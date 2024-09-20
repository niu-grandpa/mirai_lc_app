import controller from '@/controllers/user';
import { authenticateUser } from '@controllers/auth';
import { Router } from 'express';

const router = Router();

router.post('/register', controller.register);
router.post('/gen-anode-id', authenticateUser, controller.genANodeKey);

export default router;
