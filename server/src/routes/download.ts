import controller from '@/controllers/download';
import { authenticateUser } from '@controllers/auth';
import { Router } from 'express';

const router = Router();

router.post('/project', authenticateUser, controller.createWholeProject);
router.post('/file', authenticateUser, controller.createOneFile);

export default router;
