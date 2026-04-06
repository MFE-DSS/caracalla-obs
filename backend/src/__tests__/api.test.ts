import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { createTestDb, closeDb, getDb } from '../db/client.js';

const FIXTURE_A = {
  company_name: 'Menuiserie Dupont',
  company_size_band: '21-50',
  industry_hint: 'BTP / Construction',
  pain_text: 'Je perds du temps sur des tâches répétitives. On reçoit les demandes de devis par email, on les ressaisit dans Excel, puis on refait la saisie dans EBP pour la facturation.',
};

const FIXTURE_B = {
  company_name: 'Transports Martin',
  company_size_band: '6-20',
  industry_hint: 'Transport / Logistique',
  pain_text: 'Je n\'ai pas de visibilité sur mon activité. Chaque mois, je reconstruis mon tableau de bord dans Excel.',
};

beforeAll(() => {
  createTestDb();
});

afterAll(() => {
  closeDb();
});

describe('POST /api/audits', () => {
  it('creates an audit and returns 201 with summary', async () => {
    const res = await request(app).post('/api/audits').send(FIXTURE_A);

    expect(res.status).toBe(201);
    expect(res.body.audit_id).toBeTruthy();
    expect(res.body.status).toBe('computed');
    expect(res.body.summary.global_score).toBeGreaterThanOrEqual(10);
    expect(res.body.summary.global_level).toBeTruthy();
    expect(res.body.summary.confidence).toBeTruthy();
    expect(res.body.summary.frictions_count).toBeGreaterThan(0);
  });

  it('returns 400 for missing company_name', async () => {
    const res = await request(app).post('/api/audits').send({
      company_size_band: '6-20',
      industry_hint: 'BTP',
      pain_text: 'Test douleur',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('validation_error');
  });

  it('returns 400 for invalid company_size_band', async () => {
    const res = await request(app).post('/api/audits').send({
      company_name: 'Test',
      company_size_band: 'invalid',
      industry_hint: 'BTP',
      pain_text: 'Test douleur minimum',
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 for pain_text too short', async () => {
    const res = await request(app).post('/api/audits').send({
      company_name: 'Test',
      company_size_band: '6-20',
      industry_hint: 'BTP',
      pain_text: 'x',
    });

    expect(res.status).toBe(400);
  });

  it('different inputs produce different summaries', async () => {
    const resA = await request(app).post('/api/audits').send(FIXTURE_A);
    const resB = await request(app).post('/api/audits').send(FIXTURE_B);

    expect(resA.body.audit_id).not.toBe(resB.body.audit_id);
    // Different inputs produce distinct audits — scores or frictions may differ
    expect(resA.body.summary.frictions_count).not.toBe(resB.body.summary.frictions_count);
  });
});

describe('GET /api/audits/:id/summary', () => {
  let auditId: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/audits').send(FIXTURE_A);
    auditId = res.body.audit_id;
  });

  it('returns 200 with summary', async () => {
    const res = await request(app).get(`/api/audits/${auditId}/summary`);

    expect(res.status).toBe(200);
    expect(res.body.audit_id).toBe(auditId);
    expect(res.body.summary.global_score).toBeGreaterThanOrEqual(10);
    expect(res.body.summary.reason_trace.length).toBeGreaterThan(0);
    expect(res.body.summary.frictions.length).toBeGreaterThan(0);
    expect(res.body.premium_locked).toBe(true);
  });

  it('summary includes next_best_action_preview', async () => {
    const res = await request(app).get(`/api/audits/${auditId}/summary`);

    expect(res.body.summary.next_best_action_preview).toBeTruthy();
    expect(res.body.summary.next_best_action_preview.title.length).toBeGreaterThan(5);
    expect(res.body.summary.next_best_action_preview.expected_time_to_value).toBeTruthy();
  });

  it('returns 404 for unknown audit', async () => {
    const res = await request(app).get('/api/audits/aud_nonexistent/summary');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/audits/:id/report', () => {
  let auditId: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/audits').send(FIXTURE_A);
    auditId = res.body.audit_id;
  });

  it('returns 402 when not paid', async () => {
    const res = await request(app).get(`/api/audits/${auditId}/report`);

    expect(res.status).toBe(402);
    expect(res.body.error).toBe('premium_locked');
    expect(res.body.message).toBeTruthy();
    expect(res.body.audit_id).toBe(auditId);
  });

  it('returns 200 with full report when paid', async () => {
    // Simulate payment
    const db = getDb();
    db.prepare('UPDATE audits SET paid = 1 WHERE id = ?').run(auditId);

    const res = await request(app).get(`/api/audits/${auditId}/report`);

    expect(res.status).toBe(200);
    expect(res.body.audit_id).toBe(auditId);
    expect(res.body.report).toBeDefined();
    expect(res.body.report.global_score).toBeGreaterThanOrEqual(10);
    expect(res.body.report.frictions.length).toBeGreaterThan(0);
    expect(res.body.report.opportunities.length).toBeGreaterThan(0);
    expect(res.body.report.next_best_action).toBeDefined();
    expect(res.body.report.execution_plan.length).toBeGreaterThan(0);
    expect(res.body.report.why_this_first.length).toBeGreaterThan(0);
    expect(res.body.report.arbitration_trace.length).toBeGreaterThan(0);
    expect(res.body.report.constraints.length).toBeGreaterThan(0);
    expect(res.body.report.context).toBeDefined();
  });

  it('returns 404 for unknown audit', async () => {
    const res = await request(app).get('/api/audits/aud_nonexistent/report');
    expect(res.status).toBe(404);
  });
});

describe('Integration: 4 fixtures produce distinct results', () => {
  const fixtures = [
    FIXTURE_A,
    FIXTURE_B,
    {
      company_name: 'Cabinet Lefèvre',
      company_size_band: '1-5' as const,
      industry_hint: 'Services aux entreprises',
      pain_text: 'Mes outils ne sont pas connectés entre eux. Les dossiers clients sont répartis entre les emails, le serveur, des clés USB et du papier.',
    },
    {
      company_name: 'Négoce Durand',
      company_size_band: '21-50' as const,
      industry_hint: 'Commerce / Négoce',
      pain_text: 'Mes équipes dépendent trop de quelques personnes. Les validations de commandes passent par email sans traçabilité.',
    },
  ];

  it('all 4 fixtures create successfully', async () => {
    for (const fixture of fixtures) {
      const res = await request(app).post('/api/audits').send(fixture);
      expect(res.status).toBe(201);
      expect(res.body.summary.frictions_count).toBeGreaterThan(0);
    }
  });

  it('produce distinct top opportunities', async () => {
    const titles: string[] = [];
    for (const fixture of fixtures) {
      const res = await request(app).post('/api/audits').send(fixture);
      titles.push(res.body.summary.top_opportunity_title);
    }
    const unique = new Set(titles);
    expect(unique.size).toBeGreaterThanOrEqual(3);
  });
});
