import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import type { AuthRequest } from '@appTypes/express.js';

/**
 * Get a unified timeline of all health events for an animal.
 * Combines MedicalRecords, VaccinationRecords, and DewormingRecords.
 */
export const getHealthTimeline = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { animalId } = req.params;

        // Fetch all three types in parallel
        const [medical, vaccination, deworming] = await Promise.all([
            prisma.medicalRecord.findMany({ where: { animalId: animalId as string, gaushalaId: gaushalaId as string } }),
            prisma.vaccinationRecord.findMany({ where: { animalId: animalId as string, gaushalaId: gaushalaId as string } }),
            prisma.dewormingRecord.findMany({ where: { animalId: animalId as string, gaushalaId: gaushalaId as string } })
        ]);

        // Merge and format
        const timeline = [
            ...medical.map((r) => ({ ...r, eventType: 'MEDICAL' })),
            ...vaccination.map((r) => ({ ...r, eventType: 'VACCINATION' })),
            ...deworming.map((r) => ({ ...r, eventType: 'DEWORMING' }))
        ];

        // Sort by date (descending)
        timeline.sort((a: any, b: any) => {
            const dateA = a.visitDate || a.doseDate;
            const dateB = b.visitDate || b.doseDate;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        res.status(200).json({
            success: true,
            totalEvents: timeline.length,
            data: timeline
        });
    } catch (error) {
        next(error);
    }
};
