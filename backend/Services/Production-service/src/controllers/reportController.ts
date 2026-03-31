import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { AuthRequest } from '@appTypes/express.js';
import { AppError } from '@utils/AppError.js';
import { generateMonthlyMilkReport, MilkExportData } from '@utils/excelHelper.js';

/**
 * Daily Milk Report: detailed feed vs milk for all registered animals for a date.
 * Note: Ideally, this would join with Animal-service to get names. 
 */
export const getDailyMilkReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { date } = req.query;

        if (!date) {
            throw new AppError('Date is required', 400, 'MISSING_DATE');
        }

        const targetDate = new Date(date as string);

        const records = await prisma.milkRecord.findMany({
            where: {
                gaushalaId,
                date: targetDate
            }
        });

        // Group by animalId
        const reportMap: Record<string, any> = {};

        records.forEach(r => {
            if (!reportMap[r.animalId]) {
                reportMap[r.animalId] = {
                    animalId: r.animalId,
                    morning: 0,
                    evening: 0,
                    total: 0,
                    feed: 0
                };
            }

            if (r.session === 'MORNING') {
                reportMap[r.animalId].morning += r.quantity;
            } else {
                reportMap[r.animalId].evening += r.quantity;
            }

            reportMap[r.animalId].total += r.quantity;
            reportMap[r.animalId].feed += r.feedQuantity || 0;
        });

        res.status(200).json({
            success: true,
            date: targetDate,
            report: Object.values(reportMap)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Monthly Milk Report: Aggregated gaushala-wide totals per day for a month.
 */
export const getMonthlyMilkReport = async (req: any, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { year, month } = req.query; // numeric

        if (!year || !month) {
            throw new AppError('Year and month are required', 400, 'MISSING_PARAMS');
        }

        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0);

        const records = await prisma.milkRecord.findMany({
            where: {
                gaushalaId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        const dailyAgg: Record<string, any> = {};

        records.forEach(r => {
            const dayKey = r.date.toISOString().split('T')[0];
            if (!dailyAgg[dayKey]) {
                dailyAgg[dayKey] = {
                    date: dayKey,
                    totalMilk: 0,
                    totalFeed: 0,
                    count: 0
                };
            }
            dailyAgg[dayKey].totalMilk += r.quantity;
            dailyAgg[dayKey].totalFeed += r.feedQuantity || 0;
            dailyAgg[dayKey].count += 1;
        });

        res.status(200).json({
            success: true,
            year,
            month,
            report: Object.values(dailyAgg).sort((a, b) => a.date.localeCompare(b.date))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Export Monthly Milk Report as Excel.
 */
export const exportMonthlyMilkExcel = async (req: any, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { year, month } = req.query;

        if (!year || !month) {
            throw new AppError('Year and month are required', 400, 'MISSING_PARAMS');
        }

        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0);

        const records = await prisma.milkRecord.findMany({
            where: {
                gaushalaId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                animal: {
                    select: {
                        name: true,
                        tagNumber: true
                    }
                }
            }
        });

        const reportData: Record<string, MilkExportData> = {};

        records.forEach(r => {
            const animalId = r.animalId;
            if (!reportData[animalId]) {
                reportData[animalId] = {
                    cowName: r.animal.name || 'Unknown',
                    tagNumber: r.animal.tagNumber || '-',
                    days: {},
                    totalMonthly: 0
                };
            }

            const day = r.date.getDate();
            if (!reportData[animalId].days[day]) {
                reportData[animalId].days[day] = {};
            }

            if (r.session === 'MORNING') {
                reportData[animalId].days[day].MORNING = r.quantity;
            } else {
                reportData[animalId].days[day].EVENING = r.quantity;
            }

            reportData[animalId].totalMonthly += r.quantity;
        });

        await generateMonthlyMilkReport(
            res, 
            Object.values(reportData), 
            Number(month), 
            Number(year)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Cow Monthly Report: Detailed 30-day view for a specific animal.
 */
export const getCowMonthlyReport = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { animalId } = req.params;
        const gaushalaId = req.gaushala?.id as string;
        const { year, month } = req.query;

        if (!year || !month) {
            throw new AppError('Year and month are required', 400, 'MISSING_PARAMS');
        }

        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0);

        const records = await prisma.milkRecord.findMany({
            where: {
                animalId,
                gaushalaId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { date: 'asc' }
        });

        // Map by day
        const dailyData: Record<string, any> = {};
        records.forEach(r => {
            const dayKey = r.date.toISOString().split('T')[0];
            if (!dailyData[dayKey]) {
                dailyData[dayKey] = { date: dayKey, morning: 0, evening: 0, total: 0, feed: 0 };
            }

            if (r.session === 'MORNING') dailyData[dayKey].morning = r.quantity;
            else dailyData[dayKey].evening = r.quantity;

            dailyData[dayKey].total += r.quantity;
            dailyData[dayKey].feed += r.feedQuantity || 0;
        });

        res.status(200).json({
            success: true,
            animalId,
            report: Object.values(dailyData)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Distribution Summary: Breakdown of milk allocation for a period.
 */
export const getDistributionSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { startDate, endDate } = req.query;

        const where: any = { gaushalaId };
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string)
            };
        }

        const [distributions, categories] = await Promise.all([
            prisma.milkDistribution.findMany({ where }),
            prisma.milkDistributionCategory.findMany({ where: { gaushalaId } })
        ]);

        // Group by category
        const summary: Record<string, number> = {};
        distributions.forEach(d => {
            summary[d.categoryId] = (summary[d.categoryId] || 0) + d.quantity;
        });

        const result = categories.map(c => ({
            categoryId: c.id,
            categoryName: c.name,
            totalQuantity: summary[c.id] || 0
        }));

        res.status(200).json({
            success: true,
            summary: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Parity Report: Yield trends indexed by lactation number (requires animal data).
 * For now, returns animalId and production stats.
 */
export const getParityReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;

        // This effectively needs a join with Animal-service.
        // Simplest: Fetch all records and return aggregated by animalId.
        // The frontend or gateway can join with animal.lactationNumber.

        const summary = await prisma.milkRecord.groupBy({
            by: ['animalId'],
            where: { gaushalaId },
            _sum: {
                quantity: true
            },
            _avg: {
                quantity: true
            },
            _count: {
                id: true
            }
        });

        res.status(200).json({
            success: true,
            paritySummary: summary
        });
    } catch (error) {
        next(error);
    }
};
