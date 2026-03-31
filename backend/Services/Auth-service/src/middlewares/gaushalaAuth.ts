import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import type { AuthRequest } from '@appTypes/express.js';

/**
 * Middleware to check if user belongs to a specific gaushala with a required role.
 * Expects gaushala-id in headers.
 */
export const gaushalaAuth = (roles: string[] = []) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            const gaushalaId = req.headers['gaushala-id'] as string;

            if (!userId) {
                return res.status(401).json({ message: 'User identity missing' });
            }

            if (!gaushalaId) {
                return res.status(400).json({ message: 'gaushala-id is required in headers' });
            }

            const membership = await prisma.userGaushala.findUnique({
                where: {
                    userId_gaushalaId: {
                        userId,
                        gaushalaId
                    }
                }
            });

            if (!membership || !membership.isActive) {
                return res.status(403).json({ message: 'Access denied: You are not a member of this Gaushala' });
            }

            if (roles.length > 0 && !roles.includes(membership.role)) {
                return res.status(403).json({ message: `Access denied: Required role(s) [${roles.join(', ')}]` });
            }

            // Attach gaushala info to request
            req.gaushala = {
                id: membership.gaushalaId,
                role: membership.role
            };

            next();
        } catch (error) {
            next(error);
        }
    };
};
