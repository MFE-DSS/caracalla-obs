import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let dbPath = path.join(__dirname, '../../data/caracalla.db');

/** Override DB path (used by tests to use :memory:) */
export function setDbPath(p: string) {
  dbPath = p;
  _db = null;
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(dbPath);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
  }
  return _db;
}

export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS audits (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      company_name TEXT NOT NULL,
      company_size_band TEXT NOT NULL,
      industry_hint TEXT NOT NULL,
      pain_text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      paid INTEGER NOT NULL DEFAULT 0,
      access_token TEXT,
      email TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_outputs (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL REFERENCES audits(id),
      engine_version TEXT NOT NULL DEFAULT 'v2',
      global_score INTEGER NOT NULL,
      global_level TEXT NOT NULL,
      confidence TEXT NOT NULL,
      summary_payload TEXT NOT NULL,
      report_payload TEXT NOT NULL,
      computed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      occurred_at TEXT NOT NULL DEFAULT (datetime('now')),
      actor_mode TEXT NOT NULL DEFAULT 'system',
      surface TEXT NOT NULL DEFAULT 'api',
      payload_json TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_audit_events_audit_id ON audit_events(audit_id);
    CREATE INDEX IF NOT EXISTS idx_audit_events_type ON audit_events(event_type);

    CREATE TABLE IF NOT EXISTS shared_access_links (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      scope TEXT NOT NULL DEFAULT 'premium_read',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      created_by_mode TEXT NOT NULL DEFAULT 'owner',
      is_active INTEGER NOT NULL DEFAULT 1
    );
    CREATE INDEX IF NOT EXISTS idx_shared_links_audit_id ON shared_access_links(audit_id);
  `);

  // Best-effort additive migrations (idempotent).
  const cols = db.prepare("PRAGMA table_info(audits)").all() as { name: string }[];
  if (!cols.some((c) => c.name === 'email')) {
    try {
      db.exec('ALTER TABLE audits ADD COLUMN email TEXT');
    } catch {
      /* already present — ignore */
    }
  }
}

/** Create an in-memory DB for testing */
export function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  _db = db;
  return db;
}
