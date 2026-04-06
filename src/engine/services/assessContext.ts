import type { NormalizedAudit, Signal } from '../domain/types';
import type { CompanyContext, MaturityLevel } from '../domain/context';

function hasAny(signals: Signal[], targets: Signal[]): boolean {
  return targets.some((t) => signals.includes(t));
}

function assessToolingMaturity(audit: NormalizedAudit): MaturityLevel {
  const all = [...audit.tool_signals, ...audit.pain_signals, ...audit.process_signals];
  if (hasAny(all, ['erp', 'crm'])) return 'medium';
  if (hasAny(all, ['spreadsheet', 'email']) && !hasAny(all, ['erp', 'crm'])) return 'low';
  return 'medium';
}

function assessFormalization(audit: NormalizedAudit): MaturityLevel {
  const all = [...audit.pain_signals, ...audit.process_signals];
  const informalSignals = ['dependency', 'email', 'followup'].filter((s) => all.includes(s as Signal));
  if (informalSignals.length >= 2) return 'low';
  if (informalSignals.length >= 1) return 'medium';
  return 'high';
}

function assessOrgComplexity(sizeBand: string): MaturityLevel {
  if (sizeBand === '1-5') return 'low';
  if (sizeBand === '6-20') return 'medium';
  return 'high'; // 21-50, 51-250
}

function assessChangeCapacity(sizeBand: string, formalization: MaturityLevel): MaturityLevel {
  if (sizeBand === '1-5') return formalization === 'low' ? 'low' : 'medium';
  if (sizeBand === '6-20') return 'medium';
  return formalization === 'high' ? 'high' : 'medium';
}

function assessDataReadiness(audit: NormalizedAudit): MaturityLevel {
  const all = [...audit.tool_signals, ...audit.pain_signals, ...audit.process_signals];
  const weakSignals = ['spreadsheet', 'duplicate_entry', 'document'].filter((s) => all.includes(s as Signal));
  if (weakSignals.length >= 2) return 'low';
  if (weakSignals.length >= 1) return 'medium';
  return 'high';
}

export function assessContext(audit: NormalizedAudit): CompanyContext {
  const formalization = assessFormalization(audit);

  return {
    company_size_band: audit.company_size_band,
    industry_hint: audit.industry_guess,
    tooling_maturity: assessToolingMaturity(audit),
    process_formalization_level: formalization,
    organization_complexity: assessOrgComplexity(audit.company_size_band),
    change_capacity: assessChangeCapacity(audit.company_size_band, formalization),
    data_readiness: assessDataReadiness(audit),
  };
}
