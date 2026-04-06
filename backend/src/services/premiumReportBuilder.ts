import type { EngineOutputV2 } from '../../../src/engine/domain/arbitration.js';
import type {
  PremiumReportViewModel,
  ExecutiveVerdict,
  PremiumOpportunityCard,
  PremiumExecutionStep,
  PrerequisiteItem,
  BlockedItemView,
  AdvisoryCTABlock,
} from '../domain/premiumReport.js';

// ── Labels ─────────────────────────────────────────────

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

const SCORE_LABELS: Record<string, string> = {
  high: 'Élevé',
  medium: 'Modéré',
  low: 'Faible',
};

function scoreLabel(score: number, invert = false): string {
  if (invert) {
    if (score <= 25) return 'Faible';
    if (score <= 45) return 'Modéré';
    return 'Élevé';
  }
  if (score >= 70) return 'Élevé';
  if (score >= 40) return 'Modéré';
  return 'Faible';
}

// ── Verdict ────────────────────────────────────────────

function buildVerdict(output: EngineOutputV2): ExecutiveVerdict {
  const nba = output.next_best_action;
  const level = output.global_level;
  const topFriction = output.frictions[0];

  // Recommended motion
  let recommended_motion = 'structurer';
  if (nba) {
    if (nba.type.includes('automate')) recommended_motion = 'automatiser une étape bornée';
    else if (nba.type.includes('assist')) recommended_motion = 'outiller le travail existant';
    else if (nba.type.includes('structure')) recommended_motion = 'structurer les données';
    else if (nba.type.includes('standardize')) recommended_motion = 'standardiser les process';
  }

  // Dominant theme
  let dominant_theme = 'amélioration opérationnelle';
  if (topFriction) {
    if (['duplicate_entry', 'spreadsheet_dependency'].includes(topFriction.friction_id)) {
      dominant_theme = 'réduction des ressaisies et de la dépendance au tableur';
    } else if (['email_as_workflow', 'manual_followup'].includes(topFriction.friction_id)) {
      dominant_theme = 'structuration du suivi et des relances';
    } else if (['missing_visibility', 'manual_reporting_rebuild'].includes(topFriction.friction_id)) {
      dominant_theme = 'visibilité et pilotage de l\'activité';
    } else if (['document_dispersion', 'slow_information_retrieval'].includes(topFriction.friction_id)) {
      dominant_theme = 'centralisation et accès à l\'information';
    } else if (['non_traceable_validation', 'single_person_dependency'].includes(topFriction.friction_id)) {
      dominant_theme = 'traçabilité et réduction des dépendances';
    }
  }

  // Headline
  let headline: string;
  if (output.global_score >= 60) {
    headline = `Votre organisation est bien structurée. Le principal levier est de ${recommended_motion}.`;
  } else if (output.global_score >= 35) {
    headline = `Votre organisation a de bonnes bases mais repose encore sur des process manuels. La priorité est de ${recommended_motion}.`;
  } else {
    headline = `Votre organisation nécessite une structuration avant d'envisager des automatisations. Commencez par ${recommended_motion}.`;
  }

  // Subheadline
  const subheadline = nba
    ? `Le gain le plus réaliste à court terme : ${nba.title.toLowerCase()}.`
    : 'Plusieurs pistes d\'amélioration ont été identifiées.';

  return {
    headline,
    subheadline,
    recommended_motion,
    dominant_theme,
    time_to_value_hint: nba?.expected_time_to_value ?? 'À évaluer',
    confidence: SCORE_LABELS[output.confidence] ?? output.confidence,
  };
}

// ── Opportunity cards ──────────────────────────────────

function buildOpportunityCard(
  opp: EngineOutputV2['opportunities'][0],
  rank: number,
  output: EngineOutputV2,
): PremiumOpportunityCard {
  const friction = output.frictions.find((f) => opp.linked_frictions.includes(f.friction_id));
  const archetype = output.detected_archetypes.find((a) => a.archetype_id === opp.archetype_id);

  // Build "why now"
  let why_now = opp.explanation;
  if (rank === 1 && output.why_this_first.length > 0) {
    why_now = output.why_this_first.filter((r) => r !== opp.explanation).slice(0, 2).join('. ');
    if (!why_now) why_now = opp.explanation;
  }

  return {
    id: opp.id,
    rank,
    title: opp.title,
    priority_label: TIER_LABELS[opp.tier] ?? opp.tier,
    type_label: TYPE_LABELS[opp.type] ?? opp.type,
    archetype_label: archetype?.label ?? '',
    dominant_friction_label: friction?.label ?? '',
    value_label: scoreLabel(opp.value_score),
    effort_label: scoreLabel(opp.effort_score, true),
    risk_label: scoreLabel(opp.risk_score, true),
    why_it_matters: opp.explanation,
    why_now,
  };
}

// ── Prerequisites ──────────────────────────────────────

function buildPrerequisites(output: EngineOutputV2): PrerequisiteItem[] {
  const items: PrerequisiteItem[] = [];
  const seen = new Set<string>();

  // From execution plan prerequisites
  for (const step of output.execution_plan) {
    if (step.kind === 'prerequisite' && !seen.has(step.title)) {
      seen.add(step.title);
      items.push({ label: step.title, category: 'structuration' });
    }
  }

  // From explicit prerequisites
  for (const p of output.prerequisites) {
    if (!seen.has(p)) {
      seen.add(p);
      items.push({ label: p, category: 'structuration' });
    }
  }

  // From constraints → derive prerequisites
  for (const c of output.constraints) {
    if (c.id === 'weak_data_foundation' && !seen.has('data_foundation')) {
      seen.add('data_foundation');
      items.push({ label: 'Consolider la base de données existante', category: 'données' });
    }
    if (c.id === 'poor_traceability' && !seen.has('traceability')) {
      seen.add('traceability');
      items.push({ label: 'Mettre en place un minimum de traçabilité', category: 'traçabilité' });
    }
    if (c.id === 'low_formalization' && !seen.has('formalization')) {
      seen.add('formalization');
      items.push({ label: 'Clarifier les process clés avant de les outiller', category: 'process' });
    }
  }

  return items;
}

// ── Blocked items ──────────────────────────────────────

function buildBlockedItems(output: EngineOutputV2): BlockedItemView[] {
  return output.blocked_items.map((b) => {
    let unblock_condition = 'Résoudre les prérequis identifiés ci-dessus.';
    if (b.why_blocked.includes('formalisation')) {
      unblock_condition = 'Formaliser les process concernés avant d\'automatiser.';
    } else if (b.why_blocked.includes('données') || b.why_blocked.includes('data')) {
      unblock_condition = 'Structurer les données sources avant de connecter les outils.';
    } else if (b.why_blocked.includes('validation') || b.why_blocked.includes('changement')) {
      unblock_condition = 'Mettre en place un circuit de validation traçable d\'abord.';
    } else if (b.why_blocked.includes('préalable') || b.why_blocked.includes('Dépend')) {
      unblock_condition = 'Compléter l\'action préalable recommandée dans le plan d\'exécution.';
    }

    return {
      title: b.title,
      why_blocked: b.why_blocked,
      unblock_condition,
    };
  });
}

// ── Execution plan ─────────────────────────────────────

function buildExecutionPlan(output: EngineOutputV2): PremiumExecutionStep[] {
  return output.execution_plan.slice(0, 3).map((step, i) => ({
    step_number: i + 1,
    title: step.title,
    kind: step.kind,
    kind_label: KIND_LABELS[step.kind] ?? step.kind,
    why: step.why,
    time_to_value: step.expected_time_to_value,
    unlocks_count: step.unlocks.length,
  }));
}

// ── Advisory CTA ───────────────────────────────────────

function buildAdvisoryCTA(output: EngineOutputV2): AdvisoryCTABlock {
  const nba = output.next_best_action;
  const reasons: string[] = [];

  if (nba) {
    reasons.push(`Cadrer le lancement de : ${nba.title}`);
  }
  if (output.prerequisites.length > 0) {
    reasons.push('Clarifier les prérequis identifiés dans votre diagnostic');
  }
  if (output.execution_plan.length > 1) {
    reasons.push('Définir le séquençage optimal pour votre contexte');
  }
  if (reasons.length === 0) {
    reasons.push('Transformer ce diagnostic en plan d\'action concret');
  }

  return {
    headline: 'Besoin d\'aide pour passer du diagnostic à l\'action ?',
    reasons,
    cta_label: 'Demander un échange de 30 minutes',
  };
}

// ── Decision summary ───────────────────────────────────

function buildDecisionSummary(output: EngineOutputV2): string {
  const parts: string[] = [];

  parts.push(`Score de maturité opérationnelle : ${output.global_score}/100 (${output.global_level}).`);
  parts.push(`${output.frictions.length} point(s) de friction identifié(s).`);
  parts.push(`${output.opportunities.length} piste(s) d'amélioration détectée(s).`);

  if (output.constraints.length > 0) {
    parts.push(`${output.constraints.length} contrainte(s) d'exécution prise(s) en compte.`);
  }

  if (output.next_best_action) {
    parts.push(`Action recommandée en premier : ${output.next_best_action.title}.`);
  }

  return parts.join(' ');
}

// ── Main builder ───────────────────────────────────────

export function buildPremiumReport(output: EngineOutputV2): PremiumReportViewModel {
  const topOpps = output.opportunities.slice(0, 3);

  return {
    executive_verdict: buildVerdict(output),
    decision_summary: buildDecisionSummary(output),
    top_opportunity: topOpps.length > 0 ? buildOpportunityCard(topOpps[0], 1, output) : null,
    priority_board: topOpps.map((opp, i) => buildOpportunityCard(opp, i + 1, output)),
    prerequisites_board: buildPrerequisites(output),
    blocked_items_board: buildBlockedItems(output),
    execution_plan_board: buildExecutionPlan(output),
    advisory_cta_block: buildAdvisoryCTA(output),
  };
}
