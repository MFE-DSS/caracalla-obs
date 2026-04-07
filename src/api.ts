/* CARACALLA — Frontend API Client
 * Calls the backend API. Falls back to local engine if API unavailable.
 * Uses Authorization header with auto-refresh on 401/403.
 */

import { buildEngineOutputV2 } from './engine/services/buildEngineOutputV2';
import type { EngineOutputV2 } from './engine/domain/arbitration';
import type { PremiumReportViewModel } from './types/premiumReport';
import { loadSession, saveSession } from './services/session';

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
  refresh_token?: string | null;
  access_token?: string | null;
}

export interface ReportResult {
  audit_id: string;
  report: EngineOutputV2;
  premium_view: PremiumReportViewModel;
}

// ── Auth fetch with auto-refresh ───────────────────────

/**
 * Authenticated fetch with automatic refresh on 401/403.
 * Uses Authorization: Bearer header (preferred) instead of query param.
 */
export async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const session = loadSession();
  let accessToken = session?.access_token ?? null;
  const refreshToken = session?.refresh_token ?? null;

  const buildHeaders = (token: string | null): HeadersInit => {
    const h: Record<string, string> = { ...(init?.headers as Record<string, string> | undefined) };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };

  let res = await fetch(url, { ...init, headers: buildHeaders(accessToken) });

  // If unauthorized and we have a refresh token, try to refresh and retry
  if ((res.status === 401 || res.status === 403) && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken);
    if (refreshed) {
      accessToken = refreshed;
      // Update session with new access token
      if (session) {
        saveSession(session.last_audit_id, session.last_known_paid, session.last_screen, accessToken, refreshToken);
      }
      res = await fetch(url, { ...init, headers: buildHeaders(accessToken) });
    }
  }

  return res;
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (res.ok) {
      const body = await res.json();
      return body.access_token ?? null;
    }
  } catch {
    // ignore
  }
  return null;
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
    const init: RequestInit = {};
    if (accessToken) {
      init.headers = { Authorization: `Bearer ${accessToken}` };
    }
    const res = await authFetch(`${API_BASE}/api/audits/${auditId}/report`, init);
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

async function devUnlock(auditId: string): Promise<{ url: string; access_token?: string; refresh_token?: string } | { error: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/payments/dev-unlock/${auditId}`, { method: 'POST' });
    if (res.ok) {
      const body = await res.json();
      return {
        url: `${window.location.origin}/payment/success?audit_id=${auditId}`,
        access_token: body.access_token,
        refresh_token: body.refresh_token,
      };
    }
  } catch {
    // Ignore
  }
  return { url: `${window.location.origin}/payment/success?audit_id=${auditId}` };
}
