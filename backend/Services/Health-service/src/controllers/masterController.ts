import { Request, Response, NextFunction } from 'express';
import prisma from '@config/db.js';
import { AppError } from '@utils/AppError.js';
import { AuthRequest } from '@appTypes/express.js';

/**
 * Fetch all diseases for a specific gaushala.
 * Returns common diseases (gaushalaId = null) merged with gaushala-specific ones.
 * If a gaushala-specific disease has the same name as a common one, the specific one takes precedence.
 */
export const getAllDiseases = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) throw new AppError('Gaushala ID is required', 400);

        const allDiseases = await prisma.diseaseMaster.findMany({
            where: {
                OR: [
                    { gaushalaId: null },
                    { gaushalaId }
                ]
            },
            orderBy: { name: 'asc' }
        });

        // Deduplicate: gaushala-specific diseases take precedence over common ones
        const diseaseMap = new Map<string, typeof allDiseases[0]>();
        for (const d of allDiseases) {
            if (d.gaushalaId === null) {
                diseaseMap.set(d.name.toLowerCase(), d);
            }
        }
        for (const d of allDiseases) {
            if (d.gaushalaId !== null) {
                diseaseMap.set(d.name.toLowerCase(), d);
            }
        }

        const diseases = Array.from(diseaseMap.values()).sort((a, b) => a.name.localeCompare(b.name));

        res.status(200).json({
            success: true,
            data: diseases
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add a new disease for a specific gaushala.
 */
export const addDisease = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) throw new AppError('Gaushala ID is required', 400);

        const { name } = req.body;
        if (!name) throw new AppError('Disease name is required', 400);

        const disease = await prisma.diseaseMaster.create({
            data: { name, gaushalaId }
        });

        res.status(201).json({
            success: true,
            message: 'Disease added successfully',
            data: disease
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Fetch all vaccines for a specific gaushala.
 * Returns common vaccines (gaushalaId = null) merged with gaushala-specific ones.
 * If a gaushala-specific vaccine has the same name as a common one, the specific one takes precedence.
 */
export const getAllVaccines = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) throw new AppError('Gaushala ID is required', 400);

        // Fetch common vaccines (gaushalaId is null) and gaushala-specific vaccines
        const allVaccines = await prisma.vaccineMaster.findMany({
            where: {
                OR: [
                    { gaushalaId: null },   // Common vaccines
                    { gaushalaId }           // Gaushala-specific vaccines
                ]
            },
            orderBy: { name: 'asc' }
        });

        // Deduplicate: gaushala-specific vaccines take precedence over common ones
        const vaccineMap = new Map<string, typeof allVaccines[0]>();
        // First, add common vaccines
        for (const v of allVaccines) {
            if (v.gaushalaId === null) {
                vaccineMap.set(v.name.toLowerCase(), v);
            }
        }
        // Then, overwrite with gaushala-specific vaccines (these win)
        for (const v of allVaccines) {
            if (v.gaushalaId !== null) {
                vaccineMap.set(v.name.toLowerCase(), v);
            }
        }

        const vaccines = Array.from(vaccineMap.values()).sort((a, b) => a.name.localeCompare(b.name));

        res.status(200).json({
            success: true,
            data: vaccines
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add a new vaccine for a specific gaushala.
 */
export const addVaccine = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) throw new AppError('Gaushala ID is required', 400);

        const { name, frequencyMonths } = req.body;
        if (!name) throw new AppError('Vaccine name is required', 400);

        const vaccine = await prisma.vaccineMaster.create({
            data: { name, gaushalaId, frequencyMonths: frequencyMonths ?? 0 }
        });

        res.status(201).json({
            success: true,
            message: 'Vaccine added successfully',
            data: vaccine
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Fetch all lab tests for a specific gaushala.
 * Returns common lab tests (gaushalaId = null) merged with gaushala-specific ones.
 * If a gaushala-specific lab test has the same name as a common one, the specific one takes precedence.
 */
export const getLabTests = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) throw new AppError('Gaushala ID is required', 400);

        const allLabTests = await (prisma as any).labtestMaster.findMany({
            where: {
                OR: [
                    { gaushalaId: null },
                    { gaushalaId }
                ]
            },
            orderBy: { name: 'asc' }
        });

        // Deduplicate: gaushala-specific lab tests take precedence over common ones
        const labTestMap = new Map<string, any>();
        for (const t of allLabTests) {
            if (t.gaushalaId === null) {
                labTestMap.set(t.name.toLowerCase(), t);
            }
        }
        for (const t of allLabTests) {
            if (t.gaushalaId !== null) {
                labTestMap.set(t.name.toLowerCase(), t);
            }
        }

        const labTests = Array.from(labTestMap.values()).sort((a: any, b: any) => a.name.localeCompare(b.name));

        res.status(200).json({
            success: true,
            data: labTests
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add a new lab test for a specific gaushala.
 */
export const addLabTest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gaushalaId = req.gaushala?.id as string;
        if (!gaushalaId) throw new AppError('Gaushala ID is required', 400);

        const { name } = req.body;
        if (!name) throw new AppError('Lab test name is required', 400);

        const labTest = await (prisma as any).labtestMaster.create({
            data: {
                name,
                gaushalaId
            }
        });

        res.status(201).json({
            success: true,
            message: 'Lab test added successfully',
            data: labTest
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a lab test master.
 */
export const deleteLabTest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const gaushalaId = req.gaushala?.id as string;

        if (!gaushalaId) throw new AppError('Gaushala ID is required', 400);

        const labTest = await (prisma as any).labtestMaster.findFirst({
            where: { id, gaushalaId }
        });

        if (!labTest) throw new AppError('Lab test not found or unauthorized', 404);

        await (prisma as any).labtestMaster.delete({
            where: { id }
        });

        res.status(200).json({
            success: true,
            message: 'Lab test deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};


