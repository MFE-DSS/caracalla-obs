import { describe, it, expect } from 'vitest';
import { normalizeAudit } from '../services/normalizeAudit';
import { FIXTURE_A, FIXTURE_B, FIXTURE_C } from '../fixtures/mockAudits.fixture';

describe('normalizeAudit', () => {
  it('normalizes company name', () => {
    const result = normalizeAudit(FIXTURE_A);
    expect(result.company_name).toBe('Menuiserie Dupont');
  });

  it('guesses industry from hint', () => {
    const result = normalizeAudit(FIXTURE_A);
    expect(result.industry_guess).toBe('BTP');
  });

  it('detects email signal from pain text', () => {
    const result = normalizeAudit(FIXTURE_A);
    expect(result.pain_signals).toContain('email');
  });

  it('detects spreadsheet signal from "Excel"', () => {
    const result = normalizeAudit(FIXTURE_A);
    expect(result.tool_signals).toContain('spreadsheet');
  });

  it('detects duplicate_entry signal from "ressaisit"', () => {
    const result = normalizeAudit(FIXTURE_A);
    expect(result.pain_signals).toContain('duplicate_entry');
  });

  it('detects reporting signal', () => {
    const result = normalizeAudit(FIXTURE_B);
    expect(result.pain_signals).toContain('reporting');
  });

  it('detects document signal from "dossiers"', () => {
    const result = normalizeAudit(FIXTURE_C);
    expect(result.pain_signals).toContain('document');
  });

  it('tokenizes text into lowercase tokens', () => {
    const result = normalizeAudit(FIXTURE_A);
    expect(result.tokens.length).toBeGreaterThan(5);
    expect(result.tokens.every((t) => t === t.toLowerCase())).toBe(true);
  });

  it('produces distinct signals for different inputs', () => {
    const a = normalizeAudit(FIXTURE_A);
    const b = normalizeAudit(FIXTURE_B);
    expect(a.pain_signals).not.toEqual(b.pain_signals);
  });
});
