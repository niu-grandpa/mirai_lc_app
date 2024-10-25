import { Router } from 'express';
import upload from './upload';
import user from './user';
import workData from './work_data';

const router = Router();

router.use('/user', user);
router.use('/upload', upload);
router.use('/work-data', workData);

export default router;
