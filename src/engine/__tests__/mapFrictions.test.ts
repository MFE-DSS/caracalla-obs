import { describe, it, expect } from 'vitest';
import { normalizeAudit } from '../services/normalizeAudit';
import { detectArchetypes } from '../services/detectArchetypes';
import { mapFrictions } from '../services/mapFrictions';
import { FIXTURE_A, FIXTURE_B, FIXTURE_C, FIXTURE_D } from '../fixtures/mockAudits.fixture';

describe('mapFrictions', () => {
  it('detects email_as_workflow and duplicate_entry for fixture A', () => {
    const norm = normalizeAudit(FIXTURE_A);
    const archetypes = detectArchetypes(norm);
    const frictions = mapFrictions(norm, archetypes);
    const ids = frictions.map((f) => f.friction_id);
    expect(ids).toContain('email_as_workflow');
    expect(ids).toContain('duplicate_entry');
  });

  it('detects manual_reporting_rebuild for fixture B', () => {
    const norm = normalizeAudit(FIXTURE_B);
    const archetypes = detectArchetypes(norm);
    const frictions = mapFrictions(norm, archetypes);
    const ids = frictions.map((f) => f.friction_id);
    expect(ids).toContain('manual_reporting_rebuild');
  });

  it('detects document_dispersion for fixture C', () => {
    const norm = normalizeAudit(FIXTURE_C);
    const archetypes = detectArchetypes(norm);
    const frictions = mapFrictions(norm, archetypes);
    const ids = frictions.map((f) => f.friction_id);
    expect(ids).toContain('document_dispersion');
  });

  it('detects non_traceable_validation for fixture D', () => {
    const norm = normalizeAudit(FIXTURE_D);
    const archetypes = detectArchetypes(norm);
    const frictions = mapFrictions(norm, archetypes);
    const ids = frictions.map((f) => f.friction_id);
    expect(ids).toContain('non_traceable_validation');
  });

  it('includes evidence for each friction', () => {
    const norm = normalizeAudit(FIXTURE_A);
    const archetypes = detectArchetypes(norm);
    const frictions = mapFrictions(norm, archetypes);
    for (const f of frictions) {
      expect(f.evidence.length).toBeGreaterThan(0);
    }
  });

  it('sorts by severity descending', () => {
    const norm = normalizeAudit(FIXTURE_A);
    const archetypes = detectArchetypes(norm);
    const frictions = mapFrictions(norm, archetypes);
    const sevOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    for (let i = 1; i < frictions.length; i++) {
      expect(sevOrder[frictions[i].severity]).toBeLessThanOrEqual(sevOrder[frictions[i - 1].severity]);
    }
  });

  it('produces different frictions for different inputs', () => {
    const fA = mapFrictions(normalizeAudit(FIXTURE_A), detectArchetypes(normalizeAudit(FIXTURE_A)));
    const fB = mapFrictions(normalizeAudit(FIXTURE_B), detectArchetypes(normalizeAudit(FIXTURE_B)));
    const idsA = fA.map((f) => f.friction_id).sort();
    const idsB = fB.map((f) => f.friction_id).sort();
    expect(idsA).not.toEqual(idsB);
  });
});
