import { Router } from 'express';
import { handleCreateAudit, handleGetAuditStatus, handleGetSummary, handleGetReport } from '../controllers/auditsController.js';

const router = Router();

router.post('/', handleCreateAudit);
router.get('/:id', handleGetAuditStatus);
router.get('/:id/summary', handleGetSummary);
router.get('/:id/report', handleGetReport);

export default router;
