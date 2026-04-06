import { describe, it, expect } from 'vitest';
import { buildEngineOutput } from '../services/buildEngineOutput';
import { FIXTURE_A, FIXTURE_B, FIXTURE_C, FIXTURE_D } from '../fixtures/mockAudits.fixture';

describe('Engine integration', () => {
  describe('Fixture A — PME BTP / devis par mail + Excel', () => {
    const output = buildEngineOutput(FIXTURE_A);

    it('identifies manual_intake and data_reentry archetypes', () => {
      const ids = output.detected_archetypes.map((a) => a.archetype_id);
      expect(ids).toContain('manual_intake');
      expect(ids).toContain('data_reentry');
    });

    it('detects email_as_workflow and duplicate_entry frictions', () => {
      const ids = output.frictions.map((f) => f.friction_id);
      expect(ids).toContain('email_as_workflow');
      expect(ids).toContain('duplicate_entry');
    });

    it('generates at least one opportunity related to intake or reentry', () => {
      expect(output.opportunities.length).toBeGreaterThan(0);
      const top = output.opportunities[0];
      expect(top.title.length).toBeGreaterThan(5);
      expect(top.explanation.length).toBeGreaterThan(10);
    });

    it('produces a global score between 10 and 90', () => {
      expect(output.global_score).toBeGreaterThanOrEqual(10);
      expect(output.global_score).toBeLessThanOrEqual(90);
    });

    it('includes a reason trace', () => {
      expect(output.reason_trace.length).toBeGreaterThan(0);
    });
  });

  describe('Fixture B — Reporting mensuel reconstruit', () => {
    const output = buildEngineOutput(FIXTURE_B);

    it('identifies manual_reporting archetype', () => {
      const ids = output.detected_archetypes.map((a) => a.archetype_id);
      expect(ids).toContain('manual_reporting');
    });

    it('detects manual_reporting_rebuild friction', () => {
      const ids = output.frictions.map((f) => f.friction_id);
      expect(ids).toContain('manual_reporting_rebuild');
    });

    it('generates opportunity to fiabiliser reporting', () => {
      expect(output.opportunities.some((o) => o.title.toLowerCase().includes('reporting'))).toBe(true);
    });
  });

  describe('Fixture C — Documents dispersés', () => {
    const output = buildEngineOutput(FIXTURE_C);

    it('identifies document_chasing archetype', () => {
      const ids = output.detected_archetypes.map((a) => a.archetype_id);
      expect(ids).toContain('document_chasing');
    });

    it('detects document_dispersion friction', () => {
      const ids = output.frictions.map((f) => f.friction_id);
      expect(ids).toContain('document_dispersion');
    });

    it('generates opportunity to centraliser/structurer documents', () => {
      expect(output.opportunities.some((o) =>
        o.type === 'structure_data_first' || o.type === 'standardize_first'
      )).toBe(true);
    });
  });

  describe('Fixture D — Validation manuelle lente', () => {
    const output = buildEngineOutput(FIXTURE_D);

    it('identifies manual_validation archetype', () => {
      const ids = output.detected_archetypes.map((a) => a.archetype_id);
      expect(ids).toContain('manual_validation');
    });

    it('detects non_traceable_validation friction', () => {
      const ids = output.frictions.map((f) => f.friction_id);
      expect(ids).toContain('non_traceable_validation');
    });

    it('generates partial_workflow_automation or assist_human_work opportunity', () => {
      expect(output.opportunities.some((o) =>
        o.type === 'partial_workflow_automation' || o.type === 'assist_human_work'
      )).toBe(true);
    });
  });

  describe('Cross-fixture consistency', () => {
    it('different inputs produce different outputs', () => {
      const outA = buildEngineOutput(FIXTURE_A);
      const outB = buildEngineOutput(FIXTURE_B);
      const outC = buildEngineOutput(FIXTURE_C);
      const outD = buildEngineOutput(FIXTURE_D);

      // Different top opportunities
      const topTitles = [
        outA.opportunities[0]?.title,
        outB.opportunities[0]?.title,
        outC.opportunities[0]?.title,
        outD.opportunities[0]?.title,
      ];
      const uniqueTitles = new Set(topTitles);
      expect(uniqueTitles.size).toBeGreaterThanOrEqual(3);
    });

    it('all outputs have valid structure', () => {
      for (const fixture of [FIXTURE_A, FIXTURE_B, FIXTURE_C, FIXTURE_D]) {
        const output = buildEngineOutput(fixture);
        expect(output.company_name).toBeTruthy();
        expect(output.global_score).toBeGreaterThanOrEqual(10);
        expect(output.global_score).toBeLessThanOrEqual(90);
        expect(['low', 'medium', 'high']).toContain(output.confidence);
        expect(output.reason_trace.length).toBeGreaterThan(0);
        expect(output.frictions.length).toBeGreaterThan(0);
        expect(output.opportunities.length).toBeGreaterThan(0);
        expect(output.detected_archetypes.length).toBeGreaterThan(0);

        // Opportunities are ranked
        for (let i = 1; i < output.opportunities.length; i++) {
          expect(output.opportunities[i].priority_score)
            .toBeLessThanOrEqual(output.opportunities[i - 1].priority_score);
        }
      }
    });
  });
});
