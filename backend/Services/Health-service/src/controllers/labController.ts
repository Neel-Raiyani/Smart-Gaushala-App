import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { AuthRequest } from '@appTypes/express.js';
import { AppError } from '@utils/AppError.js';
import { getPresignedViewUrl } from '@utils/s3.js';

/**
 * Create a new lab test record for an animal.
 */
export const createLabRecord = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { animalId, labtestId, sampleDate, resultDate, result, attachmentUrl, remark } = req.body;

        const animal = await (prisma as any).animal.findFirst({
            where: { id: animalId, gaushalaId, isActive: true }
        });

        if (!animal) {
            throw new AppError('Animal not found or inactive', 404, 'ANIMAL_NOT_FOUND');
        }

        const record = await (prisma as any).labRecord.create({
            data: {
                animalId,
                gaushalaId,
                labtestId,
                sampleDate: new Date(sampleDate),
                resultDate: resultDate ? new Date(resultDate) : null,
                result: result?.toUpperCase(),
                attachmentUrl,
                remark
            }
        });

        res.status(201).json({
            success: true,
            message: 'Lab record created successfully',
            data: record
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing lab record.
 */
export const updateLabRecord = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const gaushalaId = req.gaushala?.id as string;
        const { labtestId, sampleDate, resultDate, result, attachmentUrl, remark } = req.body;

        const record = await (prisma as any).labRecord.findFirst({
            where: { id, gaushalaId }
        });

        if (!record) throw new AppError('Lab record not found or unauthorized', 404);

        const updatedRecord = await (prisma as any).labRecord.update({
            where: { id },
            data: {
                labtestId,
                sampleDate: sampleDate ? new Date(sampleDate) : undefined,
                resultDate: resultDate ? new Date(resultDate) : undefined,
                result: result?.toUpperCase(),
                attachmentUrl,
                remark
            }
        });

        res.status(200).json({
            success: true,
            message: 'Lab record updated successfully',
            data: updatedRecord
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a lab record.
 */
export const deleteLabRecord = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const gaushalaId = req.gaushala?.id as string;

        const record = await (prisma as any).labRecord.findFirst({
            where: { id, gaushalaId }
        });

        if (!record) throw new AppError('Lab record not found or unauthorized', 404);

        await (prisma as any).labRecord.delete({
            where: { id }
        });

        res.status(200).json({
            success: true,
            message: 'Lab record deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * List lab records for an animal or gaushala (Summary View).
 */
export const listLabRecords = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { animalId } = req.query;

        const where: any = { gaushalaId };
        if (animalId) {
            const animal = await (prisma as any).animal.findFirst({
                where: { id: animalId as string, gaushalaId: gaushalaId as string, isActive: true }
            });
            if (!animal) {
                throw new AppError('Animal not found or inactive', 404, 'ANIMAL_NOT_FOUND');
            }
            where.animalId = animalId;
        }

        const records = await (prisma as any).labRecord.findMany({
            where,
            orderBy: { sampleDate: 'desc' }
        });

        const labTestIds = [...new Set(records.map((r: any) => r.labtestId))];
        const labTests = await (prisma as any).labtestMaster.findMany({
            where: { id: { in: labTestIds } }
        });
        const labTestMap = new Map(labTests.map((l: any) => [l.id, l.name]));

        const data = await Promise.all(records.map(async (record: any) => {
            const attachment = record.attachmentUrl ? await getPresignedViewUrl('health-media', record.attachmentUrl) : null;
            return {
                ...record,
                labtestName: labTestMap.get(record.labtestId) || 'Unknown',
                attachmentUrl: attachment
            };
        }));

        res.status(200).json({
            success: true,
            totalCount: records.length,
            data
        });
    } catch (error) {
        next(error);
    }
};
