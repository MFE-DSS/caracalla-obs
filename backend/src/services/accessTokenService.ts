import { createHmac, timingSafeEqual } from 'crypto';

const TOKEN_SECRET = process.env.TOKEN_SECRET ?? 'caracalla-dev-secret-change-in-production';
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type AccessScope = 'summary_access' | 'premium_access' | 'export_access';

interface TokenPayload {
  audit_id: string;
  scope: AccessScope;
  issued_at: number;
  expires_at: number;
}

function sign(payload: string): string {
  return createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
}

/**
 * Generate a signed access token for a given audit and scope.
 */
export function generateAccessToken(auditId: string, scope: AccessScope): string {
  const payload: TokenPayload = {
    audit_id: auditId,
    scope,
    issued_at: Date.now(),
    expires_at: Date.now() + TOKEN_EXPIRY_MS,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = sign(payloadB64);

  return `${payloadB64}.${signature}`;
}

/**
 * Verify a signed access token. Returns the payload if valid, null otherwise.
 */
export function verifyAccessToken(token: string, expectedScope: AccessScope, expectedAuditId?: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, providedSig] = parts;

  // Verify signature
  const expectedSig = sign(payloadB64);
  const sigBuffer = Buffer.from(providedSig, 'hex');
  const expectedBuffer = Buffer.from(expectedSig, 'hex');

  if (sigBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null;

  // Decode payload
  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
  } catch {
    return null;
  }

  // Check expiration
  if (Date.now() > payload.expires_at) return null;

  // Check scope
  if (payload.scope !== expectedScope) return null;

  // Check audit_id if provided
  if (expectedAuditId && payload.audit_id !== expectedAuditId) return null;

  return payload;
}
