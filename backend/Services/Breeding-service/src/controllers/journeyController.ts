import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { Prisma } from '@prisma/client';
import logger from '@utils/logger.js';
import { AppError } from '@utils/AppError.js';
import { getPresignedViewUrl } from '@utils/s3.js';
import type { AuthRequest } from '@appTypes/express.js';

// ───────────────────────── Initiate Journey ─────────────────────────
export const initiateJourney = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }
        const {
            animalId, conceiveDate, pregnancyType,
            bullId, bullName, bullTag,
            serialNumber, companyName
        } = req.body;

        // BLOCK: Check if cow has an active non-pregnancy dry-off record
        const activeDryOff = await prisma.dryOffRecord.findFirst({
            where: { animalId, gaushalaId }
        });
        if (activeDryOff) {
            throw new AppError(
                `Cannot initiate conception journey. Cow is currently dried off due to ${activeDryOff.reason}. Delete the dry-off record first.`,
                400,
                'COW_DRIED_OFF'
            );
        }

        // BLOCK: Check for existing active journey
        const existingJourney = await prisma.conceptionJourney.findFirst({
            where: { animalId, gaushalaId, status: { notIn: ['COMPLETED', 'FAILED'] } }
        });
        if (existingJourney) {
            throw new AppError('Animal already has an active conception journey', 409, 'JOURNEY_ALREADY_ACTIVE');
        }

        // Auto-fetch parity from the animal's parity field
        const animal = await prisma.animal.findFirst({
            where: { id: animalId, isActive: true }
        });
        if (!animal) {
            throw new AppError('Animal not found', 404, 'ANIMAL_NOT_FOUND');
        }
        const parity = animal.parity || 0;

        const journey = await prisma.conceptionJourney.create({
            data: {
                animalId,
                gaushalaId,
                conceiveDate: new Date(conceiveDate),
                pregnancyType,
                bullId: bullId || null,
                bullName: bullName || null,
                bullTag: bullTag || null,
                serialNumber: serialNumber || null,
                companyName: companyName || null,
                parity,
                status: 'INITIATED'
            }
        });

        logger.info(`Conception journey initiated for animal ${animalId}`);
        res.status(201).json({ success: true, message: 'Conception journey initiated successfully', data: journey });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Update Journey Initiation Details ─────────────────────────
export const updateJourneyInitiation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }
        const id = req.params.id as string;
        const {
            conceiveDate, pregnancyType,
            bullId, bullName, bullTag,
            serialNumber, companyName
        } = req.body;

        const journey = await prisma.conceptionJourney.update({
            where: { id, gaushalaId },
            data: {
                ...(conceiveDate && { conceiveDate: new Date(conceiveDate) }),
                ...(pregnancyType && { pregnancyType }),
                ...(bullId !== undefined && { bullId }),
                ...(bullName !== undefined && { bullName }),
                ...(bullTag !== undefined && { bullTag }),
                ...(serialNumber !== undefined && { serialNumber }),
                ...(companyName !== undefined && { companyName })
            }
        });

        res.json({ success: true, message: 'Journey updated successfully', data: journey });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Confirm Pregnancy (PD Popup) ─────────────────────────
export const confirmPregnancy = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }
        const id = req.params.id as string;
        const { pdResult, pdDate } = req.body;

        if (pdResult === undefined || !pdDate) {
            throw new AppError('pdResult and pdDate are required', 400, 'VALIDATION_ERROR');
        }

        const journey = await prisma.conceptionJourney.update({
            where: { id, gaushalaId },
            data: {
                pdResult: Boolean(pdResult),
                pdDate: new Date(pdDate),
                status: pdResult ? 'PREGNANT' : 'FAILED'
            }
        });

        const msg = pdResult ? 'Pregnancy confirmed successfully' : 'Pregnancy result recorded as negative (FAILED)';
        logger.info(`Journey ${id} PD result: ${pdResult}`);
        res.json({ success: true, message: msg, data: journey });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Mark Dry-Off (from Conception Screen) ─────────────────────────
export const markDryOff = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }
        const id = req.params.id as string;
        const { dryOffDate } = req.body;

        if (!dryOffDate) {
            throw new AppError('dryOffDate is required', 400, 'VALIDATION_ERROR');
        }

        const journey = await prisma.conceptionJourney.update({
            where: { id, gaushalaId },
            data: {
                dryOffDate: new Date(dryOffDate),
                status: 'DRY_OFF'
            }
        });

        logger.info(`Journey ${id} marked as DRY_OFF`);
        res.json({ success: true, message: 'Cow marked as dry-off in conception journey', data: journey });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Record Delivery ─────────────────────────
export const recordDelivery = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }
        const id = req.params.id as string;
        const {
            deliveryDate, calfStatus, calfGender,
            calfName, calfTagNumber, calfBreed, calfGroup,
            calfAppearance, calfWeight,
            deliveryPhoto, calfPhoto
        } = req.body;

        // Mandatory fields enforced at controller level
        if (!deliveryDate || !calfStatus) {
            throw new AppError(
                'deliveryDate and calfStatus are mandatory for delivery',
                400,
                'MISSING_MANDATORY_FIELDS'
            );
        }

        const journey = await prisma.conceptionJourney.findUnique({
            where: { id, gaushalaId }
        });

        if (!journey) {
            throw new AppError('Conception journey not found', 404, 'JOURNEY_NOT_FOUND');
        }

        const mother = await prisma.animal.findFirst({
            where: { id: journey.animalId, isActive: true }
        });

        if (!mother) {
            throw new AppError('Mother animal not found', 404, 'MOTHER_NOT_FOUND');
        }

        const bDate = new Date(deliveryDate);
        const adultDate = new Date(bDate);
        adultDate.setMonth(adultDate.getMonth() + 12);

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. Update Journey
            await tx.conceptionJourney.update({
                where: { id, gaushalaId },
                data: {
                    deliveryDate: bDate,
                    calfStatus,
                    calfGender,
                    calfAppearance: calfAppearance || null,
                    calfWeight: calfWeight ? Number(calfWeight) : null,
                    deliveryPhoto: deliveryPhoto || null,
                    calfPhoto: calfPhoto || null,
                    status: 'COMPLETED'
                }
            });

            // 2. Increment Mother's Parity & Set Lactating
            await tx.animal.update({
                where: { id: journey.animalId },
                data: {
                    parity: { increment: 1 },
                    isLactating: true,
                    isPregnant: false,
                    isDryOff: false
                }
            });

            // 3. Register Calf (if ALIVE)
            if (calfStatus === 'ALIVE') {
                // Duplicate tag check for calf
                if (calfTagNumber) {
                    const existingTag = await tx.animal.findFirst({
                        where: { tagNumber: calfTagNumber, gaushalaId, isActive: true }
                    });
                    if (existingTag) {
                        throw new AppError('Calf tag number already exists in this Gaushala', 409, 'DUPLICATE_TAG');
                    }
                }

                await tx.animal.create({
                    data: {
                        name: calfName,
                        tagNumber: calfTagNumber,
                        gender: calfGender,
                        gaushalaId,
                        cowBreed: calfBreed || mother.cowBreed || null,
                        cowGroupId: calfGroup || mother.cowGroupId || null,
                        birthDate: bDate,
                        adultDate,
                        acquisitionType: 'BIRTH',
                        status: 'ACTIVE',
                        motherId: mother.id,
                        motherName: mother.name || null,
                        fatherName: journey.bullName || null,
                        fatherId: journey.bullId || null,
                        photoUrl: calfPhoto || null,
                        parity: 0,
                        isHeifer: false,
                        isLactating: false,
                        isRetired: false,
                        isPregnant: false,
                        isDryOff: false
                    }
                });
            }
        });

        logger.info(`Journey ${id} COMPLETED — delivery recorded atomically. Mother parity updated, calf registered if alive.`);
        res.json({ success: true, message: 'Delivery recorded, journey completed, mother parity updated, and calf registered if alive' });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Get Journey Details ─────────────────────────
export const getJourneyDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }
        const id = req.params.id as string;

        const journey = await prisma.conceptionJourney.findUnique({
            where: { id, gaushalaId }
        });

        if (!journey) {
            throw new AppError('Conception journey not found', 404, 'JOURNEY_NOT_FOUND');
        }

        const animal = await prisma.animal.findFirst({
            where: { id: journey.animalId, isActive: true }
        });

        const bucket = process.env.S3_BUCKET_NAME || 'breeding-media';
        const deliveryViewUrl = journey.deliveryPhoto ? await getPresignedViewUrl(bucket, journey.deliveryPhoto) : null;
        const calfViewUrl = journey.calfPhoto ? await getPresignedViewUrl(bucket, journey.calfPhoto) : null;

        res.json({
            success: true,
            data: {
                ...journey,
                tagNumber: animal?.tagNumber || null,
                animalName: animal?.name || null,
                deliveryViewUrl,
                calfViewUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── List Journeys (Filtered) ─────────────────────────
export const listJourneys = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }
        const { filter, animalId, page = '1', limit = '20' } = req.query as { filter?: string; animalId?: string; page?: string; limit?: string };

        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
        const skip = (pageNum - 1) * limitNum;

        const where: Prisma.ConceptionJourneyWhereInput = { gaushalaId };

        if (animalId) where.animalId = animalId;

        if (filter === 'check_pending') {
            where.status = 'INITIATED';
        } else if (filter === 'pregnant') {
            where.status = 'PREGNANT';
        } else if (filter === 'dryoff') {
            where.status = 'DRY_OFF';
        } else if (filter === 'delivery_pending') {
            where.status = { in: ['PREGNANT', 'DRY_OFF'] };
        } else if (filter === 'completed') {
            where.status = 'COMPLETED';
        } else if (filter === 'failed') {
            where.status = 'FAILED';
        }

        const [total, journeys] = await Promise.all([
            prisma.conceptionJourney.count({ where }),
            prisma.conceptionJourney.findMany({
                where,
                orderBy: { conceiveDate: 'desc' },
                skip,
                take: limitNum
            })
        ]);

        const animalIds = [...new Set(journeys.map(j => j.animalId))];
        const animals = await prisma.animal.findMany({
            where: { id: { in: animalIds }, isActive: true }
        });
        const animalMap = new Map(animals.map(a => [a.id, a]));

        const bucket = process.env.S3_BUCKET_NAME || 'breeding-media';
        const formattedJourneys = await Promise.all(journeys.map(async (j) => {
            const animalData = animalMap.get(j.animalId);

            const deliveryViewUrl = j.deliveryPhoto ? await getPresignedViewUrl(bucket, j.deliveryPhoto) : null;
            const calfViewUrl = j.calfPhoto ? await getPresignedViewUrl(bucket, j.calfPhoto) : null;

            // Calculate total days from conceiveDate to now
            const totalDays = Math.floor((new Date().getTime() - new Date(j.conceiveDate!).getTime()) / (1000 * 60 * 60 * 24));

            return {
                id: j.id,
                animalId: j.animalId,
                animalName: animalData?.name || null,
                tagNumber: animalData?.tagNumber || null,
                pregnancyType: j.pregnancyType,
                isPregnant: ['PREGNANT', 'DRY_OFF', 'COMPLETED'].includes(j.status),
                isDryOff: j.status === 'DRY_OFF',
                conceiveDate: j.conceiveDate,
                pdDate: j.pdDate || null,
                dryOffDate: j.dryOffDate || null,
                totalDays
            };
        }));

        res.json({
            success: true,
            data: formattedJourneys,
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

// ───────────────────────── Delete Journey ─────────────────────────
export const deleteJourney = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }
        const id = req.params.id as string;

        await prisma.conceptionJourney.delete({ where: { id, gaushalaId } });

        logger.info(`Conception journey ${id} deleted`);
        res.json({ success: true, message: 'Conception journey deleted successfully' });
    } catch (error) {
        next(error);
    }
};


// ───────────────────────── Get Eligible Cows for Dry-Off ─────────────────────────
export const getEligibleForDryOff = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }

        // Only PREGNANT cows can be moved to DRY_OFF from the Conception screen
        const journeys = await prisma.conceptionJourney.findMany({
            where: { gaushalaId, status: 'PREGNANT' },
            select: { animalId: true, id: true, conceiveDate: true, parity: true }
        });

        res.json({ success: true, data: journeys });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Get Eligible Cows for Conception Journey ─────────────────────────
export const getEligibleCowsForJourney = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }

        // 1. Fetch all female, active, non-retired cows that are either Heifers or Lactating
        const cows = await prisma.animal.findMany({
            where: {
                gaushalaId,
                gender: 'FEMALE',
                status: 'ACTIVE',
                isActive: true,
                isRetired: false,
                OR: [
                    { isHeifer: true },
                    { isLactating: true }
                ]
            },
            select: {
                id: true,
                tagNumber: true,
                name: true,
                isHeifer: true,
                isLactating: true
            }
        });

        // 2. Fetch animals with active journeys (not COMPLETED or FAILED)
        const activeJourneys = await prisma.conceptionJourney.findMany({
            where: {
                gaushalaId,
                status: { notIn: ['COMPLETED', 'FAILED'] }
            },
            select: { animalId: true }
        });
        const journeyAnimalIds = new Set(activeJourneys.map(j => j.animalId));

        // 3. Fetch animals with active dry-off records
        const dryOffs = await prisma.dryOffRecord.findMany({
            where: { gaushalaId },
            select: { animalId: true }
        });
        const dryOffAnimalIds = new Set(dryOffs.map(d => d.animalId));

        // 4. Filter cows
        const eligibleCows = cows.filter(c =>
            !journeyAnimalIds.has(c.id) &&
            !dryOffAnimalIds.has(c.id)
        );

        res.json({ success: true, data: eligibleCows });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Get Bulls for Breeding Dropdown ─────────────────────────
export const getBullsForDropdown = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }

        const { pregnancyType } = req.query;

        const now = new Date();
        const twelveMonthsAgo = new Date(now);
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const where: any = {
            gaushalaId,
            gender: 'MALE',
            isRetired: false,
            isActive: true,
            birthDate: { lte: twelveMonthsAgo }
        };

        // Filter bulls based on pregnancy type
        if (pregnancyType === 'AI') {
            where.bullType = 'AI';
        } else if (pregnancyType === 'NATURAL') {
            where.bullType = 'GAUSHALA';
        }

        // Bulls that are MALE, NOT retired, and NOT calves (>= 12 months)
        const bulls = await prisma.animal.findMany({
            where,
            select: {
                id: true,
                tagNumber: true,
                name: true
            }
        });

        res.json({ success: true, data: bulls });
    } catch (error) {
        next(error);
    }
};
