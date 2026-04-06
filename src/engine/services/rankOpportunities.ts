import type { Opportunity, Tier } from '../domain/types';

/**
 * Re-ranks opportunities using the deterministic formula.
 * Can be used to re-sort after adjustments or when scores change.
 *
 * Formula:
 *   priority_score = 0.35 * value + 0.30 * feasibility - 0.20 * effort - 0.15 * risk
 *
 * Tiers:
 *   top_candidate >= 70
 *   candidate     50-69
 *   backlog       30-49
 *   not_now       < 30
 */
export function rankOpportunities(opportunities: Opportunity[]): Opportunity[] {
  return opportunities
    .map((opp) => {
      const priority_score = Math.round(
        0.35 * opp.value_score +
        0.30 * opp.feasibility_score -
        0.20 * opp.effort_score -
        0.15 * opp.risk_score,
      );

      let tier: Tier;
      if (priority_score >= 43) tier = 'top_candidate';
      else if (priority_score >= 33) tier = 'candidate';
      else if (priority_score >= 20) tier = 'backlog';
      else tier = 'not_now';

      return { ...opp, priority_score, tier };
    })
    .sort((a, b) => b.priority_score - a.priority_score);
}
