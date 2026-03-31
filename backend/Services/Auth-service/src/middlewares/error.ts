import { Request, Response, NextFunction } from 'express';
import logger from '@utils/logger.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
