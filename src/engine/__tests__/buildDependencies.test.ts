import { describe, it, expect } from 'vitest';
import { buildEngineOutput } from '../services/buildEngineOutput';
import { buildDependencies, getUnlocked, getDependsOn } from '../services/buildDependencies';
import { FIXTURE_A, FIXTURE_B } from '../fixtures/mockAudits.fixture';

describe('buildDependencies', () => {
  it('creates dependency edges between structure_data and automate', () => {
    const v1 = buildEngineOutput(FIXTURE_A);
    const deps = buildDependencies(v1.opportunities);
    // If both types exist, there should be edges
    const hasStructure = v1.opportunities.some((o) => o.type === 'structure_data_first');
    const hasAutomate = v1.opportunities.some((o) => o.type === 'automate_bounded_step');
    if (hasStructure && hasAutomate) {
      expect(deps.length).toBeGreaterThan(0);
    }
  });

  it('edges have from_id, to_id and reason', () => {
    const v1 = buildEngineOutput(FIXTURE_A);
    const deps = buildDependencies(v1.opportunities);
    for (const edge of deps) {
      expect(edge.from_id).toBeTruthy();
      expect(edge.to_id).toBeTruthy();
      expect(edge.reason).toBeTruthy();
    }
  });

  it('getUnlocked returns correct downstream IDs', () => {
    const v1 = buildEngineOutput(FIXTURE_A);
    const deps = buildDependencies(v1.opportunities);
    if (deps.length > 0) {
      const firstFrom = deps[0].from_id;
      const unlocked = getUnlocked(firstFrom, deps);
      expect(unlocked).toContain(deps[0].to_id);
    }
  });

  it('getDependsOn returns correct upstream IDs', () => {
    const v1 = buildEngineOutput(FIXTURE_A);
    const deps = buildDependencies(v1.opportunities);
    if (deps.length > 0) {
      const firstTo = deps[0].to_id;
      const dependsOn = getDependsOn(firstTo, deps);
      expect(dependsOn).toContain(deps[0].from_id);
    }
  });

  it('does not create self-referencing edges', () => {
    const v1 = buildEngineOutput(FIXTURE_B);
    const deps = buildDependencies(v1.opportunities);
    for (const edge of deps) {
      expect(edge.from_id).not.toBe(edge.to_id);
    }
  });
});
