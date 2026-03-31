import { Router } from 'express';
import folderRoutes from './folderRoutes.js';
import galleryRoutes from './galleryRoutes.js';

const router = Router();

router.use('/folders', folderRoutes);
router.use('/gallery', galleryRoutes);

export default router;
