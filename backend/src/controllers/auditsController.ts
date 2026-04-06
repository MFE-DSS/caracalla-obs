import type { Request, Response } from 'express';
import { createAuditSchema } from '../validation/auditSchemas.js';
import { createAudit } from '../services/auditService.js';
import { getSummary } from '../services/summaryService.js';
import { getReport } from '../services/reportService.js';

export function handleCreateAudit(req: Request, res: Response): void {
  const parsed = createAuditSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'validation_error',
      details: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
    return;
  }

  try {
    const result = createAudit(parsed.data);
    res.status(201).json(result);
  } catch (err) {
    console.error('Engine error:', err);
    res.status(500).json({ error: 'engine_error', message: 'Erreur lors du calcul du diagnostic.' });
  }
}

export function handleGetSummary(req: Request, res: Response): void {
  const { id } = req.params;
  const summary = getSummary(id);

  if (!summary) {
    res.status(404).json({ error: 'not_found', message: 'Audit non trouvé.' });
    return;
  }

  res.json(summary);
}

export function handleGetReport(req: Request, res: Response): void {
  const { id } = req.params;
  const result = getReport(id);

  switch (result.status) {
    case 'not_found':
      res.status(404).json({ error: 'not_found', message: 'Audit non trouvé.' });
      return;
    case 'locked':
      res.status(402).json(result.data);
      return;
    case 'ok':
      res.json(result.data);
      return;
  }
}
