import { body, param, validationResult } from 'express-validator';
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

export const masterLabValidation = [
    body('name').notEmpty().withMessage('Name is required').isString(),
    validate
];

export const createLabRecordValidation = [
    body('animalId').isMongoId().withMessage('Valid animalId is required'),
    body('labtestId').isMongoId().withMessage('Valid labtestId is required'),
    body('sampleDate').isISO8601().withMessage('Valid sampleDate is required'),
    body('resultDate').optional().isISO8601().withMessage('Valid resultDate is required'),
    body('result').optional().isIn(['POSITIVE', 'NEGATIVE']).withMessage('Result must be POSITIVE or NEGATIVE'),
    body('attachmentUrl').optional().isString(),
    body('remark').optional().isString(),
    validate
];

export const updateLabRecordValidation = [
    param('id').isMongoId().withMessage('Valid record ID is required'),
    body('resultDate').optional().isISO8601().withMessage('Valid resultDate is required'),
    body('result').optional().isIn(['POSITIVE', 'NEGATIVE']).withMessage('Result must be POSITIVE or NEGATIVE'),
    body('attachmentUrl').optional().isString(),
    body('remark').optional().isString(),
    validate
];
