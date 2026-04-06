import { describe, it, expect } from 'vitest';
import { rankOpportunities } from '../services/rankOpportunities';
import type { Opportunity } from '../domain/types';

function makeOpp(overrides: Partial<Opportunity>): Opportunity {
  return {
    id: 'test',
    title: 'Test',
    type: 'automate_bounded_step',
    archetype_id: 'manual_intake',
    linked_frictions: ['duplicate_entry'],
    value_score: 50,
    feasibility_score: 50,
    effort_score: 50,
    risk_score: 50,
    priority_score: 0,
    tier: 'backlog',
    explanation: 'Test',
    ...overrides,
  };
}

describe('rankOpportunities', () => {
  it('computes priority_score using the formula', () => {
    const opps = [makeOpp({ value_score: 80, feasibility_score: 70, effort_score: 30, risk_score: 10 })];
    const ranked = rankOpportunities(opps);
    // 0.35*80 + 0.30*70 - 0.20*30 - 0.15*10 = 28 + 21 - 6 - 1.5 = 41.5 → 42
    const expected = Math.round(0.35 * 80 + 0.30 * 70 - 0.20 * 30 - 0.15 * 10);
    expect(ranked[0].priority_score).toBe(expected);
  });

  it('assigns top_candidate tier for high-value low-effort opportunity', () => {
    // 0.35*90 + 0.30*90 - 0.20*10 - 0.15*10 = 31.5 + 27 - 2 - 1.5 = 55
    const opps = [makeOpp({ value_score: 90, feasibility_score: 90, effort_score: 10, risk_score: 10 })];
    const ranked = rankOpportunities(opps);
    expect(ranked[0].priority_score).toBeGreaterThanOrEqual(43);
    expect(ranked[0].tier).toBe('top_candidate');
  });

  it('assigns candidate tier for moderate opportunity', () => {
    // 0.35*60 + 0.30*60 - 0.20*40 - 0.15*30 = 21 + 18 - 8 - 4.5 = 26.5 → 27
    const opps = [makeOpp({ value_score: 60, feasibility_score: 60, effort_score: 40, risk_score: 30 })];
    const ranked = rankOpportunities(opps);
    expect(ranked[0].priority_score).toBeLessThan(43);
    expect(ranked[0].priority_score).toBeGreaterThanOrEqual(20);
  });

  it('assigns not_now tier for low-value high-effort opportunity', () => {
    // 0.35*20 + 0.30*20 - 0.20*80 - 0.15*80 = 7 + 6 - 16 - 12 = -15
    const opps = [makeOpp({ value_score: 20, feasibility_score: 20, effort_score: 80, risk_score: 80 })];
    const ranked = rankOpportunities(opps);
    expect(ranked[0].priority_score).toBeLessThan(20);
    expect(ranked[0].tier).toBe('not_now');
  });

  it('sorts by priority_score descending', () => {
    const opps = [
      makeOpp({ id: 'low', value_score: 30, feasibility_score: 30, effort_score: 70, risk_score: 70 }),
      makeOpp({ id: 'high', value_score: 90, feasibility_score: 90, effort_score: 10, risk_score: 10 }),
    ];
    const ranked = rankOpportunities(opps);
    expect(ranked[0].id).toBe('high');
    expect(ranked[1].id).toBe('low');
  });
});
