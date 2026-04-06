import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { createTestDb, closeDb, getDb } from '../db/client.js';

const FIXTURE_A = {
  company_name: 'Menuiserie Dupont',
  company_size_band: '21-50',
  industry_hint: 'BTP / Construction',
  pain_text: 'Je perds du temps sur des tâches répétitives. On reçoit les demandes de devis par email, on les ressaisit dans Excel.',
};

let auditId: string;

beforeAll(async () => {
  createTestDb();
  const res = await request(app).post('/api/audits').send(FIXTURE_A);
  auditId = res.body.audit_id;
});

afterAll(() => {
  closeDb();
});

describe('POST /api/payments/create-session', () => {
  it('returns 503 when Stripe is not configured', async () => {
    const res = await request(app)
      .post('/api/payments/create-session')
      .send({ audit_id: auditId });

    // Without STRIPE_SECRET_KEY env var, should return 503
    expect(res.status).toBe(503);
    expect(res.body.error).toBe('stripe_not_configured');
  });

  it('returns 400 for missing audit_id', async () => {
    const res = await request(app)
      .post('/api/payments/create-session')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation_error');
  });

  it('returns 404 for unknown audit', async () => {
    const res = await request(app)
      .post('/api/payments/create-session')
      .send({ audit_id: 'aud_nonexistent' });

    expect(res.status).toBe(404);
  });
});

describe('POST /api/payments/dev-unlock/:id', () => {
  it('unlocks a non-paid audit', async () => {
    const res = await request(app)
      .post(`/api/payments/dev-unlock/${auditId}`);

    expect(res.status).toBe(200);
    expect(res.body.audit_id).toBe(auditId);
    expect(res.body.paid).toBe(true);
  });

  it('returns 404 for unknown audit', async () => {
    const res = await request(app)
      .post('/api/payments/dev-unlock/aud_nonexistent');

    expect(res.status).toBe(404);
  });

  it('idempotent: unlock twice does not error', async () => {
    // First unlock already done above
    const res = await request(app)
      .post(`/api/payments/dev-unlock/${auditId}`);

    expect(res.status).toBe(200);
    expect(res.body.paid).toBe(true);
  });
});

describe('Payment → Report unlock integration', () => {
  let freshAuditId: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/audits').send(FIXTURE_A);
    freshAuditId = res.body.audit_id;
  });

  it('report is locked before payment', async () => {
    const res = await request(app).get(`/api/audits/${freshAuditId}/report`);
    expect(res.status).toBe(402);
    expect(res.body.error).toBe('premium_locked');
  });

  it('unlock via dev-unlock', async () => {
    const res = await request(app).post(`/api/payments/dev-unlock/${freshAuditId}`);
    expect(res.status).toBe(200);
    expect(res.body.paid).toBe(true);
  });

  it('report is unlocked after payment', async () => {
    const res = await request(app).get(`/api/audits/${freshAuditId}/report`);
    expect(res.status).toBe(200);
    expect(res.body.audit_id).toBe(freshAuditId);
    expect(res.body.report).toBeDefined();
    expect(res.body.premium_view).toBeDefined();
    expect(res.body.premium_view.executive_verdict).toBeDefined();
  });

  it('paid flag persists in DB', () => {
    const db = getDb();
    const row = db.prepare('SELECT paid FROM audits WHERE id = ?').get(freshAuditId) as { paid: number };
    expect(row.paid).toBe(1);
  });
});

describe('Webhook endpoint', () => {
  it('returns 400 without stripe-signature header', async () => {
    const res = await request(app)
      .post('/api/payments/webhook')
      .set('Content-Type', 'application/json')
      .send('{}');

    expect(res.status).toBe(400);
  });
});
