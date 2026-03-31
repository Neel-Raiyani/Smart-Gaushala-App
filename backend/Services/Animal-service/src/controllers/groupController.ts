import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { Prisma } from '@prisma/client';
import { AppError } from '@utils/AppError.js';
import logger from '@utils/logger.js';
import type { AuthRequest } from '@appTypes/express.js';

// ───────────────────────── Get Groups ─────────────────────────
export const getGroups = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;

        const groups = await prisma.cowGroup.findMany({
            where: { gaushalaId: gaushalaId as string },
            orderBy: { name: 'asc' }
        });

        res.status(200).json({ success: true, groups });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Create Group ─────────────────────────
export const createGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { name } = req.body;

        if (!name || !name.trim()) {
            throw new AppError('Group name is required', 400, 'MISSING_NAME');
        }

        const group = await prisma.cowGroup.create({
            data: { gaushalaId: gaushalaId as string, name: name.trim() }
        });

        logger.info(`Cow group created: "${name}" in Gaushala ${gaushalaId}`);
        res.status(201).json({ success: true, message: 'Group created', group });
    } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return res.status(409).json({
                success: false,
                message: 'A group with this name already exists in this Gaushala'
            });
        }
        next(error);
    }
};

// ───────────────────────── Update Group ─────────────────────────
export const updateGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const gaushalaId = req.gaushala?.id as string;
        const { name } = req.body;

        if (!name || !name.trim()) {
            throw new AppError('Group name is required', 400, 'MISSING_NAME');
        }

        // Verify group exists and belongs to this gaushala
        const existing = await prisma.cowGroup.findFirst({
            where: { id: id as string, gaushalaId: gaushalaId as string }
        });
        if (!existing) {
            throw new AppError('Group not found', 404, 'GROUP_NOT_FOUND');
        }

        const group = await prisma.cowGroup.update({
            where: { id: id as string },
            data: { name: name.trim() }
        });

        logger.info(`Cow group updated: "${name}" in Gaushala ${gaushalaId}`);
        res.status(200).json({ success: true, message: 'Group updated', group });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                success: false,
                message: 'A group with this name already exists in this Gaushala'
            });
        }
        next(error);
    }
};

// ───────────────────────── Delete Group ─────────────────────────
export const deleteGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const gaushalaId = req.gaushala?.id as string;

        const existing = await prisma.cowGroup.findFirst({
            where: { id: id as string, gaushalaId: gaushalaId as string }
        });
        if (!existing) {
            throw new AppError('Group not found', 404, 'GROUP_NOT_FOUND');
        }

        await prisma.cowGroup.delete({ where: { id: id as string } });

        logger.info(`Cow group deleted: "${existing.name}" from Gaushala ${gaushalaId}`);
        res.status(200).json({ success: true, message: 'Group deleted' });
    } catch (error) {
        next(error);
    }
};
