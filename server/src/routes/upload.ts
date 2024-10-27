import controller from '@/controllers/upload';
import { authenticateUser } from '@controllers/auth';
import { Router } from 'express';
import multer from 'multer';
import path from 'path';

const router = Router();

const upload = multer({
  dest: path.join(__dirname, '../../public/uploads/'),
});

router.post(
  '/work-file',
  authenticateUser,
  upload.single('readJsonFile'),
  controller.readJsonFile
);

export default router;
