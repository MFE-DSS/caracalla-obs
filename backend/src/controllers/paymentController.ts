import type { Request, Response } from 'express';
import { createCheckoutSession, handleWebhookEvent, devUnlockPremium } from '../services/paymentService.js';
import { getAudit } from '../services/auditService.js';

export async function handleCreateCheckoutSession(req: Request, res: Response): Promise<void> {
  const { audit_id } = req.body;

  if (!audit_id || typeof audit_id !== 'string') {
    res.status(400).json({ error: 'validation_error', message: 'audit_id is required' });
    return;
  }

  try {
    const result = await createCheckoutSession(audit_id);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'Audit not found') {
      res.status(404).json({ error: 'not_found', message: 'Audit non trouvé.' });
    } else if (err.message === 'Audit already paid') {
      res.status(409).json({ error: 'already_paid', message: 'Ce rapport a déjà été débloqué.' });
    } else if (err.message === 'STRIPE_SECRET_KEY is not configured') {
      res.status(503).json({ error: 'stripe_not_configured', message: 'Le système de paiement n\'est pas encore configuré.' });
    } else {
      console.error('Checkout session error:', err);
      res.status(500).json({ error: 'payment_error', message: 'Erreur lors de la création de la session de paiement.' });
    }
  }
}

export function handleWebhook(req: Request, res: Response): void {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    res.status(400).json({ error: 'missing_signature' });
    return;
  }

  try {
    const result = handleWebhookEvent(req.body, signature);
    res.json({ received: true, ...result });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    res.status(400).json({ error: 'webhook_error', message: err.message });
  }
}

/** Dev-only: unlock premium without payment */
export function handleDevUnlock(req: Request, res: Response): void {
  const { id } = req.params;

  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'forbidden', message: 'Dev unlock not available in production.' });
    return;
  }

  const audit = getAudit(id);
  if (!audit) {
    res.status(404).json({ error: 'not_found', message: 'Audit non trouvé.' });
    return;
  }

  const result = devUnlockPremium(id);
  res.json({
    audit_id: id,
    paid: result.success || audit.paid,
    access_token: result.access_token,
    refresh_token: result.refresh_token,
  });
}
