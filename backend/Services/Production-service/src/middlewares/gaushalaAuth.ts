import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { AppError } from '@utils/AppError.js';

/**
 * Middleware to verify the user's membership and role in a specific Gaushala.
 * Reads `gaushala-id` from request headers and `userId` from the JWT payload.
 *
 * @param roles - Optional array of allowed roles. If empty, any active member is allowed.
 */
export const gaushalaAuth = (roles: string[] = []) => {
    return async (req: any, _res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            const gaushalaId = req.headers['gaushala-id'] as string;

            if (!userId) {
                throw new AppError('User identity missing from token', 401, 'AUTH_REQUIRED');
            }

            if (!gaushalaId) {
                throw new AppError('gaushala-id header is required', 400, 'MISSING_GAUSHALA_ID');
            }

            const membership = await prisma.userGaushala.findUnique({
                where: {
                    userId_gaushalaId: { userId, gaushalaId }
                }
            });

            if (!membership || !membership.isActive) {
                throw new AppError(
                    'Access denied: You are not an active member of this Gaushala',
                    403,
                    'GAUSHALA_ACCESS_DENIED'
                );
            }

            if (roles.length > 0 && !roles.includes(membership.role)) {
                throw new AppError(
                    `Access denied: Required role(s): ${roles.join(', ')}. Your role: ${membership.role}`,
                    403,
                    'INSUFFICIENT_ROLE'
                );
            }

            // Attach membership info for downstream use
            req.gaushala = {
                id: gaushalaId,
                role: membership.role
            };

            next();
        } catch (error) {
            next(error);
        }
    };
};
