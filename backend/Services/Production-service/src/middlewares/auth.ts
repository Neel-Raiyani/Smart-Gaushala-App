import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '@utils/AppError.js';

export interface AuthRequest extends Request {
    user?: any;
}

/**
 * JWT authentication middleware.
 * Extracts the token from the Authorization header, verifies it,
 * and attaches the decoded payload to req.user.
 */
export const auth = (req: any, _res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Authentication required. Provide a Bearer token.', 401, 'AUTH_REQUIRED');
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw new AppError('Authentication required. Token is empty.', 401, 'AUTH_REQUIRED');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (error: any) {
        if (error instanceof AppError) {
            return next(error);
        }
        next(error);
    }
};
