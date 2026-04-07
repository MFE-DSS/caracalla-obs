import { createHmac, timingSafeEqual } from 'crypto';

const TOKEN_SECRET = process.env.TOKEN_SECRET ?? 'caracalla-dev-secret-change-in-production';

const ACCESS_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type AccessScope = 'summary_access' | 'premium_access' | 'export_access';
export type TokenType = 'access' | 'refresh';

interface TokenPayload {
  audit_id: string;
  scope: AccessScope;
  type: TokenType;
  issued_at: number;
  expires_at: number;
}

function sign(payload: string): string {
  return createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
}

function buildToken(auditId: string, scope: AccessScope, type: TokenType, expiryMs: number): string {
  const payload: TokenPayload = {
    audit_id: auditId,
    scope,
    type,
    issued_at: Date.now(),
    expires_at: Date.now() + expiryMs,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

/** Short-lived (15 min) access token used in Authorization header */
export function generateAccessToken(auditId: string, scope: AccessScope): string {
  return buildToken(auditId, scope, 'access', ACCESS_TOKEN_EXPIRY_MS);
}

/** Long-lived (7d) refresh token used to obtain new access tokens */
export function generateRefreshToken(auditId: string, scope: AccessScope): string {
  return buildToken(auditId, scope, 'refresh', REFRESH_TOKEN_EXPIRY_MS);
}

interface VerifyOptions {
  expectedScope: AccessScope;
  expectedType: TokenType;
  expectedAuditId?: string;
}

function verifyToken(token: string, opts: VerifyOptions): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, providedSig] = parts;

  const expectedSig = sign(payloadB64);
  const sigBuffer = Buffer.from(providedSig, 'hex');
  const expectedBuffer = Buffer.from(expectedSig, 'hex');

  if (sigBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null;

  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
  } catch {
    return null;
  }

  if (Date.now() > payload.expires_at) return null;
  if (payload.scope !== opts.expectedScope) return null;

  // Backward-compat: TRUST_01 tokens have no `type` field — treat them as access tokens
  const tokenType = payload.type ?? 'access';
  if (tokenType !== opts.expectedType) return null;

  if (opts.expectedAuditId && payload.audit_id !== opts.expectedAuditId) return null;

  return payload;
}

/**
 * Verify an access token. Backward compatible with TRUST_01 tokens (no `type` field).
 */
export function verifyAccessToken(token: string, expectedScope: AccessScope, expectedAuditId?: string): TokenPayload | null {
  return verifyToken(token, { expectedScope, expectedType: 'access', expectedAuditId });
}

/** Verify a refresh token. */
export function verifyRefreshToken(token: string, expectedScope: AccessScope, expectedAuditId?: string): TokenPayload | null {
  return verifyToken(token, { expectedScope, expectedType: 'refresh', expectedAuditId });
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  access_expires_in: number;
  refresh_expires_in: number;
}

/** Generate both access and refresh tokens for a given audit and scope. */
export function generateTokenPair(auditId: string, scope: AccessScope): TokenPair {
  return {
    access_token: generateAccessToken(auditId, scope),
    refresh_token: generateRefreshToken(auditId, scope),
    access_expires_in: ACCESS_TOKEN_EXPIRY_MS / 1000,
    refresh_expires_in: REFRESH_TOKEN_EXPIRY_MS / 1000,
  };
}
