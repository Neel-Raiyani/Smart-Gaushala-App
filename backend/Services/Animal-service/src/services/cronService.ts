import cron from 'node-cron';
import prisma from '@config/db.js';
import logger from '@utils/logger.js';

/**
 * Automated Heifer Status Cron Job
 * Runs every day at midnight (00:00)
 * 
 * Logic:
 * 1. Find all female cattle that are NOT yet heifers and have 0 parity.
 * 2. Check if their adultDate (birthDate + 12 months) is today or in the past.
 * 3. Update their isHeifer status to true.
 */
export const initHeiferCron = () => {
    // Schedule: Minute Hour DayOfMonth Month DayOfWeek
    // 0 0 * * * = Every Day at Midnight
    cron.schedule('0 0 * * *', async () => {
        logger.info('Starting Heifer Status Update Cron Job...');

        try {
            const now = new Date();
            // Add 1 day buffer to cover timezone differences (e.g. IST is 5.5h ahead of UTC)
            // Without this, cron at midnight IST sees "yesterday 6:30 PM UTC" and misses today's adultDate
            now.setDate(now.getDate() + 1);

            // Find animals to update
            const animalsToUpdate = await prisma.animal.findMany({
                where: {
                    gender: 'FEMALE',
                    isHeifer: false,
                    parity: 0,
                    adultDate: {
                        lte: now
                    },
                    status: 'ACTIVE',
                    isActive: true
                },
                select: { id: true, name: true, tagNumber: true }
            });

            if (animalsToUpdate.length === 0) {
                logger.info('No animals found for heifer status update.');
                return;
            }

            // Batch update isHeifer to true
            const updateCount = await prisma.animal.updateMany({
                where: {
                    id: { in: animalsToUpdate.map(a => a.id) }
                },
                data: {
                    isHeifer: true
                }
            });

            logger.info(`Successfully updated ${updateCount.count} animals to Heifer status.`);

            // Log individual updates for audit
            animalsToUpdate.forEach(a => {
                logger.info(`Animal updated to Heifer: ${a.name} (Tag: ${a.tagNumber || 'N/A'}, ID: ${a.id})`);
            });

        } catch (error) {
            logger.error('Error in Heifer Status Update Cron Job:', error);
        }
    }, { timezone: 'Asia/Kolkata' });

    logger.info('Heifer Status Update Cron Job initialized to run daily at midnight.');
};
