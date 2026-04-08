import type { Request, Response } from 'express';
import { getAudit } from '../services/auditService.js';
import { getTimeline, getMetrics } from '../services/timelineService.js';

export function handleGetTimeline(req: Request, res: Response): void {
  const { id } = req.params;
  const audit = getAudit(id);
  if (!audit) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  const timeline = getTimeline(id);
  res.json({ audit_id: id, timeline });
}

export function handleGetMetrics(req: Request, res: Response): void {
  const { id } = req.params;
  const audit = getAudit(id);
  if (!audit) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.json({ audit_id: id, metrics: getMetrics(id) });
}
