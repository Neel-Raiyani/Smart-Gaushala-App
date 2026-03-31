import { body, query, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            errorCode: 'VALIDATION_FAILED',
            errors: errors.array().map((err: any) => ({
                field: err.path || err.param,
                message: err.msg
            }))
        });
    }
    next();
};

export const createFolderValidation = [
    body('name').notEmpty().withMessage('Folder name is required').isString(),
    body('type').isIn(['PHOTO', 'VIDEO']).withMessage('Folder type must be PHOTO or VIDEO'),
    validate
];

export const renameFolderValidation = [
    param('id').isMongoId().withMessage('Valid folder ID is required'),
    body('name').notEmpty().withMessage('Folder name is required').isString(),
    validate
];

export const getUploadUrlValidation = [
    query('fileName').notEmpty().withMessage('fileName is required'),
    query('fileType').notEmpty().withMessage('fileType is required'),
    validate
];

export const registerMediaItemValidation = [
    body('folderId').isMongoId().withMessage('Valid folderId is required'),
    body('fileName').notEmpty().withMessage('fileName is required').isString(),
    body('originalName').notEmpty().withMessage('originalName is required').isString(),
    body('mimeType').notEmpty().withMessage('mimeType is required').isString(),
    body('size').isNumeric().withMessage('size must be a number'),
    validate
];
