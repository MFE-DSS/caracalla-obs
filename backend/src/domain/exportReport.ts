/* CARACALLA — Export Report Types */

import type { PremiumReportViewModel } from './premiumReport.js';

export interface ExportMeta {
  audit_id: string;
  engine_version: string;
  generated_at: string;
  export_format: 'pdf';
}

export interface ExportReportViewModel {
  meta: ExportMeta;
  report_title: string;
  company_name: string;
  global_score: number;
  global_level: string;
  premium: PremiumReportViewModel;
  footer_note: string;
}
