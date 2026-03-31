import { Router } from 'express';
import * as folderController from '@controllers/folderController.js';
import { auth } from '@middlewares/auth.js';
import { gaushalaAuth } from '@middlewares/gaushalaAuth.js';
import { createFolderValidation, renameFolderValidation } from '@validators/mediaValidators.js';

const router = Router();

router.use(auth);
router.use(gaushalaAuth());

router.post('/', createFolderValidation, folderController.createFolder);
router.get('/', folderController.getFolders);
router.patch('/:id', renameFolderValidation, folderController.renameFolder);
router.delete('/:id', folderController.deleteFolder);

export default router;
