import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { Animal } from '@prisma/client';
import logger from '@utils/logger.js';
import { AppError } from '@utils/AppError.js';
import { getPresignedUploadUrl, getPresignedViewUrl } from '@utils/s3.js';
import type { AuthRequest } from '@appTypes/express.js';
import { deleteRelatedRecords } from '@utils/cleanupHelper.js';

// ───────────────────────── Register Animal ─────────────────────────
export const registerAnimal = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;

        const {
            name, tagNumber, animalNumber, gender,
            cowBreed, cowGroupId, birthDate,
            parity, bullType,
            bullView, motherMilk, grandmotherMilk, isHandicapped, handicapReason,
            acquisitionType, purchaseDate, purchasedFrom, purchasePrice, ownerName, ownerMobile,
            photoUrl,
            isUdderClosedFL, isUdderClosedFR, isUdderClosedBL, isUdderClosedBR,
            motherName, fatherName, motherId, fatherId
        } = req.body;

        const bDate = new Date(birthDate);
        const adultDate = new Date(bDate);
        adultDate.setMonth(adultDate.getMonth() + 12);

        const now = new Date();
        const parityValue = parity ?? 0;

        let autoLactating = false;
        let autoHeifer = false;

        if (gender === 'FEMALE') {
            // Cross-validate: parity > 0 is impossible for animals under 12 months
            if (parityValue > 0 && now < adultDate) {
                throw new AppError(
                    'Parity cannot be greater than 0 for an animal younger than 12 months',
                    400,
                    'INVALID_PARITY_AGE'
                );
            }

            if (parityValue > 0) {
                autoLactating = true;
                autoHeifer = false;
            } else if (now >= adultDate) {
                autoHeifer = true;
                autoLactating = false;
            }
        }

        // Duplicate tag check within same gaushala
        if (tagNumber) {
            const existing = await prisma.animal.findFirst({
                where: { tagNumber, gaushalaId, isActive: true }
            });
            if (existing) {
                throw new AppError('Tag number already exists in this Gaushala', 409, 'DUPLICATE_TAG');
            }
        }

        const animal = await prisma.animal.create({
            data: {
                name,
                tagNumber,
                animalNumber,
                gender,
                gaushalaId,
                cowBreed: cowBreed || null,
                cowGroupId: cowGroupId || null,
                birthDate: bDate,
                adultDate,
                isPregnant: false,
                parity: parityValue,
                isLactating: autoLactating,
                isDryOff: false,
                isHeifer: autoHeifer,
                isRetired: false,
                bullType: gender === 'MALE' ? (bullType || null) : null,
                bullView: bullView || null,
                motherMilk: motherMilk ?? null,
                grandmotherMilk: grandmotherMilk ?? null,
                isHandicapped: isHandicapped ?? false,
                handicapReason: handicapReason || null,
                acquisitionType,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
                purchasedFrom: purchasedFrom || null,
                purchasePrice: purchasePrice ?? null,
                ownerName: ownerName || null,
                ownerMobile: ownerMobile || null,
                photoUrl: photoUrl || null,
                isUdderClosedFL: isUdderClosedFL ?? false,
                isUdderClosedFR: isUdderClosedFR ?? false,
                isUdderClosedBL: isUdderClosedBL ?? false,
                isUdderClosedBR: isUdderClosedBR ?? false,
                motherName: motherName || null,
                fatherName: fatherName || null,
                motherId: motherId || null,
                fatherId: fatherId || null,
                status: 'ACTIVE'
            }
        });

        logger.info(`Animal registered: ${animal.id} in Gaushala ${gaushalaId}`);
        res.status(201).json({
            success: true,
            message: 'Animal registered successfully',
            animal
        });
    } catch (error) {
        next(error);
    }
};


// ───────────────────────── Get Cows (Paginated with Filters) ─────────────────────────
export const getCows = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { filter = 'all', search, cowGroupId, page = '1', limit = '20' } = req.query;

        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
        const skip = (pageNum - 1) * limitNum;

        const now = new Date();
        const twelveMonthsAgo = new Date(now);
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const where: any = { gaushalaId, gender: 'FEMALE', isActive: true, status: 'ACTIVE' };

        switch (filter) {
            case 'lactating': where.isLactating = true; break;
            case 'heifer': where.isHeifer = true; break;
            case 'pregnant': where.isPregnant = true; break;
            case 'dryoff': where.isDryOff = true; break;
            case 'retired': where.isRetired = true; break;
            case 'handicapped': where.isHandicapped = true; break;
            case 'calves': where.birthDate = { gt: twelveMonthsAgo }; break;
        }

        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { tagNumber: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        if (cowGroupId) {
            where.cowGroupId = cowGroupId as string;
        }

        const [animalsList, total] = await Promise.all([
            prisma.animal.findMany({
                where,
                skip,
                take: limitNum,
                select: {
                    id: true,
                    name: true,
                    tagNumber: true,
                    cowBreed: true,
                    cowGroupId: true,
                    cowGroup: { select: { name: true } },
                    parity: true,
                    isHeifer: true,
                    isLactating: true,
                    birthDate: true,
                    adultDate: true,
                    isRetired: true,
                    photoUrl: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.animal.count({ where })
        ]);

        const bucket = (process.env.S3_BUCKET_CATTLE_PHOTOS || 'cattle-photos') as string;
        const cows = await Promise.all(animalsList.map(async (animal) => {
            const enriched: any = {
                ...animal
            };
            if (animal.photoUrl) {
                try {
                    enriched.viewUrl = await getPresignedViewUrl(bucket, animal.photoUrl);
                } catch (err) {
                    logger.error(`Error generating view URL for cow ${animal.id}:`, err);
                }
            }
            return enriched;
        }));

        res.status(200).json({
            success: true,
            cows,
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

// ───────────────────────── Get Bulls (Paginated with Filters) ─────────────────────────
export const getBulls = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { filter = 'all', search, cowGroupId, page = '1', limit = '20' } = req.query;

        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
        const skip = (pageNum - 1) * limitNum;

        const now = new Date();
        const twelveMonthsAgo = new Date(now);
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const where: any = { gaushalaId, gender: 'MALE', isActive: true, status: 'ACTIVE' };

        switch (filter) {
            case 'retired': where.isRetired = true; break;
            case 'calf': where.birthDate = { gt: twelveMonthsAgo }; break;
        }

        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { tagNumber: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        if (cowGroupId) {
            where.cowGroupId = cowGroupId as string;
        }

        const { bullType: bullTypeFilter } = req.query;
        if (bullTypeFilter) {
            where.bullType = bullTypeFilter as string;
        }

        const [animalsList, total] = await Promise.all([
            prisma.animal.findMany({
                where,
                skip,
                take: limitNum,
                select: {
                    id: true,
                    name: true,
                    tagNumber: true,
                    cowBreed: true,
                    cowGroupId: true,
                    cowGroup: { select: { name: true } },
                    parity: true,
                    birthDate: true,
                    adultDate: true,
                    isRetired: true,
                    bullType: true,
                    photoUrl: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.animal.count({ where })
        ]);

        const bucket = process.env.S3_BUCKET_CATTLE_PHOTOS || 'cattle-photos';
        const bulls = await Promise.all(animalsList.map(async (animal) => {
            const enriched: any = {
                ...animal
            };
            if (animal.photoUrl) {
                try {
                    enriched.viewUrl = await getPresignedViewUrl(bucket, animal.photoUrl);
                } catch (err) {
                    logger.error(`Error generating view URL for bull ${animal.id}:`, err);
                }
            }
            return enriched;
        }));

        res.status(200).json({
            success: true,
            bulls,
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

// ───────────────────────── Get Animal By ID ─────────────────────────
export const getAnimalById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const gaushalaId = req.gaushala?.id as string;

        const animal = await prisma.animal.findFirst({
            where: { id: id as string, gaushalaId, isActive: true },
            include: {
                sellRecord: true,
                deathRecord: true,
                donationRecord: true
            }
        });

        if (!animal) {
            throw new AppError('Animal not found in this Gaushala', 404, 'ANIMAL_NOT_FOUND');
        }

        // Enrich with security-signed view URL
        let viewUrl = null;
        if (animal.photoUrl) {
            try {
                const bucket = process.env.S3_BUCKET_CATTLE_PHOTOS || 'cattle-photos';
                viewUrl = await getPresignedViewUrl(bucket, animal.photoUrl);
            } catch (err) {
                logger.error(`Error generating view URL for animal ${id}:`, err);
            }
        }

        res.status(200).json({
            success: true,
            animal: { ...animal, viewUrl }
        });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Update Animal ─────────────────────────
export const updateAnimal = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const gaushalaId = req.gaushala?.id as string;

        // Verify animal exists and belongs to this gaushala
        const existingAnimal = await prisma.animal.findFirst({
            where: { id: id as string, gaushalaId, isActive: true }
        });

        if (!existingAnimal) {
            throw new AppError('Animal not found in this Gaushala', 404, 'ANIMAL_NOT_FOUND');
        }

        const {
            name, tagNumber, animalNumber, gender,
            cowBreed, cowGroupId, birthDate,
            parity, bullType,
            bullView, motherMilk, grandmotherMilk, isHandicapped, handicapReason,
            acquisitionType, purchaseDate, purchasedFrom, purchasePrice, ownerName, ownerMobile,
            photoUrl,
            isUdderClosedFL, isUdderClosedFR, isUdderClosedBL, isUdderClosedBR,
            motherName, fatherName, motherId, fatherId
        } = req.body;

        // Duplicate tag check — only if tagNumber is changing
        if (tagNumber !== undefined && tagNumber !== existingAnimal.tagNumber) {
            const duplicate = await prisma.animal.findFirst({
                where: { tagNumber, gaushalaId, isActive: true }
            });
            if (duplicate) {
                throw new AppError('Tag number already exists in this Gaushala', 409, 'DUPLICATE_TAG');
            }
        }

        // Build update object — only include fields that were actually sent
        const updateData: Record<string, any> = {};
        if (name !== undefined) updateData.name = name;
        if (tagNumber !== undefined) updateData.tagNumber = tagNumber;
        if (animalNumber !== undefined) updateData.animalNumber = animalNumber;
        if (gender !== undefined) updateData.gender = gender;
        if (cowBreed !== undefined) updateData.cowBreed = cowBreed;
        if (cowGroupId !== undefined) updateData.cowGroupId = cowGroupId;
        if (bullType !== undefined) updateData.bullType = bullType;

        // Automatic Logic for Dates and Statuses
        const finalBirthDate = birthDate !== undefined ? new Date(birthDate) : existingAnimal.birthDate;
        if (birthDate !== undefined) {
            updateData.birthDate = finalBirthDate;
            const newAdultDate = new Date(finalBirthDate!);
            newAdultDate.setMonth(newAdultDate.getMonth() + 12);
            updateData.adultDate = newAdultDate;
        }

        const finalParity = parity !== undefined ? parity : existingAnimal.parity;
        if (parity !== undefined) updateData.parity = parity;

        // Recalculate isLactating and isHeifer if parity or birthDate changed
        if (existingAnimal.gender === 'FEMALE' && (parity !== undefined || birthDate !== undefined)) {
            const currentAdultDate = updateData.adultDate || existingAnimal.adultDate;
            const now = new Date();
            const parityValue = finalParity ?? 0;

            // Cross-validate: parity > 0 is impossible for animals under 12 months
            if (parityValue > 0 && currentAdultDate && now < new Date(currentAdultDate)) {
                throw new AppError(
                    'Parity cannot be greater than 0 for an animal younger than 12 months',
                    400,
                    'INVALID_PARITY_AGE'
                );
            }

            if (parityValue > 0) {
                updateData.isLactating = true;
                updateData.isHeifer = false;
            } else if (currentAdultDate && now >= new Date(currentAdultDate)) {
                updateData.isHeifer = true;
                updateData.isLactating = false;
            } else {
                updateData.isHeifer = false;
                updateData.isLactating = false;
            }
        }

        if (bullView !== undefined) updateData.bullView = bullView;
        if (motherMilk !== undefined) updateData.motherMilk = motherMilk;
        if (grandmotherMilk !== undefined) updateData.grandmotherMilk = grandmotherMilk;
        if (isHandicapped !== undefined) updateData.isHandicapped = isHandicapped;
        if (handicapReason !== undefined) updateData.handicapReason = handicapReason;
        if (acquisitionType !== undefined) updateData.acquisitionType = acquisitionType;
        if (purchaseDate !== undefined) updateData.purchaseDate = purchaseDate ? new Date(purchaseDate) : null;
        if (purchasedFrom !== undefined) updateData.purchasedFrom = purchasedFrom;
        if (purchasePrice !== undefined) updateData.purchasePrice = purchasePrice;
        if (ownerName !== undefined) updateData.ownerName = ownerName;
        if (ownerMobile !== undefined) updateData.ownerMobile = ownerMobile;
        if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
        if (isUdderClosedFL !== undefined) updateData.isUdderClosedFL = isUdderClosedFL;
        if (isUdderClosedFR !== undefined) updateData.isUdderClosedFR = isUdderClosedFR;
        if (isUdderClosedBL !== undefined) updateData.isUdderClosedBL = isUdderClosedBL;
        if (isUdderClosedBR !== undefined) updateData.isUdderClosedBR = isUdderClosedBR;
        if (motherName !== undefined) updateData.motherName = motherName;
        if (fatherName !== undefined) updateData.fatherName = fatherName;
        if (motherId !== undefined) updateData.motherId = motherId;
        if (fatherId !== undefined) updateData.fatherId = fatherId;

        if (Object.keys(updateData).length === 0) {
            throw new AppError('No valid fields provided for update', 400, 'NO_UPDATE_FIELDS');
        }

        const animal = await prisma.animal.update({
            where: { id: id as string },
            data: updateData
        });

        logger.info(`Animal updated: ${id} in Gaushala ${gaushalaId}`);
        res.status(200).json({
            success: true,
            message: 'Animal updated successfully',
            animal
        });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Generate Pre-signed Upload URL ─────────────────────────
export const generateUploadUrl = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { fileName, contentType, type } = req.query;

        if (!fileName || !contentType) {
            throw new AppError('fileName and contentType query params are required', 400, 'MISSING_PARAMS');
        }

        const bucketMap: Record<string, string | undefined> = {
            PHOTO: process.env.S3_BUCKET_CATTLE_PHOTOS,
            DISPOSAL: process.env.S3_BUCKET_DISPOSAL_MEDIA,
            DOC: process.env.S3_BUCKET_CATTLE_DOCS
        };

        const bucket = bucketMap[(type as string) || 'PHOTO'];
        if (!bucket) {
            throw new AppError('Invalid upload type. Use PHOTO, DISPOSAL, or DOC', 400, 'INVALID_UPLOAD_TYPE');
        }

        const result = await getPresignedUploadUrl(bucket, fileName as string, contentType as string);
        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Delete Animal (Soft Delete + Cascading Hard Delete) ─────────────────────────
export const deleteAnimal = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const gaushalaId = req.gaushala?.id as string;

        const animal = await prisma.animal.findFirst({
            where: { id: id as string, gaushalaId, isActive: true }
        });

        if (!animal) {
            throw new AppError('Animal not found in this Gaushala', 404, 'ANIMAL_NOT_FOUND');
        }

        await prisma.$transaction(async (tx) => {
            // 1. Soft delete the animal
            await tx.animal.update({
                where: { id: id as string },
                data: { isActive: false }
            });

            // 2. Soft delete any disposal records
            await tx.sellRecord.updateMany({
                where: { animalId: id as string },
                data: { isActive: false }
            });
            await tx.deathRecord.updateMany({
                where: { animalId: id as string },
                data: { isActive: false }
            });
            await tx.donationRecord.updateMany({
                where: { animalId: id as string },
                data: { isActive: false }
            });

            // 3. Hard delete all related service records
            await deleteRelatedRecords(tx, id as string);
        });

        logger.info(`Animal soft-deleted and history cleared: ${id} in Gaushala ${gaushalaId}`);
        res.status(200).json({
            success: true,
            message: 'Animal and its history deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
