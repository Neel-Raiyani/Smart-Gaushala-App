import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import logger from '@utils/logger.js';
import { AppError } from '@utils/AppError.js';
import type { AuthRequest } from '@appTypes/express.js';

// ───────────────────────── Constants ─────────────────────────

const HEAT_CYCLE_DAYS = 21;         // Bovine estrus cycle
const PD_CHECK_DAYS = 60;           // Days after conception for PD check
const DELIVERY_ALERT_DAYS = 250;    // Alert 30 days before expected delivery (280 - 30)
const GESTATION_DAYS = 280;         // Full gestation period
const INSEMINATION_WAIT_DAYS = 60;  // Wait period after delivery before next insemination
const DEWORMING_ALERT_DAYS = 7;     // Alert N days before nextDoseDate
const ADULT_LOWER_MONTHS = 12;      // Start alert at 12 months
const ADULT_UPPER_MONTHS = 15;      // Stop alert at 15 months

// ───────────────────────── Helpers ─────────────────────────

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

const monthsAgo = (months: number): Date => {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    d.setHours(0, 0, 0, 0);
    return d;
};

const diffDays = (from: Date, to: Date): number => {
    return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
};

// ───────────────────────── 2. Heat Alert ─────────────────────────

export const getHeatAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;

        const eligibleCows = await prisma.animal.findMany({
            where: {
                gaushalaId,
                gender: 'FEMALE',
                status: 'ACTIVE',
                isActive: true,
                isPregnant: false,
                isRetired: false,
                isHeifer: true
            },
            select: {
                id: true,
                name: true,
                tagNumber: true,
                animalNumber: true,
                parity: true,
                photoUrl: true
            }
        });

        if (eligibleCows.length === 0) {
            return res.json({ success: true, count: 0, data: [] });
        }

        const cowIds = eligibleCows.map((c: { id: string }) => c.id);
        const heatThreshold = daysAgo(HEAT_CYCLE_DAYS);

        // Get the latest heat record for each cow
        const latestHeatRecords = await prisma.heatRecord.findMany({
            where: {
                gaushalaId,
                animalId: { in: cowIds }
            },
            orderBy: { date: 'desc' }
        });

        const latestHeatMap = new Map<string, Date>();
        for (const record of latestHeatRecords) {
            if (!latestHeatMap.has(record.animalId)) {
                latestHeatMap.set(record.animalId, record.date);
            }
        }

        const now = new Date();
        type EligibleCow = typeof eligibleCows[0];
        const data = eligibleCows
            .filter((cow: EligibleCow) => {
                const lastHeat = latestHeatMap.get(cow.id);
                return !lastHeat || lastHeat < heatThreshold;
            })
            .map((cow: EligibleCow) => {
                const lastHeatDate = latestHeatMap.get(cow.id) || null;
                return {
                    ...cow,
                    lastHeatDate,
                    daysSinceLastHeat: lastHeatDate ? diffDays(lastHeatDate, now) : null
                };
            });

        logger.info(`Fetched ${data.length} heat alerts for Gaushala ${gaushalaId}`);
        res.json({ success: true, count: data.length, data });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── 3. Pregnancy Check (PD Due) ─────────────────────────

export const getPregnancyCheckAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;

        const journeys = await prisma.conceptionJourney.findMany({
            where: {
                gaushalaId,
                status: 'INITIATED',
                pdDate: null,
                conceiveDate: { lte: daysAgo(PD_CHECK_DAYS) }
            },
            select: {
                id: true,
                animalId: true,
                conceiveDate: true,
                pregnancyType: true,
                bullName: true,
                parity: true
            },
            orderBy: { conceiveDate: 'asc' }
        });

        if (journeys.length === 0) {
            return res.json({ success: true, count: 0, data: [] });
        }

        type JourneyItem = typeof journeys[0];
        type AnimalItem = { id: string; name: string | null; tagNumber: string | null; animalNumber: string | null; photoUrl: string | null };
        const animalIds = journeys.map((j: JourneyItem) => j.animalId);
        const animals = await prisma.animal.findMany({
            where: { id: { in: animalIds }, isActive: true },
            select: { id: true, name: true, tagNumber: true, animalNumber: true, photoUrl: true }
        });
        const animalMap = new Map(animals.map((a: AnimalItem) => [a.id, a]));

        const now = new Date();
        const data = journeys.map((j: JourneyItem) => ({
            journeyId: j.id,
            animal: animalMap.get(j.animalId) || null,
            conceiveDate: j.conceiveDate,
            pregnancyType: j.pregnancyType,
            bullName: j.bullName,
            parity: j.parity,
            daysSinceConception: diffDays(j.conceiveDate, now)
        }));

        logger.info(`Fetched ${data.length} pregnancy check alerts for Gaushala ${gaushalaId}`);
        res.json({ success: true, count: data.length, data });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── 4. Insemination Alert ─────────────────────────

export const getInseminationAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;

        const eligibleCows = await prisma.animal.findMany({
            where: {
                gaushalaId,
                gender: 'FEMALE',
                status: 'ACTIVE',
                isActive: true,
                isHeifer: true,
                isPregnant: false,
                isRetired: false,
                isDryOff: false
            },
            select: {
                id: true,
                name: true,
                tagNumber: true,
                animalNumber: true,
                parity: true,
                photoUrl: true
            }
        });

        if (eligibleCows.length === 0) {
            return res.json({ success: true, count: 0, data: [] });
        }

        const cowIds = eligibleCows.map((c: { id: string }) => c.id);

        // Exclude cows with active conception journeys
        const activeJourneys = await prisma.conceptionJourney.findMany({
            where: {
                gaushalaId,
                animalId: { in: cowIds },
                status: { notIn: ['COMPLETED', 'FAILED'] }
            },
            select: { animalId: true },
            distinct: ['animalId']
        });
        const cowsWithActiveJourney = new Set(activeJourneys.map((j: { animalId: string }) => j.animalId));

        // For cows with parity > 0, check 60-day post-delivery wait
        type InseminationCow = typeof eligibleCows[0];
        const cowsWithParity = eligibleCows.filter((c: InseminationCow) => (c.parity || 0) > 0);
        const deliveryWaitThreshold = daysAgo(INSEMINATION_WAIT_DAYS);

        const cowsStillWaiting = new Set<string>();
        const latestDeliveryMap = new Map<string, Date>();

        if (cowsWithParity.length > 0) {
            const parityIds = cowsWithParity.map((c: InseminationCow) => c.id);
            const completedJourneys = await prisma.conceptionJourney.findMany({
                where: {
                    gaushalaId,
                    animalId: { in: parityIds },
                    status: 'COMPLETED',
                    deliveryDate: { not: null }
                },
                orderBy: { deliveryDate: 'desc' }
            });

            for (const j of completedJourneys) {
                if (!latestDeliveryMap.has(j.animalId) && j.deliveryDate) {
                    latestDeliveryMap.set(j.animalId, j.deliveryDate);
                }
            }

            for (const [animalId, deliveryDate] of latestDeliveryMap) {
                if (deliveryDate > deliveryWaitThreshold) {
                    cowsStillWaiting.add(animalId);
                }
            }
        }

        const now = new Date();
        const data = eligibleCows
            .filter((cow: InseminationCow) => !cowsWithActiveJourney.has(cow.id) && !cowsStillWaiting.has(cow.id))
            .map((cow: InseminationCow) => {
                const lastDelivery = latestDeliveryMap.get(cow.id) || null;
                return {
                    ...cow,
                    lastDeliveryDate: lastDelivery,
                    daysSinceDelivery: lastDelivery ? diffDays(lastDelivery, now) : null
                };
            });

        logger.info(`Fetched ${data.length} insemination alerts for Gaushala ${gaushalaId}`);
        res.json({ success: true, count: data.length, data });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── 5. Delivery Alert ─────────────────────────

export const getDeliveryAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;

        const journeys = await prisma.conceptionJourney.findMany({
            where: {
                gaushalaId,
                status: { in: ['INITIATED', 'PREGNANT', 'DRY_OFF'] },
                deliveryDate: null,
                conceiveDate: { lte: daysAgo(DELIVERY_ALERT_DAYS) }
            },
            select: {
                id: true,
                animalId: true,
                conceiveDate: true,
                pregnancyType: true,
                bullName: true,
                parity: true,
                status: true,
                dryOffDate: true
            },
            orderBy: { conceiveDate: 'asc' }
        });

        if (journeys.length === 0) {
            return res.json({ success: true, count: 0, data: [] });
        }

        type DeliveryJourney = typeof journeys[0];
        type DeliveryAnimal = { id: string; name: string | null; tagNumber: string | null; animalNumber: string | null; photoUrl: string | null };
        const animalIds = journeys.map((j: DeliveryJourney) => j.animalId);
        const animals = await prisma.animal.findMany({
            where: { id: { in: animalIds }, isActive: true },
            select: { id: true, name: true, tagNumber: true, animalNumber: true, photoUrl: true }
        });
        const animalMap = new Map(animals.map((a: DeliveryAnimal) => [a.id, a]));

        const now = new Date();
        const data = journeys.map((j: DeliveryJourney) => {
            const expectedDelivery = new Date(j.conceiveDate);
            expectedDelivery.setDate(expectedDelivery.getDate() + GESTATION_DAYS);
            const remaining = diffDays(now, expectedDelivery);

            return {
                journeyId: j.id,
                animal: animalMap.get(j.animalId) || null,
                conceiveDate: j.conceiveDate,
                expectedDeliveryDate: expectedDelivery,
                daysRemaining: remaining,
                currentStage: j.status,
                pregnancyType: j.pregnancyType,
                bullName: j.bullName,
                parity: j.parity,
                dryOffDate: j.dryOffDate
            };
        });

        logger.info(`Fetched ${data.length} delivery alerts for Gaushala ${gaushalaId}`);
        res.json({ success: true, count: data.length, data });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── 6. Deworming Alert ─────────────────────────

export const getDewormingAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const now = new Date();
        const alertWindow = daysFromNow(DEWORMING_ALERT_DAYS);

        const records = await prisma.dewormingRecord.findMany({
            where: {
                gaushalaId,
                nextDoseDate: { lte: alertWindow }
            },
            orderBy: { doseDate: 'desc' }
        });

        // Build map: animalId -> latest record with approaching nextDoseDate
        const latestMap = new Map<string, typeof records[0]>();
        for (const r of records) {
            if (!latestMap.has(r.animalId)) {
                latestMap.set(r.animalId, r);
            }
        }

        if (latestMap.size === 0) {
            return res.json({ success: true, count: 0, data: [] });
        }

        const animalIds = Array.from(latestMap.keys());
        const animals = await prisma.animal.findMany({
            where: {
                id: { in: animalIds },
                status: 'ACTIVE',
                isActive: true
            },
            select: {
                id: true,
                name: true,
                tagNumber: true,
                animalNumber: true,
                photoUrl: true
            }
        });
        type DewormAnimal = typeof animals[0];
        const animalMap = new Map(animals.map((a: DewormAnimal) => [a.id, a]));

        const data = Array.from(latestMap.entries())
            .filter(([animalId]) => animalMap.has(animalId))
            .map(([animalId, record]) => {
                const isOverdue = record.nextDoseDate ? record.nextDoseDate < now : false;
                const daysUntilDue = record.nextDoseDate ? diffDays(now, record.nextDoseDate) : null;

                return {
                    id: record.id,
                    animal: animalMap.get(animalId),
                    lastDoseDate: record.doseDate,
                    nextDoseDate: record.nextDoseDate,
                    daysUntilDue,
                    isOverdue,
                    doseType: record.doseType,
                    companyName: record.companyName
                };
            });

        logger.info(`Fetched ${data.length} deworming alerts for Gaushala ${gaushalaId}`);
        res.json({ success: true, count: data.length, data });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── 7. Adult Alert ─────────────────────────

export const getAdultAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const upperLimit = monthsAgo(ADULT_LOWER_MONTHS);
        const lowerLimit = monthsAgo(ADULT_UPPER_MONTHS);

        const animals = await prisma.animal.findMany({
            where: {
                gaushalaId,
                status: 'ACTIVE',
                isActive: true,
                birthDate: {
                    lte: upperLimit,
                    gte: lowerLimit
                }
            },
            select: {
                id: true,
                name: true,
                tagNumber: true,
                animalNumber: true,
                gender: true,
                birthDate: true,
                adultDate: true,
                photoUrl: true
            },
            orderBy: { birthDate: 'asc' }
        });

        const now = new Date();
        const data = animals.map(animal => ({
            ...animal,
            ageInMonths: animal.birthDate
                ? Math.floor(diffDays(animal.birthDate, now) / 30.44)
                : null
        }));

        logger.info(`Fetched ${data.length} adult alerts for Gaushala ${gaushalaId}`);
        res.json({ success: true, count: data.length, data });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── 8. Lab Test Alert ─────────────────────────

export const getLabAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;

        const labRecords = await prisma.labRecord.findMany({
            where: {
                gaushalaId,
                result: null
            },
            orderBy: { sampleDate: 'desc' }
        });

        if (labRecords.length === 0) {
            return res.json({ success: true, count: 0, data: [] });
        }

        const animalIds = labRecords.map(r => r.animalId);
        const labtestIds = labRecords.map(r => r.labtestId);

        // FIX: Run both lookups in parallel
        const [animals, labtestMasters] = await Promise.all([
            prisma.animal.findMany({
                where: { id: { in: animalIds }, isActive: true },
                select: { id: true, name: true, tagNumber: true, animalNumber: true, photoUrl: true }
            }),
            prisma.labtestMaster.findMany({
                where: { id: { in: labtestIds } }
            })
        ]);
        const animalMap = new Map(animals.map(a => [a.id, a]));
        const labtestMap = new Map(labtestMasters.map(m => [m.id, m.name]));

        const data = labRecords.map(record => ({
            id: record.id,
            animal: animalMap.get(record.animalId) || null,
            testName: labtestMap.get(record.labtestId) || 'Unknown Test',
            sampleDate: record.sampleDate,
            remark: record.remark
        }));

        logger.info(`Fetched ${data.length} lab alerts for Gaushala ${gaushalaId}`);
        res.json({ success: true, count: data.length, data });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── 9. Vaccination Alert ─────────────────────────

export const getVaccinationAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const VACCINATION_ALERT_DAYS = 7;

        // FIX: Fetch vaccines and animals in parallel first
        const [vaccines, animals] = await Promise.all([
            // 1. Get all vaccines that have a repeat frequency
            prisma.vaccineMaster.findMany({
                where: { frequencyMonths: { gt: 0 } }
            }),
            // 2. Get all active animals in this gaushala
            prisma.animal.findMany({
                where: { gaushalaId, status: 'ACTIVE', isActive: true },
                select: { id: true, name: true, tagNumber: true, animalNumber: true, photoUrl: true }
            })
        ]);

        if (vaccines.length === 0) {
            return res.json({ success: true, count: 0, data: [] });
        }

        if (animals.length === 0) {
            return res.json({ success: true, count: 0, data: [] });
        }

        const animalIds = animals.map(a => a.id);
        const animalMap = new Map(animals.map(a => [a.id, a]));
        const vaccineMap = new Map(vaccines.map(v => [v.id, v]));
        const vaccineIds = vaccines.map(v => v.id);

        // 3. Get all vaccination records for these animals and vaccines
        const vaccinationRecords = await prisma.vaccinationRecord.findMany({
            where: {
                gaushalaId,
                animalId: { in: animalIds },
                vaccineId: { in: vaccineIds }
            },
            orderBy: { doseDate: 'desc' }
        });

        // 4. Build map: animalId_vaccineId -> latest doseDate
        const latestDoseMap = new Map<string, Date>();
        for (const record of vaccinationRecords) {
            const key = `${record.animalId}_${record.vaccineId}`;
            if (!latestDoseMap.has(key)) {
                latestDoseMap.set(key, record.doseDate);
            }
        }

        // 5. Calculate alerts
        const now = new Date();
        const alertWindow = daysFromNow(VACCINATION_ALERT_DAYS);

        type AlertItem = {
            animal: typeof animals[0];
            vaccineName: string;
            vaccineId: string;
            lastDoseDate: Date | null;
            nextDueDate: Date | null;
            daysUntilDue: number | null;
            isOverdue: boolean;
            isNeverVaccinated: boolean;
        };

        const data: AlertItem[] = [];

        for (const animal of animals) {
            for (const vaccine of vaccines) {
                const key = `${animal.id}_${vaccine.id}`;
                const lastDose = latestDoseMap.get(key);

                if (!lastDose) continue;

                // Calculate next due date
                const nextDue = new Date(lastDose);
                nextDue.setMonth(nextDue.getMonth() + vaccine.frequencyMonths);

                if (nextDue <= alertWindow) {
                    data.push({
                        animal,
                        vaccineName: vaccine.name,
                        vaccineId: vaccine.id,
                        lastDoseDate: lastDose,
                        nextDueDate: nextDue,
                        daysUntilDue: diffDays(now, nextDue),
                        isOverdue: nextDue < now,
                        isNeverVaccinated: false
                    });
                }
            }
        }

        logger.info(`Fetched ${data.length} vaccination alerts for Gaushala ${gaushalaId}`);
        res.json({ success: true, count: data.length, data });
    } catch (error) {
        next(error);
    }
};
