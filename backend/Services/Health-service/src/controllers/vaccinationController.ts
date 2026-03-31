import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { Prisma } from '@prisma/client';
import { AppError } from '@utils/AppError.js';
import type { AuthRequest } from '@appTypes/express.js';

/**
 * Record a new vaccination.
 */
export const recordVaccination = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { animalId, doseDate, doseType, vaccineId, remark } = req.body;

        // Verify animal
        const animal = await prisma.animal.findFirst({
            where: { id: animalId, gaushalaId, isActive: true }
        });

        if (!animal) {
            throw new AppError('Animal not found in this Gaushala', 404, 'ANIMAL_NOT_FOUND');
        }

        const vaccination = await prisma.vaccinationRecord.create({
            data: {
                animalId,
                gaushalaId,
                doseDate: new Date(doseDate),
                doseType,
                vaccineId,
                remark: remark || null
            }
        });

        res.status(201).json({
            success: true,
            message: 'Vaccination recorded successfully',
            data: vaccination
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a vaccination record.
 */
export const updateVaccination = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const gaushalaId = req.gaushala?.id as string;
        const updateData: Partial<Prisma.VaccinationRecordUpdateInput> = req.body;

        const existingRecord = await prisma.vaccinationRecord.findFirst({
            where: { id: id as string, gaushalaId: gaushalaId as string }
        });

        if (!existingRecord) {
            throw new AppError('Vaccination record not found', 404, 'RECORD_NOT_FOUND');
        }

        delete (updateData as any).animalId;
        delete (updateData as any).gaushalaId;

        if (updateData.doseDate) updateData.doseDate = new Date(updateData.doseDate as any);

        const updatedRecord = await prisma.vaccinationRecord.update({
            where: { id: id as string },
            data: updateData
        });

        res.status(200).json({
            success: true,
            message: 'Vaccination record updated successfully',
            data: updatedRecord
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get vaccination history for an animal.
 */
export const getVaccinationHistoryByAnimal = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { animalId } = req.params;

        const animal = await prisma.animal.findFirst({
            where: { id: animalId as string, gaushalaId: gaushalaId as string, isActive: true }
        });

        if (!animal) {
            throw new AppError('Animal not found or inactive', 404, 'ANIMAL_NOT_FOUND');
        }

        const history = await prisma.vaccinationRecord.findMany({
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
