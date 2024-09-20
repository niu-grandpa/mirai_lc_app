import { authenticateUser } from '@controllers/auth';
import controller from '@controllers/work_data';
import { Router } from 'express';

const router = Router();

router.get('/all', authenticateUser, controller.getAll);
router.put('/sync', authenticateUser, controller.syncData);

export default router;
