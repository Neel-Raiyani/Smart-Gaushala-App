import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation middleware — collects all validation errors and returns them
 * in a structured format with field names for easy frontend consumption.
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            errorCode: 'VALIDATION_FAILED',
            message: 'Request validation failed',
            errors: errors.array().map((err: any) => ({
                field: err.path || err.param,
                message: err.msg
            }))
        });
    }
    next();
};

// ───────────────────────── Heat Record: Create ─────────────────────────
export const recordHeatValidation = [
    body('animalId').isMongoId().withMessage('A valid animal ID is required'),
    body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('breedingType').isIn(['NATURAL', 'AI']).withMessage('Breeding type must be NATURAL or AI'),
    validate
];

// ───────────────────────── Heat Record: Update ─────────────────────────
export const updateHeatValidation = [
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('breedingType').optional().isIn(['NATURAL', 'AI']).withMessage('Breeding type must be NATURAL or AI'),
    validate
];

// ───────────────────────── Dry-Off: Create ─────────────────────────
export const addDryOffValidation = [
    body('animalId').isMongoId().withMessage('A valid animal ID is required'),
    body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('reason').isIn(['ILLNESS', 'LOW_YIELD', 'MEDICATED', 'OTHER']).withMessage('Reason must be ILLNESS, LOW_YIELD, MEDICATED, or OTHER'),
    body('remarks').optional().isString().withMessage('Remarks must be a string'),
    validate
];

// ───────────────────────── Dry-Off: Update ─────────────────────────
export const updateDryOffValidation = [
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('reason').optional().isIn(['ILLNESS', 'LOW_YIELD', 'MEDICATED', 'OTHER']).withMessage('Reason must be ILLNESS, LOW_YIELD, MEDICATED, or OTHER'),
    body('remarks').optional().isString().withMessage('Remarks must be a string'),
    validate
];

// ───────────────────────── Journey: Initiate ─────────────────────────
export const initiateJourneyValidation = [
    body('animalId').isMongoId().withMessage('A valid animal ID is required'),
    body('conceiveDate').isISO8601().withMessage('Conceive date must be a valid ISO 8601 date'),
    body('pregnancyType').isIn(['NATURAL', 'AI']).withMessage('Pregnancy type must be NATURAL or AI'),
    body('bullId').optional().isMongoId().withMessage('Bull ID must be a valid Mongo ID'),
    body('bullName').optional().isString().withMessage('Bull name must be a string'),
    body('bullTag').optional().isString().withMessage('Bull tag must be a string'),
    body('serialNumber').optional().isString().withMessage('Serial number must be a string'),
    body('companyName').optional().isString().withMessage('Company name must be a string'),
    validate
];

// ───────────────────────── Journey: Update Initiation ─────────────────────────
export const updateJourneyValidation = [
    body('conceiveDate').optional().isISO8601().withMessage('Conceive date must be a valid ISO 8601 date'),
    body('pregnancyType').optional().isIn(['NATURAL', 'AI']).withMessage('Pregnancy type must be NATURAL or AI'),
    body('bullId').optional().isMongoId().withMessage('Bull ID must be a valid Mongo ID'),
    body('bullName').optional().isString().withMessage('Bull name must be a string'),
    body('bullTag').optional().isString().withMessage('Bull tag must be a string'),
    body('serialNumber').optional().isString().withMessage('Serial number must be a string'),
    body('companyName').optional().isString().withMessage('Company name must be a string'),
    validate
];

// ───────────────────────── Journey: Confirm Pregnancy (PD) ─────────────────────────
export const confirmPregnancyValidation = [
    body('pdResult').isBoolean().withMessage('PD result must be a boolean (true/false)'),
    body('pdDate').isISO8601().withMessage('PD date must be a valid ISO 8601 date'),
    validate
];

// ───────────────────────── Journey: Mark Dry-Off ─────────────────────────
export const markDryOffValidation = [
    body('dryOffDate').isISO8601().withMessage('Dry-off date must be a valid ISO 8601 date'),
    validate
];

// ───────────────────────── Journey: Record Delivery ─────────────────────────
export const recordDeliveryValidation = [
    body('deliveryDate').isISO8601().withMessage('Delivery date must be a valid ISO 8601 date'),
    body('calfStatus').isIn(['ALIVE', 'DEAD', 'ABORTED']).withMessage('Calf status must be ALIVE, DEAD, or ABORTED'),
    body('calfGender').isIn(['MALE', 'FEMALE']).withMessage('Calf gender must be MALE or FEMALE'),
    body('calfName').if(body('calfStatus').equals('ALIVE')).notEmpty().withMessage('Calf name is required for alive calves'),
    body('calfTagNumber').if(body('calfStatus').equals('ALIVE')).notEmpty().withMessage('Calf tag number is required for alive calves'),
    body('calfBreed').optional().isIn([
        'Gir', 'Sahiwal', 'Red_Sindhi', 'Tharparkar', 'Kankrej', 'Rathi', 'Punganur', 
        'Badri', 'Hallikar', 'Kangayam', 'Hariana', 'Mewati', 'Nagori', 'Nimadi', 
        'Malvi', 'Kherigarh', 'Amritmahal', 'Umblachery', 'Pulikulam', 'Bargur', 
        'Ongole', 'Red_Kandhari', 'Gaolao', 'Gangatiri', 'Siri', 'Motu', 'Vechur', 
        'Jersey', 'Holstein_Friesian', 'Brown_Swiss'
    ]).withMessage('Invalid cow breed'),
    body('calfGroup').optional().isString().withMessage('Calf group must be a string'),
    body('calfAppearance').optional().isString().withMessage('Calf appearance must be a string'),
    body('calfWeight').optional().isFloat({ min: 0 }).withMessage('Calf weight must be a positive number'),
    body('deliveryPhoto').optional().isString().withMessage('Delivery photo must be a string URL'),
    body('calfPhoto').optional().isString().withMessage('Calf photo must be a string URL'),
    validate
];
// ───────────────────────── Parity Record: Add ─────────────────────────
export const addParityValidation = [
    body('animalId').isMongoId().withMessage('A valid animal ID is required'),
    body('parityNo').isInt({ min: 1 }).withMessage('Parity number must be a positive integer'),
    body('cowPhoto').optional().isString().withMessage('Cow photo must be a string URL'),
    body('pregnancyType').isIn(['NATURAL', 'AI']).withMessage('Pregnancy type must be NATURAL or AI'),
    body('bullId').optional().isMongoId().withMessage('Bull ID must be a valid Mongo ID'),
    body('bullName').optional().isString().withMessage('Bull name must be a string'),
    body('deliveryDate').isISO8601().withMessage('Delivery date must be a valid ISO 8601 date'),
    body('pregnancyDate').isISO8601().withMessage('Pregnancy date must be a valid ISO 8601 date'),
    body('dryOffDate').optional().isISO8601().withMessage('Dry-off date must be a valid ISO 8601 date'),
    body('note').optional().isString().withMessage('Note must be a string'),
    validate
];

// ───────────────────────── Parity Record: Update ─────────────────────────
export const updateParityValidation = [
    body('parityNo').optional().isInt({ min: 1 }).withMessage('Parity number must be a positive integer'),
    body('cowPhoto').optional().isString().withMessage('Cow photo must be a string URL'),
    body('pregnancyType').optional().isIn(['NATURAL', 'AI']).withMessage('Pregnancy type must be NATURAL or AI'),
    body('bullId').optional().isMongoId().withMessage('Bull ID must be a valid Mongo ID'),
    body('bullName').optional().isString().withMessage('Bull name must be a string'),
    body('deliveryDate').optional().isISO8601().withMessage('Delivery date must be a valid ISO 8601 date'),
    body('pregnancyDate').optional().isISO8601().withMessage('Pregnancy date must be a valid ISO 8601 date'),
    body('dryOffDate').optional().isISO8601().withMessage('Dry-off date must be a valid ISO 8601 date'),
    body('note').optional().isString().withMessage('Note must be a string'),
    validate
];
