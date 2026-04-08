/**
 * shareApi — SHARE_MODE_01 frontend client.
 * Calls the backend share endpoints. Pure fetch, no auth required for V1
 * (the audit_id + owner session already gate the premium route).
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export interface ShareLink {
  id: string;
  audit_id?: string;
  token: string;
  scope: 'premium_read' | 'premium_read_export';
  created_at: string;
  expires_at: string;
  is_active: boolean;
  share_url: string;
}

export interface CreateShareLinkOptions {
  scope?: 'premium_read' | 'premium_read_export';
  ttl_days?: number;
}

export async function createShareLink(
  auditId: string,
  options: CreateShareLinkOptions = {},
): Promise<ShareLink> {
  const res = await fetch(`${API_BASE}/api/audits/${auditId}/share-links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  if (!res.ok) {
    throw new Error(`Impossible de créer le lien de partage (${res.status})`);
  }
  return res.json();
}

export async function listShareLinks(auditId: string): Promise<ShareLink[]> {
  const res = await fetch(`${API_BASE}/api/audits/${auditId}/share-links`);
  if (!res.ok) throw new Error(`Impossible de charger les liens (${res.status})`);
  const data = await res.json();
  return data.links ?? [];
}

export async function revokeShareLink(token: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/share/${token}/revoke`, { method: 'POST' });
  if (!res.ok) return false;
  const data = await res.json();
  return !!data.revoked;
}

export async function getSharedReport(token: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/share/${token}`);
  if (!res.ok) throw new Error(`Lien invalide (${res.status})`);
  return res.json();
}

// ── Typed fetcher for the shared report page ──────────

import type { EngineOutputV2 } from '../engine/domain/arbitration';
import type { PremiumReportViewModel } from '../types/premiumReport';

export interface SharedReportPayload {
  audit_id: string;
  report: EngineOutputV2;
  premium_view: PremiumReportViewModel;
  shared: true;
  scope: 'premium_read' | 'premium_read_export';
  expires_at: string;
}

export type SharedReportResult =
  | { status: 'ok'; data: SharedReportPayload }
  | { status: 'not_found' }
  | { status: 'expired' }
  | { status: 'error' };

/**
 * Typed variant of getSharedReport for the shared report page.
 * Maps HTTP status codes to explicit states so the UI can react without try/catch.
 */
export async function fetchSharedReport(token: string): Promise<SharedReportResult> {
  try {
    const res = await fetch(`${API_BASE}/api/share/${token}`);
    if (res.ok) {
      const data = (await res.json()) as SharedReportPayload;
      return { status: 'ok', data };
    }
    if (res.status === 404) return { status: 'not_found' };
    if (res.status === 403) return { status: 'expired' };
    return { status: 'error' };
  } catch {
    return { status: 'error' };
  }
}
