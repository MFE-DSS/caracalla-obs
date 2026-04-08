import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { createTestDb, closeDb } from '../db/client.js';
import {
  clearSentEmails,
  getSentEmails,
  sendAuditCreatedEmail,
  sendPaymentSuccessEmail,
} from '../services/emailService.js';

const FIXTURE = {
  company_name: 'Test Email Co',
  company_size_band: '6-20',
  industry_hint: 'Services',
  pain_text: 'Trop de ressaisie manuelle dans notre process commercial quotidien.',
  email: 'owner@test-email-co.example',
};

beforeEach(() => {
  createTestDb();
  clearSentEmails();
});

afterAll(() => {
  closeDb();
});

describe('emailService unit', () => {
  it('sendAuditCreatedEmail records a transactional email', async () => {
    await sendAuditCreatedEmail('foo@example.com', 'aud_xyz');
    const sent = getSentEmails();
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe('foo@example.com');
    expect(sent[0].kind).toBe('audit_created');
    expect(sent[0].subject).toContain('Caracalla');
    expect(sent[0].body).toContain('/audit/aud_xyz');
  });

  it('sendPaymentSuccessEmail records premium + export links with token', async () => {
    await sendPaymentSuccessEmail('bar@example.com', 'aud_abc', 'tok_123');
    const sent = getSentEmails();
    expect(sent).toHaveLength(1);
    expect(sent[0].kind).toBe('payment_success');
    expect(sent[0].body).toContain('/premium/aud_abc?token=tok_123');
    expect(sent[0].body).toContain('/export/aud_abc?token=tok_123');
  });

  it('fail-soft: does not throw even if provider rejects', async () => {
    // Without EMAIL_PROVIDER_API_KEY set, deliver() is a no-op that returns false.
    // The call should still resolve and record the email.
    await expect(sendAuditCreatedEmail('x@y.z', 'aud_1')).resolves.toBeUndefined();
  });
});

describe('Audit creation triggers email', () => {
  it('sends audit_created email when email is provided', async () => {
    const res = await request(app).post('/api/audits').send(FIXTURE);
    expect(res.status).toBe(201);
    // Allow the fire-and-forget promise to flush.
    await new Promise((r) => setImmediate(r));
    const sent = getSentEmails();
    const auditEmail = sent.find((e) => e.kind === 'audit_created');
    expect(auditEmail).toBeDefined();
    expect(auditEmail!.to).toBe(FIXTURE.email);
    expect(auditEmail!.body).toContain(res.body.audit_id);
  });

  it('does not send email when no email field is provided', async () => {
    const { email: _omit, ...noEmail } = FIXTURE;
    const res = await request(app).post('/api/audits').send(noEmail);
    expect(res.status).toBe(201);
    await new Promise((r) => setImmediate(r));
    expect(getSentEmails().filter((e) => e.kind === 'audit_created')).toHaveLength(0);
  });
});

describe('Payment success triggers email', () => {
  it('sends payment_success email on dev-unlock when email is stored', async () => {
    const createRes = await request(app).post('/api/audits').send(FIXTURE);
    const auditId = createRes.body.audit_id;
    clearSentEmails();

    const unlockRes = await request(app).post(`/api/payments/dev-unlock/${auditId}`);
    expect(unlockRes.status).toBe(200);
    await new Promise((r) => setImmediate(r));

    const sent = getSentEmails();
    const payEmail = sent.find((e) => e.kind === 'payment_success');
    expect(payEmail).toBeDefined();
    expect(payEmail!.to).toBe(FIXTURE.email);
    expect(payEmail!.body).toContain(`/premium/${auditId}`);
    expect(payEmail!.body).toContain(`/export/${auditId}`);
  });

  it('main flow still succeeds if email address is absent', async () => {
    const { email: _omit, ...noEmail } = FIXTURE;
    const createRes = await request(app).post('/api/audits').send(noEmail);
    const auditId = createRes.body.audit_id;

    const unlockRes = await request(app).post(`/api/payments/dev-unlock/${auditId}`);
    expect(unlockRes.status).toBe(200);
    expect(unlockRes.body.paid).toBe(true);
    await new Promise((r) => setImmediate(r));
    expect(getSentEmails().filter((e) => e.kind === 'payment_success')).toHaveLength(0);
  });
});
