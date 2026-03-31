import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { AuthRequest } from '@appTypes/express.js';
import { AppError } from '@utils/AppError.js';
import logger from '@utils/logger.js';

/**
 * Record milk distribution for a category on a specific date/session.
 */
export const recordDistribution = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { date, session, categoryId, quantity } = req.body;

        if (!date || !session || !categoryId || quantity === undefined) {
            throw new AppError('Date, session, categoryId and quantity are required', 400, 'MISSING_DATA');
        }

        // Verify category
        const category = await prisma.milkDistributionCategory.findFirst({
            where: { id: categoryId, gaushalaId }
        });

        if (!category) {
            throw new AppError('Invalid distribution category', 400, 'INVALID_CATEGORY');
        }

        const distribution = await prisma.milkDistribution.create({
            data: {
                gaushalaId,
                date: new Date(date),
                session,
                categoryId,
                quantity: Number(quantity) // Liters
            }
        });

        logger.info(`Recorded distribution of ${quantity}L to ${category.name} in Gaushala ${gaushalaId}`);

        res.status(201).json({
            success: true,
            message: 'Distribution recorded successfully',
            distribution
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get distribution records for a specific date and session.
 */
export const getDistributions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { date, session } = req.query;

        const where: any = { gaushalaId };
        if (date) where.date = new Date(date as string);
        if (session) where.session = session as any;

        const distributions = await prisma.milkDistribution.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        // Fetch categories to attach names (since we didn't define relation in prisma)
        const categories = await prisma.milkDistributionCategory.findMany({
            where: { gaushalaId }
        });

        const categoryMap = categories.reduce((acc: any, cat) => {
            acc[cat.id] = cat.name;
            return acc;
        }, {});

        const resultWithNames = distributions.map(d => ({
            ...d,
            categoryName: categoryMap[d.categoryId] || 'Unknown'
        }));

        res.status(200).json({
            success: true,
            distributions: resultWithNames
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a distribution record.
 */
export const updateDistribution = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const gaushalaId = req.gaushala?.id as string;
        const { quantity, categoryId, date, session } = req.body;

        const existing = await prisma.milkDistribution.findFirst({
            where: { id: id as string, gaushalaId }
        });

        if (!existing) {
            throw new AppError('Distribution record not found', 404, 'RECORD_NOT_FOUND');
        }

        const data: any = {};
        if (quantity !== undefined) data.quantity = Number(quantity);
        if (categoryId) data.categoryId = categoryId;
        if (date) data.date = new Date(date);
        if (session) data.session = session;

        const updated = await prisma.milkDistribution.update({
            where: { id: id as string },
            data
        });

        logger.info(`Updated distribution record ${id} in Gaushala ${gaushalaId}`);

        res.status(200).json({
            success: true,
            message: 'Distribution updated successfully',
            distribution: updated
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a distribution record.
 */
export const deleteDistribution = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const gaushalaId = req.gaushala?.id as string;

        const existing = await prisma.milkDistribution.findFirst({
            where: { id: id as string, gaushalaId }
        });

        if (!existing) {
            throw new AppError('Distribution record not found', 404, 'RECORD_NOT_FOUND');
        }

        await prisma.milkDistribution.delete({ where: { id: id as string } });

        logger.info(`Deleted distribution record ${id} in Gaushala ${gaushalaId}`);

        res.status(200).json({
            success: true,
            message: 'Distribution deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
