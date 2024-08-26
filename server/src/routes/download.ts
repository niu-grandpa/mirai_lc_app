import controller from '@/controllers/download';
import { Router } from 'express';

const router = Router();

router.post('/project', controller.createWholeProject);
router.post('/file', controller.createOneFile);

export default router;
