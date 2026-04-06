import type { OpportunityType, ArchetypeId, FrictionPatternId } from './types';

export interface OpportunityTemplate {
  type: OpportunityType;
  title_template: string;
  base_value: number;
  base_feasibility: number;
  base_effort: number;
  base_risk: number;
}

/** Maps friction → archetype context → opportunity templates */
export interface OpportunityRule {
  friction_id: FrictionPatternId;
  archetype_id: ArchetypeId;
  opportunity_type: OpportunityType;
  title: string;
  value: number;
  feasibility: number;
  effort: number;
  risk: number;
  explanation_template: string;
}

export const OPPORTUNITY_RULES: OpportunityRule[] = [
  // manual_intake
  {
    friction_id: 'email_as_workflow',
    archetype_id: 'manual_intake',
    opportunity_type: 'structure_data_first',
    title: 'Structurer le suivi des demandes entrantes',
    value: 80, feasibility: 75, effort: 35, risk: 15,
    explanation_template: 'Les demandes arrivent par email sans suivi centralisé. Structurer ce flux permettrait de ne plus en perdre.',
  },
  {
    friction_id: 'duplicate_entry',
    archetype_id: 'manual_intake',
    opportunity_type: 'automate_bounded_step',
    title: 'Supprimer la ressaisie entre prise de demande et traitement',
    value: 75, feasibility: 70, effort: 40, risk: 15,
    explanation_template: 'La même information est saisie plusieurs fois entre la demande et son traitement.',
  },
  {
    friction_id: 'duplicate_entry',
    archetype_id: 'data_reentry',
    opportunity_type: 'automate_bounded_step',
    title: 'Réduire les ressaisies entre outils',
    value: 80, feasibility: 70, effort: 35, risk: 15,
    explanation_template: 'Les mêmes données sont saisies dans plusieurs outils. Un lien entre eux supprimerait cette étape.',
  },
  // manual_reporting
  {
    friction_id: 'manual_reporting_rebuild',
    archetype_id: 'manual_reporting',
    opportunity_type: 'structure_data_first',
    title: 'Fiabiliser le reporting reconstruit manuellement',
    value: 85, feasibility: 75, effort: 30, risk: 10,
    explanation_template: 'Le reporting est fréquent, manuel et dépend d\'un tableur. Structurer les données sources le rendrait automatique.',
  },
  {
    friction_id: 'spreadsheet_dependency',
    archetype_id: 'manual_reporting',
    opportunity_type: 'structure_data_first',
    title: 'Remplacer le tableur de reporting par une source fiable',
    value: 70, feasibility: 65, effort: 40, risk: 20,
    explanation_template: 'Le tableur est la source unique de reporting. Un outil dédié réduirait les erreurs et le temps de reconstruction.',
  },
  // document_chasing
  {
    friction_id: 'document_dispersion',
    archetype_id: 'document_chasing',
    opportunity_type: 'structure_data_first',
    title: 'Centraliser les documents utiles au traitement',
    value: 70, feasibility: 80, effort: 25, risk: 10,
    explanation_template: 'Les documents sont dispersés entre emails, dossiers et papier. Les centraliser réduirait le temps de recherche.',
  },
  {
    friction_id: 'slow_information_retrieval',
    archetype_id: 'document_chasing',
    opportunity_type: 'standardize_first',
    title: 'Standardiser le classement des documents',
    value: 60, feasibility: 85, effort: 20, risk: 5,
    explanation_template: 'Retrouver un document prend trop de temps. Un classement standard accélérerait l\'accès.',
  },
  // multi_tool_coordination
  {
    friction_id: 'duplicate_entry',
    archetype_id: 'multi_tool_coordination',
    opportunity_type: 'partial_workflow_automation',
    title: 'Connecter les outils pour supprimer les transferts manuels',
    value: 80, feasibility: 60, effort: 50, risk: 25,
    explanation_template: 'Plusieurs outils non connectés nécessitent des transferts manuels. Les relier supprimerait ces étapes.',
  },
  {
    friction_id: 'spreadsheet_dependency',
    archetype_id: 'multi_tool_coordination',
    opportunity_type: 'structure_data_first',
    title: 'Réduire la dépendance au tableur de coordination',
    value: 65, feasibility: 65, effort: 40, risk: 20,
    explanation_template: 'Le tableur sert de hub entre les outils. Un outil central remplacerait ce rôle fragile.',
  },
  // manual_validation
  {
    friction_id: 'non_traceable_validation',
    archetype_id: 'manual_validation',
    opportunity_type: 'partial_workflow_automation',
    title: 'Mettre en place un circuit de validation traçable',
    value: 75, feasibility: 70, effort: 35, risk: 15,
    explanation_template: 'Les validations passent par email ou oral sans trace. Un circuit simple permettrait de suivre et d\'auditer.',
  },
  {
    friction_id: 'email_as_workflow',
    archetype_id: 'manual_validation',
    opportunity_type: 'assist_human_work',
    title: 'Outiller les validations récurrentes',
    value: 65, feasibility: 75, effort: 30, risk: 10,
    explanation_template: 'Les validations récurrentes sont gérées par email. Un outil dédié accélérerait le circuit.',
  },
  // exception_followup
  {
    friction_id: 'manual_followup',
    archetype_id: 'exception_followup',
    opportunity_type: 'assist_human_work',
    title: 'Automatiser les rappels et relances',
    value: 70, feasibility: 80, effort: 25, risk: 10,
    explanation_template: 'Les relances dépendent de la mémoire. Des rappels automatiques réduiraient les oublis.',
  },
  {
    friction_id: 'single_person_dependency',
    archetype_id: 'exception_followup',
    opportunity_type: 'standardize_first',
    title: 'Documenter le processus de suivi des exceptions',
    value: 55, feasibility: 85, effort: 20, risk: 5,
    explanation_template: 'Le suivi des exceptions dépend d\'une personne. Documenter le processus réduirait le risque.',
  },
  // planning_dispatch
  {
    friction_id: 'single_person_dependency',
    archetype_id: 'planning_dispatch',
    opportunity_type: 'assist_human_work',
    title: 'Outiller la planification pour la rendre partageable',
    value: 75, feasibility: 70, effort: 35, risk: 15,
    explanation_template: 'La planification repose sur une seule personne. Un outil partagé réduirait la dépendance.',
  },
  {
    friction_id: 'missing_visibility',
    archetype_id: 'planning_dispatch',
    opportunity_type: 'standardize_first',
    title: 'Rendre le planning visible à toute l\'équipe',
    value: 65, feasibility: 80, effort: 25, risk: 10,
    explanation_template: 'L\'équipe n\'a pas de visibilité sur le planning. Le partager améliorerait la coordination.',
  },
  // document_generation
  {
    friction_id: 'duplicate_entry',
    archetype_id: 'document_generation',
    opportunity_type: 'automate_bounded_step',
    title: 'Automatiser la génération de documents récurrents',
    value: 75, feasibility: 75, effort: 30, risk: 10,
    explanation_template: 'Les documents sont créés manuellement à chaque fois. Des modèles ou un outil dédié gagneraient du temps.',
  },
  {
    friction_id: 'slow_information_retrieval',
    archetype_id: 'document_generation',
    opportunity_type: 'standardize_first',
    title: 'Standardiser les modèles de documents',
    value: 55, feasibility: 90, effort: 15, risk: 5,
    explanation_template: 'Les documents sont créés sans modèle fixe. Standardiser les modèles accélérerait la production.',
  },
  // master_data_update
  {
    friction_id: 'duplicate_entry',
    archetype_id: 'master_data_update',
    opportunity_type: 'structure_data_first',
    title: 'Centraliser les données de référence (clients, produits, tarifs)',
    value: 80, feasibility: 70, effort: 40, risk: 15,
    explanation_template: 'Les données de référence sont maintenues à plusieurs endroits. Les centraliser supprimerait les incohérences.',
  },
  {
    friction_id: 'spreadsheet_dependency',
    archetype_id: 'master_data_update',
    opportunity_type: 'structure_data_first',
    title: 'Sortir les données de référence du tableur',
    value: 65, feasibility: 65, effort: 35, risk: 20,
    explanation_template: 'Le tableur sert de base de données de référence. Un outil dédié serait plus fiable et partageable.',
  },
];
