import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            errorCode: 'VALIDATION_FAILED',
            errors: errors.array().map((err: any) => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// ───────────────────────── Master Lists ─────────────────────────

export const masterValidation = [
    body('name').notEmpty().withMessage('Name is required').isString(),
    validate
];

// ───────────────────────── Medical Records ─────────────────────────

export const recordMedicalValidation = [
    body('animalId').isMongoId().withMessage('Invalid animal ID'),
    body('visitType').isIn(['ILLNESS', 'CHECKUP']).withMessage('Visit type must be ILLNESS or CHECKUP'),
    body('visitDate').isISO8601().withMessage('Valid visit date is required'),
    body('medicalStatus').isIn(['SICK', 'HEALTHY']).withMessage('Medical status must be SICK or HEALTHY'),
    body('visitNumber').optional().isString(),
    body('vetId').optional().isMongoId().withMessage('Invalid veterinarian ID'),
    body('diseaseId')
        .optional({ checkFalsy: true })
        .isMongoId().withMessage('Disease ID must be a valid Mongo ID'),
    body('diseaseId')
        .if(body('visitType').equals('ILLNESS'))
        .notEmpty().withMessage('Disease ID is required for illness visits'),
    body('symptoms').optional().isString(),
    body('treatment').optional().isString(),
    validate
];

export const updateMedicalValidation = [
    param('id').isMongoId().withMessage('Invalid record ID'),
    body('visitType').optional().isIn(['ILLNESS', 'CHECKUP']),
    body('visitDate').optional().isISO8601(),
    body('medicalStatus').optional().isIn(['SICK', 'HEALTHY']),
    body('visitNumber').optional().isString(),
    body('vetId').optional().isMongoId(),
    body('diseaseId').optional().isMongoId(),
    body('symptoms').optional().isString(),
    body('treatment').optional().isString(),
    validate
];

// ───────────────────────── Vaccination ─────────────────────────

export const recordVaccinationValidation = [
    body('animalId').isMongoId().withMessage('Invalid animal ID'),
    body('doseDate').isISO8601().withMessage('Valid dose date is required'),
    body('doseType').isIn(['FIRST', 'BOOSTER', 'REPEAT']).withMessage('Invalid dose type'),
    body('vaccineId').isMongoId().withMessage('Vaccine ID is required'),
    body('remark').optional().isString(),
    validate
];

export const updateVaccinationValidation = [
    param('id').isMongoId().withMessage('Invalid record ID'),
    body('doseDate').optional().isISO8601(),
    body('doseType').optional().isIn(['FIRST', 'BOOSTER', 'REPEAT']),
    body('vaccineId').optional().isMongoId(),
    body('remark').optional().isString(),
    validate
];

// ───────────────────────── Deworming ─────────────────────────

export const recordDewormingValidation = [
    body('animalId').isMongoId().withMessage('Invalid animal ID'),
    body('doseDate').isISO8601().withMessage('Valid dose date is required'),
    body('doseType').isIn(['INJECTION', 'TABLET']).withMessage('Dose type must be INJECTION or TABLET'),
    body('companyName').optional().isString(),
    body('quantity').optional().isString(),
    body('vetId').isMongoId().withMessage('Veterinarian ID is required'),
    body('nextDoseDate').optional().isISO8601(),
    validate
];

export const recordBulkDewormingValidation = [
    body('animalIds').isArray({ min: 1 }).withMessage('At least one animalId is required'),
    body('animalIds.*').isMongoId().withMessage('Invalid animal ID in array'),
    body('doseDate').isISO8601().withMessage('Valid dose date is required'),
    body('doseType').isIn(['INJECTION', 'TABLET']),
    body('companyName').optional().isString(),
    body('quantity').optional().isString(),
    body('vetId').isMongoId().withMessage('Veterinarian ID is required'),
    body('nextDoseDate').optional().isISO8601(),
    validate
];

export const updateDewormingValidation = [
    param('id').isMongoId().withMessage('Invalid record ID'),
    body('doseDate').optional().isISO8601(),
    body('doseType').optional().isIn(['INJECTION', 'TABLET']),
    body('companyName').optional().isString(),
    body('quantity').optional().isString(),
    body('vetId').optional().isMongoId(),
    body('nextDoseDate').optional().isISO8601(),
    validate
];
