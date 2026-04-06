import { describe, it, expect } from 'vitest';
import { normalizeAudit } from '../services/normalizeAudit';
import { detectArchetypes } from '../services/detectArchetypes';
import { mapFrictions } from '../services/mapFrictions';
import { generateOpportunities } from '../services/generateOpportunities';
import { FIXTURE_A, FIXTURE_B, FIXTURE_C, FIXTURE_D } from '../fixtures/mockAudits.fixture';

function getOppsFor(fixture: typeof FIXTURE_A) {
  const norm = normalizeAudit(fixture);
  const arch = detectArchetypes(norm);
  const fric = mapFrictions(norm, arch);
  return generateOpportunities(arch, fric);
}

describe('generateOpportunities', () => {
  it('generates opportunities for fixture A (BTP)', () => {
    const opps = getOppsFor(FIXTURE_A);
    expect(opps.length).toBeGreaterThan(0);
  });

  it('generates structure_data_first or automate_bounded_step for fixture A', () => {
    const opps = getOppsFor(FIXTURE_A);
    const types = opps.map((o) => o.type);
    expect(types.some((t) => t === 'structure_data_first' || t === 'automate_bounded_step')).toBe(true);
  });

  it('generates opportunities for fixture B (reporting)', () => {
    const opps = getOppsFor(FIXTURE_B);
    expect(opps.length).toBeGreaterThan(0);
    expect(opps.some((o) => o.title.toLowerCase().includes('reporting'))).toBe(true);
  });

  it('generates opportunities for fixture C (documents)', () => {
    const opps = getOppsFor(FIXTURE_C);
    expect(opps.length).toBeGreaterThan(0);
    expect(opps.some((o) => o.type === 'structure_data_first' || o.type === 'standardize_first')).toBe(true);
  });

  it('generates opportunities for fixture D (validation)', () => {
    const opps = getOppsFor(FIXTURE_D);
    expect(opps.length).toBeGreaterThan(0);
    expect(opps.some((o) => o.type === 'partial_workflow_automation' || o.type === 'assist_human_work')).toBe(true);
  });

  it('computes priority_score correctly', () => {
    const opps = getOppsFor(FIXTURE_A);
    for (const opp of opps) {
      const expected = Math.round(
        0.35 * opp.value_score +
        0.30 * opp.feasibility_score -
        0.20 * opp.effort_score -
        0.15 * opp.risk_score,
      );
      expect(opp.priority_score).toBe(expected);
    }
  });

  it('assigns tiers correctly', () => {
    const opps = getOppsFor(FIXTURE_A);
    for (const opp of opps) {
      if (opp.priority_score >= 43) expect(opp.tier).toBe('top_candidate');
      else if (opp.priority_score >= 33) expect(opp.tier).toBe('candidate');
      else if (opp.priority_score >= 20) expect(opp.tier).toBe('backlog');
      else expect(opp.tier).toBe('not_now');
    }
  });

  it('sorts by priority_score descending', () => {
    const opps = getOppsFor(FIXTURE_A);
    for (let i = 1; i < opps.length; i++) {
      expect(opps[i].priority_score).toBeLessThanOrEqual(opps[i - 1].priority_score);
    }
  });
});
