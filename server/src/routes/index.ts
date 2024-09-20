import { Router } from 'express';
import download from './download';
import upload from './upload';
import user from './user';
import workData from './work_data';

const router = Router();

router.use('/user', user);
router.use('/upload', upload);
router.use('/download', download);
router.use('/work-data', workData);

export default router;
