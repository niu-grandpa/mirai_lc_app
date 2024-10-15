import { authenticateUser } from '@controllers/auth';
import controller from '@controllers/work_data';
import { Router } from 'express';

const router = Router();

router.get('/all', authenticateUser, controller.getAll);
router.put('/sync', authenticateUser, controller.syncData);

router.post('/create-folder', controller.createFolderNode);
router.post('/create-file', controller.createFileNode);
router.post('/create-component', controller.createComponent);

export default router;
