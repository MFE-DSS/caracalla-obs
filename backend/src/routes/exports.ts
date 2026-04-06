import { Router } from 'express';
import { handleExportPdf } from '../controllers/exportsController.js';

const router = Router();

router.get('/:id/export', handleExportPdf);

export default router;
