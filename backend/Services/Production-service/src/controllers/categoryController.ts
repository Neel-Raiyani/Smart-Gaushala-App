import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { AuthRequest } from '@appTypes/express.js';
import { AppError } from '@utils/AppError.js';
import logger from '@utils/logger.js';

/**
 * Get all milk distribution categories for a Gaushala.
 */
export const getCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;

        const categories = await prisma.milkDistributionCategory.findMany({
            where: { gaushalaId },
            orderBy: { name: 'asc' }
        });

        res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new distribution category.
 */
export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { name } = req.body;

        if (!name) {
            throw new AppError('Category name is required', 400, 'MISSING_NAME');
        }

        const category = await prisma.milkDistributionCategory.create({
            data: {
                gaushalaId,
                name: name.trim()
            }
        });

        logger.info(`Distribution category created: ${category.name} in Gaushala ${gaushalaId}`);
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return next(new AppError('A category with this name already exists', 409, 'DUPLICATE_CATEGORY'));
        }
        next(error);
    }
};

/**
 * Update a distribution category.
 */
export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const gaushalaId = req.gaushala?.id as string;
        const { name } = req.body;

        if (!name) {
            throw new AppError('Category name is required', 400, 'MISSING_NAME');
        }

        // Verify existence and ownership
        const existing = await prisma.milkDistributionCategory.findFirst({
            where: { id: id as string, gaushalaId }
        });

        if (!existing) {
            throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
        }

        const category = await prisma.milkDistributionCategory.update({
            where: { id: id as string },
            data: { name: name.trim() }
        });

        logger.info(`Distribution category updated: ${category.name} in Gaushala ${gaushalaId}`);
        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            category
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return next(new AppError('A category with this name already exists', 409, 'DUPLICATE_CATEGORY'));
        }
        next(error);
    }
};

/**
 * Delete a distribution category.
 * Note: Should consider what happens to existing distribution records using this category.
 */
export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const gaushalaId = req.gaushala?.id as string;

        const existing = await prisma.milkDistributionCategory.findFirst({
            where: { id: id as string, gaushalaId }
        });

        if (!existing) {
            throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
        }

        // Check if category is in use
        const distributionInUse = await prisma.milkDistribution.findFirst({
            where: { categoryId: id as string }
        });

        if (distributionInUse) {
            throw new AppError('Cannot delete category as it is currently in use by distribution records', 400, 'CATEGORY_IN_USE');
        }

        await prisma.milkDistributionCategory.delete({
            where: { id: id as string }
        });

        logger.info(`Distribution category deleted: ${existing.name} in Gaushala ${gaushalaId}`);
        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
