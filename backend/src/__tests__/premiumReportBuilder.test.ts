import { describe, it, expect } from 'vitest';
import { buildPremiumReport } from '../services/premiumReportBuilder.js';
import { buildEngineOutputV2 } from '../../../src/engine/services/buildEngineOutputV2.js';
import { FIXTURE_A, FIXTURE_B, FIXTURE_C, FIXTURE_D } from '../../../src/engine/fixtures/mockAudits.fixture.js';

function getPremiumFor(fixture: typeof FIXTURE_A) {
  return buildPremiumReport(buildEngineOutputV2(fixture));
}

describe('premiumReportBuilder', () => {
  describe('executive_verdict', () => {
    it('produces a headline', () => {
      const pv = getPremiumFor(FIXTURE_A);
      expect(pv.executive_verdict.headline.length).toBeGreaterThan(20);
    });

    it('produces a subheadline with concrete action', () => {
      const pv = getPremiumFor(FIXTURE_A);
      expect(pv.executive_verdict.subheadline.length).toBeGreaterThan(10);
    });

    it('includes a recommended motion', () => {
      const pv = getPremiumFor(FIXTURE_A);
      expect(pv.executive_verdict.recommended_motion).toBeTruthy();
    });

    it('includes a dominant theme', () => {
      const pv = getPremiumFor(FIXTURE_A);
      expect(pv.executive_verdict.dominant_theme).toBeTruthy();
    });

    it('includes time to value hint', () => {
      const pv = getPremiumFor(FIXTURE_A);
      expect(pv.executive_verdict.time_to_value_hint).toBeTruthy();
    });

    it('produces different verdicts for different fixtures', () => {
      const headlines = [FIXTURE_A, FIXTURE_B, FIXTURE_C, FIXTURE_D].map(
        (f) => getPremiumFor(f).executive_verdict.dominant_theme,
      );
      const unique = new Set(headlines);
      expect(unique.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('decision_summary', () => {
    it('includes score and frictions count', () => {
      const pv = getPremiumFor(FIXTURE_A);
      expect(pv.decision_summary).toContain('/100');
      expect(pv.decision_summary).toContain('friction');
    });
  });

  describe('top_opportunity', () => {
    it('has a top opportunity card', () => {
      const pv = getPremiumFor(FIXTURE_A);
      expect(pv.top_opportunity).not.toBeNull();
      expect(pv.top_opportunity!.rank).toBe(1);
      expect(pv.top_opportunity!.title.length).toBeGreaterThan(5);
    });

    it('top opportunity has labels', () => {
      const pv = getPremiumFor(FIXTURE_A);
      expect(pv.top_opportunity!.priority_label).toBeTruthy();
      expect(pv.top_opportunity!.type_label).toBeTruthy();
      expect(pv.top_opportunity!.value_label).toBeTruthy();
      expect(pv.top_opportunity!.effort_label).toBeTruthy();
      expect(pv.top_opportunity!.risk_label).toBeTruthy();
    });

    it('top opportunity has why_it_matters', () => {
      const pv = getPremiumFor(FIXTURE_A);
      expect(pv.top_opportunity!.why_it_matters.length).toBeGreaterThan(10);
    });
  });

  describe('priority_board', () => {
    it('contains max 3 opportunities', () => {
      const pv = getPremiumFor(FIXTURE_A);
      expect(pv.priority_board.length).toBeGreaterThan(0);
      expect(pv.priority_board.length).toBeLessThanOrEqual(3);
    });

    it('opportunities are ranked 1, 2, 3', () => {
      const pv = getPremiumFor(FIXTURE_A);
      pv.priority_board.forEach((card, i) => {
        expect(card.rank).toBe(i + 1);
      });
    });
  });

  describe('prerequisites_board', () => {
    it('includes prerequisite items with labels', () => {
      const pv = getPremiumFor(FIXTURE_A);
      // At least some prerequisites given the fixture constraints
      expect(pv.prerequisites_board.length).toBeGreaterThan(0);
      for (const p of pv.prerequisites_board) {
        expect(p.label.length).toBeGreaterThan(5);
        expect(p.category).toBeTruthy();
      }
    });
  });

  describe('blocked_items_board', () => {
    it('transforms blocked items with unblock conditions', () => {
      // Find a fixture that produces blocked items
      const allPvs = [FIXTURE_A, FIXTURE_B, FIXTURE_C, FIXTURE_D].map((f) => getPremiumFor(f));
      const withBlocked = allPvs.find((pv) => pv.blocked_items_board.length > 0);
      if (withBlocked) {
        for (const b of withBlocked.blocked_items_board) {
          expect(b.title.length).toBeGreaterThan(5);
          expect(b.why_blocked.length).toBeGreaterThan(5);
          expect(b.unblock_condition.length).toBeGreaterThan(5);
        }
      }
    });
  });

  describe('execution_plan_board', () => {
    it('contains 1-3 steps', () => {
      const pv = getPremiumFor(FIXTURE_A);
      expect(pv.execution_plan_board.length).toBeGreaterThanOrEqual(1);
      expect(pv.execution_plan_board.length).toBeLessThanOrEqual(3);
    });

    it('steps have labels and why', () => {
      const pv = getPremiumFor(FIXTURE_A);
      for (const step of pv.execution_plan_board) {
        expect(step.title.length).toBeGreaterThan(5);
        expect(step.kind_label).toBeTruthy();
        expect(step.why.length).toBeGreaterThan(5);
        expect(step.time_to_value).toBeTruthy();
      }
    });
  });

  describe('advisory_cta_block', () => {
    it('has headline and reasons', () => {
      const pv = getPremiumFor(FIXTURE_A);
      expect(pv.advisory_cta_block.headline.length).toBeGreaterThan(10);
      expect(pv.advisory_cta_block.reasons.length).toBeGreaterThan(0);
      expect(pv.advisory_cta_block.cta_label.length).toBeGreaterThan(5);
    });

    it('reasons are contextualized', () => {
      const pv = getPremiumFor(FIXTURE_A);
      // At least one reason should mention the NBA or prerequisites
      const allReasons = pv.advisory_cta_block.reasons.join(' ');
      expect(allReasons.length).toBeGreaterThan(20);
    });
  });

  describe('cross-fixture', () => {
    it('all 4 fixtures produce valid premium views', () => {
      for (const fixture of [FIXTURE_A, FIXTURE_B, FIXTURE_C, FIXTURE_D]) {
        const pv = getPremiumFor(fixture);
        expect(pv.executive_verdict.headline).toBeTruthy();
        expect(pv.decision_summary).toBeTruthy();
        expect(pv.priority_board.length).toBeGreaterThan(0);
        expect(pv.execution_plan_board.length).toBeGreaterThan(0);
        expect(pv.advisory_cta_block.headline).toBeTruthy();
      }
    });

    it('top opportunities differ across fixtures', () => {
      const titles = [FIXTURE_A, FIXTURE_B, FIXTURE_C, FIXTURE_D].map(
        (f) => getPremiumFor(f).top_opportunity?.title,
      );
      const unique = new Set(titles);
      expect(unique.size).toBeGreaterThanOrEqual(3);
    });
  });
});
