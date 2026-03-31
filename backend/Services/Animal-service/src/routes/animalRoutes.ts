import express from 'express';
import { registerAnimal, getCows, getBulls, getAnimalById, updateAnimal, generateUploadUrl, deleteAnimal } from '@controllers/animalController.js';
import { recordSell, recordDeath, recordDonation, updateDisposalRecord, deleteDisposalRecord, getDisposalRecords } from '@controllers/disposalController.js';
import { getGroups, createGroup, updateGroup, deleteGroup } from '@controllers/groupController.js';
import reportRoutes from './reportRoutes.js';
import { registerAnimalValidation, updateAnimalValidation, sellRecordValidation, deathRecordValidation, donationRecordValidation } from '@validators/animalValidators.js';
import { auth } from '@middlewares/auth.js';
import { gaushalaAuth } from '@middlewares/gaushalaAuth.js';

const router = express.Router();

router.use('/reports', reportRoutes);

router.get('/media/presigned-url', auth, gaushalaAuth(), generateUploadUrl);

// ───────────────────────── Cow Groups ─────────────────────────
router.get('/groups', auth, gaushalaAuth(), getGroups);
router.post('/groups', auth, gaushalaAuth(['OWNER', 'MANAGER']), createGroup);
router.patch('/groups/:id', auth, gaushalaAuth(['OWNER', 'MANAGER']), updateGroup);
router.delete('/groups/:id', auth, gaushalaAuth(['OWNER', 'MANAGER']), deleteGroup);

router.post('/sell', auth, gaushalaAuth(['OWNER', 'MANAGER']), sellRecordValidation, recordSell);
router.post('/death', auth, gaushalaAuth(['OWNER', 'MANAGER']), deathRecordValidation, recordDeath);
router.post('/donation', auth, gaushalaAuth(['OWNER', 'MANAGER']), donationRecordValidation, recordDonation);
router.patch('/disposal/:type/:id', auth, gaushalaAuth(['OWNER', 'MANAGER']), updateDisposalRecord);
router.delete('/disposal/:type/:id', auth, gaushalaAuth(['OWNER', 'MANAGER']), deleteDisposalRecord);
router.get('/disposals', auth, gaushalaAuth(), getDisposalRecords);

// ───────────────────────── Animals ─────────────────────────
router.post('/add', auth, gaushalaAuth(['OWNER', 'MANAGER', 'STAFF']), registerAnimalValidation, registerAnimal);
router.get('/cows', auth, gaushalaAuth(), getCows);
router.get('/bulls', auth, gaushalaAuth(), getBulls);
router.patch('/update/:id', auth, gaushalaAuth(['OWNER', 'MANAGER', 'STAFF']), updateAnimalValidation, updateAnimal);
router.get('/:id', auth, gaushalaAuth(), getAnimalById);
router.delete('/:id', auth, gaushalaAuth(['OWNER', 'MANAGER']), deleteAnimal);

export default router;