import { describe, it, expect } from 'vitest';
import { normalizeAudit } from '../services/normalizeAudit';
import { assessContext } from '../services/assessContext';
import { FIXTURE_A, FIXTURE_C, FIXTURE_D } from '../fixtures/mockAudits.fixture';

describe('assessContext', () => {
  it('detects medium tooling maturity for Excel+email+ERP', () => {
    // Fixture A mentions EBP (ERP), so tooling maturity is medium, not low
    const ctx = assessContext(normalizeAudit(FIXTURE_A));
    expect(ctx.tooling_maturity).toBe('medium');
  });

  it('detects low formalization for dependency+email signals', () => {
    const ctx = assessContext(normalizeAudit(FIXTURE_D));
    expect(ctx.process_formalization_level).toBe('low');
  });

  it('detects low org complexity for 1-5 employees', () => {
    const ctx = assessContext(normalizeAudit(FIXTURE_C));
    expect(ctx.organization_complexity).toBe('low');
  });

  it('detects high org complexity for 21-50 employees', () => {
    const ctx = assessContext(normalizeAudit(FIXTURE_A));
    expect(ctx.organization_complexity).toBe('high');
  });

  it('detects low data readiness for BTP fixture with spreadsheet+duplicate', () => {
    // Fixture A has spreadsheet + duplicate_entry → low data readiness
    const ctx = assessContext(normalizeAudit(FIXTURE_A));
    expect(ctx.data_readiness).toBe('low');
  });

  it('returns different contexts for different fixtures', () => {
    const ctxA = assessContext(normalizeAudit(FIXTURE_A));
    const ctxC = assessContext(normalizeAudit(FIXTURE_C));
    expect(ctxA.organization_complexity).not.toBe(ctxC.organization_complexity);
  });
});
