/**
 * timelineService — ADVANCED_01 Stream C.
 *
 * Aggregates audit_events into a consumer-friendly timeline and basic metrics.
 */
import { listEvents, countEvents } from './eventService.js';
import type { AuditEventRecord } from '../domain/auditEvent.js';

export interface TimelineItem {
  id: string;
  event_type: AuditEventRecord['event_type'];
  label: string;
  occurred_at: string;
  surface: AuditEventRecord['surface'];
  actor_mode: AuditEventRecord['actor_mode'];
  payload: Record<string, unknown> | null;
}

const LABELS: Record<AuditEventRecord['event_type'], string> = {
  audit_created: 'Audit créé',
  audit_computed: 'Diagnostic calculé',
  summary_viewed: 'Synthèse ouverte',
  premium_checkout_started: 'Checkout premium démarré',
  payment_completed: 'Paiement confirmé',
  premium_unlocked: 'Premium débloqué',
  premium_viewed: 'Rapport premium ouvert',
  premium_exported: 'Export PDF généré',
  share_link_created: 'Lien de partage créé',
  share_link_opened: 'Lien de partage ouvert',
  share_link_revoked: 'Lien de partage révoqué',
  email_audit_sent: 'Email audit envoyé',
  email_payment_sent: 'Email paiement envoyé',
  email_send_failed: 'Échec envoi email',
  invalid_token_attempt: 'Tentative avec token invalide',
  refresh_performed: 'Session rafraîchie',
  report_access_denied: 'Accès rapport refusé',
};

export function getTimeline(auditId: string): TimelineItem[] {
  const events = listEvents(auditId);
  return events.map((e) => ({
    id: e.id,
    event_type: e.event_type,
    label: LABELS[e.event_type] ?? e.event_type,
    occurred_at: e.occurred_at,
    surface: e.surface,
    actor_mode: e.actor_mode,
    payload: e.payload_json ? safeParse(e.payload_json) : null,
  }));
}

function safeParse(s: string): Record<string, unknown> | null {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

export interface AuditMetrics {
  emails_sent: number;
  premium_opens: number;
  exports: number;
  shares_created: number;
  shares_opened: number;
}

export function getMetrics(auditId: string): AuditMetrics {
  return {
    emails_sent: countEvents(auditId, ['email_audit_sent', 'email_payment_sent']),
    premium_opens: countEvents(auditId, ['premium_viewed']),
    exports: countEvents(auditId, ['premium_exported']),
    shares_created: countEvents(auditId, ['share_link_created']),
    shares_opened: countEvents(auditId, ['share_link_opened']),
  };
}
