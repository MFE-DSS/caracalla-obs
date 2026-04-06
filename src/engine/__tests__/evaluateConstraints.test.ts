import { describe, it, expect } from 'vitest';
import { normalizeAudit } from '../services/normalizeAudit';
import { assessContext } from '../services/assessContext';
import { buildEngineOutput } from '../services/buildEngineOutput';
import { evaluateConstraints } from '../services/evaluateConstraints';
import { FIXTURE_A, FIXTURE_C, FIXTURE_D } from '../fixtures/mockAudits.fixture';

function getConstraintsFor(fixture: typeof FIXTURE_A) {
  const v1 = buildEngineOutput(fixture);
  const ctx = assessContext(normalizeAudit(fixture));
  return evaluateConstraints(ctx, v1.frictions, v1.opportunities);
}

describe('evaluateConstraints', () => {
  it('detects weak_data_foundation for fixture A', () => {
    const constraints = getConstraintsFor(FIXTURE_A);
    const ids = constraints.map((c) => c.id);
    expect(ids).toContain('weak_data_foundation');
  });

  it('detects low_formalization when process is informal', () => {
    const constraints = getConstraintsFor(FIXTURE_D);
    const ids = constraints.map((c) => c.id);
    expect(ids).toContain('low_formalization');
  });

  it('assigns severity to constraints', () => {
    const constraints = getConstraintsFor(FIXTURE_A);
    for (const c of constraints) {
      expect(['low', 'medium', 'high']).toContain(c.severity);
    }
  });

  it('includes evidence for each constraint', () => {
    const constraints = getConstraintsFor(FIXTURE_A);
    for (const c of constraints) {
      expect(c.evidence.length).toBeGreaterThan(0);
    }
  });

  it('sorts by penalty_score descending', () => {
    const constraints = getConstraintsFor(FIXTURE_A);
    for (let i = 1; i < constraints.length; i++) {
      expect(constraints[i].penalty_score).toBeLessThanOrEqual(constraints[i - 1].penalty_score);
    }
  });

  it('produces different constraints for different inputs', () => {
    const cA = getConstraintsFor(FIXTURE_A);
    const cC = getConstraintsFor(FIXTURE_C);
    const idsA = cA.map((c) => c.id).sort();
    const idsC = cC.map((c) => c.id).sort();
    expect(idsA).not.toEqual(idsC);
  });
});
