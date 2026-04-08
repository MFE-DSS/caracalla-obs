/**
 * eventService — ADVANCED_01 Stream B.
 *
 * Minimal, centralized event store. Fail-soft: recording never throws to the
 * caller (so instrumentation can never break the main flow).
 */
import { randomUUID } from 'crypto';
import { getDb } from '../db/client.js';
import type {
  ActorMode,
  AuditEventRecord,
  AuditEventType,
  EventSurface,
} from '../domain/auditEvent.js';

export interface RecordEventInput {
  audit_id: string;
  event_type: AuditEventType;
  actor_mode?: ActorMode;
  surface?: EventSurface;
  payload?: Record<string, unknown>;
}

export function recordEvent(input: RecordEventInput): void {
  try {
    const db = getDb();
    const id = `evt_${randomUUID().slice(0, 12)}`;
    db.prepare(`
      INSERT INTO audit_events (id, audit_id, event_type, actor_mode, surface, payload_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      input.audit_id,
      input.event_type,
      input.actor_mode ?? 'system',
      input.surface ?? 'api',
      input.payload ? JSON.stringify(input.payload) : null,
    );
  } catch (err) {
    console.warn('[eventService] recordEvent failed:', (err as Error).message);
  }
}

export function listEvents(auditId: string): AuditEventRecord[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM audit_events WHERE audit_id = ? ORDER BY occurred_at ASC, id ASC')
    .all(auditId) as AuditEventRecord[];
}

export function countEvents(auditId: string, types: AuditEventType[]): number {
  if (types.length === 0) return 0;
  const placeholders = types.map(() => '?').join(',');
  const db = getDb();
  const row = db
    .prepare(
      `SELECT COUNT(*) as c FROM audit_events WHERE audit_id = ? AND event_type IN (${placeholders})`,
    )
    .get(auditId, ...types) as { c: number };
  return row.c;
}
