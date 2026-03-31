import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { Prisma } from '@prisma/client';
import { getPresignedViewUrl } from '@utils/s3.js';
import type { AuthRequest } from '@appTypes/express.js';

// ───────────────────────── Heat Report ─────────────────────────
export const getHeatReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) return res.status(401).json({ message: 'Gaushala ID missing' });

        const { from, to, animalId, page = '1', limit = '20' } = req.query as { from?: string; to?: string; animalId?: string; page?: string; limit?: string };
        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
        const skip = (pageNum - 1) * limitNum;
        const where: Prisma.HeatRecordWhereInput = { gaushalaId };

        if (animalId) where.animalId = animalId;
        if (from || to) {
            where.date = {};
            if (from) { const fromDate = new Date(from); fromDate.setHours(0, 0, 0, 0); (where.date as Prisma.DateTimeFilter).gte = fromDate; }
            if (to) { const toDate = new Date(to); toDate.setHours(23, 59, 59, 999); (where.date as Prisma.DateTimeFilter).lte = toDate; }
        }

        const [total, records] = await Promise.all([
            prisma.heatRecord.count({ where }),
            prisma.heatRecord.findMany({
                where,
                orderBy: { date: 'desc' },
                skip,
                take: limitNum
            })
        ]);

        const animalIds = [...new Set(records.map(r => r.animalId))];
        const animals = await prisma.animal.findMany({
            where: { id: { in: animalIds } },
            select: { id: true, name: true, tagNumber: true, animalNumber: true, photoUrl: true }
        });

        const bucket = process.env.S3_BUCKET_NAME || 'breeding-media';
        const enrichedAnimals = await Promise.all(
            animals.map(async (a) => ({
                ...a,
                photoUrl: a.photoUrl ? await getPresignedViewUrl('gaushala-media', a.photoUrl) : null
            }))
        );
        const animalMap = new Map(enrichedAnimals.map(a => [a.id, a]));

        const data = records.map(r => {
            const animal = animalMap.get(r.animalId);
            return {
                id: r.id,
                animalId: r.animalId,
                photo: animal?.photoUrl || null,
                name: animal?.name || null,
                tagno: animal?.tagNumber || null,
                cowNo: animal?.animalNumber || null,
                date: r.date,
                pregnancyType: r.breedingType,
                parity: r.parity,
                note: r.note || null
            };
        });

        res.json({
            success: true,
            data,
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

// ───────────────────────── Pregnancy Report ─────────────────────────
export const getPregnancyReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) return res.status(401).json({ message: 'Gaushala ID missing' });

        const { from, to, page = '1', limit = '20' } = req.query as { from?: string; to?: string; page?: string; limit?: string };
        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
        const skip = (pageNum - 1) * limitNum;
        const where: Prisma.ConceptionJourneyWhereInput = {
            gaushalaId,
            status: { in: ['PREGNANT', 'DRY_OFF'] }
        };

        if (from || to) {
            where.conceiveDate = {};
            if (from) { const fromDate = new Date(from); fromDate.setHours(0, 0, 0, 0); (where.conceiveDate as Prisma.DateTimeFilter).gte = fromDate; }
            if (to) { const toDate = new Date(to); toDate.setHours(23, 59, 59, 999); (where.conceiveDate as Prisma.DateTimeFilter).lte = toDate; }
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
            where: { id: { in: animalIds } },
            select: { id: true, name: true, tagNumber: true, animalNumber: true, photoUrl: true }
        });

        const enrichedAnimals = await Promise.all(
            animals.map(async (a) => ({
                ...a,
                photoUrl: a.photoUrl ? await getPresignedViewUrl('gaushala-media', a.photoUrl) : null
            }))
        );
        const animalMap = new Map(enrichedAnimals.map(a => [a.id, a]));

        const data = journeys.map(j => {
            const animal = animalMap.get(j.animalId);
            return {
                id: j.id,
                animalId: j.animalId,
                photo: animal?.photoUrl || null,
                name: animal?.name || null,
                tagno: animal?.tagNumber || null,
                cowNo: animal?.animalNumber || null,
                parity: j.parity,
                pregnantDate: j.conceiveDate,
                deliveryDate: j.deliveryDate || null,
                totalDays: j.deliveryDate ? Math.floor((new Date(j.deliveryDate).getTime() - new Date(j.conceiveDate).getTime()) / (1000 * 60 * 60 * 24)) : 0,
                totalMilk: 0,
                calfStatus: j.calfStatus || null,
                calfGender: j.calfGender || null
            };
        });

        res.json({
            success: true,
            totalCount: total,
            data,
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

// ───────────────────────── Delivery Report ─────────────────────────
export const getDeliveryReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) return res.status(401).json({ message: 'Gaushala ID missing' });

        const { from, to, page = '1', limit = '20' } = req.query as { from?: string; to?: string; page?: string; limit?: string };
        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
        const skip = (pageNum - 1) * limitNum;
        const where: Prisma.ConceptionJourneyWhereInput = {
            gaushalaId,
            status: 'COMPLETED'
        };

        if (from || to) {
            where.deliveryDate = {};
            if (from) { const fromDate = new Date(from); fromDate.setHours(0, 0, 0, 0); (where.deliveryDate as Prisma.DateTimeFilter).gte = fromDate; }
            if (to) { const toDate = new Date(to); toDate.setHours(23, 59, 59, 999); (where.deliveryDate as Prisma.DateTimeFilter).lte = toDate; }
        }

        const [total, journeys] = await Promise.all([
            prisma.conceptionJourney.count({ where }),
            prisma.conceptionJourney.findMany({
                where,
                orderBy: { deliveryDate: 'desc' },
                skip,
                take: limitNum
            })
        ]);

        const animalIds = [...new Set(journeys.map(j => j.animalId))];
        const animals = await prisma.animal.findMany({
            where: { id: { in: animalIds } },
            select: { id: true, name: true, tagNumber: true, animalNumber: true, photoUrl: true }
        });

        const enrichedAnimals = await Promise.all(
            animals.map(async (a) => ({
                ...a,
                photoUrl: a.photoUrl ? await getPresignedViewUrl('gaushala-media', a.photoUrl) : null
            }))
        );
        const animalMap = new Map(enrichedAnimals.map(a => [a.id, a]));

        const data = journeys.map(j => {
            const animal = animalMap.get(j.animalId);
            return {
                id: j.id,
                animalId: j.animalId,
                photo: animal?.photoUrl || null,
                name: animal?.name || null,
                tagno: animal?.tagNumber || null,
                cowNo: animal?.animalNumber || null,
                parity: j.parity,
                pregnantDate: j.conceiveDate,
                deliveryDate: j.deliveryDate,
                totalDays: j.deliveryDate ? Math.floor((new Date(j.deliveryDate).getTime() - new Date(j.conceiveDate).getTime()) / (1000 * 60 * 60 * 24)) : 0,
                totalMilk: 0,
                calfStatus: j.calfStatus,
                calfGender: j.calfGender
            };
        });

        res.json({
            success: true,
            totalCount: total,
            data,
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

// ───────────────────────── Dropdown for Parity Report ─────────────────────────
export const getAnimalsForParityDropdown = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) return res.status(401).json({ message: 'Gaushala ID missing' });

        const animals = await prisma.animal.findMany({
            where: { gaushalaId, gender: 'FEMALE', status: 'ACTIVE' },
            select: { id: true, name: true, tagNumber: true }
        });

        res.json({ success: true, data: animals });
    } catch (error) {
        next(error);
    }
};
