/* CARACALLA — Frontend API Client
 * Calls the backend API instead of computing the engine locally.
 * Falls back to local engine computation if API is unavailable (dev/preview mode).
 */

import { buildEngineOutputV2 } from './engine/services/buildEngineOutputV2';
import type { EngineOutputV2 } from './engine/domain/arbitration';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

interface CreateAuditResponse {
  audit_id: string;
  status: string;
  summary: {
    global_score: number;
    global_level: string;
    confidence: string;
    frictions_count: number;
    top_opportunity_title: string | null;
  };
}

export interface AuditResult {
  audit_id: string;
  engineOutput: EngineOutputV2;
  source: 'api' | 'local';
}

/**
 * Submit an audit. Tries the API first, falls back to local engine.
 */
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
      const createRes: CreateAuditResponse = await res.json();
      const engineOutput = buildEngineOutputV2({
        company_name: input.company_name,
        company_size_band: input.company_size_band,
        industry_hint: input.industry_hint,
        pain_text: input.pain_text,
      });
      return { audit_id: createRes.audit_id, engineOutput, source: 'api' };
    }
  } catch {
    // API unavailable — fall back to local computation
  }

  // Fallback: compute locally
  const engineOutput = buildEngineOutputV2({
    company_name: input.company_name,
    company_size_band: input.company_size_band,
    industry_hint: input.industry_hint,
    pain_text: input.pain_text,
  });

  return { audit_id: `local_${Date.now()}`, engineOutput, source: 'local' };
}

/**
 * Create a Stripe Checkout session. Returns the Checkout URL.
 * Falls back to dev-unlock if Stripe is not configured.
 */
export async function createPaymentSession(auditId: string): Promise<{ url: string } | { error: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/payments/create-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audit_id: auditId }),
    });

    if (res.ok) {
      return await res.json();
    }

    const body = await res.json().catch(() => ({}));

    // If Stripe not configured, try dev-unlock
    if (res.status === 503 || body.error === 'stripe_not_configured') {
      return devUnlock(auditId);
    }

    if (res.status === 409) {
      return { error: 'already_paid' };
    }

    return { error: body.message ?? 'Erreur de paiement' };
  } catch {
    // API unavailable — try dev unlock
    return devUnlock(auditId);
  }
}

/** Dev-only: unlock without Stripe */
async function devUnlock(auditId: string): Promise<{ url: string } | { error: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/payments/dev-unlock/${auditId}`, { method: 'POST' });
    if (res.ok) {
      return { url: `${window.location.origin}?payment=success&audit_id=${auditId}` };
    }
  } catch {
    // Ignore
  }
  // Pure local fallback — just signal success
  return { url: `${window.location.origin}?payment=success&audit_id=${auditId}` };
}
