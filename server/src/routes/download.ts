import controller from '@/controllers/download';
import { Router } from 'express';

const router = Router();

router.post('/project', (req, res) => controller.createWholeProject(req, res));
router.post('/file', (req, res) => controller.createOneFile(req, res));

export default router;
