import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  createShareLink,
  getShareLinkByToken,
  isShareLinkValid,
  listActiveShareLinks,
  revokeShareLink,
} from '../services/shareLinkService.js';
import { getAudit } from '../services/auditService.js';
import { getReport } from '../services/reportService.js';
import { recordEvent } from '../services/eventService.js';

const createSchema = z.object({
  scope: z.enum(['premium_read', 'premium_read_export']).optional(),
  ttl_days: z.number().int().min(1).max(90).optional(),
});

export function handleCreateShareLink(req: Request, res: Response): void {
  const { id } = req.params;
  const audit = getAudit(id);
  if (!audit) {
    res.status(404).json({ error: 'not_found', message: 'Audit non trouvé.' });
    return;
  }
  if (!audit.paid) {
    res.status(402).json({ error: 'premium_locked', message: 'Un partage nécessite un accès premium.' });
    return;
  }

  const parsed = createSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: 'validation_error', details: parsed.error.issues });
    return;
  }

  const link = createShareLink({
    audit_id: id,
    scope: parsed.data.scope,
    ttl_days: parsed.data.ttl_days,
  });

  recordEvent({
    audit_id: id,
    event_type: 'share_link_created',
    actor_mode: 'owner',
    surface: 'web',
    payload: { share_id: link.id, scope: link.scope },
  });

  const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
  res.status(201).json({
    id: link.id,
    audit_id: link.audit_id,
    token: link.token,
    scope: link.scope,
    expires_at: link.expires_at,
    is_active: link.is_active,
    created_at: link.created_at,
    share_url: `${FRONTEND_URL}/share/${link.token}`,
  });
}

export function handleListShareLinks(req: Request, res: Response): void {
  const { id } = req.params;
  const audit = getAudit(id);
  if (!audit) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
  const links = listActiveShareLinks(id).map((l) => ({
    id: l.id,
    token: l.token,
    scope: l.scope,
    expires_at: l.expires_at,
    created_at: l.created_at,
    is_active: l.is_active,
    share_url: `${FRONTEND_URL}/share/${l.token}`,
  }));
  res.json({ audit_id: id, links });
}

export function handleRevokeShareLink(req: Request, res: Response): void {
  const { token } = req.params;
  const link = getShareLinkByToken(token);
  if (!link) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  const ok = revokeShareLink(token);
  if (ok) {
    recordEvent({
      audit_id: link.audit_id,
      event_type: 'share_link_revoked',
      actor_mode: 'owner',
      surface: 'web',
      payload: { share_id: link.id },
    });
  }
  res.json({ revoked: ok, token });
}

export function handleGetSharedReport(req: Request, res: Response): void {
  const { token } = req.params;
  const link = getShareLinkByToken(token);
  if (!link) {
    res.status(404).json({ error: 'not_found', message: 'Lien invalide.' });
    return;
  }
  if (!isShareLinkValid(link)) {
    recordEvent({
      audit_id: link.audit_id,
      event_type: 'report_access_denied',
      actor_mode: 'shared_viewer',
      surface: 'share',
      payload: { reason: link.is_active ? 'expired' : 'revoked', share_id: link.id },
    });
    res.status(403).json({ error: 'link_expired_or_revoked' });
    return;
  }

  const result = getReport(link.audit_id);
  if (result.status !== 'ok') {
    res.status(result.status === 'not_found' ? 404 : 402).json(
      'data' in result ? result.data : { error: 'not_found' },
    );
    return;
  }

  recordEvent({
    audit_id: link.audit_id,
    event_type: 'share_link_opened',
    actor_mode: 'shared_viewer',
    surface: 'share',
    payload: { share_id: link.id, scope: link.scope },
  });
  recordEvent({
    audit_id: link.audit_id,
    event_type: 'premium_viewed',
    actor_mode: 'shared_viewer',
    surface: 'share',
  });

  res.json({
    ...result.data,
    shared: true,
    scope: link.scope,
    expires_at: link.expires_at,
  });
}
