/* Local premium report builder — mirrors backend/src/services/premiumReportBuilder.ts
 * Used when the frontend computes locally (fallback mode).
 */

import type { EngineOutputV2 } from '../engine/domain/arbitration';
import type { PremiumReportViewModel, PremiumOpportunityCard, PremiumExecutionStep, PrerequisiteItem, BlockedItemView, ExecutiveVerdict, AdvisoryCTABlock } from '../types/premiumReport';

const TYPE_LABELS: Record<string, string> = {
  standardize_first: 'Standardiser',
  structure_data_first: 'Structurer les données',
  assist_human_work: 'Outiller le travail',
  automate_bounded_step: 'Automatiser une étape',
  partial_workflow_automation: 'Automatiser un flux',
};

const TIER_LABELS: Record<string, string> = {
  top_candidate: 'Priorité haute',
  candidate: 'Priorité moyenne',
  backlog: 'À planifier',
  not_now: 'Pas maintenant',
};

const KIND_LABELS: Record<string, string> = {
  prerequisite: 'Prérequis',
  pilot: 'Projet pilote',
  backlog: 'À planifier ensuite',
};

function scoreLabel(score: number, invert = false): string {
  if (invert) return score <= 25 ? 'Faible' : score <= 45 ? 'Modéré' : 'Élevé';
  return score >= 70 ? 'Élevé' : score >= 40 ? 'Modéré' : 'Faible';
}

function confLabel(c: string): string {
  return c === 'high' ? 'Élevé' : c === 'medium' ? 'Modéré' : 'Faible';
}

export function buildLocalPremiumReport(output: EngineOutputV2): PremiumReportViewModel {
  const nba = output.next_best_action;
  const topFriction = output.frictions[0];

  let recommended_motion = 'structurer';
  if (nba) {
    if (nba.type.includes('automate')) recommended_motion = 'automatiser une étape bornée';
    else if (nba.type.includes('assist')) recommended_motion = 'outiller le travail existant';
    else if (nba.type.includes('structure')) recommended_motion = 'structurer les données';
    else if (nba.type.includes('standardize')) recommended_motion = 'standardiser les process';
  }

  let dominant_theme = 'amélioration opérationnelle';
  if (topFriction) {
    if (['duplicate_entry', 'spreadsheet_dependency'].includes(topFriction.friction_id)) dominant_theme = 'réduction des ressaisies et de la dépendance au tableur';
    else if (['email_as_workflow', 'manual_followup'].includes(topFriction.friction_id)) dominant_theme = 'structuration du suivi et des relances';
    else if (['missing_visibility', 'manual_reporting_rebuild'].includes(topFriction.friction_id)) dominant_theme = 'visibilité et pilotage de l\'activité';
    else if (['document_dispersion', 'slow_information_retrieval'].includes(topFriction.friction_id)) dominant_theme = 'centralisation et accès à l\'information';
    else if (['non_traceable_validation', 'single_person_dependency'].includes(topFriction.friction_id)) dominant_theme = 'traçabilité et réduction des dépendances';
  }

  const headline = output.global_score >= 60
    ? `Votre organisation est bien structurée. Le principal levier est de ${recommended_motion}.`
    : output.global_score >= 35
    ? `Votre organisation a de bonnes bases mais repose encore sur des process manuels. La priorité est de ${recommended_motion}.`
    : `Votre organisation nécessite une structuration avant d'envisager des automatisations. Commencez par ${recommended_motion}.`;

  const verdict: ExecutiveVerdict = {
    headline,
    subheadline: nba ? `Le gain le plus réaliste à court terme : ${nba.title.toLowerCase()}.` : 'Plusieurs pistes d\'amélioration ont été identifiées.',
    recommended_motion,
    dominant_theme,
    time_to_value_hint: nba?.expected_time_to_value ?? 'À évaluer',
    confidence: confLabel(output.confidence),
  };

  const topOpps = output.opportunities.slice(0, 3);
  const priority_board: PremiumOpportunityCard[] = topOpps.map((opp, i) => {
    const friction = output.frictions.find((f) => opp.linked_frictions.includes(f.friction_id));
    const archetype = output.detected_archetypes.find((a) => a.archetype_id === opp.archetype_id);
    return {
      id: opp.id,
      rank: i + 1,
      title: opp.title,
      priority_label: TIER_LABELS[opp.tier] ?? opp.tier,
      type_label: TYPE_LABELS[opp.type] ?? opp.type,
      archetype_label: archetype?.label ?? '',
      dominant_friction_label: friction?.label ?? '',
      value_label: scoreLabel(opp.value_score),
      effort_label: scoreLabel(opp.effort_score, true),
      risk_label: scoreLabel(opp.risk_score, true),
      why_it_matters: opp.explanation,
      why_now: i === 0 && output.why_this_first.length > 0
        ? output.why_this_first.filter((r) => r !== opp.explanation).slice(0, 2).join('. ') || opp.explanation
        : opp.explanation,
    };
  });

  const prerequisites_board: PrerequisiteItem[] = [];
  const seen = new Set<string>();
  for (const step of output.execution_plan) {
    if (step.kind === 'prerequisite' && !seen.has(step.title)) {
      seen.add(step.title);
      prerequisites_board.push({ label: step.title, category: 'structuration' });
    }
  }
  for (const p of output.prerequisites) {
    if (!seen.has(p)) { seen.add(p); prerequisites_board.push({ label: p, category: 'structuration' }); }
  }
  for (const c of output.constraints) {
    if (c.id === 'weak_data_foundation' && !seen.has('data_foundation')) { seen.add('data_foundation'); prerequisites_board.push({ label: 'Consolider la base de données existante', category: 'données' }); }
    if (c.id === 'poor_traceability' && !seen.has('traceability')) { seen.add('traceability'); prerequisites_board.push({ label: 'Mettre en place un minimum de traçabilité', category: 'traçabilité' }); }
    if (c.id === 'low_formalization' && !seen.has('formalization')) { seen.add('formalization'); prerequisites_board.push({ label: 'Clarifier les process clés avant de les outiller', category: 'process' }); }
  }

  const blocked_items_board: BlockedItemView[] = output.blocked_items.map((b) => ({
    title: b.title,
    why_blocked: b.why_blocked,
    unblock_condition: b.why_blocked.includes('formalisation') ? 'Formaliser les process concernés avant d\'automatiser.'
      : b.why_blocked.includes('préalable') || b.why_blocked.includes('Dépend') ? 'Compléter l\'action préalable recommandée.'
      : 'Résoudre les prérequis identifiés ci-dessus.',
  }));

  const execution_plan_board: PremiumExecutionStep[] = output.execution_plan.slice(0, 3).map((step, i) => ({
    step_number: i + 1,
    title: step.title,
    kind: step.kind,
    kind_label: KIND_LABELS[step.kind] ?? step.kind,
    why: step.why,
    time_to_value: step.expected_time_to_value,
    unlocks_count: step.unlocks.length,
  }));

  const reasons: string[] = [];
  if (nba) reasons.push(`Cadrer le lancement de : ${nba.title}`);
  if (output.prerequisites.length > 0) reasons.push('Clarifier les prérequis identifiés dans votre diagnostic');
  if (output.execution_plan.length > 1) reasons.push('Définir le séquençage optimal pour votre contexte');
  if (reasons.length === 0) reasons.push('Transformer ce diagnostic en plan d\'action concret');

  const advisory_cta_block: AdvisoryCTABlock = {
    headline: 'Besoin d\'aide pour passer du diagnostic à l\'action ?',
    reasons,
    cta_label: 'Demander un échange de 30 minutes',
  };

  const decision_summary = [
    `Score de maturité opérationnelle : ${output.global_score}/100 (${output.global_level}).`,
    `${output.frictions.length} point(s) de friction identifié(s).`,
    `${output.opportunities.length} piste(s) d'amélioration détectée(s).`,
    output.constraints.length > 0 ? `${output.constraints.length} contrainte(s) d'exécution prise(s) en compte.` : '',
    nba ? `Action recommandée en premier : ${nba.title}.` : '',
  ].filter(Boolean).join(' ');

  return {
    executive_verdict: verdict,
    decision_summary,
    top_opportunity: priority_board[0] ?? null,
    priority_board,
    prerequisites_board,
    blocked_items_board,
    execution_plan_board,
    advisory_cta_block,
  };
}
