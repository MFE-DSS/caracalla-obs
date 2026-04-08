/**
 * ADVANCED_01 — Integration tests covering the 3 streams:
 *   A. SHARE_MODE_01
 *   B. OBSERVABILITY_01
 *   C. AUDIT_TIMELINE_01
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { createTestDb, closeDb, getDb } from '../db/client.js';
import { recordEvent, listEvents } from '../services/eventService.js';
import {
  createShareLink,
  getShareLinkByToken,
  isShareLinkValid,
  revokeShareLink,
} from '../services/shareLinkService.js';
import { clearSentEmails } from '../services/emailService.js';

const FIXTURE = {
  company_name: 'Advanced Test Co',
  company_size_band: '21-50',
  industry_hint: 'Services',
  pain_text: 'Beaucoup de ressaisie manuelle entre nos outils commerciaux et la facturation.',
  email: 'ops@advanced-test.example',
};

async function createPaidAudit(): Promise<string> {
  const createRes = await request(app).post('/api/audits').send(FIXTURE);
  const auditId = createRes.body.audit_id;
  await request(app).post(`/api/payments/dev-unlock/${auditId}`);
  return auditId;
}

beforeEach(() => {
  createTestDb();
  clearSentEmails();
});

afterAll(() => {
  closeDb();
});

// ─── Stream B — Observability ────────────────────────────────────────────────
describe('eventService (Stream B)', () => {
  it('records and lists events in order', async () => {
    const createRes = await request(app).post('/api/audits').send(FIXTURE);
    const auditId = createRes.body.audit_id;

    const events = listEvents(auditId);
    const types = events.map((e) => e.event_type);
    expect(types).toContain('audit_created');
    expect(types).toContain('audit_computed');
  });

  it('records payment_completed + premium_unlocked on dev-unlock', async () => {
    const auditId = await createPaidAudit();
    const types = listEvents(auditId).map((e) => e.event_type);
    expect(types).toContain('payment_completed');
    expect(types).toContain('premium_unlocked');
  });

  it('records email_payment_sent on unlock with email', async () => {
    const auditId = await createPaidAudit();
    // allow fire-and-forget email to flush
    await new Promise((r) => setImmediate(r));
    const types = listEvents(auditId).map((e) => e.event_type);
    expect(types).toContain('email_audit_sent');
    expect(types).toContain('email_payment_sent');
  });

  it('records premium_viewed on report fetch', async () => {
    const auditId = await createPaidAudit();
    await request(app).get(`/api/audits/${auditId}/report`);
    const types = listEvents(auditId).map((e) => e.event_type);
    expect(types).toContain('premium_viewed');
  });

  it('records invalid_token_attempt + report_access_denied on bad token', async () => {
    const auditId = await createPaidAudit();
    await request(app).get(`/api/audits/${auditId}/report?token=nope`);
    const types = listEvents(auditId).map((e) => e.event_type);
    expect(types).toContain('invalid_token_attempt');
    expect(types).toContain('report_access_denied');
  });

  it('recordEvent is fail-soft (invalid audit id still returns cleanly)', () => {
    expect(() =>
      recordEvent({ audit_id: 'aud_fake', event_type: 'summary_viewed' }),
    ).not.toThrow();
  });
});

// ─── Stream A — Share mode ───────────────────────────────────────────────────
describe('shareLinkService + share endpoints (Stream A)', () => {
  it('creates a share link for a paid audit', async () => {
    const auditId = await createPaidAudit();
    const res = await request(app).post(`/api/audits/${auditId}/share-links`).send({});
    expect(res.status).toBe(201);
    expect(res.body.token).toMatch(/^shr_/);
    expect(res.body.scope).toBe('premium_read');
    expect(new Date(res.body.expires_at).getTime()).toBeGreaterThan(Date.now());
  });

  it('refuses to create a share link for an unpaid audit', async () => {
    const createRes = await request(app).post('/api/audits').send(FIXTURE);
    const auditId = createRes.body.audit_id;
    const res = await request(app).post(`/api/audits/${auditId}/share-links`).send({});
    expect(res.status).toBe(402);
  });

  it('lists active share links', async () => {
    const auditId = await createPaidAudit();
    await request(app).post(`/api/audits/${auditId}/share-links`).send({});
    await request(app).post(`/api/audits/${auditId}/share-links`).send({ scope: 'premium_read_export' });
    const res = await request(app).get(`/api/audits/${auditId}/share-links`);
    expect(res.status).toBe(200);
    expect(res.body.links).toHaveLength(2);
  });

  it('reads premium report via a share token', async () => {
    const auditId = await createPaidAudit();
    const createRes = await request(app).post(`/api/audits/${auditId}/share-links`).send({});
    const token = createRes.body.token;

    const res = await request(app).get(`/api/share/${token}`);
    expect(res.status).toBe(200);
    expect(res.body.audit_id).toBe(auditId);
    expect(res.body.shared).toBe(true);
    expect(res.body.premium_view).toBeDefined();

    const types = listEvents(auditId).map((e) => e.event_type);
    expect(types).toContain('share_link_opened');
  });

  it('revokes a share link and blocks further access', async () => {
    const auditId = await createPaidAudit();
    const createRes = await request(app).post(`/api/audits/${auditId}/share-links`).send({});
    const token = createRes.body.token;

    const revokeRes = await request(app).post(`/api/share/${token}/revoke`);
    expect(revokeRes.status).toBe(200);
    expect(revokeRes.body.revoked).toBe(true);

    const readRes = await request(app).get(`/api/share/${token}`);
    expect(readRes.status).toBe(403);

    const types = listEvents(auditId).map((e) => e.event_type);
    expect(types).toContain('share_link_revoked');
  });

  it('rejects expired share links', async () => {
    const auditId = await createPaidAudit();
    // Create directly with a past expiration by manipulating the DB
    const link = createShareLink({ audit_id: auditId, ttl_days: 1 });
    getDb()
      .prepare('UPDATE shared_access_links SET expires_at = ? WHERE id = ?')
      .run('2000-01-01T00:00:00.000Z', link.id);

    const fresh = getShareLinkByToken(link.token)!;
    expect(isShareLinkValid(fresh)).toBe(false);

    const res = await request(app).get(`/api/share/${link.token}`);
    expect(res.status).toBe(403);
  });

  it('revokeShareLink returns false on unknown token', () => {
    expect(revokeShareLink('nope')).toBe(false);
  });
});

// ─── Stream C — Timeline & metrics ───────────────────────────────────────────
describe('timeline endpoints (Stream C)', () => {
  it('returns the full event timeline for an audit', async () => {
    const auditId = await createPaidAudit();
    await request(app).get(`/api/audits/${auditId}/report`);

    const res = await request(app).get(`/api/audits/${auditId}/timeline`);
    expect(res.status).toBe(200);
    expect(res.body.audit_id).toBe(auditId);
    expect(Array.isArray(res.body.timeline)).toBe(true);
    const types = res.body.timeline.map((t: { event_type: string }) => t.event_type);
    expect(types).toContain('audit_created');
    expect(types).toContain('premium_unlocked');
    expect(types).toContain('premium_viewed');
    // Each item has a human label
    for (const item of res.body.timeline) {
      expect(typeof item.label).toBe('string');
      expect(item.label.length).toBeGreaterThan(0);
    }
  });

  it('returns useful metrics', async () => {
    const auditId = await createPaidAudit();
    await request(app).post(`/api/audits/${auditId}/share-links`).send({});
    await request(app).get(`/api/audits/${auditId}/report`);

    const res = await request(app).get(`/api/audits/${auditId}/metrics`);
    expect(res.status).toBe(200);
    expect(res.body.metrics.shares_created).toBeGreaterThanOrEqual(1);
    expect(res.body.metrics.premium_opens).toBeGreaterThanOrEqual(1);
  });

  it('returns 404 for unknown audit', async () => {
    const res = await request(app).get(`/api/audits/aud_fake/timeline`);
    expect(res.status).toBe(404);
  });
});
