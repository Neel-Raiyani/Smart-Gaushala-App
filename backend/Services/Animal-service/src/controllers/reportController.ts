import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import logger from '@utils/logger.js';
import { AppError } from '@utils/AppError.js';
import type { AuthRequest } from '@appTypes/express.js';
import { getPresignedViewUrl } from '@utils/s3.js';
import { generateCowReport, generateBullReport } from '@utils/excelHelper.js';

// ───────────────────────── Get Animal Summary ─────────────────────────
export const getAnimalSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;

        const now = new Date();
        const twelveMonthsAgo = new Date(now);
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const [
            totalCows, heifer, pregnant, lactating, dryOff, retiredCows,
            totalBulls, bullCalves, retiredBulls
        ] = await Promise.all([
            prisma.animal.count({ where: { gaushalaId, gender: 'FEMALE', status: 'ACTIVE' } }),
            prisma.animal.count({ where: { gaushalaId, gender: 'FEMALE', isHeifer: true, status: 'ACTIVE' } }),
            prisma.animal.count({ where: { gaushalaId, gender: 'FEMALE', isPregnant: true, status: 'ACTIVE' } }),
            prisma.animal.count({ where: { gaushalaId, gender: 'FEMALE', isLactating: true, status: 'ACTIVE' } }),
            prisma.animal.count({ where: { gaushalaId, gender: 'FEMALE', isDryOff: true, status: 'ACTIVE' } }),
            prisma.animal.count({ where: { gaushalaId, gender: 'FEMALE', isRetired: true, status: 'ACTIVE' } }),
            prisma.animal.count({ where: { gaushalaId, gender: 'MALE', status: 'ACTIVE' } }),
            prisma.animal.count({ where: { gaushalaId, gender: 'MALE', birthDate: { gt: twelveMonthsAgo }, status: 'ACTIVE' } }),
            prisma.animal.count({ where: { gaushalaId, gender: 'MALE', isRetired: true, status: 'ACTIVE' } })
        ]);

        res.status(200).json({
            success: true,
            summary: {
                cows: {
                    total: totalCows,
                    heifer,
                    pregnant,
                    lactating,
                    dryOff,
                    retired: retiredCows
                },
                bulls: {
                    total: totalBulls,
                    calf: bullCalves,
                    retired: retiredBulls
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Get Udder Close Cows ─────────────────────────
export const getUdderCloseCows = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { quarterCount = 'all', page = '1', limit = '20' } = req.query;

        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
        const skip = (pageNum - 1) * limitNum;

        // Since we can't do complex boolean sums directly in Prisma's findMany where, 
        // we'll fetch basic data and filter or use a more targeted approach if possible.
        // For 'all', we just check if any quarter is closed.

        const countFilter: any = { gaushalaId, gender: 'FEMALE', status: 'ACTIVE' };

        if (quarterCount === 'all') {
            countFilter.OR = [
                { isUdderClosedFL: true },
                { isUdderClosedFR: true },
                { isUdderClosedBL: true },
                { isUdderClosedBR: true }
            ];
        }

        // Fetching matches. For specific counts (1,2,3,4), we'll have to filter in JS or use raw query.
        // Given MongoDB and Prisma, we'll fetch those that have AT LEAST one and filter in memory if count is small.
        // For performance, let's just fetch those that have at least one closed quarter.

        const animals = await prisma.animal.findMany({
            where: {
                gaushalaId,
                gender: 'FEMALE',
                status: 'ACTIVE',
                OR: [
                    { isUdderClosedFL: true },
                    { isUdderClosedFR: true },
                    { isUdderClosedBL: true },
                    { isUdderClosedBR: true }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        const filteredAnimals = animals.filter(animal => {
            const closedQuarters = [
                animal.isUdderClosedFL,
                animal.isUdderClosedFR,
                animal.isUdderClosedBL,
                animal.isUdderClosedBR
            ].filter(Boolean).length;

            if (quarterCount === 'all') return true;
            return closedQuarters === parseInt(quarterCount as string);
        });

        const total = filteredAnimals.length;
        const paginated = filteredAnimals.slice(skip, skip + limitNum);

        const bucket = process.env.S3_BUCKET_CATTLE_PHOTOS || 'cattle-photos';
        const cows = await Promise.all(paginated.map(async (animal) => {
            let viewUrl = null;
            if (animal.photoUrl) {
                try {
                    viewUrl = await getPresignedViewUrl(bucket, animal.photoUrl);
                } catch (err) {
                    logger.error(`Error generating view URL for cow ${animal.id}:`, err);
                }
            }
            return {
                id: animal.id,
                name: animal.name,
                tagNumber: animal.tagNumber,
                parity: animal.parity,
                animalNumber: animal.animalNumber,
                birthDate: animal.birthDate,
                adultDate: animal.adultDate,
                isUdderClosedFL: animal.isUdderClosedFL,
                isUdderClosedFR: animal.isUdderClosedFR,
                isUdderClosedBL: animal.isUdderClosedBL,
                isUdderClosedBR: animal.isUdderClosedBR,
                viewUrl
            };
        }));

        res.status(200).json({
            success: true,
            cows,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Retire Animal ─────────────────────────
export const retireAnimal = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { animalId, retiredDate } = req.body;

        if (!animalId || !retiredDate) {
            throw new AppError('Animal ID and retired date are required', 400, 'MISSING_FIELDS');
        }

        const animal = await prisma.animal.findFirst({
            where: { id: animalId, gaushalaId, status: 'ACTIVE' }
        });

        if (!animal) {
            throw new AppError('Active animal not found', 404, 'ANIMAL_NOT_FOUND');
        }

        const updated = await prisma.animal.update({
            where: { id: animalId },
            data: {
                isRetired: true,
                retiredDate: new Date(retiredDate),
                isLactating: false,
                isPregnant: false,
                isDryOff: false
            }
        });

        logger.info(`Animal ${animalId} retired on ${retiredDate}`);
        res.status(200).json({
            success: true,
            message: 'Animal retired successfully',
            animal: updated
        });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Get Eligible for Retirement ─────────────────────────
export const getEligibleForRetirement = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { gender } = req.query; // Optional filter

        const where: any = {
            gaushalaId,
            status: 'ACTIVE',
            isRetired: false,
            isPregnant: false
        };

        if (gender === 'MALE' || gender === 'FEMALE') {
            where.gender = gender;
        }

        const animals = await prisma.animal.findMany({
            where,
            select: {
                id: true,
                name: true,
                tagNumber: true,
                animalNumber: true,
                gender: true
            },
            orderBy: { name: 'asc' }
        });

        res.status(200).json({
            success: true,
            animals
        });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Export Cows Excel ─────────────────────────
export const exportCowsExcel = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { filter = 'all' } = req.query;

        const now = new Date();
        const twelveMonthsAgo = new Date(now);
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const where: any = { gaushalaId, gender: 'FEMALE', isActive: true };

        switch (filter) {
            case 'lactating': where.isLactating = true; break;
            case 'heifer': where.isHeifer = true; break;
            case 'pregnant': where.isPregnant = true; break;
            case 'dryoff': where.isDryOff = true; break;
            case 'retired': where.isRetired = true; break;
            case 'handicapped': where.isHandicapped = true; break;
            case 'calves': where.birthDate = { gt: twelveMonthsAgo }; break;
        }

        const cows = await prisma.animal.findMany({
            where,
            include: { cowGroup: { select: { name: true } } },
            orderBy: { tagNumber: 'asc' }
        });

        const mappedCows = cows.map(cow => ({
            ...cow,
            cowGroupName: cow.cowGroup?.name || undefined
        }));

        await generateCowReport(res, mappedCows as any, filter as string);
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Export Bulls Excel ─────────────────────────
export const exportBullsExcel = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { filter = 'all' } = req.query;

        const now = new Date();
        const twelveMonthsAgo = new Date(now);
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const where: any = { gaushalaId, gender: 'MALE', isActive: true };

        switch (filter) {
            case 'retired': where.isRetired = true; break;
            case 'calf': where.birthDate = { gt: twelveMonthsAgo }; break;
        }

        const bulls = await prisma.animal.findMany({
            where,
            orderBy: { tagNumber: 'asc' }
        });

        await generateBullReport(res, bulls as any, filter as string);
    } catch (error) {
        next(error);
    }
};
