import type { DetectedFriction, FrictionPatternId, Opportunity } from '../domain/types';
import type { CompanyContext } from '../domain/context';
import type { Constraint, ConstraintType } from '../domain/constraints';

interface ConstraintRule {
  id: string;
  type: ConstraintType;
  label: string;
  check: (ctx: CompanyContext, frictions: DetectedFriction[], opps: Opportunity[]) => { fires: boolean; evidence: string[] };
  penalty: number;
}

const CONSTRAINT_RULES: ConstraintRule[] = [
  {
    id: 'low_formalization',
    type: 'organizational',
    label: 'Faible formalisation des process',
    check: (ctx) => ({
      fires: ctx.process_formalization_level === 'low',
      evidence: ['Niveau de formalisation détecté : faible'],
    }),
    penalty: 10,
  },
  {
    id: 'weak_data_foundation',
    type: 'data',
    label: 'Fondation de données fragile',
    check: (ctx, frictions) => {
      const has = (id: FrictionPatternId) => frictions.some((f) => f.friction_id === id);
      const fires = ctx.data_readiness === 'low' || (has('spreadsheet_dependency') && has('missing_visibility'));
      const evidence: string[] = [];
      if (ctx.data_readiness === 'low') evidence.push('Préparation des données : faible');
      if (has('spreadsheet_dependency')) evidence.push('Dépendance tableur détectée');
      if (has('missing_visibility')) evidence.push('Manque de visibilité détecté');
      return { fires, evidence };
    },
    penalty: 8,
  },
  {
    id: 'single_person_dependency',
    type: 'human',
    label: 'Dépendance à une personne clé',
    check: (_ctx, frictions) => {
      const has = frictions.some((f) => f.friction_id === 'single_person_dependency');
      return { fires: has, evidence: has ? ['Friction personne clé détectée'] : [] };
    },
    penalty: 6,
  },
  {
    id: 'multi_tool_fragility',
    type: 'technical',
    label: 'Fragilité multi-outils',
    check: (ctx, frictions) => {
      const has = frictions.some((f) => f.friction_id === 'duplicate_entry') && ctx.tooling_maturity === 'low';
      return { fires: has, evidence: has ? ['Ressaisie + outillage faible'] : [] };
    },
    penalty: 6,
  },
  {
    id: 'validation_change_risk',
    type: 'organizational',
    label: 'Risque de changement sur les validations',
    check: (_ctx, frictions, opps) => {
      const hasValidationFriction = frictions.some((f) => f.friction_id === 'non_traceable_validation');
      const hasWorkflowOpp = opps.some((o) => o.type === 'partial_workflow_automation');
      const fires = hasValidationFriction && hasWorkflowOpp;
      return { fires, evidence: fires ? ['Automatisation de validation sur process non traçable'] : [] };
    },
    penalty: 8,
  },
  {
    id: 'poor_traceability',
    type: 'data',
    label: 'Traçabilité insuffisante',
    check: (_ctx, frictions) => {
      const count = frictions.filter((f) =>
        ['non_traceable_validation', 'email_as_workflow'].includes(f.friction_id),
      ).length;
      return { fires: count >= 2, evidence: count >= 2 ? ['Validation non traçable + email comme workflow'] : [] };
    },
    penalty: 6,
  },
  {
    id: 'high_coordination_load',
    type: 'organizational',
    label: 'Charge de coordination élevée',
    check: (ctx) => {
      const fires = ctx.organization_complexity === 'high' && ctx.process_formalization_level !== 'high';
      return { fires, evidence: fires ? ['Organisation complexe avec faible formalisation'] : [] };
    },
    penalty: 8,
  },
];

export function evaluateConstraints(
  ctx: CompanyContext,
  frictions: DetectedFriction[],
  opportunities: Opportunity[],
): Constraint[] {
  const constraints: Constraint[] = [];

  for (const rule of CONSTRAINT_RULES) {
    const { fires, evidence } = rule.check(ctx, frictions, opportunities);
    if (!fires) continue;

    constraints.push({
      id: rule.id,
      type: rule.type,
      label: rule.label,
      severity: rule.penalty >= 8 ? 'high' : rule.penalty >= 6 ? 'medium' : 'low',
      evidence,
      penalty_score: rule.penalty,
    });
  }

  return constraints.sort((a, b) => b.penalty_score - a.penalty_score);
}
