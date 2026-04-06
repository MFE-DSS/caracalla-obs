import { describe, it, expect } from 'vitest';
import { normalizeAudit } from '../services/normalizeAudit';
import { detectArchetypes } from '../services/detectArchetypes';
import { FIXTURE_A, FIXTURE_B, FIXTURE_C, FIXTURE_D } from '../fixtures/mockAudits.fixture';

describe('detectArchetypes', () => {
  it('detects manual_intake for BTP devis workflow', () => {
    const normalized = normalizeAudit(FIXTURE_A);
    const archetypes = detectArchetypes(normalized);
    const ids = archetypes.map((a) => a.archetype_id);
    expect(ids).toContain('manual_intake');
  });

  it('detects data_reentry for double saisie', () => {
    const normalized = normalizeAudit(FIXTURE_A);
    const archetypes = detectArchetypes(normalized);
    const ids = archetypes.map((a) => a.archetype_id);
    expect(ids).toContain('data_reentry');
  });

  it('detects manual_reporting for reporting reconstruit', () => {
    const normalized = normalizeAudit(FIXTURE_B);
    const archetypes = detectArchetypes(normalized);
    const ids = archetypes.map((a) => a.archetype_id);
    expect(ids).toContain('manual_reporting');
  });

  it('detects document_chasing for documents dispersés', () => {
    const normalized = normalizeAudit(FIXTURE_C);
    const archetypes = detectArchetypes(normalized);
    const ids = archetypes.map((a) => a.archetype_id);
    expect(ids).toContain('document_chasing');
  });

  it('detects manual_validation for validation par email', () => {
    const normalized = normalizeAudit(FIXTURE_D);
    const archetypes = detectArchetypes(normalized);
    const ids = archetypes.map((a) => a.archetype_id);
    expect(ids).toContain('manual_validation');
  });

  it('returns confidence levels', () => {
    const normalized = normalizeAudit(FIXTURE_A);
    const archetypes = detectArchetypes(normalized);
    expect(archetypes.length).toBeGreaterThan(0);
    for (const a of archetypes) {
      expect(['low', 'medium', 'high']).toContain(a.confidence);
    }
  });

  it('sorts by confidence descending', () => {
    const normalized = normalizeAudit(FIXTURE_A);
    const archetypes = detectArchetypes(normalized);
    const confOrder = { high: 3, medium: 2, low: 1 };
    for (let i = 1; i < archetypes.length; i++) {
      expect(confOrder[archetypes[i].confidence]).toBeLessThanOrEqual(confOrder[archetypes[i - 1].confidence]);
    }
  });
});
