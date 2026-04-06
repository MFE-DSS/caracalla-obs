/* CARACALLA — Analytics Module
 * Aligned with CARACALLA_EVENT_INSTRUMENTATION_V1.md
 * Currently logs to console; swap adapter for Plausible/PostHog in production.
 */

type EventName =
  | 'landing_viewed'
  | 'landing_cta_clicked'
  | 'landing_section_viewed'
  | 'audit_started'
  | 'audit_step_completed'
  | 'audit_submitted'
  | 'summary_viewed'
  | 'summary_friction_expanded'
  | 'score_viewed'
  | 'report_evidence_viewed'
  | 'paywall_viewed'
  | 'paywall_cta_clicked'
  | 'consulting_cta_clicked'
  | 'flow_completed';

interface AnalyticsContext {
  session_id: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < 640) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
  }
  return sessionId;
}

function getContext(): AnalyticsContext {
  return {
    session_id: getSessionId(),
    device_type: getDeviceType(),
  };
}

const firedOnce = new Set<string>();

export function track(event: EventName, payload?: Record<string, unknown>): void {
  const data = { event, ...getContext(), ...payload, timestamp: new Date().toISOString() };
  // Console adapter (dev); replace with Plausible/PostHog in production
  console.log('[analytics]', data);
}

/** Fire an event only once per key (e.g., scroll depth thresholds). */
export function trackOnce(key: string, event: EventName, payload?: Record<string, unknown>): void {
  if (firedOnce.has(key)) return;
  firedOnce.add(key);
  track(event, payload);
}
