import controller from '@/controllers/user';
import { Router } from 'express';

const router = Router();

router.post('/register', controller.register);

export default router;
