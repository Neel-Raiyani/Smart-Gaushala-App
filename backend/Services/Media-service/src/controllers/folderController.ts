import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { AuthRequest } from '@appTypes/express.js';
import { AppError } from '@utils/AppError.js';
import { deleteS3Object } from '@utils/s3.js';

/**
 * Create a new gallery folder.
 */
export const createFolder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { name, type } = req.body;
        if (!name || !type) {
            throw new AppError('Name and type are required', 400);
        }

        const folder = await (prisma as any).folder.create({
            data: {
                name,
                type,
                gaushalaId
            }
        });

        res.status(201).json({
            success: true,
            message: 'Folder created successfully',
            data: folder
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return next(new AppError('A folder with this name already exists', 409, 'DUPLICATE_ENTRY'));
        }
        next(error);
    }
};

/**
 * Get all folders for a gaushala.
 */
export const getFolders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { type } = req.query;

        const where: any = { gaushalaId };
        if (type) where.type = type;

        const folders = await (prisma as any).folder.findMany({
            where,
            include: {
                _count: {
                    select: { items: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: folders.map((f: any) => ({
                ...f,
                itemCount: f._count.items,
                _count: undefined
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Rename a folder.
 */
export const renameFolder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { id } = req.params;
        const { name } = req.body;
        if (!name) throw new AppError('Name is required', 400);

        const folder = await (prisma as any).folder.findFirst({
            where: { id, gaushalaId }
        });

        if (!folder) throw new AppError('Folder not found', 404, 'FOLDER_NOT_FOUND');

        const updatedFolder = await (prisma as any).folder.update({
            where: { id },
            data: { name }
        });

        res.status(200).json({
            success: true,
            message: 'Folder renamed successfully',
            data: updatedFolder
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a folder and its contents.
 */
export const deleteFolder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const gaushalaId = req.gaushala?.id as string;

        const folder = await (prisma as any).folder.findFirst({
            where: { id, gaushalaId },
            include: { items: true }
        });

        if (!folder) throw new AppError('Folder not found', 404, 'FOLDER_NOT_FOUND');

        // Delete files from S3
        for (const item of folder.items) {
            await deleteS3Object(item.fileName);
        }

        // Delete from DB (Cascade will handle galleryItem records, but we did S3 first)
        await (prisma as any).folder.delete({
            where: { id }
        });

        res.status(200).json({
            success: true,
            message: 'Folder and contents deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
