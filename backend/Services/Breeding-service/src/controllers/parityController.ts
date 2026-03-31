import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { Prisma, PregnancyType } from '@prisma/client';
import logger from '@utils/logger.js';
import { AppError } from '@utils/AppError.js';
import { getPresignedViewUrl } from '@utils/s3.js';
import type { AuthRequest } from '@appTypes/express.js';

interface ParityBody {
    animalId: string;
    parityNo: number;
    cowPhoto?: string;
    pregnancyType: PregnancyType;
    bullId?: string;
    bullName?: string;
    deliveryDate: string;
    pregnancyDate: string;
    dryOffDate?: string;
    note?: string;
}

// ───────────────────────── Add Parity Record ─────────────────────────
export const addParityRecord = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }
        const {
            animalId, parityNo, cowPhoto, pregnancyType,
            bullId, bullName, deliveryDate, pregnancyDate,
            dryOffDate, note
        } = req.body as ParityBody;

        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const record = await tx.parityRecord.create({
                data: {
                    animalId,
                    gaushalaId,
                    parityNo,
                    cowPhoto: cowPhoto || null,
                    pregnancyType,
                    bullId: bullId || null,
                    bullName: bullName || null,
                    deliveryDate: new Date(deliveryDate),
                    pregnancyDate: new Date(pregnancyDate),
                    dryOffDate: dryOffDate ? new Date(dryOffDate) : null,
                    note: note || null
                }
            });

            // Update animal status
            await tx.animal.update({
                where: { id: animalId, isActive: true },
                data: {
                    parity: parityNo,
                    isLactating: true,
                    isDryOff: false,
                    isPregnant: false
                }
            });

            return record;
        });

        logger.info(`Parity record added for animal ${animalId}, parity ${parityNo}. Animal status updated.`);
        res.status(201).json({
            success: true,
            message: 'Parity record added successfully and animal status updated',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Get Parity Records ─────────────────────────
export const getParityRecords = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }
        const animalId = req.params.animalId as string;

        // 1. Fetch historical parity records
        const historicalRecords = await prisma.parityRecord.findMany({
            where: { animalId, gaushalaId },
            orderBy: { parityNo: 'desc' }
        });

        // 2. Fetch completed journeys (conception-based parity)
        const journeyRecords = await prisma.conceptionJourney.findMany({
            where: { animalId, gaushalaId, status: 'COMPLETED' },
            orderBy: { parity: 'desc' }
        });

        // 3. Fetch animal details for header data
        const animal = await prisma.animal.findFirst({
            where: { id: animalId, isActive: true },
            select: { name: true, tagNumber: true, animalNumber: true, photoUrl: true, isHeifer: true }
        });

        if (!animal) {
            throw new AppError('Animal not found', 404, 'ANIMAL_NOT_FOUND');
        }

        const bucket = 'gaushala-media';
        const animalPhoto = animal.photoUrl ? await getPresignedViewUrl(bucket, animal.photoUrl) : null;

        // 4. Merge and format records
        const combinedData = [
            ...historicalRecords.map(r => ({
                id: r.id,
                animalId: animalId,
                photo: animalPhoto,
                name: animal.name,
                tagno: animal.tagNumber,
                cowNo: animal.animalNumber,
                parity: r.parityNo,
                isHeifer: animal.isHeifer,
                calfStatus: null,
                breedingType: r.pregnancyType,
                totalDays: Math.floor((new Date(r.deliveryDate).getTime() - new Date(r.pregnancyDate).getTime()) / (1000 * 60 * 60 * 24)),
                totalMilk: 0, // Placeholder as production data is in another service
                pregnantDate: r.pregnancyDate,
                deliveryDate: r.deliveryDate,
                bullName: r.bullName || '-',
                note: r.note,
                type: 'HISTORICAL'
            })),
            ...journeyRecords.map(j => ({
                id: j.id,
                animalId: animalId,
                photo: animalPhoto,
                name: animal.name,
                tagno: animal.tagNumber,
                cowNo: animal.animalNumber,
                parity: j.parity + 1,
                isHeifer: animal.isHeifer,
                calfStatus: j.calfStatus,
                breedingType: j.pregnancyType,
                totalDays: j.deliveryDate ? Math.floor((new Date(j.deliveryDate).getTime() - new Date(j.conceiveDate).getTime()) / (1000 * 60 * 60 * 24)) : 0,
                totalMilk: 0,
                pregnantDate: j.conceiveDate,
                deliveryDate: j.deliveryDate,
                bullName: j.bullName || '-',
                note: null,
                type: 'JOURNEY'
            }))
        ].sort((a, b) => b.parity - a.parity);

        res.status(200).json({
            success: true,
            totalParity: combinedData.length,
            data: combinedData
        });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Update Parity Record ─────────────────────────
export const updateParityRecord = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }
        const id = req.params.id as string;
        const {
            parityNo, cowPhoto, pregnancyType,
            bullId, bullName, deliveryDate, pregnancyDate,
            dryOffDate, note
        } = req.body as Partial<ParityBody>;

        const record = await prisma.parityRecord.update({
            where: { id, gaushalaId },
            data: {
                ...(parityNo !== undefined && { parityNo: Number(parityNo) }),
                ...(cowPhoto !== undefined && { cowPhoto }),
                ...(pregnancyType !== undefined && { pregnancyType }),
                ...(bullId !== undefined && { bullId }),
                ...(bullName !== undefined && { bullName }),
                ...(deliveryDate && { deliveryDate: new Date(deliveryDate) }),
                ...(pregnancyDate && { pregnancyDate: new Date(pregnancyDate) }),
                ...(dryOffDate !== undefined && { dryOffDate: dryOffDate ? new Date(dryOffDate) : null }),
                ...(note !== undefined && { note })
            }
        });

        res.status(200).json({
            success: true,
            message: 'Parity record updated successfully',
            data: record
        });
    } catch (error) {
        next(error);
    }
};
