import express from 'express';
import { auth } from '@middlewares/auth.js';
import { gaushalaAuth } from '@middlewares/gaushalaAuth.js';

// Controllers
import { getAllDiseases, addDisease, getAllVaccines, addVaccine } from '@controllers/masterController.js';
import { recordMedicalVisit, updateMedicalRecord, getMedicalHistoryByAnimal, getSickAnimals } from '@controllers/medicalController.js';
import { recordVaccination, updateVaccination, getVaccinationHistoryByAnimal } from '@controllers/vaccinationController.js';
import { recordDeworming, recordBulkDeworming, updateDeworming, getDewormingHistoryByAnimal, listDewormingRecords } from '@controllers/dewormingController.js';
import { getHealthTimeline } from '@controllers/timelineController.js';
import reportRoutes from '@routes/reportRoutes.js';
import labRoutes from '@routes/labRoutes.js';

// Validators
import {
    masterValidation,
    recordMedicalValidation, updateMedicalValidation,
    recordVaccinationValidation, updateVaccinationValidation,
    recordDewormingValidation, recordBulkDewormingValidation, updateDewormingValidation
} from '@validators/healthValidators.js';

const router = express.Router();

// ───────────────────────── Master Lists ─────────────────────────
router.get('/master/diseases', auth, gaushalaAuth(), getAllDiseases);
router.post('/master/diseases', auth, gaushalaAuth(['OWNER', 'MANAGER']), masterValidation, addDisease);

router.get('/master/vaccines', auth, gaushalaAuth(), getAllVaccines);
router.post('/master/vaccines', auth, gaushalaAuth(['OWNER', 'MANAGER']), masterValidation, addVaccine);


// ───────────────────────── Medical Records ─────────────────────────
router.get('/medical/sick', auth, gaushalaAuth(), getSickAnimals);
router.post('/medical', auth, gaushalaAuth(['OWNER', 'MANAGER', 'VETERINARIAN']), recordMedicalValidation, recordMedicalVisit);
router.patch('/medical/:id', auth, gaushalaAuth(['OWNER', 'MANAGER', 'VETERINARIAN']), updateMedicalValidation, updateMedicalRecord);
router.get('/medical/animal/:animalId', auth, gaushalaAuth(), getMedicalHistoryByAnimal);

// ───────────────────────── Vaccination ─────────────────────────
router.post('/vaccination', auth, gaushalaAuth(['OWNER', 'MANAGER', 'VETERINARIAN']), recordVaccinationValidation, recordVaccination);
router.patch('/vaccination/:id', auth, gaushalaAuth(['OWNER', 'MANAGER', 'VETERINARIAN']), updateVaccinationValidation, updateVaccination);
router.get('/vaccination/animal/:animalId', auth, gaushalaAuth(), getVaccinationHistoryByAnimal);

// ───────────────────────── Deworming ─────────────────────────
router.get('/deworming', auth, gaushalaAuth(['OWNER', 'MANAGER']), listDewormingRecords);
router.post('/deworming', auth, gaushalaAuth(['OWNER', 'MANAGER', 'VETERINARIAN']), recordDewormingValidation, recordDeworming);
router.post('/deworming/bulk', auth, gaushalaAuth(['OWNER', 'MANAGER', 'VETERINARIAN']), recordBulkDewormingValidation, recordBulkDeworming);
router.patch('/deworming/:id', auth, gaushalaAuth(['OWNER', 'MANAGER', 'VETERINARIAN']), updateDewormingValidation, updateDeworming);
router.get('/deworming/animal/:animalId', auth, gaushalaAuth(), getDewormingHistoryByAnimal);

// ───────────────────────── Unified Timeline ─────────────────────────
router.get('/timeline/animal/:animalId', auth, gaushalaAuth(), getHealthTimeline);

// ───────────────────────── Lab Testing ─────────────────────────
router.use('/lab', labRoutes);

// ───────────────────────── Reports ─────────────────────────
router.use('/reports', reportRoutes);

export default router;
