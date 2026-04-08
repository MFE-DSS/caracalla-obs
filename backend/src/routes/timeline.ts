import { Router } from 'express';
import { handleGetTimeline, handleGetMetrics } from '../controllers/timelineController.js';

const router = Router();

router.get('/:id/timeline', handleGetTimeline);
router.get('/:id/metrics', handleGetMetrics);

export default router;
