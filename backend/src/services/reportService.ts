import type { ReportResponse, PremiumLockedResponse, ReportPayload } from '../domain/delivery.js';
import { getAudit, getAuditOutput } from './auditService.js';
import { buildPremiumReport } from './premiumReportBuilder.js';

type ReportResult =
  | { status: 'ok'; data: ReportResponse }
  | { status: 'locked'; data: PremiumLockedResponse }
  | { status: 'not_found' };

export function getReport(auditId: string): ReportResult {
  const audit = getAudit(auditId);
  if (!audit) return { status: 'not_found' };

  if (!audit.paid) {
    return {
      status: 'locked',
      data: {
        error: 'premium_locked',
        message: 'Le rapport complet nécessite un déverrouillage premium.',
        audit_id: auditId,
      },
    };
  }

  const output = getAuditOutput(auditId);
  if (!output) return { status: 'not_found' };

  const report: ReportPayload = JSON.parse(output.report_payload);
  const premium_view = buildPremiumReport(report);

  return {
    status: 'ok',
    data: {
      audit_id: auditId,
      report,
      premium_view,
    },
  };
}
