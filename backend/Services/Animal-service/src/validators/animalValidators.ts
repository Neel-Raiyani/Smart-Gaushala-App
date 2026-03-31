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

// ───────────────────────── Animal Registration ─────────────────────────
export const registerAnimalValidation = [
    body('gender')
        .isIn(['MALE', 'FEMALE']).withMessage('Gender must be MALE or FEMALE'),
    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string'),
    body('tagNumber')
        .notEmpty().withMessage('Tag number is required')
        .isString().withMessage('Tag number must be a string'),
    body('acquisitionType')
        .isIn(['BIRTH', 'PURCHASE', 'DONATION']).withMessage('Acquisition type must be BIRTH, PURCHASE, or DONATION'),
    body('cowBreed')
        .optional()
        .isIn([
            'Gir', 'Sahiwal', 'Red_Sindhi', 'Tharparkar', 'Kankrej', 'Rathi', 'Punganur', 
            'Badri', 'Hallikar', 'Kangayam', 'Hariana', 'Mewati', 'Nagori', 'Nimadi', 
            'Malvi', 'Kherigarh', 'Amritmahal', 'Umblachery', 'Pulikulam', 'Bargur', 
            'Ongole', 'Red_Kandhari', 'Gaolao', 'Gangatiri', 'Siri', 'Motu', 'Vechur', 
            'Jersey', 'Holstein_Friesian', 'Brown_Swiss'
        ]).withMessage('Invalid cow breed'),
    body('birthDate')
        .notEmpty().withMessage('Birth date is required')
        .isISO8601().withMessage('Birth date must be a valid ISO 8601 date'),
    body('parity')
        .notEmpty().withMessage('Parity is required')
        .isInt({ min: 0 }).withMessage('Parity must be a non-negative integer'),
    body('purchasePrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Purchase price must be a positive number'),
    body('purchaseDate')
        .optional()
        .isISO8601().withMessage('Purchase date must be a valid ISO 8601 date'),
    body('isUdderClosedFL').optional().isBoolean().withMessage('isUdderClosedFL must be a boolean'),
    body('isUdderClosedFR').optional().isBoolean().withMessage('isUdderClosedFR must be a boolean'),
    body('isUdderClosedBL').optional().isBoolean().withMessage('isUdderClosedBL must be a boolean'),
    body('isUdderClosedBR').optional().isBoolean().withMessage('isUdderClosedBR must be a boolean'),
    body('motherName').optional().isString().withMessage('Mother name must be a string'),
    body('fatherName').optional().isString().withMessage('Father name must be a string'),
    body('motherId').optional().isMongoId().withMessage('Mother ID must be a valid Mongo ID'),
    body('fatherId').optional().isMongoId().withMessage('Father ID must be a valid Mongo ID'),
    body('cowGroupId').optional().isMongoId().withMessage('Cow group ID must be a valid Mongo ID'),
    body('bullType').optional().isIn(['GAUSHALA', 'AI']).withMessage('Bull type must be GAUSHALA or AI'),
    validate
];

// ───────────────────────── Animal Update ─────────────────────────
export const updateAnimalValidation = [
    body('name').optional().isString().withMessage('Name must be a string'),
    body('tagNumber').optional().isString().withMessage('Tag number must be a string'),
    body('animalNumber').optional().isString().withMessage('Animal number must be a string'),
    body('gender').optional().isIn(['MALE', 'FEMALE']).withMessage('Gender must be MALE or FEMALE'),
    body('cowBreed').optional().isIn([
        'Gir', 'Sahiwal', 'Red_Sindhi', 'Tharparkar', 'Kankrej', 'Rathi', 'Punganur', 
        'Badri', 'Hallikar', 'Kangayam', 'Hariana', 'Mewati', 'Nagori', 'Nimadi', 
        'Malvi', 'Kherigarh', 'Amritmahal', 'Umblachery', 'Pulikulam', 'Bargur', 
        'Ongole', 'Red_Kandhari', 'Gaolao', 'Gangatiri', 'Siri', 'Motu', 'Vechur', 
        'Jersey', 'Holstein_Friesian', 'Brown_Swiss'
    ]).withMessage('Invalid cow breed'),
    body('bullView').optional().isString().withMessage('Bull view must be a string'),
    body('acquisitionType').optional().isIn(['BIRTH', 'PURCHASE', 'DONATION']).withMessage('Acquisition type must be BIRTH, PURCHASE, or DONATION'),
    body('purchaseDate').optional().isISO8601().withMessage('Purchase date must be a valid ISO 8601 date'),
    body('purchasedFrom').optional().isString().withMessage('Purchased from must be a string'),
    body('purchasePrice').optional().isFloat({ min: 0 }).withMessage('Purchase price must be a positive number'),
    body('ownerName').optional().isString().withMessage('Owner name must be a string'),
    body('ownerMobile').optional().isString().withMessage('Owner mobile must be a string'),
    body('photoUrl').optional().isString().withMessage('Photo URL must be a string'),
    body('isHandicapped').optional().isBoolean().withMessage('isHandicapped must be a boolean'),
    body('handicapReason').optional().isString().withMessage('Handicap reason must be a string'),
    body('parity').optional().isInt({ min: 0 }).withMessage('Parity must be a non-negative integer'),
    body('cowGroupId').optional().isMongoId().withMessage('Cow group ID must be a valid Mongo ID'),
    body('bullType').optional().isIn(['GAUSHALA', 'AI']).withMessage('Bull type must be GAUSHALA or AI'),
    body('birthDate').optional().isISO8601().withMessage('Birth date must be a valid ISO 8601 date'),
    body('motherMilk').optional().isFloat({ min: 0 }).withMessage('Mother milk must be a positive number'),
    body('grandmotherMilk').optional().isFloat({ min: 0 }).withMessage('Grandmother milk must be a positive number'),
    body('isUdderClosedFL').optional().isBoolean().withMessage('isUdderClosedFL must be a boolean'),
    body('isUdderClosedFR').optional().isBoolean().withMessage('isUdderClosedFR must be a boolean'),
    body('isUdderClosedBL').optional().isBoolean().withMessage('isUdderClosedBL must be a boolean'),
    body('isUdderClosedBR').optional().isBoolean().withMessage('isUdderClosedBR must be a boolean'),
    body('motherName').optional().isString().withMessage('Mother name must be a string'),
    body('fatherName').optional().isString().withMessage('Father name must be a string'),
    body('motherId').optional().isMongoId().withMessage('Mother ID must be a valid Mongo ID'),
    body('fatherId').optional().isMongoId().withMessage('Father ID must be a valid Mongo ID'),
    validate
];

// ───────────────────────── Sell Record ─────────────────────────
export const sellRecordValidation = [
    body('animalId').isMongoId().withMessage('A valid animal ID is required'),
    body('buyer').notEmpty().withMessage('Buyer name is required'),
    body('mobileNumber').isMobilePhone('en-IN').withMessage('A valid Indian mobile number is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('soldAt').optional().isISO8601().withMessage('Sold date must be a valid ISO 8601 date'),
    validate
];

// ───────────────────────── Death Record ─────────────────────────
export const deathRecordValidation = [
    body('animalId').isMongoId().withMessage('A valid animal ID is required'),
    body('dateOfDeath').isISO8601().withMessage('Date of death must be a valid ISO 8601 date'),
    body('reason').notEmpty().withMessage('Reason for death is required'),
    validate
];

// ───────────────────────── Donation Record ─────────────────────────
export const donationRecordValidation = [
    body('animalId').isMongoId().withMessage('A valid animal ID is required'),
    body('gaushalaName').notEmpty().withMessage('Receiving gaushala name is required'),
    body('mobileNumber').isMobilePhone('en-IN').withMessage('A valid Indian mobile number is required'),
    body('donatedAt').optional().isISO8601().withMessage('Donated date must be a valid ISO 8601 date'),
    validate
];
