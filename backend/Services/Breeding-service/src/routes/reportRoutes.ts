import express from 'express';
import { auth } from '@middlewares/auth.js';
import { gaushalaAuth } from '@middlewares/gaushalaAuth.js';
import {
    getHeatReport,
    getPregnancyReport,
    getDeliveryReport,
    getAnimalsForParityDropdown
} from '@controllers/reportController.js';

const router = express.Router();

router.get('/heat', auth, gaushalaAuth(), getHeatReport);
router.get('/pregnancy', auth, gaushalaAuth(), getPregnancyReport);
router.get('/delivery', auth, gaushalaAuth(), getDeliveryReport);
router.get('/parity/dropdown', auth, gaushalaAuth(), getAnimalsForParityDropdown);

export default router;
