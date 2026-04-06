import type { EngineOutputV2 } from '../../../src/engine/domain/arbitration.js';
import type { PremiumReportViewModel } from '../domain/premiumReport.js';
import type { ExportReportViewModel } from '../domain/exportReport.js';

/**
 * Builds the view model for PDF export from existing premium report data.
 */
export function buildExportReport(
  auditId: string,
  engineOutput: EngineOutputV2,
  premiumView: PremiumReportViewModel,
): ExportReportViewModel {
  return {
    meta: {
      audit_id: auditId,
      engine_version: 'v2',
      generated_at: new Date().toISOString(),
      export_format: 'pdf',
    },
    report_title: 'Dossier premium de décision',
    company_name: engineOutput.company_name,
    global_score: engineOutput.global_score,
    global_level: engineOutput.global_level,
    premium: premiumView,
    footer_note: 'Ce document a été généré par Caracalla. Les résultats sont basés sur les réponses fournies lors de l\'audit et sont indicatifs.',
  };
}
