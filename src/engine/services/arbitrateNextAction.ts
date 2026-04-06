import type { Opportunity } from '../domain/types';
import type { CompanyContext } from '../domain/context';
import type { Constraint } from '../domain/constraints';
import type { ExecutionStep } from '../domain/execution';
import type { NextBestAction, BlockedItem } from '../domain/arbitration';
import type { DependencyEdge } from './buildDependencies';
import { getUnlocked, getDependsOn } from './buildDependencies';

interface ScoredCandidate {
  opportunity: Opportunity;
  arbitration_score: number;
  bonuses: string[];
  penalties: string[];
}

function scoreCandidate(
  opp: Opportunity,
  ctx: CompanyContext,
  constraints: Constraint[],
  deps: DependencyEdge[],
): ScoredCandidate {
  let score = opp.priority_score;
  const bonuses: string[] = [];
  const penalties: string[] = [];

  // Context bonus: quick win for small companies
  if (ctx.company_size_band === '1-5' && opp.effort_score <= 25) {
    score += 8;
    bonuses.push('Quick win adapté à la taille de l\'entreprise');
  }

  // Sequencing bonus: unlocks other opportunities
  const unlocks = getUnlocked(opp.id, deps);
  if (unlocks.length > 0) {
    score += unlocks.length * 5;
    bonuses.push(`Débloque ${unlocks.length} opportunité(s) suivante(s)`);
  }

  // Maturity fit bonus
  if (
    (opp.type === 'standardize_first' || opp.type === 'structure_data_first') &&
    ctx.process_formalization_level === 'low'
  ) {
    score += 6;
    bonuses.push('Bon fit avec le niveau de maturité actuel');
  }
  if (opp.type === 'assist_human_work' && ctx.tooling_maturity === 'low') {
    score += 4;
    bonuses.push('Assistance adaptée au niveau d\'outillage');
  }

  // Time-to-value bonus: low effort = fast value
  if (opp.effort_score <= 25) {
    score += 5;
    bonuses.push('Temps de retour court');
  }

  // Constraint penalties
  for (const c of constraints) {
    if (c.id === 'low_formalization' && opp.type === 'partial_workflow_automation') {
      score -= c.penalty_score;
      penalties.push('Nécessite formalisation préalable des process');
    }
    if (c.id === 'weak_data_foundation' && opp.type === 'automate_bounded_step') {
      score -= Math.round(c.penalty_score * 0.5);
      penalties.push('Fondation de données fragile');
    }
    if (c.id === 'validation_change_risk' && opp.type === 'partial_workflow_automation') {
      score -= c.penalty_score;
      penalties.push('Risque de changement sur les validations');
    }
    if (c.id === 'high_coordination_load' && opp.effort_score > 40) {
      score -= Math.round(c.penalty_score * 0.5);
      penalties.push('Charge de coordination élevée pour ce type de projet');
    }
  }

  // Dependency penalty: if depends on something, penalize
  const dependsOn = getDependsOn(opp.id, deps);
  if (dependsOn.length > 0) {
    score -= 12;
    penalties.push('Dépend d\'une action préalable');
  }

  return { opportunity: opp, arbitration_score: score, bonuses, penalties };
}

export function arbitrateNextAction(
  opportunities: Opportunity[],
  ctx: CompanyContext,
  constraints: Constraint[],
  deps: DependencyEdge[],
  executionPlan: ExecutionStep[],
): {
  next_best_action: NextBestAction | null;
  why_this_first: string[];
  blocked_items: BlockedItem[];
  prerequisites: string[];
  arbitration_trace: string[];
} {
  if (opportunities.length === 0) {
    return {
      next_best_action: null,
      why_this_first: [],
      blocked_items: [],
      prerequisites: [],
      arbitration_trace: ['Aucune opportunité détectée'],
    };
  }

  // Score all candidates
  const scored = opportunities.map((opp) => scoreCandidate(opp, ctx, constraints, deps));
  scored.sort((a, b) => b.arbitration_score - a.arbitration_score);

  const winner = scored[0];
  const winnerOpp = winner.opportunity;

  // Time to value
  const ttv = winnerOpp.effort_score <= 25 ? '1-2 semaines' :
    winnerOpp.effort_score <= 35 ? '2-4 semaines' : '1-2 mois';

  // Build next_best_action
  const next_best_action: NextBestAction = {
    opportunity_id: winnerOpp.id,
    title: winnerOpp.title,
    type: winnerOpp.type,
    arbitration_score: winner.arbitration_score,
    expected_time_to_value: ttv,
  };

  // Build why_this_first
  const why_this_first: string[] = [];
  if (winner.bonuses.length > 0) {
    why_this_first.push(...winner.bonuses);
  }
  why_this_first.push(winnerOpp.explanation);

  // Build blocked_items: opportunities penalized significantly
  const blocked_items: BlockedItem[] = scored
    .filter((s) => s.penalties.length > 0 && s.arbitration_score < winner.arbitration_score - 10)
    .slice(0, 3)
    .map((s) => ({
      opportunity_id: s.opportunity.id,
      title: s.opportunity.title,
      why_blocked: s.penalties.join(' ; '),
    }));

  // Build prerequisites from execution plan
  const prerequisites = executionPlan
    .filter((step) => step.kind === 'prerequisite')
    .map((step) => step.title);

  // Build arbitration trace
  const arbitration_trace: string[] = [];
  arbitration_trace.push(`${scored.length} opportunité(s) évaluée(s)`);
  arbitration_trace.push(`Score d'arbitrage de la première action : ${winner.arbitration_score}`);
  if (constraints.length > 0) {
    arbitration_trace.push(`${constraints.length} contrainte(s) prise(s) en compte`);
  }
  if (winner.bonuses.length > 0) {
    arbitration_trace.push(`Bonus appliqués : ${winner.bonuses.join(', ')}`);
  }
  if (winner.penalties.length > 0) {
    arbitration_trace.push(`Pénalités appliquées : ${winner.penalties.join(', ')}`);
  }
  if (blocked_items.length > 0) {
    arbitration_trace.push(`${blocked_items.length} opportunité(s) dégradée(s) pour le moment`);
  }

  return { next_best_action, why_this_first, blocked_items, prerequisites, arbitration_trace };
}
