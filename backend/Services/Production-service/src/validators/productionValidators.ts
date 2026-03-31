import { body, query, param } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const handleValidation = (req: Request, res: Response, next: NextFunction) => {
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

export const recordYieldValidation = [
    body('date').isISO8601().withMessage('Valid date is required'),
    body('session').isIn(['MORNING', 'EVENING']).withMessage('Session must be MORNING or EVENING'),
    body('entries').isArray({ min: 1 }).withMessage('Entries array is required'),
    body('entries.*.animalId').isMongoId().withMessage('Valid animalId is required'),
    body('entries.*.quantity').isFloat({ min: 0 }).withMessage('Milk quantity must be 0 or greater'),
    body('entries.*.feedQuantity').isFloat({ min: 0 }).withMessage('Feed quantity is required and must be 0 or greater'),
    handleValidation
];

export const updateYieldValidation = [
    param('id').isMongoId().withMessage('Valid record ID is required'),
    body('quantity').optional().isFloat({ min: 0 }).withMessage('Milk quantity must be 0 or greater'),
    body('feedQuantity').optional().isFloat({ min: 0 }).withMessage('Feed quantity must be 0 or greater'),
    handleValidation
];

export const distributionValidation = [
    body('date').isISO8601().withMessage('Valid date is required'),
    body('session').isIn(['MORNING', 'EVENING']).withMessage('Session must be MORNING or EVENING'),
    body('categoryId').isMongoId().withMessage('Valid categoryId is required'),
    body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be 0 or greater'),
    handleValidation
];

export const updateDistributionValidation = [
    param('id').isMongoId().withMessage('Valid distribution record ID is required'),
    body('quantity').optional().isFloat({ min: 0 }).withMessage('Quantity must be 0 or greater'),
    body('categoryId').optional().isMongoId().withMessage('Valid categoryId is required'),
    body('date').optional().isISO8601().withMessage('Valid date is required'),
    body('session').optional().isIn(['MORNING', 'EVENING']).withMessage('Session must be MORNING or EVENING'),
    handleValidation
];

export const inventoryUpdateValidation = [
    body('quantity').isFloat().withMessage('Quantity must be a number'),
    handleValidation
];
