import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('[db]: MongoDB connected successfully');
    } catch (error) {
        console.error('[db]: MongoDB connection error:', error);
        process.exit(1);
    }
};

export default prisma;
