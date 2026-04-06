/* CARACALLA — Frontend API Client
 * Calls the backend API. Falls back to local engine if API unavailable.
 */

import { buildEngineOutputV2 } from './engine/services/buildEngineOutputV2';
import type { EngineOutputV2 } from './engine/domain/arbitration';
import type { PremiumReportViewModel } from './types/premiumReport';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// ── Types ──────────────────────────────────────────────

export interface AuditResult {
  audit_id: string;
  engineOutput: EngineOutputV2;
  source: 'api' | 'local';
}

export interface AuditStatus {
  audit_id: string;
  status: string;
  paid: boolean;
  company_name: string;
  summary_available: boolean;
  report_available: boolean;
  access_token?: string | null;
}

export interface ReportResult {
  audit_id: string;
  report: EngineOutputV2;
  premium_view: PremiumReportViewModel;
}

// ── Submit Audit ───────────────────────────────────────

export async function submitAudit(data: {
  company: string;
  sector: string;
  size: string;
  pain: string;
}): Promise<AuditResult> {
  const input = {
    company_name: data.company,
    company_size_band: data.size,
    industry_hint: data.sector,
    pain_text: data.pain,
  };

  try {
    const res = await fetch(`${API_BASE}/api/audits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (res.ok) {
      const createRes = await res.json();
      const engineOutput = buildEngineOutputV2({
        company_name: input.company_name,
        company_size_band: input.company_size_band,
        industry_hint: input.industry_hint,
        pain_text: input.pain_text,
      });
      return { audit_id: createRes.audit_id, engineOutput, source: 'api' };
    }
  } catch {
    // API unavailable
  }

  const engineOutput = buildEngineOutputV2({
    company_name: input.company_name,
    company_size_band: input.company_size_band,
    industry_hint: input.industry_hint,
    pain_text: input.pain_text,
  });
  return { audit_id: `local_${Date.now()}`, engineOutput, source: 'local' };
}

// ── Audit Status ───────────────────────────────────────

export async function getAuditStatus(auditId: string): Promise<AuditStatus | null> {
  try {
    const res = await fetch(`${API_BASE}/api/audits/${auditId}`);
    if (res.ok) return await res.json();
  } catch {
    // API unavailable
  }
  return null;
}

// ── Report ─────────────────────────────────────────────

export async function getAuditReport(auditId: string, accessToken?: string | null): Promise<ReportResult | { locked: true } | null> {
  try {
    const url = accessToken
      ? `${API_BASE}/api/audits/${auditId}/report?token=${encodeURIComponent(accessToken)}`
      : `${API_BASE}/api/audits/${auditId}/report`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
    if (res.status === 402) return { locked: true };
    if (res.status === 404) return null;
  } catch {
    // API unavailable
  }
  return null;
}

// ── Payment ────────────────────────────────────────────

export async function createPaymentSession(auditId: string): Promise<{ url: string } | { error: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/payments/create-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audit_id: auditId }),
    });

    if (res.ok) return await res.json();

    const body = await res.json().catch(() => ({}));

    if (res.status === 503 || body.error === 'stripe_not_configured') {
      return devUnlock(auditId);
    }
    if (res.status === 409) return { error: 'already_paid' };

    return { error: body.message ?? 'Erreur de paiement' };
  } catch {
    return devUnlock(auditId);
  }
}

async function devUnlock(auditId: string): Promise<{ url: string; access_token?: string } | { error: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/payments/dev-unlock/${auditId}`, { method: 'POST' });
    if (res.ok) {
      const body = await res.json();
      return {
        url: `${window.location.origin}/payment/success?audit_id=${auditId}`,
        access_token: body.access_token,
      };
    }
  } catch {
    // Ignore
  }
  return { url: `${window.location.origin}/payment/success?audit_id=${auditId}` };
}
