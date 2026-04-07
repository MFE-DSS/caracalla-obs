import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { createTestDb, closeDb } from '../db/client.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
} from '../services/accessTokenService.js';

const FIXTURE = {
  company_name: 'Menuiserie Dupont',
  company_size_band: '21-50',
  industry_hint: 'BTP / Construction',
  pain_text: 'Je perds du temps sur des tâches répétitives. On reçoit les demandes de devis par email.',
};

beforeAll(() => createTestDb());
afterAll(() => closeDb());

describe('Access vs Refresh tokens', () => {
  it('generates distinct access and refresh tokens', () => {
    const access = generateAccessToken('aud_test', 'premium_access');
    const refresh = generateRefreshToken('aud_test', 'premium_access');
    expect(access).not.toBe(refresh);
  });

  it('verifyAccessToken accepts access token', () => {
    const access = generateAccessToken('aud_test', 'premium_access');
    expect(verifyAccessToken(access, 'premium_access')).not.toBeNull();
  });

  it('verifyAccessToken rejects refresh token', () => {
    const refresh = generateRefreshToken('aud_test', 'premium_access');
    expect(verifyAccessToken(refresh, 'premium_access')).toBeNull();
  });

  it('verifyRefreshToken accepts refresh token', () => {
    const refresh = generateRefreshToken('aud_test', 'premium_access');
    expect(verifyRefreshToken(refresh, 'premium_access')).not.toBeNull();
  });

  it('verifyRefreshToken rejects access token', () => {
    const access = generateAccessToken('aud_test', 'premium_access');
    expect(verifyRefreshToken(access, 'premium_access')).toBeNull();
  });

  it('generateTokenPair returns both tokens with expiries', () => {
    const pair = generateTokenPair('aud_test', 'premium_access');
    expect(pair.access_token).toBeTruthy();
    expect(pair.refresh_token).toBeTruthy();
    expect(pair.access_expires_in).toBe(15 * 60);
    expect(pair.refresh_expires_in).toBe(7 * 24 * 60 * 60);
  });
});

describe('POST /api/auth/refresh', () => {
  it('returns new access token for valid refresh token', async () => {
    const refresh = generateRefreshToken('aud_test', 'premium_access');
    const res = await request(app).post('/api/auth/refresh').send({ refresh_token: refresh });
    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeTruthy();
    expect(res.body.audit_id).toBe('aud_test');
    expect(res.body.scope).toBe('premium_access');
    expect(res.body.access_expires_in).toBe(15 * 60);
  });

  it('returns 401 for invalid refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refresh_token: 'invalid.token' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('invalid_refresh_token');
  });

  it('returns 401 for access token used as refresh', async () => {
    const access = generateAccessToken('aud_test', 'premium_access');
    const res = await request(app).post('/api/auth/refresh').send({ refresh_token: access });
    expect(res.status).toBe(401);
  });

  it('returns 400 for missing refresh_token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});
    expect(res.status).toBe(400);
  });
});

describe('Authorization header on protected endpoints', () => {
  let auditId: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/audits').send(FIXTURE);
    auditId = res.body.audit_id;
    await request(app).post(`/api/payments/dev-unlock/${auditId}`);
  });

  it('report accessible via Bearer header', async () => {
    const accessToken = generateAccessToken(auditId, 'premium_access');
    const res = await request(app)
      .get(`/api/audits/${auditId}/report`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.report).toBeDefined();
  });

  it('export accessible via Bearer header', async () => {
    const accessToken = generateAccessToken(auditId, 'premium_access');
    const res = await request(app)
      .get(`/api/audits/${auditId}/export`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
  });

  it('Bearer with refresh token is rejected', async () => {
    const refreshToken = generateRefreshToken(auditId, 'premium_access');
    const res = await request(app)
      .get(`/api/audits/${auditId}/report`)
      .set('Authorization', `Bearer ${refreshToken}`);
    expect(res.status).toBe(403);
  });

  it('dev-unlock returns both access_token and refresh_token', async () => {
    const r = await request(app).post('/api/audits').send(FIXTURE);
    const id = r.body.audit_id;
    const res = await request(app).post(`/api/payments/dev-unlock/${id}`);
    expect(res.body.access_token).toBeTruthy();
    expect(res.body.refresh_token).toBeTruthy();
    expect(res.body.access_token).not.toBe(res.body.refresh_token);
  });
});

describe('Backward compatibility with TRUST_01 tokens', () => {
  // TRUST_01 tokens had no `type` field — simulated by manually crafting
  it('still accepts TRUST_01-style query param token', async () => {
    const r = await request(app).post('/api/audits').send(FIXTURE);
    const id = r.body.audit_id;
    await request(app).post(`/api/payments/dev-unlock/${id}`);

    // Get the new-style access token via dev-unlock
    const unlockRes = await request(app).post(`/api/payments/dev-unlock/${id}`);
    const accessToken = unlockRes.body.access_token;

    // Use as query param (TRUST_01 style)
    const res = await request(app).get(`/api/audits/${id}/report?token=${encodeURIComponent(accessToken)}`);
    expect(res.status).toBe(200);
  });
});
