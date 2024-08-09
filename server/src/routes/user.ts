import controller from '@src/controllers/user';
import { Router } from 'express';

const router = Router();

router.post('/user/register', controller.register);

export default router;
