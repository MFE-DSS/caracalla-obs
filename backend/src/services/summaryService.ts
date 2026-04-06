import type { SummaryResponse, SummaryPayload } from '../domain/delivery.js';
import { getAudit, getAuditOutput } from './auditService.js';

export function getSummary(auditId: string): SummaryResponse | null {
  const audit = getAudit(auditId);
  if (!audit) return null;

  const output = getAuditOutput(auditId);
  if (!output) return null;

  const summary: SummaryPayload = JSON.parse(output.summary_payload);

  return {
    audit_id: auditId,
    summary,
    premium_locked: !audit.paid,
  };
}
