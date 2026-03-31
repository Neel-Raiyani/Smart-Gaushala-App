import express from 'express';
import { auth } from '@middlewares/auth.js';
import { gaushalaAuth } from '@middlewares/gaushalaAuth.js';

import { recordHeat, getHeatRecords, updateHeatRecord, deleteHeatRecord, getEligibleForHeat } from '@controllers/heatController.js';
import { addDryOff, getDryOffRecords, updateDryOff, deleteDryOff, getEligibleForDryOffDropdown } from '@controllers/dryOffController.js';
import { addParityRecord, getParityRecords, updateParityRecord } from '@controllers/parityController.js';
import { getChildren } from '@controllers/lineageController.js';
import reportRoutes from './reportRoutes.js';
import {
    initiateJourney, updateJourneyInitiation, confirmPregnancy,
    markDryOff, recordDelivery, getJourneyDetails,
    listJourneys, deleteJourney, getEligibleForDryOff,
    getEligibleCowsForJourney, getBullsForDropdown
} from '@controllers/journeyController.js';
import {
    recordHeatValidation, updateHeatValidation,
    addDryOffValidation, updateDryOffValidation,
    initiateJourneyValidation, updateJourneyValidation,
    confirmPregnancyValidation, markDryOffValidation, recordDeliveryValidation,
    addParityValidation, updateParityValidation
} from '@validators/breedingValidators.js';
import { getPresignedUploadUrl } from '@utils/s3.js';

const router = express.Router();

// ───────────────────────── Media ─────────────────────────
router.get('/media/presigned-url', auth, gaushalaAuth(), async (req: any, res) => {
    try {
        const { fileName, fileType } = req.query;
        if (!fileName || !fileType) return res.status(400).json({ success: false, message: 'fileName and fileType are required' });
        const data = await getPresignedUploadUrl('breeding-media', fileName as string, fileType as string);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ───────────────────────── Heat Records ─────────────────────────
router.post('/heat', auth, gaushalaAuth(), recordHeatValidation, recordHeat);
router.get('/heat', auth, gaushalaAuth(), getHeatRecords);
router.get('/heat/eligible', auth, gaushalaAuth(), getEligibleForHeat);
router.patch('/heat/:id', auth, gaushalaAuth(['OWNER', 'MANAGER', 'STAFF']), updateHeatValidation, updateHeatRecord);
router.delete('/heat/:id', auth, gaushalaAuth(['OWNER', 'MANAGER']), deleteHeatRecord);

// ───────────────────────── Dry-Off Records (Non-Pregnancy) ─────────────────────────
router.post('/dry-off', auth, gaushalaAuth(['OWNER', 'MANAGER', 'STAFF']), addDryOffValidation, addDryOff);
router.get('/dry-off', auth, gaushalaAuth(), getDryOffRecords);
router.get('/dry-off/eligible', auth, gaushalaAuth(), getEligibleForDryOffDropdown);
router.patch('/dry-off/:id', auth, gaushalaAuth(['OWNER', 'MANAGER', 'STAFF']), updateDryOffValidation, updateDryOff);
router.delete('/dry-off/:id', auth, gaushalaAuth(['OWNER', 'MANAGER']), deleteDryOff);

// ───────────────────────── Parity Records ─────────────────────────
router.post('/parity', auth, gaushalaAuth(['OWNER', 'MANAGER', 'STAFF']), addParityValidation, addParityRecord);
router.get('/parity/:animalId', auth, gaushalaAuth(), getParityRecords);
router.patch('/parity/:id', auth, gaushalaAuth(['OWNER', 'MANAGER', 'STAFF']), updateParityValidation, updateParityRecord);

// ───────────────────────── Bulls & Lineage ─────────────────────────
router.get('/bulls/eligible', auth, gaushalaAuth(), getBullsForDropdown);
router.get('/lineage/:id', auth, gaushalaAuth(), getChildren);

// ───────────────────────── Conception Journeys ─────────────────────────
router.post('/journey/initiate', auth, gaushalaAuth(['OWNER', 'MANAGER', 'STAFF']), initiateJourneyValidation, initiateJourney);
router.get('/journey/list', auth, gaushalaAuth(), listJourneys);
router.get('/journey/eligible-cows', auth, gaushalaAuth(), getEligibleCowsForJourney);
router.get('/journey/eligible-dry-off', auth, gaushalaAuth(), getEligibleForDryOff);
router.get('/journey/:id', auth, gaushalaAuth(), getJourneyDetails);
router.put('/journey/:id', auth, gaushalaAuth(['OWNER', 'MANAGER', 'STAFF']), updateJourneyValidation, updateJourneyInitiation);
router.patch('/journey/:id/confirm', auth, gaushalaAuth(['OWNER', 'MANAGER', 'VETERINARIAN']), confirmPregnancyValidation, confirmPregnancy);
router.patch('/journey/:id/dry-off', auth, gaushalaAuth(['OWNER', 'MANAGER', 'STAFF']), markDryOffValidation, markDryOff);
router.patch('/journey/:id/deliver', auth, gaushalaAuth(['OWNER', 'MANAGER', 'STAFF']), recordDeliveryValidation, recordDelivery);
router.delete('/journey/:id', auth, gaushalaAuth(['OWNER', 'MANAGER']), deleteJourney);

// ───────────────────────── Reports ─────────────────────────
router.use('/reports', reportRoutes);

export default router;
