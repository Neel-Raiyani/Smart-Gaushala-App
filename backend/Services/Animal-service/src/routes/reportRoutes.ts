import express from 'express';
import { auth } from '@middlewares/auth.js';
import { gaushalaAuth } from '@middlewares/gaushalaAuth.js';
import { 
    getAnimalSummary, getUdderCloseCows, retireAnimal, 
    getEligibleForRetirement, exportCowsExcel, exportBullsExcel 
} from '@controllers/reportController.js';

const router = express.Router();

// All routes require auth
router.use(auth);
router.use(gaushalaAuth());

/**
 * Summary reports
 */
router.get('/summary', getAnimalSummary);

/**
 * Export reports
 */
router.get('/export/cows', exportCowsExcel);
router.get('/export/bulls', exportBullsExcel);

/**
 * Filtered cow lists
 */
router.get('/udder-close', getUdderCloseCows);

/**
 * Retirement management
 */
router.get('/eligible-retirement', getEligibleForRetirement);
router.post('/retire', gaushalaAuth(['OWNER', 'MANAGER']), retireAnimal);

export default router;
