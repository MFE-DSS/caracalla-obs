import Stripe from 'stripe';
import { getAudit, markAsPaid } from './auditService.js';
import { generateAccessToken, generateRefreshToken } from './accessTokenService.js';
import { sendPaymentSuccessEmail } from './emailService.js';
import { recordEvent } from './eventService.js';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? '';
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
const PRICE_AMOUNT = 4900; // 49.00 EUR in cents

function getStripe(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(STRIPE_SECRET_KEY);
}

export interface CreateCheckoutResult {
  url: string;
}

export function createCheckoutSession(auditId: string): Promise<CreateCheckoutResult> {
  const audit = getAudit(auditId);
  if (!audit) {
    throw new Error('Audit not found');
  }

  if (audit.paid) {
    throw new Error('Audit already paid');
  }

  const stripe = getStripe();

  return stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: PRICE_AMOUNT,
          product_data: {
            name: 'Caracalla — Rapport premium',
            description: `Diagnostic complet et plan d'action pour ${audit.company_name}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      audit_id: auditId,
    },
    success_url: `${FRONTEND_URL}?payment=success&audit_id=${auditId}`,
    cancel_url: `${FRONTEND_URL}?payment=cancelled&audit_id=${auditId}`,
  }).then((session) => {
    if (!session.url) throw new Error('Stripe session URL missing');
    return { url: session.url };
  });
}

export function handleWebhookEvent(payload: Buffer, signature: string): { audit_id: string | null; action: string; access_token?: string; refresh_token?: string } {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  const stripe = getStripe();
  const event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const auditId = session.metadata?.audit_id;

    if (auditId) {
      const audit = getAudit(auditId);
      if (audit && !audit.paid) {
        const accessToken = generateAccessToken(auditId, 'premium_access');
        const refreshToken = generateRefreshToken(auditId, 'premium_access');
        markAsPaid(auditId, refreshToken);
        recordEvent({ audit_id: auditId, event_type: 'payment_completed', surface: 'api', payload: { provider: 'stripe' } });
        recordEvent({ audit_id: auditId, event_type: 'premium_unlocked', surface: 'api' });
        if (audit.email) {
          void sendPaymentSuccessEmail(audit.email, auditId, accessToken);
        }
        return { audit_id: auditId, action: 'unlocked', access_token: accessToken, refresh_token: refreshToken };
      }
      return { audit_id: auditId, action: 'already_paid', refresh_token: audit?.access_token ?? undefined };
    }

    return { audit_id: null, action: 'missing_metadata' };
  }

  return { audit_id: null, action: 'ignored_event' };
}

/** For testing: directly unlock without Stripe */
export function devUnlockPremium(auditId: string): { success: boolean; access_token?: string; refresh_token?: string } {
  const audit = getAudit(auditId);
  if (!audit) return { success: false };
  if (audit.paid) {
    // Issue a fresh access token; refresh token is the stored one (long-lived)
    const accessToken = generateAccessToken(auditId, 'premium_access');
    return { success: true, access_token: accessToken, refresh_token: audit.access_token ?? undefined };
  }
  const accessToken = generateAccessToken(auditId, 'premium_access');
  const refreshToken = generateRefreshToken(auditId, 'premium_access');
  markAsPaid(auditId, refreshToken);
  recordEvent({ audit_id: auditId, event_type: 'payment_completed', surface: 'api', payload: { provider: 'dev_unlock' } });
  recordEvent({ audit_id: auditId, event_type: 'premium_unlocked', surface: 'api' });
  if (audit.email) {
    void sendPaymentSuccessEmail(audit.email, auditId, accessToken);
  }
  return { success: true, access_token: accessToken, refresh_token: refreshToken };
}
