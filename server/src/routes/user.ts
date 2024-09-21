import controller from '@/controllers/user';
import { authenticateUser } from '@controllers/auth';
import { Router } from 'express';

const router = Router();

router.get('/login', controller.login);
router.post('/register', controller.register);
router.post('/logout', authenticateUser, controller.logout);
router.delete('/destroy', authenticateUser, controller.destory);
router.post('/gen-anode-id', authenticateUser, controller.genANodeKey);

export default router;
