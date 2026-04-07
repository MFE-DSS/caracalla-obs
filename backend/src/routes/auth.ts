import { Router } from 'express';
import { handleRefresh } from '../controllers/authController.js';

const router = Router();

router.post('/refresh', handleRefresh);

export default router;
