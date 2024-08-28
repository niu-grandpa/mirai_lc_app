import controller from '@/controllers/user';
import { Router } from 'express';

const router = Router();

router.post('/register', controller.register);
router.post('/gen-anode-id', controller.genANodeKey);

export default router;
