import { Request, Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { Prisma } from '@prisma/client';
import { AppError } from '@utils/AppError.js';
import type { AuthRequest } from '@appTypes/express.js';

/**
 * Record a single deworming dose.
 */
export const recordDeworming = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { animalId, doseDate, doseType, companyName, quantity, vetId, nextDoseDate } = req.body;

        const animal = await prisma.animal.findFirst({
            where: { id: animalId, gaushalaId, isActive: true }
        });

        if (!animal) {
            throw new AppError('Animal not found in this Gaushala', 404, 'ANIMAL_NOT_FOUND');
        }

        const deworming = await prisma.dewormingRecord.create({
            data: {
                animalId,
                gaushalaId,
                doseDate: new Date(doseDate),
                doseType,
                companyName: companyName || null,
                quantity: quantity || null,
                vetId: vetId || null,
                nextDoseDate: nextDoseDate ? new Date(nextDoseDate) : null
            }
        });

        res.status(201).json({
            success: true,
            data: deworming
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Record deworming for multiple animals at once.
 */
export const recordBulkDeworming = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { animalIds, doseDate, doseType, companyName, quantity, vetId, nextDoseDate } = req.body;

        if (!Array.isArray(animalIds) || animalIds.length === 0) {
            throw new AppError('animalIds array is required', 400);
        }

        // Verify all animals belong to this gaushala
        const animals = await prisma.animal.findMany({
            where: {
                id: { in: animalIds },
                gaushalaId,
                isActive: true
            }
        });

        if (animals.length !== animalIds.length) {
            throw new AppError('Some animals were not found in this Gaushala', 404);
        }

        const data = animalIds.map(id => ({
            animalId: id,
            gaushalaId,
            doseDate: new Date(doseDate),
            doseType,
            companyName: companyName || null,
            quantity: quantity || null,
            vetId: vetId || null,
            nextDoseDate: nextDoseDate ? new Date(nextDoseDate) : null
        }));

        await prisma.dewormingRecord.createMany({ data });

        res.status(201).json({
            success: true,
            message: `Deworming recorded for ${animalIds.length} animals`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a deworming record.
 */
export const updateDeworming = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const gaushalaId = req.gaushala?.id as string;
        const updateData: Partial<Prisma.DewormingRecordUpdateInput> = req.body;

        const existing = await prisma.dewormingRecord.findFirst({
            where: { id: id as string, gaushalaId: gaushalaId as string }
        });

        if (!existing) {
            throw new AppError('Deworming record not found', 404);
        }

        delete (updateData as any).animalId;
        delete (updateData as any).gaushalaId;

        if (updateData.doseDate) updateData.doseDate = new Date(updateData.doseDate as any);
        if (updateData.nextDoseDate) updateData.nextDoseDate = new Date(updateData.nextDoseDate as any);

        const updated = await prisma.dewormingRecord.update({
            where: { id: id as string },
            data: updateData
        });

        res.status(200).json({
            success: true,
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get deworming history for an animal.
 */
export const getDewormingHistoryByAnimal = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { animalId } = req.params;
        const gaushalaId = req.gaushala?.id as string;

        const history = await prisma.dewormingRecord.findMany({
            where: { animalId: animalId as string, gaushalaId: gaushalaId as string },
            orderBy: { doseDate: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        next(error);
    }
};

/**
 * List deworming records for a gaushala (often used for reports).
 */
export const listDewormingRecords = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { startDate, endDate } = req.query;

        const where: Prisma.DewormingRecordWhereInput = { gaushalaId: gaushalaId as string };
        if (startDate || endDate) {
            const dateFilter: Prisma.DateTimeFilter = {};
            if (startDate) dateFilter.gte = new Date(startDate as string);
            if (endDate) dateFilter.lte = new Date(endDate as string);
            where.doseDate = dateFilter;
        }

        const records = await prisma.dewormingRecord.findMany({
            where,
            orderBy: { doseDate: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: records
        });
    } catch (error) {
        next(error);
    }
};
