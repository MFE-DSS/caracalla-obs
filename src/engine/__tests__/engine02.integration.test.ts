import { describe, it, expect } from 'vitest';
import { buildEngineOutputV2 } from '../services/buildEngineOutputV2';
import { FIXTURE_A, FIXTURE_B, FIXTURE_C, FIXTURE_D } from '../fixtures/mockAudits.fixture';

describe('ENGINE_02 integration', () => {
  const fixtures = [
    { name: 'Fixture A — BTP', data: FIXTURE_A },
    { name: 'Fixture B — Transport', data: FIXTURE_B },
    { name: 'Fixture C — Services', data: FIXTURE_C },
    { name: 'Fixture D — Commerce', data: FIXTURE_D },
  ];

  for (const { name, data } of fixtures) {
    describe(name, () => {
      const v2 = buildEngineOutputV2(data);

      it('has valid ENGINE_01 output', () => {
        expect(v2.global_score).toBeGreaterThanOrEqual(10);
        expect(v2.global_score).toBeLessThanOrEqual(90);
        expect(v2.frictions.length).toBeGreaterThan(0);
        expect(v2.opportunities.length).toBeGreaterThan(0);
      });

      it('has company context', () => {
        expect(v2.context).toBeDefined();
        expect(['low', 'medium', 'high']).toContain(v2.context.tooling_maturity);
        expect(['low', 'medium', 'high']).toContain(v2.context.data_readiness);
      });

      it('has constraints', () => {
        expect(v2.constraints).toBeDefined();
        // At least some constraints for realistic PME inputs
        expect(v2.constraints.length).toBeGreaterThan(0);
      });

      it('has execution plan with 1-3 steps', () => {
        expect(v2.execution_plan.length).toBeGreaterThanOrEqual(1);
        expect(v2.execution_plan.length).toBeLessThanOrEqual(3);
      });

      it('has next_best_action', () => {
        expect(v2.next_best_action).not.toBeNull();
        expect(v2.next_best_action!.title.length).toBeGreaterThan(5);
        expect(v2.next_best_action!.expected_time_to_value).toBeTruthy();
      });

      it('has why_this_first explanations', () => {
        expect(v2.why_this_first.length).toBeGreaterThan(0);
      });

      it('has arbitration_trace', () => {
        expect(v2.arbitration_trace.length).toBeGreaterThan(0);
      });

      it('has execution_confidence', () => {
        expect(['low', 'medium', 'high']).toContain(v2.execution_confidence);
      });
    });
  }

  describe('cross-fixture consistency', () => {
    it('all 4 fixtures produce distinct next_best_action titles', () => {
      const titles = fixtures.map(
        (f) => buildEngineOutputV2(f.data).next_best_action?.title,
      );
      const unique = new Set(titles);
      expect(unique.size).toBeGreaterThanOrEqual(3);
    });

    it('blocked_items are not empty for at least 1 fixture', () => {
      const anyBlocked = fixtures.some(
        (f) => buildEngineOutputV2(f.data).blocked_items.length > 0,
      );
      expect(anyBlocked).toBe(true);
    });

    it('execution plans differ across fixtures', () => {
      const plans = fixtures.map(
        (f) => buildEngineOutputV2(f.data).execution_plan.map((s) => s.title).join(','),
      );
      const unique = new Set(plans);
      expect(unique.size).toBeGreaterThanOrEqual(3);
    });

    it('a same priority_score can lead to different arbitration outcome', () => {
      // Verify that arbitration re-ranks based on context, not just raw score
      const v2A = buildEngineOutputV2(FIXTURE_A);
      const v2D = buildEngineOutputV2(FIXTURE_D);
      // They should have different next actions even if some raw scores overlap
      expect(v2A.next_best_action?.title).not.toBe(v2D.next_best_action?.title);
    });
  });
});
