import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { Prisma } from '@prisma/client';
import logger from '@utils/logger.js';
import type { AuthRequest } from '@appTypes/express.js';

// ──────────────────────── Create Gaushala ────────────────────────
export const createGaushala = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { name, city, state, totalCattle } = req.body;

        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const gaushala = await tx.gaushala.create({
                data: {
                    name,
                    city,
                    state,
                    totalCattle: parseInt(totalCattle) || 0
                }
            });

            await tx.userGaushala.create({
                data: {
                    userId,
                    gaushalaId: gaushala.id,
                    role: 'OWNER'
                }
            });

            return gaushala;
        });

        logger.info(`New Gaushala created by user ${userId}: ${name}`);
        res.status(201).json({
            message: 'Gaushala created successfully',
            gaushala: result
        });
    } catch (error) {
        next(error);
    }
};

// ──────────────────────── Get User's Gaushalas ────────────────────────
export const getMyGaushalas = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const memberships = await prisma.userGaushala.findMany({
            where: { userId, isActive: true },
            include: { gaushala: true }
        });

        interface MembershipWithGaushala extends Prisma.UserGaushalaGetPayload<{ include: { gaushala: true } }> { }

        res.status(200).json({
            success: true,
            data: memberships.map((m: MembershipWithGaushala) => ({
                id: m.gaushala.id,
                name: m.gaushala.name,
                role: m.role,
                city: m.gaushala.city
            }))
        });
    } catch (error) {
        next(error);
    }
};
