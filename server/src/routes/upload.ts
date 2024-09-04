import controller from '@/controllers/upload';
import { Router } from 'express';

const router = Router();

router.post('/work-file', controller.readJsonFile);

export default router;
