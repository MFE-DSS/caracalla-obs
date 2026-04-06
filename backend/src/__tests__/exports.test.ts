import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { createTestDb, closeDb, getDb } from '../db/client.js';
import { buildExportReport } from '../services/exportReportBuilder.js';
import { buildPremiumReport } from '../services/premiumReportBuilder.js';
import { buildEngineOutputV2 } from '../../../src/engine/services/buildEngineOutputV2.js';
import { FIXTURE_A, FIXTURE_B, FIXTURE_C, FIXTURE_D } from '../../../src/engine/fixtures/mockAudits.fixture.js';

let paidAuditId: string;
let unpaidAuditId: string;

beforeAll(async () => {
  createTestDb();

  const res1 = await request(app).post('/api/audits').send({
    company_name: 'Menuiserie Dupont',
    company_size_band: '21-50',
    industry_hint: 'BTP / Construction',
    pain_text: 'Je perds du temps sur des tâches répétitives. On reçoit les demandes de devis par email, on les ressaisit dans Excel.',
  });
  paidAuditId = res1.body.audit_id;
  // Mark as paid
  const db = getDb();
  db.prepare('UPDATE audits SET paid = 1 WHERE id = ?').run(paidAuditId);

  const res2 = await request(app).post('/api/audits').send({
    company_name: 'Transports Martin',
    company_size_band: '6-20',
    industry_hint: 'Transport / Logistique',
    pain_text: 'Je n\'ai pas de visibilité sur mon activité. Chaque mois, je reconstruis mon tableau de bord dans Excel.',
  });
  unpaidAuditId = res2.body.audit_id;
});

afterAll(() => {
  closeDb();
});

describe('GET /api/audits/:id/export', () => {
  it('returns 402 if not paid', async () => {
    const res = await request(app).get(`/api/audits/${unpaidAuditId}/export`);
    expect(res.status).toBe(402);
    expect(res.body.error).toBe('premium_locked');
  });

  it('returns 404 for unknown audit', async () => {
    const res = await request(app).get('/api/audits/aud_nonexistent/export');
    expect(res.status).toBe(404);
  });

  it('returns 200 with PDF if paid', async () => {
    const res = await request(app).get(`/api/audits/${paidAuditId}/export`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('caracalla-report-');
    expect(res.body).toBeDefined();
    // PDF starts with %PDF
    expect(Buffer.from(res.body).toString('ascii', 0, 5)).toBe('%PDF-');
  });

  it('PDF has non-trivial size', async () => {
    const res = await request(app).get(`/api/audits/${paidAuditId}/export`).buffer(true);
    // A proper report should be at least 5KB
    expect(res.body.length).toBeGreaterThan(5000);
  });
});

describe('exportReportBuilder', () => {
  it('produces a valid export view model', () => {
    const output = buildEngineOutputV2(FIXTURE_A);
    const premium = buildPremiumReport(output);
    const exportVM = buildExportReport('aud_test', output, premium);

    expect(exportVM.meta.audit_id).toBe('aud_test');
    expect(exportVM.meta.export_format).toBe('pdf');
    expect(exportVM.company_name).toBe('Menuiserie Dupont');
    expect(exportVM.report_title).toBeTruthy();
    expect(exportVM.premium.executive_verdict.headline).toBeTruthy();
    expect(exportVM.premium.priority_board.length).toBeGreaterThan(0);
    expect(exportVM.footer_note).toBeTruthy();
  });

  it('produces different exports for different fixtures', () => {
    const exports = [FIXTURE_A, FIXTURE_B, FIXTURE_C, FIXTURE_D].map((f) => {
      const o = buildEngineOutputV2(f);
      return buildExportReport('test', o, buildPremiumReport(o));
    });
    const companies = new Set(exports.map((e) => e.company_name));
    expect(companies.size).toBe(4);
  });
});
