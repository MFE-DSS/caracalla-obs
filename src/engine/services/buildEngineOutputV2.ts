import type { RawAuditInput, Confidence } from '../domain/types';
import type { EngineOutputV2 } from '../domain/arbitration';
import { buildEngineOutput } from './buildEngineOutput';
import { normalizeAudit } from './normalizeAudit';
import { assessContext } from './assessContext';
import { evaluateConstraints } from './evaluateConstraints';
import { buildDependencies } from './buildDependencies';
import { buildExecutionPlan } from './buildExecutionPlan';
import { arbitrateNextAction } from './arbitrateNextAction';

/**
 * ENGINE V2 entry point.
 * Wraps ENGINE V1 and adds context, constraints, sequencing, arbitration.
 */
export function buildEngineOutputV2(input: RawAuditInput): EngineOutputV2 {
  // 1. Run ENGINE V1
  const v1 = buildEngineOutput(input);

  // 2. Assess context
  const normalized = normalizeAudit(input);
  const context = assessContext(normalized);

  // 3. Evaluate constraints
  const constraints = evaluateConstraints(context, v1.frictions, v1.opportunities);

  // 4. Build dependencies
  const deps = buildDependencies(v1.opportunities);

  // 5. Build execution plan
  const execution_plan = buildExecutionPlan(v1.opportunities, deps, constraints, context);

  // 6. Arbitrate next action
  const arbitration = arbitrateNextAction(
    v1.opportunities, context, constraints, deps, execution_plan,
  );

  // 7. Compute execution confidence
  const totalPenalty = constraints.reduce((s, c) => s + c.penalty_score, 0);
  let execution_confidence: Confidence = 'high';
  if (totalPenalty > 20) execution_confidence = 'low';
  else if (totalPenalty > 10) execution_confidence = 'medium';

  return {
    ...v1,
    context,
    constraints,
    execution_plan,
    next_best_action: arbitration.next_best_action,
    why_this_first: arbitration.why_this_first,
    blocked_items: arbitration.blocked_items,
    prerequisites: arbitration.prerequisites,
    execution_confidence,
    arbitration_trace: arbitration.arbitration_trace,
  };
}
