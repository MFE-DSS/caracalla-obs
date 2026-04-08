/**
 * Transactional email service — Sprint EMAIL_DELIVERY_01.
 *
 * Backend only. Fail-soft: any error is logged and swallowed so it never
 * breaks the main flow (audit creation or payment unlock).
 *
 * Provider: Resend-compatible HTTPS API (no new dependency — uses fetch).
 * If EMAIL_PROVIDER_API_KEY is unset, emails are not sent over the wire,
 * but are still recorded in an in-memory log for tests/debug.
 */

import { recordEvent } from './eventService.js';

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'Caracalla <noreply@caracalla.app>';
const EMAIL_PROVIDER_API_KEY = process.env.EMAIL_PROVIDER_API_KEY ?? '';
const EMAIL_PROVIDER_URL = process.env.EMAIL_PROVIDER_URL ?? 'https://api.resend.com/emails';

export interface SentEmail {
  to: string;
  subject: string;
  body: string;
  kind: 'audit_created' | 'payment_success';
  sent_at: string;
  delivered: boolean;
}

const sentEmails: SentEmail[] = [];

/** Test helper: list recorded emails. */
export function getSentEmails(): SentEmail[] {
  return [...sentEmails];
}

/** Test helper: clear recorded emails. */
export function clearSentEmails(): void {
  sentEmails.length = 0;
}

async function deliver(payload: { to: string; subject: string; text: string }): Promise<boolean> {
  if (!EMAIL_PROVIDER_API_KEY) return false;
  try {
    const res = await fetch(EMAIL_PROVIDER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${EMAIL_PROVIDER_API_KEY}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
      }),
    });
    if (!res.ok) {
      console.warn('[emailService] provider returned non-OK status', res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[emailService] delivery failed:', (err as Error).message);
    return false;
  }
}

function record(email: SentEmail): void {
  sentEmails.push(email);
  if (sentEmails.length > 200) sentEmails.shift();
}

export async function sendAuditCreatedEmail(email: string, auditId: string): Promise<void> {
  try {
    const subject = 'Votre diagnostic Caracalla est prêt';
    const link = `${FRONTEND_URL}/audit/${auditId}`;
    const body = [
      'Bonjour,',
      '',
      'Votre diagnostic Caracalla vient d’être généré.',
      '',
      `Consultez votre synthèse ici : ${link}`,
      '',
      'Vous y trouverez vos principaux points de friction et un aperçu des opportunités identifiées.',
      '',
      '— L’équipe Caracalla',
    ].join('\n');

    const delivered = await deliver({ to: email, subject, text: body });
    record({ to: email, subject, body, kind: 'audit_created', sent_at: new Date().toISOString(), delivered });
    recordEvent({
      audit_id: auditId,
      event_type: delivered || !EMAIL_PROVIDER_API_KEY ? 'email_audit_sent' : 'email_send_failed',
      surface: 'email',
      payload: { to: email, delivered },
    });
  } catch (err) {
    console.warn('[emailService] sendAuditCreatedEmail error:', (err as Error).message);
    recordEvent({ audit_id: auditId, event_type: 'email_send_failed', surface: 'email', payload: { kind: 'audit_created' } });
  }
}

export async function sendPaymentSuccessEmail(
  email: string,
  auditId: string,
  accessToken: string,
): Promise<void> {
  try {
    const subject = 'Votre rapport Caracalla complet est disponible';
    const premiumLink = `${FRONTEND_URL}/premium/${auditId}?token=${encodeURIComponent(accessToken)}`;
    const exportLink = `${FRONTEND_URL}/export/${auditId}?token=${encodeURIComponent(accessToken)}`;
    const body = [
      'Bonjour,',
      '',
      'Merci pour votre confiance. Votre rapport Caracalla complet est maintenant accessible.',
      '',
      `Rapport premium : ${premiumLink}`,
      `Export PDF : ${exportLink}`,
      '',
      'Vous y retrouverez le diagnostic détaillé, le plan d’action et les prochaines étapes concrètes pour votre entreprise.',
      '',
      '— L’équipe Caracalla',
    ].join('\n');

    const delivered = await deliver({ to: email, subject, text: body });
    record({ to: email, subject, body, kind: 'payment_success', sent_at: new Date().toISOString(), delivered });
    recordEvent({
      audit_id: auditId,
      event_type: delivered || !EMAIL_PROVIDER_API_KEY ? 'email_payment_sent' : 'email_send_failed',
      surface: 'email',
      payload: { to: email, delivered },
    });
  } catch (err) {
    console.warn('[emailService] sendPaymentSuccessEmail error:', (err as Error).message);
    recordEvent({ audit_id: auditId, event_type: 'email_send_failed', surface: 'email', payload: { kind: 'payment_success' } });
  }
}
