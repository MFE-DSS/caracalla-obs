/* CARACALLA — Session Persistence (localStorage)
 * Lightweight session continuity. Backend remains source of truth.
 */

const STORAGE_KEY = 'caracalla_session';

interface SessionData {
  last_audit_id: string;
  last_known_paid: boolean;
  last_screen: string;
  timestamp: number;
}

export function saveSession(auditId: string, paid: boolean, screen: string): void {
  try {
    const data: SessionData = {
      last_audit_id: auditId,
      last_known_paid: paid,
      last_screen: screen,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable (private browsing, etc.)
  }
}

export function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: SessionData = JSON.parse(raw);
    // Expire after 30 days
    if (Date.now() - data.timestamp > 30 * 24 * 60 * 60 * 1000) {
      clearSession();
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
