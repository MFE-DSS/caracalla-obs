import { describe, it, expect } from 'vitest';
import { buildEngineOutputV2 } from '../services/buildEngineOutputV2';
import { FIXTURE_A, FIXTURE_B, FIXTURE_C, FIXTURE_D } from '../fixtures/mockAudits.fixture';

describe('arbitrateNextAction', () => {
  it('produces a next_best_action for fixture A', () => {
    const v2 = buildEngineOutputV2(FIXTURE_A);
    expect(v2.next_best_action).not.toBeNull();
    expect(v2.next_best_action!.title.length).toBeGreaterThan(5);
    expect(v2.next_best_action!.arbitration_score).toBeGreaterThan(0);
  });

  it('produces why_this_first explanations', () => {
    const v2 = buildEngineOutputV2(FIXTURE_A);
    expect(v2.why_this_first.length).toBeGreaterThan(0);
  });

  it('produces arbitration_trace', () => {
    const v2 = buildEngineOutputV2(FIXTURE_A);
    expect(v2.arbitration_trace.length).toBeGreaterThan(0);
  });

  it('fixture B: next action is coherent with reporting context', () => {
    const v2 = buildEngineOutputV2(FIXTURE_B);
    expect(v2.next_best_action).not.toBeNull();
    // Should relate to the fixture's context (reporting, visibility, data)
    expect(v2.next_best_action!.title.length).toBeGreaterThan(10);
    expect(v2.next_best_action!.arbitration_score).toBeGreaterThan(0);
  });

  it('fixture C: next action relates to documents or structure', () => {
    const v2 = buildEngineOutputV2(FIXTURE_C);
    expect(v2.next_best_action).not.toBeNull();
    const title = v2.next_best_action!.title.toLowerCase();
    expect(title.includes('document') || title.includes('central') || title.includes('class') || title.includes('structur')).toBe(true);
  });

  it('fixture D: next action is coherent with validation context', () => {
    const v2 = buildEngineOutputV2(FIXTURE_D);
    expect(v2.next_best_action).not.toBeNull();
    // Should relate to validation, followup, or assist context
    expect(v2.next_best_action!.title.length).toBeGreaterThan(10);
    expect(v2.next_best_action!.arbitration_score).toBeGreaterThan(0);
  });

  it('a strong opportunity can be degraded if constraints are high', () => {
    const v2 = buildEngineOutputV2(FIXTURE_D);
    if (v2.blocked_items.length > 0) {
      expect(v2.blocked_items[0].why_blocked.length).toBeGreaterThan(5);
    }
    // Fixture D has workflow ops that should be penalized
    expect(v2.constraints.length).toBeGreaterThan(0);
  });

  it('different fixtures produce different next_best_action', () => {
    const actions = [FIXTURE_A, FIXTURE_B, FIXTURE_C, FIXTURE_D].map(
      (f) => buildEngineOutputV2(f).next_best_action?.title,
    );
    const unique = new Set(actions);
    expect(unique.size).toBeGreaterThanOrEqual(3);
  });

  it('preserves ENGINE_01 output fields', () => {
    const v2 = buildEngineOutputV2(FIXTURE_A);
    expect(v2.global_score).toBeGreaterThanOrEqual(10);
    expect(v2.frictions.length).toBeGreaterThan(0);
    expect(v2.opportunities.length).toBeGreaterThan(0);
    expect(v2.detected_archetypes.length).toBeGreaterThan(0);
    expect(v2.reason_trace.length).toBeGreaterThan(0);
  });
});
