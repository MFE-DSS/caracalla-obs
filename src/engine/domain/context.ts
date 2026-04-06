/* CARACALLA ENGINE V2 — Company Context Types */

export type MaturityLevel = 'low' | 'medium' | 'high';

export interface CompanyContext {
  company_size_band: string;
  industry_hint: string;
  tooling_maturity: MaturityLevel;
  process_formalization_level: MaturityLevel;
  organization_complexity: MaturityLevel;
  change_capacity: MaturityLevel;
  data_readiness: MaturityLevel;
}
