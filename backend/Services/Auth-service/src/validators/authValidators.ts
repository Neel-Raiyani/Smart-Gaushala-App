import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array().map((err: any) => ({
                message: err.msg
            }))
        });
    }
    next();
};

export const registerValidation = [
    body('mobileNumber')
        .isMobilePhone('en-IN').withMessage('Valid Indian mobile number is required'),
    body('name')
        .notEmpty().withMessage('Name is required'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    body('city')
        .notEmpty().withMessage('City is required'),
    body('gaushalaName')
        .notEmpty().withMessage('Gaushala name is required'),
    body('totalCattle')
        .isInt({ min: 0 }).withMessage('Total cattle must be a positive number'),
    validate
];

export const loginValidation = [
    body('mobileNumber')
        .isMobilePhone('en-IN').withMessage('Valid Indian mobile number is required'),
    body('password')
        .notEmpty().withMessage('Password is required'),
    validate
];

export const sendOtpValidation = [
    body('mobileNumber')
        .isMobilePhone('en-IN').withMessage('Valid Indian mobile number is required'),
    validate
];

export const verifyOtpValidation = [
    body('mobileNumber')
        .isMobilePhone('en-IN').withMessage('Valid Indian mobile number is required'),
    body('otp')
        .isLength({ min: 4, max: 6 }).withMessage('Invalid OTP format'),
    body('newPassword')
        .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    validate
];

export const updateSettingsValidation = [
    body('language')
        .optional()
        .isIn(['ENGLISH', 'GUJARATI', 'HINDI']).withMessage('Invalid language selection'),
    validate
];

export const changePasswordValidation = [
    body('oldPassword')
        .notEmpty().withMessage('Old password is required'),
    body('newPassword')
        .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    validate
];

export const createGaushalaValidation = [
    body('name').notEmpty().withMessage('Gaushala name is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('totalCattle').optional().isInt({ min: 0 }).withMessage('Total cattle must be a positive number'),
    validate
];

export const addStaffValidation = [
    body('mobileNumber')
        .isMobilePhone('en-IN').withMessage('Valid Indian mobile number is required'),
    body('name')
        .notEmpty().withMessage('Name is required'),
    body('role')
        .isIn(['MANAGER', 'STAFF', 'VETERINARIAN'])
        .withMessage('Invalid role. Use MANAGER, STAFF, or VETERINARIAN. OWNER registration is handled via the separate register endpoint.'),
    body('city')
        .optional()
        .isString().withMessage('City must be a string'),
    validate
];

export const updateStaffValidation = [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('city').optional().isString().withMessage('City must be a string'),
    body('role')
        .optional()
        .isIn(['MANAGER', 'STAFF', 'VETERINARIAN'])
        .withMessage('Invalid role'),
    validate
];
export const registerFcmTokenValidation = [
    body('fcmToken').notEmpty().withMessage('FCM token is required'),
    validate
];
