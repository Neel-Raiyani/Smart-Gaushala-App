import { Request, Response, NextFunction } from 'express';
import logger from '@utils/logger.js';
import { AppError } from '@utils/AppError.js';
import { Prisma } from '@prisma/client';

/**
 * Centralized error handler — catches all errors thrown/nexted from controllers & middleware.
 * Handles: AppError, Prisma errors, JWT errors, and unknown errors.
 */
export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
    // ── 1. Our own AppError (known, operational) ──
    if (err instanceof AppError) {
        logger.error(`[${err.errorCode}] ${err.message} - ${req.method} ${req.originalUrl}`);
        return res.status(err.statusCode).json({
            success: false,
            errorCode: err.errorCode,
            message: err.message
        });
    }

    // ── 2. Prisma: Record not found (P2025) ──
    if (err instanceof (Prisma as any).PrismaClientKnownRequestError && err.code === 'P2025') {
        logger.error(`[RECORD_NOT_FOUND] ${err.message} - ${req.method} ${req.originalUrl}`);
        return res.status(404).json({
            success: false,
            errorCode: 'RECORD_NOT_FOUND',
            message: 'The requested record was not found'
        });
    }

    // ── 3. Prisma: Unique constraint violation (P2002) ──
    if (err instanceof (Prisma as any).PrismaClientKnownRequestError && err.code === 'P2002') {
        const target = (err.meta?.target as string[])?.join(', ') || 'field';
        logger.error(`[DUPLICATE_ENTRY] ${target} - ${req.method} ${req.originalUrl}`);
        return res.status(409).json({
            success: false,
            errorCode: 'DUPLICATE_ENTRY',
            message: `A record with this ${target} already exists`
        });
    }

    // ── 4. Prisma: Invalid ObjectId format (P2023) ──
    if (err instanceof (Prisma as any).PrismaClientKnownRequestError && err.code === 'P2023') {
        logger.error(`[INVALID_ID] ${err.message} - ${req.method} ${req.originalUrl}`);
        return res.status(400).json({
            success: false,
            errorCode: 'INVALID_ID',
            message: 'The provided ID format is invalid'
        });
    }

    // ── 5. Prisma: Validation Error ──
    if (err instanceof (Prisma as any).PrismaClientValidationError) {
        logger.error(`[VALIDATION_ERROR] ${err.message} - ${req.method} ${req.originalUrl}`);
        return res.status(400).json({
            success: false,
            errorCode: 'VALIDATION_ERROR',
            message: 'Invalid data provided to the database'
        });
    }

    // ── 6. JWT Errors ──
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            errorCode: 'INVALID_TOKEN',
            message: 'Invalid authentication token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            errorCode: 'TOKEN_EXPIRED',
            message: 'Authentication token has expired'
        });
    }

    // ── 7. Unknown / Programming Errors ──
    logger.error(`[INTERNAL_ERROR] ${err.message} - ${req.method} ${req.originalUrl} - Stack: ${err.stack}`);
    res.status(500).json({
        success: false,
        errorCode: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : err.message || 'Internal Server Error'
    });
};
