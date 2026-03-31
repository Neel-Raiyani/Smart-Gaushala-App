import { Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { Prisma } from '@prisma/client';
import { getPresignedViewUrl } from '@utils/s3.js';
import type { AuthRequest } from '@appTypes/express.js';

// ───────────────────────── Deworming Report ─────────────────────────
/**
 * Date-wise Deworming Dose report
 * Returns cowphoto, cowname, tagno, animal no., dose date, company name, Doctor name, last dose date, Next dose date, quantity, dose type
 */
export const getDewormingReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) return res.status(401).json({ message: 'Gaushala ID missing' });

        const { from, to, animalId, page = '1', limit = '20' } = req.query as { from?: string; to?: string; animalId?: string; page?: string; limit?: string };
        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
        const skip = (pageNum - 1) * limitNum;
        const where: Prisma.DewormingRecordWhereInput = { gaushalaId };

        if (animalId) where.animalId = animalId;
        if (from || to) {
            where.doseDate = {};
            if (from) { const fromDate = new Date(from); fromDate.setHours(0, 0, 0, 0); (where.doseDate as Prisma.DateTimeFilter).gte = fromDate; }
            if (to) { const toDate = new Date(to); toDate.setHours(23, 59, 59, 999); (where.doseDate as Prisma.DateTimeFilter).lte = toDate; }
        }

        // FIX #1: Fetch records + all deworming history for last-dose calculation in parallel
        const [total, records, allDewormingRecords] = await Promise.all([
            prisma.dewormingRecord.count({ where }),
            prisma.dewormingRecord.findMany({
                where,
                orderBy: { doseDate: 'desc' },
                skip,
                take: limitNum
            }),
            // Fetch all records for the gaushala (optionally filtered by animalId) to calculate lastDoseDate in-memory
            prisma.dewormingRecord.findMany({
                where: { gaushalaId, ...(animalId ? { animalId } : {}) },
                select: { id: true, animalId: true, doseDate: true },
                orderBy: { doseDate: 'asc' }
            })
        ]);

        const animalIds = [...new Set(records.map(r => r.animalId))];
        const vetIds = [...new Set(records.map(r => r.vetId).filter(v => v !== null))] as string[];

        // FIX #2: Run animal and vet queries in parallel
        const [animals, vets] = await Promise.all([
            prisma.animal.findMany({
                where: { id: { in: animalIds } },
                select: { id: true, name: true, tagNumber: true, animalNumber: true, photoUrl: true }
            }),
            prisma.user.findMany({
                where: { id: { in: vetIds } },
                select: { id: true, name: true }
            })
        ]);

        // FIX #3: Generate all pre-signed URLs in parallel instead of sequentially
        const enrichedAnimals = await Promise.all(
            animals.map(async (a) => ({
                ...a,
                photoUrl: a.photoUrl ? await getPresignedViewUrl('gaushala-media', a.photoUrl) : null
            }))
        );
        const animalMap = new Map(enrichedAnimals.map(a => [a.id, a]));
        const vetMap = new Map(vets.map(v => [v.id, v.name]));

        // FIX #4: Build lastDoseDate map in-memory — no more N+1 queries
        // allDewormingRecords is sorted ascending by doseDate
        const prevDoseMap = new Map<string, Date>();
        const seenDoseMap = new Map<string, Date>();
        for (const r of allDewormingRecords) {
            if (seenDoseMap.has(r.animalId)) {
                prevDoseMap.set(`${r.animalId}_${r.doseDate.toISOString()}`, seenDoseMap.get(r.animalId)!);
            }
            seenDoseMap.set(r.animalId, r.doseDate);
        }

        const data = records.map(r => {
            const animal = animalMap.get(r.animalId);
            const doctorName = r.vetId ? vetMap.get(r.vetId) : '-';
            const lastDoseDate = prevDoseMap.get(`${r.animalId}_${r.doseDate.toISOString()}`) || null;

            return {
                id: r.id,
                animalId: r.animalId,
                photo: animal?.photoUrl || null,
                name: animal?.name || null,
                tagno: animal?.tagNumber || null,
                animalNo: animal?.animalNumber || null,
                doseDate: r.doseDate,
                companyName: r.companyName || '-',
                doctorName: doctorName || '-',
                lastDoseDate,
                nextDoseDate: r.nextDoseDate || null,
                quantity: r.quantity || '-',
                doseType: r.doseType
            };
        });

        res.json({
            success: true,
            totalCount: total,
            data,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
        });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Dropdowns for Deworming Report ─────────────────────────
/**
 * Returns Cows or Bulls based on type
 * type: COW (Gender: FEMALE) or BULL (Gender: MALE)
 */
export const getDewormingDropdowns = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        const { type } = req.query as { type?: 'COW' | 'BULL' };

        if (!gaushalaId) return res.status(401).json({ message: 'Gaushala ID missing' });

        const where: any = { gaushalaId, status: 'ACTIVE' };
        if (type === 'COW') {
            where.gender = 'FEMALE';
        } else if (type === 'BULL') {
            where.gender = 'MALE';
        }

        const animals = await prisma.animal.findMany({
            where,
            select: { id: true, name: true, tagNumber: true, animalNumber: true }
        });

        res.json({ success: true, data: animals });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Medical Report ─────────────────────────
/**
 * Medical Report (Animal-wise, Date-wise, or Disease-wise)
 * Returns cowphoto, name, tagno, animal no., medical status, visit type, disease, doctor name, visit date
 */
export const getMedicalReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) return res.status(401).json({ message: 'Gaushala ID missing' });

        const { from, to, animalId, diseaseId, page = '1', limit = '20' } = req.query as { from?: string; to?: string; animalId?: string; diseaseId?: string; page?: string; limit?: string };
        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
        const skip = (pageNum - 1) * limitNum;

        const where: Prisma.MedicalRecordWhereInput = { gaushalaId };

        if (animalId) where.animalId = animalId;
        if (diseaseId) where.diseaseId = diseaseId;
        if (from || to) {
            where.visitDate = {};
            if (from) { const fromDate = new Date(from); fromDate.setHours(0, 0, 0, 0); (where.visitDate as Prisma.DateTimeFilter).gte = fromDate; }
            if (to) { const toDate = new Date(to); toDate.setHours(23, 59, 59, 999); (where.visitDate as Prisma.DateTimeFilter).lte = toDate; }
        }

        const [total, records] = await Promise.all([
            prisma.medicalRecord.count({ where }),
            prisma.medicalRecord.findMany({
                where,
                orderBy: { visitDate: 'desc' },
                skip,
                take: limitNum
            })
        ]);

        const animalIds = [...new Set(records.map(r => r.animalId))];
        const vetIds = [...new Set(records.map(r => r.vetId).filter(v => v !== null))] as string[];
        const dIds = [...new Set(records.map(r => r.diseaseId).filter(d => d !== null))] as string[];

        // FIX: Run all 3 lookup queries in parallel
        const [animals, vets, diseases] = await Promise.all([
            prisma.animal.findMany({
                where: { id: { in: animalIds } },
                select: { id: true, name: true, tagNumber: true, animalNumber: true, photoUrl: true }
            }),
            prisma.user.findMany({
                where: { id: { in: vetIds } },
                select: { id: true, name: true }
            }),
            prisma.diseaseMaster.findMany({
                where: { id: { in: dIds } },
                select: { id: true, name: true }
            })
        ]);

        // FIX: Generate all pre-signed URLs in parallel
        const enrichedAnimals = await Promise.all(
            animals.map(async (a) => ({
                ...a,
                photoUrl: a.photoUrl ? await getPresignedViewUrl('gaushala-media', a.photoUrl) : null
            }))
        );
        const animalMap = new Map(enrichedAnimals.map(a => [a.id, a]));
        const vetMap = new Map(vets.map(v => [v.id, v.name]));
        const diseaseMap = new Map(diseases.map(d => [d.id, d.name]));

        const data = records.map(r => {
            const animal = animalMap.get(r.animalId);
            const doctorName = r.vetId ? vetMap.get(r.vetId) : '-';
            const diseaseName = r.diseaseId ? diseaseMap.get(r.diseaseId) : 'N/A';

            return {
                id: r.id,
                animalId: r.animalId,
                photo: animal?.photoUrl || null,
                name: animal?.name || null,
                tagno: animal?.tagNumber || null,
                animalNo: animal?.animalNumber || null,
                medicalStatus: r.medicalStatus,
                visitType: r.visitType,
                disease: diseaseName,
                doctorName: doctorName || '-',
                visitDate: r.visitDate
            };
        });

        res.json({
            success: true,
            totalCount: total,
            data,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
        });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Vaccine Report ─────────────────────────
/**
 * Vaccine Report (Animal-wise, Date-wise, or Vaccine-wise)
 * Returns photo, name, tagno, animal no., vaccine, dose date, remark, dosetype
 */
export const getVaccineReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) return res.status(401).json({ message: 'Gaushala ID missing' });

        const { from, to, animalId, vaccineId, page = '1', limit = '20' } = req.query as { from?: string; to?: string; animalId?: string; vaccineId?: string; page?: string; limit?: string };
        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
        const skip = (pageNum - 1) * limitNum;

        const where: Prisma.VaccinationRecordWhereInput = { gaushalaId };

        if (animalId) where.animalId = animalId;
        if (vaccineId) where.vaccineId = vaccineId;
        if (from || to) {
            where.doseDate = {};
            if (from) { const fromDate = new Date(from); fromDate.setHours(0, 0, 0, 0); (where.doseDate as Prisma.DateTimeFilter).gte = fromDate; }
            if (to) { const toDate = new Date(to); toDate.setHours(23, 59, 59, 999); (where.doseDate as Prisma.DateTimeFilter).lte = toDate; }
        }

        const [total, records] = await Promise.all([
            prisma.vaccinationRecord.count({ where }),
            prisma.vaccinationRecord.findMany({
                where,
                orderBy: { doseDate: 'desc' },
                skip,
                take: limitNum
            })
        ]);

        const animalIds = [...new Set(records.map(r => r.animalId))];
        const vIds = [...new Set(records.map(r => r.vaccineId).filter(v => v !== null))] as string[];

        // FIX: Run both lookup queries in parallel
        const [animals, vaccineMasters] = await Promise.all([
            prisma.animal.findMany({
                where: { id: { in: animalIds } },
                select: { id: true, name: true, tagNumber: true, animalNumber: true, photoUrl: true }
            }),
            prisma.vaccineMaster.findMany({
                where: { id: { in: vIds } },
                select: { id: true, name: true }
            })
        ]);

        // FIX: Generate all pre-signed URLs in parallel
        const enrichedAnimals = await Promise.all(
            animals.map(async (a) => ({
                ...a,
                photoUrl: a.photoUrl ? await getPresignedViewUrl('gaushala-media', a.photoUrl) : null
            }))
        );
        const animalMap = new Map(enrichedAnimals.map(a => [a.id, a]));
        const vaccineMap = new Map(vaccineMasters.map(v => [v.id, v.name]));

        const data = records.map(r => {
            const animal = animalMap.get(r.animalId);
            const vaccineName = r.vaccineId ? vaccineMap.get(r.vaccineId) : 'N/A';

            return {
                id: r.id,
                animalId: r.animalId,
                photo: animal?.photoUrl || null,
                name: animal?.name || null,
                tagno: animal?.tagNumber || null,
                animalNo: animal?.animalNumber || null,
                vaccine: vaccineName,
                doseDate: r.doseDate,
                remark: r.remark || '-',
                dosetype: r.doseType
            };
        });

        res.json({
            success: true,
            totalCount: total,
            data,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
        });
    } catch (error) {
        next(error);
    }
};

// ───────────────────────── Lab Report ─────────────────────────
/**
 * Lab Report (Animal-wise, Date-wise, or Labtest-wise)
 * Returns photo, name, tagno, animal no., labtest name, sample date, result date, Remark
 */
export const getLabReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) return res.status(401).json({ message: 'Gaushala ID missing' });

        const { from, to, animalId, labtestId, page = '1', limit = '20' } = req.query as { from?: string; to?: string; animalId?: string; labtestId?: string; page?: string; limit?: string };
        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
        const skip = (pageNum - 1) * limitNum;

        const where: any = { gaushalaId };

        if (animalId) where.animalId = animalId;
        if (labtestId) where.labtestId = labtestId;
        if (from || to) {
            where.sampleDate = {};
            if (from) { const fromDate = new Date(from); fromDate.setHours(0, 0, 0, 0); where.sampleDate.gte = fromDate; }
            if (to) { const toDate = new Date(to); toDate.setHours(23, 59, 59, 999); where.sampleDate.lte = toDate; }
        }

        const [total, records] = await Promise.all([
            (prisma as any).labRecord.count({ where }),
            (prisma as any).labRecord.findMany({
                where,
                orderBy: { sampleDate: 'desc' },
                skip,
                take: limitNum
            })
        ]);

        const animalIds = [...new Set(records.map((r: any) => r.animalId))] as string[];
        const lIds = [...new Set(records.map((r: any) => r.labtestId))] as string[];

        // FIX: Run both lookup queries in parallel
        const [animals, labtestMasters] = await Promise.all([
            prisma.animal.findMany({
                where: { id: { in: animalIds } },
                select: { id: true, name: true, tagNumber: true, animalNumber: true, photoUrl: true }
            }),
            (prisma as any).labtestMaster.findMany({
                where: { id: { in: lIds } },
                select: { id: true, name: true }
            })
        ]);

        // FIX: Generate all pre-signed URLs in parallel
        const enrichedAnimals = await Promise.all(
            animals.map(async (a: typeof animals[0]) => ({
                ...a,
                photoUrl: a.photoUrl ? await getPresignedViewUrl('gaushala-media', a.photoUrl) : null
            }))
        );
        const animalMap = new Map(enrichedAnimals.map((a: typeof enrichedAnimals[0]) => [a.id, a]));
        const labtestMap = new Map(labtestMasters.map((l: any) => [l.id, l.name]));

        const data = records.map((r: any) => {
            const animal = animalMap.get(r.animalId);
            const labtestName = labtestMap.get(r.labtestId) || 'Unknown';

            return {
                id: r.id,
                animalId: r.animalId,
                photo: (animal as any)?.photoUrl || null,
                name: (animal as any)?.name || null,
                tagno: (animal as any)?.tagNumber || null,
                animalNo: (animal as any)?.animalNumber || null,
                labtestName,
                sampleDate: r.sampleDate,
                resultDate: r.resultDate,
                Remark: r.remark || '-'
            };
        });

        res.json({
            success: true,
            totalCount: total,
            data,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
        });
    } catch (error) {
        next(error);
    }
};
