import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { Prisma } from '@prisma/client';
import { AppError } from '@utils/AppError.js';
import logger from '@utils/logger.js';
import type { AuthRequest } from '@appTypes/express.js';
import { deleteRelatedRecords } from '@utils/cleanupHelper.js';

// ───────────────────────── Record Sale ─────────────────────────
export const recordSell = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const {
            animalId, buyer, mobileNumber, city,
            amount, referenceBy, photoUrl, soldAt
        } = req.body;

        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const animal = await tx.animal.findFirst({
                where: { id: animalId as string, gaushalaId: gaushalaId as string, isActive: true }
            });

            if (!animal) {
                throw new AppError('Animal not found in this Gaushala', 404, 'ANIMAL_NOT_FOUND');
            }
            if (animal.status !== 'ACTIVE') {
                throw new AppError(
                    `Cannot sell: Animal status is ${animal.status}`,
                    409,
                    'ANIMAL_NOT_ACTIVE'
                );
            }

            const sellRecord = await tx.sellRecord.create({
                data: {
                    animalId: animalId as string,
                    buyer,
                    mobileNumber,
                    city: city || null,
                    amount: Number(amount),
                    referenceBy: referenceBy || null,
                    photoUrl: photoUrl || null,
                    soldAt: soldAt ? new Date(soldAt) : new Date()
                }
            });

            await tx.animal.update({
                where: { id: animalId as string },
                data: { status: 'SOLD' }
            });

            // Cascade delete related records
            await deleteRelatedRecords(tx, animalId as string);

            return sellRecord;
        });

        logger.info(`Animal sold: ${animalId} in Gaushala ${gaushalaId}`);
        res.status(201).json({
            success: true,
            message: 'Sell record created successfully',
            record: result
        });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Record Death ─────────────────────────
export const recordDeath = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { animalId, dateOfDeath, reason, lastPhotoUrl } = req.body;

        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const animal = await tx.animal.findFirst({
                where: { id: animalId as string, gaushalaId: gaushalaId as string, isActive: true }
            });

            if (!animal) {
                throw new AppError('Animal not found in this Gaushala', 404, 'ANIMAL_NOT_FOUND');
            }
            if (animal.status !== 'ACTIVE') {
                throw new AppError(
                    `Cannot record death: Animal status is ${animal.status}`,
                    409,
                    'ANIMAL_NOT_ACTIVE'
                );
            }

            const deathRecord = await tx.deathRecord.create({
                data: {
                    animalId: animalId as string,
                    dateOfDeath: new Date(dateOfDeath),
                    reason,
                    lastPhotoUrl: lastPhotoUrl || null
                }
            });

            await tx.animal.update({
                where: { id: animalId as string },
                data: { status: 'DEAD' }
            });

            // Cascade delete related records
            await deleteRelatedRecords(tx, animalId as string);

            return deathRecord;
        });

        logger.info(`Animal death recorded: ${animalId} in Gaushala ${gaushalaId}`);
        res.status(201).json({
            success: true,
            message: 'Death record created successfully',
            record: result
        });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Record Donation ─────────────────────────
export const recordDonation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const {
            animalId, gaushalaName, mobileNumber,
            referenceBy, photoUrl, donatedAt
        } = req.body;

        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const animal = await tx.animal.findFirst({
                where: { id: animalId as string, gaushalaId: gaushalaId as string, isActive: true }
            });

            if (!animal) {
                throw new AppError('Animal not found in this Gaushala', 404, 'ANIMAL_NOT_FOUND');
            }
            if (animal.status !== 'ACTIVE') {
                throw new AppError(
                    `Cannot donate: Animal status is ${animal.status}`,
                    409,
                    'ANIMAL_NOT_ACTIVE'
                );
            }

            const donationRecord = await tx.donationRecord.create({
                data: {
                    animalId: animalId as string,
                    gaushalaName,
                    mobileNumber,
                    referenceBy: referenceBy || null,
                    photoUrl: photoUrl || null,
                    donatedAt: donatedAt ? new Date(donatedAt) : new Date()
                }
            });

            await tx.animal.update({
                where: { id: animalId as string },
                data: { status: 'DONATED' }
            });

            // Cascade delete related records
            await deleteRelatedRecords(tx, animalId as string);

            return donationRecord;
        });

        logger.info(`Animal donated: ${animalId} in Gaushala ${gaushalaId}`);
        res.status(201).json({
            success: true,
            message: 'Donation record created successfully',
            record: result
        });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Update Disposal Record ─────────────────────────
export const updateDisposalRecord = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const type = req.params.type as string;
        const id = req.params.id as string;
        const data = req.body;

        if (Object.keys(data).length === 0) {
            throw new AppError('No fields provided for update', 400, 'NO_UPDATE_FIELDS');
        }

        // Prevent changing the animalId on disposal records
        delete (data as any).animalId;

        const validTypes = ['sell', 'death', 'donation'];
        if (!validTypes.includes(type)) {
            throw new AppError(
                `Invalid disposal type '${type}'. Use: ${validTypes.join(', ')}`,
                400,
                'INVALID_DISPOSAL_TYPE'
            );
        }

        let result;
        switch (type) {
            case 'sell':
                result = await prisma.sellRecord.update({
                    where: { id: id as string },
                    data: {
                        buyer: data.buyer,
                        mobileNumber: data.mobileNumber,
                        city: data.city,
                        amount: data.amount !== undefined ? Number(data.amount) : undefined,
                        referenceBy: data.referenceBy,
                        photoUrl: data.photoUrl,
                        soldAt: data.soldAt ? new Date(data.soldAt) : undefined
                    }
                });
                break;
            case 'death':
                result = await prisma.deathRecord.update({
                    where: { id: id as string },
                    data: {
                        dateOfDeath: data.dateOfDeath ? new Date(data.dateOfDeath as any) : undefined,
                        reason: data.reason,
                        lastPhotoUrl: data.lastPhotoUrl
                    }
                });
                break;
            case 'donation':
                result = await prisma.donationRecord.update({
                    where: { id: id as string },
                    data: {
                        gaushalaName: data.gaushalaName,
                        mobileNumber: data.mobileNumber,
                        referenceBy: data.referenceBy,
                        photoUrl: data.photoUrl,
                        donatedAt: data.donatedAt ? new Date(data.donatedAt) : undefined
                    }
                });
                break;
        }

        logger.info(`Disposal record updated: ${type}/${id}`);
        res.status(200).json({
            success: true,
            message: 'Record updated successfully',
            record: result
        });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Delete Disposal Record (Soft Delete) ─────────────────────────
export const deleteDisposalRecord = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { type, id } = req.params;
        const gaushalaId = req.gaushala?.id as string;

        const validTypes = ['sell', 'death', 'donation'];
        if (!validTypes.includes(type as string)) {
            throw new AppError(`Invalid disposal type '${type}'`, 400, 'INVALID_DISPOSAL_TYPE');
        }

        let record;
        switch (type) {
            case 'sell':
                record = await prisma.sellRecord.findFirst({ where: { id: id as string, isActive: true } });
                if (record) {
                    await prisma.sellRecord.update({ where: { id: id as string }, data: { isActive: false } });
                }
                break;
            case 'death':
                record = await prisma.deathRecord.findFirst({ where: { id: id as string, isActive: true } });
                if (record) {
                    await prisma.deathRecord.update({ where: { id: id as string }, data: { isActive: false } });
                }
                break;
            case 'donation':
                record = await prisma.donationRecord.findFirst({ where: { id: id as string, isActive: true } });
                if (record) {
                    await prisma.donationRecord.update({ where: { id: id as string }, data: { isActive: false } });
                }
                break;
        }

        if (!record) {
            throw new AppError('Record not found', 404, 'RECORD_NOT_FOUND');
        }

        logger.info(`Disposal record soft-deleted: ${type}/${id} in Gaushala ${gaushalaId}`);
        res.status(200).json({
            success: true,
            message: 'Record deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Get Disposal Records ─────────────────────────
export const getDisposalRecords = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { type = 'all', search, page = '1', limit = '20' } = req.query;

        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
        const skip = (pageNum - 1) * limitNum;

        const whereAnimal: any = { gaushalaId, isActive: true };
        if (search) {
            whereAnimal.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { tagNumber: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const validTypes = ['sell', 'death', 'donation', 'all'];
        const filterType = validTypes.includes(type as string) ? (type as string) : 'all';

        const bucket = (process.env.S3_BUCKET_DISPOSAL_MEDIA || 'disposal-media') as string;
        const animalBucket = (process.env.S3_BUCKET_CATTLE_PHOTOS || 'cattle-photos') as string;

        let records: any[] = [];
        let total = 0;

        // Helper to enrich records with view URLs
        const enrichRecords = async (list: any[], photoField: string) => {
            return Promise.all(list.map(async (rec) => {
                const enriched = { ...rec };
                if (rec[photoField]) {
                    try {
                        enriched.viewUrl = await getPresignedViewUrl(bucket, rec[photoField]);
                    } catch (err) {
                        logger.error(`Error generating view URL for disposal ${rec.id}:`, err);
                    }
                }
                if (rec.animal?.photoUrl) {
                    try {
                        enriched.animal.viewUrl = await getPresignedViewUrl(animalBucket, rec.animal.photoUrl);
                    } catch (err) {
                        logger.error(`Error generating animal view URL for ${rec.animal.id}:`, err);
                    }
                }
                return enriched;
            }));
        };

        if (filterType === 'sell' || filterType === 'all') {
            const [list, count] = await Promise.all([
                prisma.sellRecord.findMany({
                    where: { animal: whereAnimal, isActive: true },
                    include: { animal: true },
                    skip: filterType === 'all' ? 0 : skip,
                    take: filterType === 'all' ? 1000 : limitNum,
                    orderBy: { soldAt: 'desc' }
                }),
                prisma.sellRecord.count({ where: { animal: whereAnimal, isActive: true } })
            ]);
            const enriched = await enrichRecords(list, 'photoUrl');
            records.push(...enriched.map(r => ({ ...r, disposalType: 'sell' })));
            total += count;
        }

        if (filterType === 'death' || filterType === 'all') {
            const [list, count] = await Promise.all([
                prisma.deathRecord.findMany({
                    where: { animal: whereAnimal, isActive: true },
                    include: { animal: true },
                    skip: filterType === 'all' ? 0 : skip,
                    take: filterType === 'all' ? 1000 : limitNum,
                    orderBy: { dateOfDeath: 'desc' }
                }),
                prisma.deathRecord.count({ where: { animal: whereAnimal, isActive: true } })
            ]);
            const enriched = await enrichRecords(list, 'lastPhotoUrl');
            records.push(...enriched.map(r => ({ ...r, disposalType: 'death' })));
            total += count;
        }

        if (filterType === 'donation' || filterType === 'all') {
            const [list, count] = await Promise.all([
                prisma.donationRecord.findMany({
                    where: { animal: whereAnimal, isActive: true },
                    include: { animal: true },
                    skip: filterType === 'all' ? 0 : skip,
                    take: filterType === 'all' ? 1000 : limitNum,
                    orderBy: { donatedAt: 'desc' }
                }),
                prisma.donationRecord.count({ where: { animal: whereAnimal, isActive: true } })
            ]);
            const enriched = await enrichRecords(list, 'photoUrl');
            records.push(...enriched.map(r => ({ ...r, disposalType: 'donation' })));
            total += count;
        }

        // Final sorting for 'all' type and unified pagination
        if (filterType === 'all') {
            records.sort((a, b) => {
                const dateA = new Date(a.soldAt || a.dateOfDeath || a.donatedAt).getTime();
                const dateB = new Date(b.soldAt || b.dateOfDeath || b.donatedAt).getTime();
                return dateB - dateA;
            });
            records = records.slice(skip, skip + limitNum);
        }

        res.status(200).json({
            success: true,
            records,
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

// Internal utility since was not exported in original code or assumed available
async function getPresignedViewUrl(bucket: string, key: string) {
    const { getPresignedViewUrl: originalFn } = await import('@utils/s3.js');
    return originalFn(bucket, key);
}
