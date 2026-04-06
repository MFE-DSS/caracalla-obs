import type { FrictionPattern } from './types';

export const FRICTION_PATTERNS: FrictionPattern[] = [
  {
    id: 'duplicate_entry',
    label: 'Ressaisie de données',
    description: 'Les mêmes informations sont saisies plusieurs fois dans des outils différents, générant des erreurs et du temps perdu.',
    trigger_signals: ['duplicate_entry', 'spreadsheet', 'multi_tool'],
  },
  {
    id: 'email_as_workflow',
    label: 'Email utilisé comme outil de travail',
    description: 'Les emails servent de file d\'attente, de validation ou de suivi de tâches, sans traçabilité structurée.',
    trigger_signals: ['email', 'intake', 'followup'],
  },
  {
    id: 'spreadsheet_dependency',
    label: 'Dépendance forte au tableur',
    description: 'Excel ou Google Sheets est utilisé pour des tâches qui dépassent ses capacités : suivi, reporting, base de données.',
    trigger_signals: ['spreadsheet', 'reporting'],
  },
  {
    id: 'missing_visibility',
    label: 'Manque de visibilité sur l\'activité',
    description: 'Il n\'existe pas de vue consolidée de l\'activité en cours. Le dirigeant reconstitue la situation à partir de plusieurs sources.',
    trigger_signals: ['visibility', 'reporting'],
  },
  {
    id: 'document_dispersion',
    label: 'Documents dispersés',
    description: 'Les documents utiles sont répartis dans plusieurs endroits (emails, dossiers réseau, papier, clés USB) et difficiles à retrouver rapidement.',
    trigger_signals: ['document', 'email'],
  },
  {
    id: 'manual_followup',
    label: 'Relances et suivi manuels',
    description: 'Les relances clients, fournisseurs ou internes dépendent de la mémoire individuelle, sans outil de suivi structuré.',
    trigger_signals: ['followup', 'email'],
  },
  {
    id: 'single_person_dependency',
    label: 'Dépendance à une personne clé',
    description: 'Un process critique dépend d\'une seule personne. En cas d\'absence, l\'activité est bloquée ou dégradée.',
    trigger_signals: ['dependency', 'planning'],
  },
  {
    id: 'non_traceable_validation',
    label: 'Validation sans traçabilité',
    description: 'Les validations passent par des échanges informels (oral, email) sans circuit ni trace exploitable.',
    trigger_signals: ['validation', 'email'],
  },
  {
    id: 'slow_information_retrieval',
    label: 'Recherche d\'information lente',
    description: 'Retrouver une information (prix, historique client, document) prend un temps disproportionné par rapport à la tâche.',
    trigger_signals: ['document', 'spreadsheet'],
  },
  {
    id: 'manual_reporting_rebuild',
    label: 'Reporting reconstruit manuellement',
    description: 'Les tableaux de bord et indicateurs sont reconstruits à la main à chaque période, à partir de données dispersées.',
    trigger_signals: ['reporting', 'spreadsheet'],
  },
];
