import cron from 'node-cron';
import prisma from '@config/db.js';
import logger from './logger.js';
import { sendPushNotification, sendMulticastNotification } from './notification.js';

// Logic constants shared with alertController
const PD_CHECK_DAYS = 60;
const ADULT_LOWER_MONTHS = 12;
const ADULT_UPPER_MONTHS = 15;
const HEAT_CYCLE_DAYS = 21;
const INSEMINATION_WAIT_DAYS = 60;
const DELIVERY_ALERT_DAYS = 250;
const DEWORMING_ALERT_DAYS = 7;
const VACCINATION_ALERT_DAYS = 7;

const monthsAgo = (months: number): Date => {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    d.setHours(0, 0, 0, 0);
    return d;
};

const daysAgo = (days: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    return d;
};

const daysFromNow = (days: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(23, 59, 59, 999);
    return d;
};

/**
 * Collects alert counts for a single gaushala.
 * Returns an object with category names and their counts.
 */
const collectAlertCounts = async (gaushalaId: string) => {
    const alerts: { category: string; count: number }[] = [];

    // 1. Adult Alerts (First Pregnancy)
    const adultCount = await prisma.animal.count({
        where: {
            gaushalaId,
            status: 'ACTIVE',
            isActive: true,
            gender: 'FEMALE',
            birthDate: { lte: monthsAgo(ADULT_LOWER_MONTHS), gte: monthsAgo(ADULT_UPPER_MONTHS) }
        }
    });
    if (adultCount > 0) alerts.push({ category: 'adult', count: adultCount });

    // 2. Pregnancy Check (PD Due)
    const pdDueCount = await prisma.conceptionJourney.count({
        where: {
            gaushalaId,
            status: 'INITIATED',
            pdDate: null,
            conceiveDate: { lte: daysAgo(PD_CHECK_DAYS) }
        }
    });
    if (pdDueCount > 0) alerts.push({ category: 'pregnancy check', count: pdDueCount });

    // 3. Heat Alert
    const heatThreshold = daysAgo(HEAT_CYCLE_DAYS);
    const eligibleForHeat = await prisma.animal.findMany({
        where: { gaushalaId, gender: 'FEMALE', status: 'ACTIVE', isActive: true, isPregnant: false, isRetired: false, isHeifer: true },
        select: { id: true }
    });

    if (eligibleForHeat.length > 0) {
        const cowIds = eligibleForHeat.map(c => c.id);
        const recentHeatRecords = await prisma.heatRecord.findMany({
            where: { animalId: { in: cowIds }, date: { gte: heatThreshold } },
            select: { animalId: true }
        });
        const cowIdsWithRecentHeat = new Set(recentHeatRecords.map(r => r.animalId));
        const inHeatCount = cowIds.filter(id => !cowIdsWithRecentHeat.has(id)).length;
        if (inHeatCount > 0) alerts.push({ category: 'heat', count: inHeatCount });
    }

    // 4. Missing Parity Info
    const missingParityCount = await prisma.animal.count({
        where: {
            gaushalaId,
            gender: 'FEMALE',
            status: 'ACTIVE',
            isActive: true,
            isHeifer: false,
            OR: [{ parity: null }, { parity: 0 }]
        }
    });
    if (missingParityCount > 0) alerts.push({ category: 'missing parity', count: missingParityCount });

    // 5. Insemination Alert
    const deliveryWaitThreshold = daysAgo(INSEMINATION_WAIT_DAYS);
    const eligibleForInsemination = await prisma.animal.findMany({
        where: { gaushalaId, gender: 'FEMALE', status: 'ACTIVE', isActive: true, isHeifer: true, isPregnant: false, isRetired: false, isDryOff: false },
        select: { id: true, parity: true }
    });

    if (eligibleForInsemination.length > 0) {
        const cowIds = eligibleForInsemination.map(c => c.id);
        const activeJourneys = await prisma.conceptionJourney.findMany({
            where: { gaushalaId, animalId: { in: cowIds }, status: { notIn: ['COMPLETED', 'FAILED'] } },
            select: { animalId: true }
        });
        const toExclude = new Set(activeJourneys.map(j => j.animalId));

        const completedJourneys = await prisma.conceptionJourney.findMany({
            where: { gaushalaId, animalId: { in: cowIds }, status: 'COMPLETED', deliveryDate: { gt: deliveryWaitThreshold } },
            select: { animalId: true }
        });
        completedJourneys.forEach(j => toExclude.add(j.animalId));

        const inseminationCount = cowIds.filter(id => !toExclude.has(id)).length;
        if (inseminationCount > 0) alerts.push({ category: 'insemination', count: inseminationCount });
    }

    // 6. Delivery Alert
    const deliveryDueCount = await prisma.conceptionJourney.count({
        where: {
            gaushalaId,
            status: { in: ['INITIATED', 'PREGNANT', 'DRY_OFF'] },
            deliveryDate: null,
            conceiveDate: { lte: daysAgo(DELIVERY_ALERT_DAYS) }
        }
    });
    if (deliveryDueCount > 0) alerts.push({ category: 'delivery', count: deliveryDueCount });

    // 7. Deworming Alert
    const dewormingWindow = daysFromNow(DEWORMING_ALERT_DAYS);
    const dewormingDueCount = await prisma.dewormingRecord.count({
        where: { gaushalaId, nextDoseDate: { lte: dewormingWindow } }
    });
    if (dewormingDueCount > 0) alerts.push({ category: 'deworming', count: dewormingDueCount });

    // 8. Lab Test Alert
    const pendingLabCount = await prisma.labRecord.count({
        where: { gaushalaId, result: null }
    });
    if (pendingLabCount > 0) alerts.push({ category: 'lab test', count: pendingLabCount });

    // 9. Vaccination Alert
    const alertWindow = daysFromNow(VACCINATION_ALERT_DAYS);
    const vaccines = await prisma.vaccineMaster.findMany({
        where: { frequencyMonths: { gt: 0 } }
    });

    if (vaccines.length > 0) {
        const animals = await prisma.animal.findMany({
            where: { gaushalaId, status: 'ACTIVE', isActive: true },
            select: { id: true }
        });

        if (animals.length > 0) {
            const animalIds = animals.map(a => a.id);
            const vaccineIds = vaccines.map(v => v.id);

            const vaccinationRecords = await prisma.vaccinationRecord.findMany({
                where: {
                    gaushalaId,
                    animalId: { in: animalIds },
                    vaccineId: { in: vaccineIds }
                },
                orderBy: { doseDate: 'desc' }
            });

            // Build map: animalId_vaccineId -> latest doseDate
            const latestDoseMap = new Map<string, Date>();
            for (const record of vaccinationRecords) {
                const key = `${record.animalId}_${record.vaccineId}`;
                if (!latestDoseMap.has(key)) {
                    latestDoseMap.set(key, record.doseDate);
                }
            }

            const now = new Date();
            let vaccinationCount = 0;
            for (const animal of animals) {
                for (const vaccine of vaccines) {
                    const key = `${animal.id}_${vaccine.id}`;
                    const lastDose = latestDoseMap.get(key);
                    if (!lastDose) continue;

                    const nextDue = new Date(lastDose);
                    nextDue.setMonth(nextDue.getMonth() + vaccine.frequencyMonths);

                    if (nextDue <= alertWindow) {
                        vaccinationCount++;
                    }
                }
            }

            if (vaccinationCount > 0) alerts.push({ category: 'vaccination', count: vaccinationCount });
        }
    }

    return alerts;
};

/**
 * Builds a single summary notification body from collected alert counts.
 * Example: "3 heat, 2 delivery, 5 deworming, and 1 vaccination alerts pending."
 */
const buildSummaryBody = (alerts: { category: string; count: number }[]): string => {
    if (alerts.length === 0) return '';

    const parts = alerts.map(a => `${a.count} ${a.category}`);

    if (parts.length === 1) {
        return `${parts[0]} alert(s) pending. Open the app to review.`;
    }

    const last = parts.pop()!;
    return `${parts.join(', ')}, and ${last} alert(s) pending. Open the app to review.`;
};

/**
 * Main routine: scans all gaushalas, collects alert counts,
 * and sends ONE summary push notification per owner.
 */
export const runDailyAlertCheck = async () => {
    logger.info('[cron]: Starting daily alert notification scan');

    try {
        const gaushalas = await prisma.gaushala.findMany({
            include: {
                members: {
                    where: { role: 'OWNER', isActive: true },
                    include: { user: { select: { fcmToken: true } } }
                }
            }
        });

        for (const gaushala of gaushalas) {
            try {
                const recipientTokens = gaushala.members
                    .map(m => m.user.fcmToken)
                    .filter((token): token is string => !!token);

                if (recipientTokens.length === 0) continue;

                // Collect all alert counts for this gaushala
                const alerts = await collectAlertCounts(gaushala.id);

                if (alerts.length === 0) {
                    logger.info(`[cron]: No alerts for Gaushala ${gaushala.name} (${gaushala.id})`);
                    continue;
                }

                const totalCount = alerts.reduce((sum, a) => sum + a.count, 0);
                const title = `🔔 ${totalCount} Cattle Alert${totalCount > 1 ? 's' : ''} - ${gaushala.name}`;
                const body = buildSummaryBody(alerts);

                // Send ONE multicast summary notification for all owners of this gaushala
                await sendMulticastNotification(recipientTokens, title, body, {
                    type: 'daily_summary',
                    gaushalaId: gaushala.id,
                    alertCount: String(totalCount)
                });

                logger.info(`[cron]: Sent summary notification for Gaushala ${gaushala.name}: ${alerts.map(a => `${a.count} ${a.category}`).join(', ')}`);
            } catch (error) {
                logger.error(`[cron]: Error processing Gaushala ${gaushala.name} (${gaushala.id}):`, error);
                // Continue to next gaushala
            }
        }

        logger.info('[cron]: Daily alert notification scan completed');
    } catch (error) {
        logger.error('[cron]: Critical error in daily alert check:', error);
    }
};

// Schedule: Every 2 hours from 6 AM to midnight IST
export const setupAlertCron = () => {
    cron.schedule('0 0,6,8,10,12,14,16,18,20,22 * * *', runDailyAlertCheck, { timezone: 'Asia/Kolkata' });
    logger.info('[cron]: Alert notification job scheduled (every 2 hours, 6 AM - 12 AM IST)');
};
