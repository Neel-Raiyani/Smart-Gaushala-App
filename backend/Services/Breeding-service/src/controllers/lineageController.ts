import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { Prisma } from '@prisma/client';
import logger from '@utils/logger.js';
import { AppError } from '@utils/AppError.js';
import type { AuthRequest } from '@appTypes/express.js';

// ───────────────────────── Get Children (Offspring) ─────────────────────────
export const getChildren = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) {
            return res.status(401).json({ message: 'Gaushala ID missing' });
        }
        const id = req.params.id as string; // Parent ID

        // 1. Fetch parent to determine gender
        const parent = await prisma.animal.findUnique({
            where: { id, gaushalaId }
        });

        if (!parent) {
            throw new AppError('Parent animal not found', 404, 'PARENT_NOT_FOUND');
        }

        // 2. Search criteria based on gender
        const where: Prisma.AnimalWhereInput = { gaushalaId };
        if (parent.gender === 'FEMALE') {
            where.motherId = id;
        } else {
            where.fatherId = id;
        }

        // 3. Fetch offspring with specific fields
        const children = await prisma.animal.findMany({
            where,
            select: {
                id: true,
                name: true,
                tagNumber: true,
                birthDate: true,
                isRetired: true,
                isHeifer: true,
                isLactating: true,
                isPregnant: true,
                isDryOff: true
            },
            orderBy: { birthDate: 'desc' }
        });

        res.status(200).json({
            success: true,
            count: children.length,
            data: children
        });
    } catch (error) {
        next(error);
    }
};
