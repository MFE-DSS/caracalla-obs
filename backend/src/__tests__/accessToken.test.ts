import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { createTestDb, closeDb, getDb } from '../db/client.js';
import { generateAccessToken, verifyAccessToken } from '../services/accessTokenService.js';

const FIXTURE = {
  company_name: 'Menuiserie Dupont',
  company_size_band: '21-50',
  industry_hint: 'BTP / Construction',
  pain_text: 'Je perds du temps sur des tâches répétitives. On reçoit les demandes de devis par email.',
};

beforeAll(() => {
  createTestDb();
});

afterAll(() => {
  closeDb();
});

describe('accessTokenService', () => {
  it('generates a non-empty token', () => {
    const token = generateAccessToken('aud_test', 'premium_access');
    expect(token).toBeTruthy();
    expect(token.split('.').length).toBe(2);
  });

  it('verifies a valid token', () => {
    const token = generateAccessToken('aud_test', 'premium_access');
    const payload = verifyAccessToken(token, 'premium_access');
    expect(payload).not.toBeNull();
    expect(payload!.audit_id).toBe('aud_test');
    expect(payload!.scope).toBe('premium_access');
  });

  it('rejects token with wrong scope', () => {
    const token = generateAccessToken('aud_test', 'summary_access');
    const payload = verifyAccessToken(token, 'premium_access');
    expect(payload).toBeNull();
  });

  it('rejects token with wrong audit_id', () => {
    const token = generateAccessToken('aud_test', 'premium_access');
    const payload = verifyAccessToken(token, 'premium_access', 'aud_other');
    expect(payload).toBeNull();
  });

  it('rejects tampered token', () => {
    const token = generateAccessToken('aud_test', 'premium_access');
    const tampered = token.slice(0, -3) + 'xxx';
    const payload = verifyAccessToken(tampered, 'premium_access');
    expect(payload).toBeNull();
  });

  it('rejects garbage token', () => {
    expect(verifyAccessToken('garbage', 'premium_access')).toBeNull();
    expect(verifyAccessToken('', 'premium_access')).toBeNull();
    expect(verifyAccessToken('a.b.c', 'premium_access')).toBeNull();
  });
});

describe('Token integration with payment', () => {
  let auditId: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/audits').send(FIXTURE);
    auditId = res.body.audit_id;
  });

  it('dev-unlock returns an access_token', async () => {
    const res = await request(app).post(`/api/payments/dev-unlock/${auditId}`);
    expect(res.status).toBe(200);
    expect(res.body.paid).toBe(true);
    expect(res.body.access_token).toBeTruthy();
  });

  it('audit status includes access_token after payment', async () => {
    const res = await request(app).get(`/api/audits/${auditId}`);
    expect(res.body.access_token).toBeTruthy();
  });

  it('report accessible with valid token', async () => {
    const statusRes = await request(app).get(`/api/audits/${auditId}`);
    const token = statusRes.body.access_token;

    const res = await request(app).get(`/api/audits/${auditId}/report?token=${encodeURIComponent(token)}`);
    expect(res.status).toBe(200);
    expect(res.body.report).toBeDefined();
  });

  it('report rejected with invalid token', async () => {
    const res = await request(app).get(`/api/audits/${auditId}/report?token=invalid.token`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('invalid_token');
  });

  it('export accessible with valid premium token', async () => {
    const statusRes = await request(app).get(`/api/audits/${auditId}`);
    const token = statusRes.body.access_token;

    const res = await request(app).get(`/api/audits/${auditId}/export?token=${encodeURIComponent(token)}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
  });

  it('export rejected with invalid token', async () => {
    const res = await request(app).get(`/api/audits/${auditId}/export?token=invalid.token`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('invalid_token');
  });
});

describe('Token-less access still works for paid audits (backward compat)', () => {
  let auditId: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/audits').send(FIXTURE);
    auditId = res.body.audit_id;
    const db = getDb();
    db.prepare('UPDATE audits SET paid = 1 WHERE id = ?').run(auditId);
  });

  it('report accessible without token if paid', async () => {
    const res = await request(app).get(`/api/audits/${auditId}/report`);
    expect(res.status).toBe(200);
  });

  it('export accessible without token if paid', async () => {
    const res = await request(app).get(`/api/audits/${auditId}/export`);
    expect(res.status).toBe(200);
  });
});
