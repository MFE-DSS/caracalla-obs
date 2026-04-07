import type { Request, Response } from 'express';
import { generateAccessToken, verifyRefreshToken } from '../services/accessTokenService.js';

export function handleRefresh(req: Request, res: Response): void {
  const { refresh_token } = req.body;

  if (!refresh_token || typeof refresh_token !== 'string') {
    res.status(400).json({ error: 'validation_error', message: 'refresh_token is required' });
    return;
  }

  // Try to verify against known scopes (premium_access is the only one issued today)
  const payload = verifyRefreshToken(refresh_token, 'premium_access');
  if (!payload) {
    res.status(401).json({ error: 'invalid_refresh_token', message: 'Lien invalide ou expiré.' });
    return;
  }

  const accessToken = generateAccessToken(payload.audit_id, payload.scope);
  res.json({
    access_token: accessToken,
    audit_id: payload.audit_id,
    scope: payload.scope,
    access_expires_in: 15 * 60,
  });
}
