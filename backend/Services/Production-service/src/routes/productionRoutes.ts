import express from 'express';
import {
    getCategories, createCategory, updateCategory, deleteCategory
} from '@controllers/categoryController.js';
import {
    getInventoryStatus, updateInventory
} from '@controllers/inventoryController.js';
import {
    recordYields, getYieldEntries, updateYield, deleteYield
} from '@controllers/productionController.js';
import {
    recordDistribution, getDistributions, updateDistribution, deleteDistribution
} from '@controllers/distributionController.js';
import {
    getDailyMilkReport, getMonthlyMilkReport, getCowMonthlyReport,
    getDistributionSummary, getParityReport, exportMonthlyMilkExcel
} from '@controllers/reportController.js';
import {
    recordYieldValidation, updateYieldValidation,
    distributionValidation, updateDistributionValidation,
    inventoryUpdateValidation
} from '@validators/productionValidators.js';
import { auth } from '@middlewares/auth.js';
import { gaushalaAuth } from '@middlewares/gaushalaAuth.js';

const router = express.Router();

// All routes require authentication and gaushala context
router.use(auth);
router.use(gaushalaAuth());

// ───────────────────────── Categories ─────────────────────────
router.get('/categories', getCategories);
router.post('/categories', gaushalaAuth(['OWNER', 'MANAGER']), createCategory);
router.patch('/categories/:id', gaushalaAuth(['OWNER', 'MANAGER']), updateCategory);
router.delete('/categories/:id', gaushalaAuth(['OWNER', 'MANAGER']), deleteCategory);

// ───────────────────────── Inventory ─────────────────────────
router.get('/inventory', getInventoryStatus);
router.post('/inventory/update', gaushalaAuth(['OWNER', 'MANAGER']), inventoryUpdateValidation, updateInventory);

// ───────────────────────── Milking / Production ─────────────────────────
router.post('/yields/bulk', gaushalaAuth(['OWNER', 'MANAGER', 'STAFF']), recordYieldValidation, recordYields);
router.get('/yields', getYieldEntries);
router.patch('/yields/:id', gaushalaAuth(['OWNER', 'MANAGER', 'STAFF']), updateYieldValidation, updateYield);
router.delete('/yields/:id', gaushalaAuth(['OWNER', 'MANAGER']), deleteYield);

// ───────────────────────── Distribution ─────────────────────────
router.post('/distribution', gaushalaAuth(['OWNER', 'MANAGER', 'STAFF']), distributionValidation, recordDistribution);
router.get('/distribution', getDistributions);
router.patch('/distribution/:id', gaushalaAuth(['OWNER', 'MANAGER', 'STAFF']), updateDistributionValidation, updateDistribution);
router.delete('/distribution/:id', gaushalaAuth(['OWNER', 'MANAGER']), deleteDistribution);

// ───────────────────────── Reports ─────────────────────────
router.get('/reports/daily', getDailyMilkReport);
router.get('/reports/monthly', getMonthlyMilkReport);
router.get('/export/monthly', exportMonthlyMilkExcel);
router.get('/reports/cow/:animalId', getCowMonthlyReport);
router.get('/reports/distribution', getDistributionSummary);
router.get('/reports/parity', getParityReport);

export default router;
