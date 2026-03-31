import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { Prisma, PregnancyType } from '@prisma/client';
import logger from '@utils/logger.js';
import { AppError } from '@utils/AppError.js';
import type { AuthRequest } from '@appTypes/express.js';

// ───────────────────────── Record Heat ─────────────────────────
export const recordHeat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { animalId, date, breedingType, note } = req.body as { animalId: string; date: string; breedingType: PregnancyType; note?: string };

        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }

        // Auto-fetch parity from the animal's parity field
        const animal = await prisma.animal.findFirst({
            where: { id: animalId, isActive: true }
        });

        if (!animal) {
            throw new AppError('Animal not found', 404, 'ANIMAL_NOT_FOUND');
        }

        const parity = animal.parity || 0;

        const record = await prisma.heatRecord.create({
            data: {
                animalId,
                gaushalaId,
                date: new Date(date),
                parity,
                breedingType,
                note: note || null
            }
        });

        logger.info(`Heat record created for animal ${animalId}`);
        res.status(201).json({ success: true, message: 'Heat record added successfully', data: record });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Get Heat Records ─────────────────────────
export const getHeatRecords = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }
        const { from, to, animalId } = req.query as { from?: string; to?: string; animalId?: string };

        const where: Prisma.HeatRecordWhereInput = { gaushalaId };

        if (animalId) where.animalId = animalId;

        if (from || to) {
            where.date = {};
            if (from) { const fromDate = new Date(from); fromDate.setHours(0, 0, 0, 0); (where.date as Prisma.DateTimeFilter).gte = fromDate; }
            if (to) { const toDate = new Date(to); toDate.setHours(23, 59, 59, 999); (where.date as Prisma.DateTimeFilter).lte = toDate; }
        }

        const records = await prisma.heatRecord.findMany({
            where,
            orderBy: { date: 'desc' }
        });

        const animalIds = [...new Set(records.map(r => r.animalId))];
        const animals = await prisma.animal.findMany({
            where: { id: { in: animalIds }, isActive: true }
        });
        const animalMap = new Map(animals.map(a => [a.id, a]));

        const formattedRecords = records.map(r => {
            const animalData = animalMap.get(r.animalId);
            return {
                id: r.id,
                animalId: r.animalId,
                animalName: animalData?.name || null,
                tagNumber: animalData?.tagNumber || null,
                parity: r.parity,
                breedingType: r.breedingType,
                date: r.date,
                note: r.note || null
            };
        });

        res.json({ success: true, data: formattedRecords });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Update Heat Record ─────────────────────────
export const updateHeatRecord = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }
        const id = req.params.id as string;
        const { date, parity, note } = req.body as { date?: string; parity?: number; note?: string };

        const record = await prisma.heatRecord.update({
            where: { id, gaushalaId },
            data: {
                ...(date && { date: new Date(date) }),
                ...(parity !== undefined && { parity: Number(parity) }),
                ...(note !== undefined && { note })
            }
        });

        res.json({ success: true, message: 'Heat record updated successfully', data: record });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Delete Heat Record ─────────────────────────
export const deleteHeatRecord = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }
        const id = req.params.id as string;

        await prisma.heatRecord.delete({ where: { id, gaushalaId } });

        logger.info(`Heat record ${id} deleted`);
        res.json({ success: true, message: 'Heat record deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Get Eligible Animals for Heat Dropdown ─────────────────────────
export const getEligibleForHeat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }

        // Cows that are lactating OR heifers are eligible for heat
        const animals = await prisma.animal.findMany({
            where: {
                gaushalaId,
                isActive: true,
                OR: [
                    { isLactating: true },
                    { isHeifer: true }
                ]
            },
            select: {
                id: true,
                tagNumber: true,
                name: true
            }
        });

        res.json({ success: true, data: animals });
    } catch (error) {
        next(error);
    }
};
