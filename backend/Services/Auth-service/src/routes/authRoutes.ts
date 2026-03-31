import express from 'express';
import { register, login, getProfile, sendOtp, verifyOtp, updateSettings, changePassword, registerFcmToken } from '@controllers/authController.js';
import { createGaushala, getMyGaushalas } from '@controllers/gaushalaController.js';
import { addStaff, getStaffList, updateStaff, removeStaff } from '@controllers/staffController.js';
import { registerValidation, loginValidation, sendOtpValidation, verifyOtpValidation, updateSettingsValidation, changePasswordValidation, createGaushalaValidation, addStaffValidation, updateStaffValidation, registerFcmTokenValidation } from '@validators/authValidators.js';
import { auth } from '@middlewares/auth.js';
import { gaushalaAuth } from '@middlewares/gaushalaAuth.js';
import { otpLimit } from '@middlewares/rateLimiter.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', auth, getProfile);

// Gaushala Management
router.post('/gaushala', auth, createGaushalaValidation, createGaushala);
router.get('/gaushala/my', auth, getMyGaushalas);

// Password Management
router.post('/forgot-password/send-otp', otpLimit, sendOtpValidation, sendOtp);
router.post('/forgot-password/verify', verifyOtpValidation, verifyOtp);
router.post('/change-password', auth, changePasswordValidation, changePassword);

// Settings (Now per-gaushala scoped)
router.put('/settings', auth, gaushalaAuth(['OWNER', 'MANAGER']), updateSettingsValidation, updateSettings);

// Staff Management
router.post('/staff', auth, gaushalaAuth(['OWNER', 'MANAGER']), addStaffValidation, addStaff);
router.get('/staff', auth, gaushalaAuth(['OWNER', 'MANAGER']), getStaffList);
router.patch('/staff/:userId', auth, gaushalaAuth(['OWNER', 'MANAGER']), updateStaffValidation, updateStaff);
router.delete('/staff/:userId', auth, gaushalaAuth(['OWNER', 'MANAGER']), removeStaff);

router.post('/profile/fcm-token', auth, registerFcmTokenValidation, registerFcmToken);

export default router;
