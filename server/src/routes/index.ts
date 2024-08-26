import { Router } from 'express';
import download from './download';
import user from './user';

const router = Router();

router.use('/user', user);
router.use('/download', download);

export default router;
