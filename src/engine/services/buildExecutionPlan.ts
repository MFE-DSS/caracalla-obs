import type { Opportunity, Confidence } from '../domain/types';
import type { CompanyContext } from '../domain/context';
import type { Constraint } from '../domain/constraints';
import type { ExecutionStep, ExecutionStepKind } from '../domain/execution';
import type { DependencyEdge } from './buildDependencies';
import { getUnlocked, getDependsOn } from './buildDependencies';

function estimateTimeToValue(opp: Opportunity, ctx: CompanyContext): string {
  const effort = opp.effort_score;
  if (effort <= 25 && ctx.change_capacity !== 'low') return '1-2 semaines';
  if (effort <= 35) return '2-4 semaines';
  if (effort <= 50) return '1-2 mois';
  return '2-3 mois';
}

function determineKind(
  opp: Opportunity,
  deps: DependencyEdge[],
  constraints: Constraint[],
  ctx: CompanyContext,
): ExecutionStepKind {
  const dependsOn = getDependsOn(opp.id, deps);
  const unlocks = getUnlocked(opp.id, deps);

  // If this opp unlocks others and is a structuring/standardizing type → prerequisite
  if (unlocks.length > 0 && (opp.type === 'structure_data_first' || opp.type === 'standardize_first')) {
    return 'prerequisite';
  }

  // If high constraints and low formalization → backlog for complex automations
  const totalPenalty = constraints.reduce((s, c) => s + c.penalty_score, 0);
  if (opp.type === 'partial_workflow_automation' && totalPenalty > 15) {
    return 'backlog';
  }
  if (opp.type === 'partial_workflow_automation' && ctx.process_formalization_level === 'low') {
    return 'backlog';
  }

  // If it depends on something → backlog unless dependency is already done
  if (dependsOn.length > 0) {
    return 'backlog';
  }

  return 'pilot';
}

function stepConfidence(opp: Opportunity, constraints: Constraint[]): Confidence {
  const totalPenalty = constraints.reduce((s, c) => s + c.penalty_score, 0);
  if (totalPenalty > 20) return 'low';
  if (totalPenalty > 10 || opp.risk_score > 30) return 'medium';
  return 'high';
}

export function buildExecutionPlan(
  opportunities: Opportunity[],
  deps: DependencyEdge[],
  constraints: Constraint[],
  ctx: CompanyContext,
): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  let stepCounter = 0;

  // Take top opportunities (max 5 to evaluate, output max 3)
  const candidates = opportunities.slice(0, 5);

  for (const opp of candidates) {
    const kind = determineKind(opp, deps, constraints, ctx);
    const unlocks = getUnlocked(opp.id, deps);
    const dependsOn = getDependsOn(opp.id, deps);

    stepCounter++;
    steps.push({
      id: `step_${String(stepCounter).padStart(2, '0')}`,
      title: opp.title,
      kind,
      linked_opportunity_ids: [opp.id],
      depends_on: dependsOn,
      unlocks,
      expected_time_to_value: estimateTimeToValue(opp, ctx),
      confidence: stepConfidence(opp, constraints),
      why: opp.explanation,
    });
  }

  // Sort: prerequisites first, then pilots, then backlog
  const kindOrder: Record<ExecutionStepKind, number> = { prerequisite: 0, pilot: 1, backlog: 2 };
  steps.sort((a, b) => kindOrder[a.kind] - kindOrder[b.kind]);

  // Return max 3 steps
  return steps.slice(0, 3);
}
