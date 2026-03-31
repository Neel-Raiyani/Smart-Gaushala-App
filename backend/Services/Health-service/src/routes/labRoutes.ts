import express from 'express';
import { auth } from '@middlewares/auth.js';
import { gaushalaAuth } from '@middlewares/gaushalaAuth.js';
import {
    createLabRecord,
    updateLabRecord,
    deleteLabRecord,
    listLabRecords
} from '@controllers/labController.js';
import {
    addLabTest,
    getLabTests,
    deleteLabTest
} from '@controllers/masterController.js';import {
    masterLabValidation,
    createLabRecordValidation,
    updateLabRecordValidation
} from '@validators/labValidators.js';

const router = express.Router();

// Master Data CRUD (Gaushala-scoped)
router.get('/master', auth, gaushalaAuth(), getLabTests);
router.post('/master', auth, gaushalaAuth(), masterLabValidation, addLabTest);
router.delete('/master/:id', auth, gaushalaAuth(), deleteLabTest);

// Record CRUD
router.get('/', auth, gaushalaAuth(), listLabRecords);
router.post('/', auth, gaushalaAuth(), createLabRecordValidation, createLabRecord);
router.put('/:id', auth, gaushalaAuth(), updateLabRecordValidation, updateLabRecord);
router.delete('/:id', auth, gaushalaAuth(), deleteLabRecord);

export default router;
