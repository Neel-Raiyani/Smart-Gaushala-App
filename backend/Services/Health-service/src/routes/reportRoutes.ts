import express from 'express';
import { auth } from '@middlewares/auth.js';
import { gaushalaAuth } from '@middlewares/gaushalaAuth.js';
import {
    getDewormingReport,
    getDewormingDropdowns,
    getMedicalReport,
    getVaccineReport,
    getLabReport
} from '@controllers/reportController.js';

const router = express.Router();

router.get('/deworming', auth, gaushalaAuth(), getDewormingReport);
router.get('/deworming/dropdown', auth, gaushalaAuth(), getDewormingDropdowns);
router.get('/medical', auth, gaushalaAuth(), getMedicalReport);
router.get('/vaccine', auth, gaushalaAuth(), getVaccineReport);
router.get('/lab', auth, gaushalaAuth(), getLabReport);

export default router;
