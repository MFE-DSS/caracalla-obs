import { Router } from 'express';
import { handleCreateCheckoutSession, handleDevUnlock } from '../controllers/paymentController.js';

const router = Router();

router.post('/create-session', handleCreateCheckoutSession);
// Dev-only endpoint to unlock without Stripe
router.post('/dev-unlock/:id', handleDevUnlock);

export default router;
