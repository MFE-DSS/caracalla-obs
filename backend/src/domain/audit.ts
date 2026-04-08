export interface AuditRecord {
  id: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  company_size_band: string;
  industry_hint: string;
  pain_text: string;
  status: 'draft' | 'computed' | 'error';
  paid: boolean;
  access_token: string | null;
  email: string | null;
}

export interface AuditOutputRecord {
  id: string;
  audit_id: string;
  engine_version: string;
  global_score: number;
  global_level: string;
  confidence: string;
  summary_payload: string;
  report_payload: string;
  computed_at: string;
}
