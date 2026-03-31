import { Request, Response, NextFunction } from 'express';
import { hashPassword, comparePassword } from '@utils/password.js';
import { generateToken } from '@utils/jwt.js';
import { sendSMS } from '@utils/sms.js';
import logger from '@utils/logger.js';
import prisma from '@config/db.js';
import { Prisma } from '@prisma/client';
import type { AuthRequest } from '@appTypes/express.js';

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { mobileNumber, password, confirmPassword, name, city, gaushalaName, totalCattle } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const existingUser = await prisma.user.findUnique({ where: { mobileNumber } });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this mobile number already exists' });
        }

        const hashedPassword = await hashPassword(password);

        // Transactional creation: User + Gaushala + Membership (OWNER)
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const user = await tx.user.create({
                data: {
                    mobileNumber,
                    password: hashedPassword,
                    name,
                    city
                }
            });

            const gaushala = await tx.gaushala.create({
                data: {
                    name: gaushalaName,
                    city,
                    totalCattle: parseInt(totalCattle) || 0
                }
            });

            await tx.userGaushala.create({
                data: {
                    userId: user.id,
                    gaushalaId: gaushala.id,
                    role: 'OWNER'
                }
            });

            return { user, gaushala };
        });

        logger.info(`User and Gaushala registered successfully: ${mobileNumber}`);
        res.status(201).json({
            message: 'User and first Gaushala registered successfully',
            userId: result.user.id,
            gaushalaId: result.gaushala.id
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { mobileNumber, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { mobileNumber },
            include: {
                memberships: {
                    include: { gaushala: true }
                }
            }
        });

        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid credentials or account inactive' });
        }

        if (!user.password) {
            return res.status(401).json({ message: 'Account has no login credentials' });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken({
            userId: user.id,
            mobileNumber: user.mobileNumber,
            name: user.name
        });

        logger.info(`User logged in: ${mobileNumber}`);

        // Define a type for the membership with gaushala included
        interface UserMembershipWithGaushala extends Prisma.UserGaushalaGetPayload<{ include: { gaushala: true } }> { }

        // Return token and the list of gaushalas the user belongs to
        res.status(200).json({
            message: 'Login successful',
            token,
            gaushalas: user.memberships.map((m: UserMembershipWithGaushala) => ({
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

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                mobileNumber: true,
                city: true,
                language: true,
                isActive: true,
                createdAt: true,
                memberships: {
                    include: {
                        gaushala: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Define a type for the user with memberships including gaushala
        interface UserWithMemberships extends Prisma.UserGetPayload<{
            select: {
                id: true;
                name: true;
                mobileNumber: true;
                city: true;
                language: true;
                isActive: true;
                createdAt: true;
                memberships: {
                    include: { gaushala: true };
                };
            };
        }> { }

        // Format for response
        const formattedUser = {
            ...user,
            gaushalas: (user as any).memberships.map((m: any) => ({
                id: m.gaushala.id,
                name: m.gaushala.name,
                role: m.role,
                city: m.gaushala.city,
                totalCattle: m.gaushala.totalCattle,
                isActive: m.isActive
            })),
            memberships: undefined // Remove raw memberships
        };

        res.status(200).json(formattedUser);
    } catch (error) {
        next(error);
    }
};

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { mobileNumber } = req.body;
        const user = await prisma.user.findUnique({ where: { mobileNumber } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // ── Static OTP for development (uncomment the line below and remove static OTP when using Twilio) ──
        // const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otp = '1234'; // Static OTP for development
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await prisma.user.update({
            where: { mobileNumber },
            data: { otp, otpExpires }
        });

        const message = `Your Smart Gaushala verification code is: ${otp}. Valid for 10 minutes.`;
        await sendSMS(mobileNumber, message); // Currently just logs, no actual SMS

        logger.info(`Static OTP set for ${mobileNumber}`);
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        next(error);
    }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { mobileNumber, otp, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const user = await prisma.user.findUnique({ where: { mobileNumber } });

        if (!user || user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const hashedPassword = await hashPassword(newPassword);
        await prisma.user.update({
            where: { mobileNumber },
            data: {
                password: hashedPassword,
                otp: null,
                otpExpires: null
            }
        });

        logger.info(`Password reset successfully for ${mobileNumber}`);
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
};

export const updateSettings = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const { language } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(language && { language })
            },
            select: { language: true }
        });

        logger.info(`Settings updated for user ${userId}`);
        res.status(200).json({ message: 'Settings updated successfully', settings: updatedUser });
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.password) {
            return res.status(400).json({ message: 'No current password set for this account' });
        }

        const isMatch = await comparePassword(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }

        const hashedPassword = await hashPassword(newPassword);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        logger.info(`Password changed successfully for user ${userId}`);
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
};
export const registerFcmToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        const { fcmToken } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { fcmToken }
        });

        logger.info(`FCM token registered for user ${userId}`);
        res.status(200).json({ message: 'FCM token registered successfully' });
    } catch (error) {
        next(error);
    }
};
