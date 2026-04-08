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
