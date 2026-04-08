export type AuditEventType =
  | 'audit_created'
  | 'audit_computed'
  | 'summary_viewed'
  | 'premium_checkout_started'
  | 'payment_completed'
  | 'premium_unlocked'
  | 'premium_viewed'
  | 'premium_exported'
  | 'share_link_created'
  | 'share_link_opened'
  | 'share_link_revoked'
  | 'email_audit_sent'
  | 'email_payment_sent'
  | 'email_send_failed'
  | 'invalid_token_attempt'
  | 'refresh_performed'
  | 'report_access_denied';

export type ActorMode = 'owner' | 'shared_viewer' | 'system';
export type EventSurface = 'web' | 'email' | 'api' | 'share';

export interface AuditEventRecord {
  id: string;
  audit_id: string;
  event_type: AuditEventType;
  occurred_at: string;
  actor_mode: ActorMode;
  surface: EventSurface;
  payload_json: string | null;
}
