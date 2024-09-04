import { Router } from 'express';
import download from './download';
import upload from './upload';
import user from './user';

const router = Router();

router.use('/user', user);
router.use('/upload', upload);
router.use('/download', download);

export default router;
