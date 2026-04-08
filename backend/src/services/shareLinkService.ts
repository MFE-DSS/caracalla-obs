/**
 * shareLinkService — ADVANCED_01 Stream A.
 *
 * Persistent share links with scope + expiration + revocation.
 */
import { randomUUID, randomBytes } from 'crypto';
import { getDb } from '../db/client.js';
import type { ShareLinkRecord, ShareLinkScope } from '../domain/shareLink.js';

const DEFAULT_TTL_DAYS = 7;

function mapRow(row: any): ShareLinkRecord {
  return { ...row, is_active: !!row.is_active } as ShareLinkRecord;
}

export interface CreateShareLinkInput {
  audit_id: string;
  scope?: ShareLinkScope;
  ttl_days?: number;
}

export function createShareLink(input: CreateShareLinkInput): ShareLinkRecord {
  const db = getDb();
  const id = `shl_${randomUUID().slice(0, 12)}`;
  const token = `shr_${randomBytes(24).toString('base64url')}`;
  const scope = input.scope ?? 'premium_read';
  const ttlDays = input.ttl_days ?? DEFAULT_TTL_DAYS;
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO shared_access_links (id, audit_id, token, scope, expires_at, created_by_mode, is_active)
    VALUES (?, ?, ?, ?, ?, 'owner', 1)
  `).run(id, input.audit_id, token, scope, expiresAt);

  return mapRow(
    db.prepare('SELECT * FROM shared_access_links WHERE id = ?').get(id),
  );
}

export function getShareLinkByToken(token: string): ShareLinkRecord | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM shared_access_links WHERE token = ?').get(token);
  return row ? mapRow(row) : null;
}

export function listActiveShareLinks(auditId: string): ShareLinkRecord[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM shared_access_links
       WHERE audit_id = ? AND is_active = 1
       ORDER BY created_at DESC`,
    )
    .all(auditId) as any[];
  return rows.map(mapRow);
}

export function revokeShareLink(token: string): boolean {
  const db = getDb();
  const res = db
    .prepare('UPDATE shared_access_links SET is_active = 0 WHERE token = ? AND is_active = 1')
    .run(token);
  return res.changes > 0;
}

export function isShareLinkValid(link: ShareLinkRecord): boolean {
  if (!link.is_active) return false;
  return new Date(link.expires_at).getTime() > Date.now();
}
