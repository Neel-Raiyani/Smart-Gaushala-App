import { Router } from 'express';
import { auth } from '@middlewares/auth.js';
import { gaushalaAuth } from '@middlewares/gaushalaAuth.js';
import {
    getHeatAlerts,
    getPregnancyCheckAlerts,
    getInseminationAlerts,
    getDeliveryAlerts,
    getDewormingAlerts,
    getAdultAlerts,
    getLabAlerts,
    getVaccinationAlerts
} from '@controllers/alertController.js';

const router = Router();

// All alert routes require authentication and gaushala membership
router.use(auth);
router.use(gaushalaAuth());

// Individual alert endpoints
router.get('/heat', getHeatAlerts);
router.get('/pregnancy-check', getPregnancyCheckAlerts);
router.get('/insemination', getInseminationAlerts);
router.get('/delivery', getDeliveryAlerts);
router.get('/deworming', getDewormingAlerts);
router.get('/adult', getAdultAlerts);
router.get('/lab-test', getLabAlerts);
router.get('/vaccination', getVaccinationAlerts);

export default router;
