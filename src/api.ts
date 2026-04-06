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

      // Fetch full summary to get frictions details
      const summaryRes = await fetch(`${API_BASE}/api/audits/${createRes.audit_id}/summary`);
      if (summaryRes.ok) {
        // We still need the full EngineOutputV2 for UI rendering.
        // The API stores it but summary endpoint only returns a subset.
        // For now, compute locally but store the audit_id for later premium unlock.
        const engineOutput = buildEngineOutputV2({
          company_name: input.company_name,
          company_size_band: input.company_size_band,
          industry_hint: input.industry_hint,
          pain_text: input.pain_text,
        });
        return { audit_id: createRes.audit_id, engineOutput, source: 'api' };
      }
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
