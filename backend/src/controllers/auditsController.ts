import type { Request, Response } from 'express';
import { createAuditSchema } from '../validation/auditSchemas.js';
import { createAudit, getAudit, getAuditOutput } from '../services/auditService.js';
import { getSummary } from '../services/summaryService.js';
import { getReport } from '../services/reportService.js';
import { verifyAccessToken, generateAccessToken } from '../services/accessTokenService.js';

function extractToken(req: Request): string | null {
  const q = req.query.token;
  if (typeof q === 'string' && q) return q;
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export function handleGetAuditStatus(req: Request, res: Response): void {
  const { id } = req.params;
  const audit = getAudit(id);

  if (!audit) {
    res.status(404).json({ error: 'not_found', message: 'Audit non trouvé.' });
    return;
  }

  const output = getAuditOutput(id);

  // Issue a fresh short-lived access token if paid (for backward-compat clients)
  const freshAccessToken = audit.paid ? generateAccessToken(id, 'premium_access') : null;

  res.json({
    audit_id: id,
    status: audit.status,
    paid: audit.paid,
    company_name: audit.company_name,
    summary_available: !!output,
    report_available: audit.paid && !!output,
    refresh_token: audit.paid ? (audit.access_token ?? null) : null,
    access_token: freshAccessToken,
  });
}

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

  // Token-based access check
  const token = extractToken(req);
  if (token) {
    const payload = verifyAccessToken(token, 'premium_access', id);
    if (!payload) {
      res.status(403).json({ error: 'invalid_token', message: 'Lien invalide ou expiré.' });
      return;
    }
  }

  const result = getReport(id);

  switch (result.status) {
    case 'not_found':
      res.status(404).json({ error: 'not_found', message: 'Audit non trouvé.' });
      return;
    case 'locked':
      // If no token provided and report is locked, return 402
      if (!token) {
        res.status(402).json(result.data);
        return;
      }
      // Token was provided but report is locked — shouldn't happen if token is valid
      res.status(402).json(result.data);
      return;
    case 'ok':
      res.json(result.data);
      return;
  }
}
