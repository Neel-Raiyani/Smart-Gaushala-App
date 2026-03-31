import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { Prisma } from '@prisma/client';
import { AppError } from '@utils/AppError.js';
import type { AuthRequest } from '@appTypes/express.js';

/**
 * Record a new medical visit (Illness/Checkup).
 */
export const recordMedicalVisit = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const {
            animalId, visitType, visitDate, visitNumber,
            vetId, diseaseId, medicalStatus, symptoms, treatment
        } = req.body;

        // Verify animal exists in this gaushala
        const animal = await prisma.animal.findFirst({
            where: { id: animalId, gaushalaId, isActive: true }
        });

        if (!animal) {
            throw new AppError('Animal not found in this Gaushala', 404, 'ANIMAL_NOT_FOUND');
        }

        const medicalRecord = await prisma.medicalRecord.create({
            data: {
                animalId,
                gaushalaId,
                visitType,
                visitDate: new Date(visitDate),
                visitNumber: visitNumber || null,
                vetId: vetId || null,
                diseaseId: diseaseId || null,
                medicalStatus,
                symptoms: symptoms || null,
                treatment: treatment || null
            }
        });

        res.status(201).json({
            success: true,
            message: 'Medical visit recorded successfully',
            data: medicalRecord
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing medical record.
 */
export const updateMedicalRecord = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { id } = req.params;
        const updateData: Partial<Prisma.MedicalRecordUpdateInput> = req.body;

        // Ensure record exists and belongs to this gaushala
        const existingRecord = await prisma.medicalRecord.findFirst({
            where: { id: id as string, gaushalaId: gaushalaId as string }
        });

        if (!existingRecord) {
            throw new AppError('Medical record not found', 404, 'RECORD_NOT_FOUND');
        }

        // Prevent animalId or gaushalaId from being changed via update
        delete (updateData as any).animalId;
        delete (updateData as any).gaushalaId;

        if (updateData.visitDate) {
            updateData.visitDate = new Date(updateData.visitDate as any);
        }

        const updatedRecord = await prisma.medicalRecord.update({
            where: { id: id as string },
            data: updateData
        });

        res.status(200).json({
            success: true,
            message: 'Medical record updated successfully',
            data: updatedRecord
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all medical records for a specific animal.
 */
export const getMedicalHistoryByAnimal = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { animalId } = req.params;
        const { page = '1', limit = '20' } = req.query as { page?: string; limit?: string };
        
        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
        const skip = (pageNum - 1) * limitNum;

        const animal = await prisma.animal.findFirst({
            where: { id: animalId as string, gaushalaId: gaushalaId as string, isActive: true }
        });

        if (!animal) {
            throw new AppError('Animal not found or inactive', 404, 'ANIMAL_NOT_FOUND');
        }

        const where = { animalId: animalId as string, gaushalaId: gaushalaId as string };
        const [total, history] = await Promise.all([
            prisma.medicalRecord.count({ where }),
            prisma.medicalRecord.findMany({
                where,
                orderBy: { visitDate: 'desc' },
                skip,
                take: limitNum
            })
        ]);

        res.status(200).json({
            success: true,
            data: history,
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

/**
 * Get all animals currently marked as 'SICK' based on their latest medical record.
 */
export const getSickAnimals = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { page = '1', limit = '20' } = req.query as { page?: string; limit?: string };
        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
        const skip = (pageNum - 1) * limitNum;

        // 1. Get the latest visitDate for each animal in this gaushala
        const latestVisits = await prisma.medicalRecord.groupBy({
            by: ['animalId'],
            where: { gaushalaId },
            _max: { visitDate: true }
        });

        if (latestVisits.length === 0) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }

        // 2. Fetch the full medical records for these latest visits
        // We use OR because we need to match both animalId and visitDate for each pair
        const sickLatestRecords = await prisma.medicalRecord.findMany({
            where: {
                gaushalaId,
                medicalStatus: 'SICK',
                OR: latestVisits.map(v => ({
                    animalId: v.animalId,
                    visitDate: v._max.visitDate!
                }))
            }
        });

        if (sickLatestRecords.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: []
            });
        }

        const total = sickLatestRecords.length;
        const paginatedRecords = sickLatestRecords.slice(skip, skip + limitNum);

        // 4. Fetch Animal and Disease details for these records
        const animalIds = paginatedRecords.map(r => r.animalId);
        const diseaseIds = paginatedRecords.map(r => r.diseaseId).filter(id => id !== null) as string[];

        const [animals, diseases] = await Promise.all([
            prisma.animal.findMany({
                where: { id: { in: animalIds }, isActive: true },
                select: { id: true, name: true, tagNumber: true, photoUrl: true, animalNumber: true }
            }),
            prisma.diseaseMaster.findMany({
                where: { id: { in: diseaseIds } }
            })
        ]);

        const animalMap = new Map(animals.map(a => [a.id, a]));
        const diseaseMap = new Map(diseases.map(d => [d.id, d.name]));

        // 5. Build final response
        const result = paginatedRecords.map(record => ({
            id: record.id,
            animal: animalMap.get(record.animalId) || null,
            visitDate: record.visitDate,
            visitType: record.visitType,
            disease: record.diseaseId ? (diseaseMap.get(record.diseaseId) || 'Unknown') : 'N/A',
            symptoms: record.symptoms,
            treatment: record.treatment,
            medicalStatus: record.medicalStatus
        })).filter(item => item.animal !== null); // Ensure we don't return records for deleted/inactive animals

        res.status(200).json({
            success: true,
            count: result.length, // records in this page
            data: result,
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
