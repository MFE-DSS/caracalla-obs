import { randomUUID } from 'crypto';
import { getDb } from '../db/client.js';
import { computeEngine } from './engineAdapter.js';
import type { AuditRecord, AuditOutputRecord } from '../domain/audit.js';
import type { CreateAuditInput } from '../validation/auditSchemas.js';
import type { CreateAuditResponse } from '../domain/delivery.js';

export function createAudit(input: CreateAuditInput): CreateAuditResponse {
  const db = getDb();
  const auditId = `aud_${randomUUID().slice(0, 12)}`;
  const outputId = `out_${randomUUID().slice(0, 12)}`;

  // 1. Persist raw audit
  db.prepare(`
    INSERT INTO audits (id, company_name, company_size_band, industry_hint, pain_text, status)
    VALUES (?, ?, ?, ?, ?, 'draft')
  `).run(auditId, input.company_name, input.company_size_band, input.industry_hint, input.pain_text);

  // 2. Run engine
  const engineOutput = computeEngine(input);

  // 3. Build summary/report payloads
  const summaryPayload = JSON.stringify({
    global_score: engineOutput.global_score,
    global_level: engineOutput.global_level,
    confidence: engineOutput.confidence,
    reason_trace: engineOutput.reason_trace,
    frictions: engineOutput.frictions.map((f) => ({
      id: f.friction_id,
      label: f.label,
      severity: f.severity,
      confidence: f.confidence,
    })),
    next_best_action_preview: engineOutput.next_best_action
      ? { title: engineOutput.next_best_action.title, expected_time_to_value: engineOutput.next_best_action.expected_time_to_value }
      : null,
  });

  const reportPayload = JSON.stringify(engineOutput);

  // 4. Persist output
  db.prepare(`
    INSERT INTO audit_outputs (id, audit_id, engine_version, global_score, global_level, confidence, summary_payload, report_payload)
    VALUES (?, ?, 'v2', ?, ?, ?, ?, ?)
  `).run(outputId, auditId, engineOutput.global_score, engineOutput.global_level, engineOutput.confidence, summaryPayload, reportPayload);

  // 5. Update audit status
  db.prepare(`UPDATE audits SET status = 'computed', updated_at = datetime('now') WHERE id = ?`).run(auditId);

  return {
    audit_id: auditId,
    status: 'computed',
    summary: {
      global_score: engineOutput.global_score,
      global_level: engineOutput.global_level,
      confidence: engineOutput.confidence,
      frictions_count: engineOutput.frictions.length,
      top_opportunity_title: engineOutput.opportunities[0]?.title ?? null,
    },
  };
}

export function getAudit(auditId: string): AuditRecord | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM audits WHERE id = ?').get(auditId) as (AuditRecord & { paid: number }) | undefined;
  if (!row) return null;
  return { ...row, paid: !!row.paid };
}

export function getAuditOutput(auditId: string): AuditOutputRecord | null {
  const db = getDb();
  return (db.prepare('SELECT * FROM audit_outputs WHERE audit_id = ? ORDER BY computed_at DESC LIMIT 1').get(auditId) as AuditOutputRecord | undefined) ?? null;
}

export function markAsPaid(auditId: string, accessToken?: string): boolean {
  const db = getDb();
  if (accessToken) {
    const result = db.prepare('UPDATE audits SET paid = 1, access_token = ?, updated_at = datetime(\'now\') WHERE id = ?').run(accessToken, auditId);
    return result.changes > 0;
  }
  const result = db.prepare('UPDATE audits SET paid = 1, updated_at = datetime(\'now\') WHERE id = ?').run(auditId);
  return result.changes > 0;
}
