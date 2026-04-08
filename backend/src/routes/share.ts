import { Router } from 'express';
import {
  handleCreateShareLink,
  handleGetSharedReport,
  handleListShareLinks,
  handleRevokeShareLink,
} from '../controllers/shareController.js';

// Mounted at /api
const router = Router();

router.post('/audits/:id/share-links', handleCreateShareLink);
router.get('/audits/:id/share-links', handleListShareLinks);
router.get('/share/:token', handleGetSharedReport);
router.post('/share/:token/revoke', handleRevokeShareLink);

export default router;
