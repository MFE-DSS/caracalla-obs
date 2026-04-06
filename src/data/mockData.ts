/* CARACALLA — Mock Data
 * Données crédibles alignées sur le profil PME BTP / menuiserie décrit dans UX_00.
 * Ces mocks seront remplacés par les résultats du moteur de scoring réel.
 */

export interface Friction {
  id: string;
  title: string;
  explanation: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: 'low' | 'medium' | 'high';
}

export interface Evidence {
  text: string;
  source: string;
}

export interface Opportunity {
  id: string;
  title: string;
  friction: string;
  expectedValue: string;
  feasibility: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  reasoning: string;
}

export interface ScoreData {
  label: string;
  value: number;
  explanation: string;
  factors: { label: string; impact: 'positive' | 'negative'; detail: string }[];
}

export const mockFrictions: Friction[] = [
  {
    id: 'f1',
    title: 'Ressaisie systématique des devis',
    explanation:
      'Chaque devis est saisi manuellement dans Excel, puis ressaisi dans le logiciel de facturation. Ce double travail consomme environ 5 heures par semaine et génère des erreurs de transcription.',
    source: 'Déclaré pendant l\'audit — étapes "Commercial" et "Administration"',
    severity: 'critical',
    confidence: 'high',
  },
  {
    id: 'f2',
    title: 'Relances clients non suivies',
    explanation:
      'Les devis envoyés ne font l\'objet d\'aucun suivi structuré. Les relances dépendent de la mémoire individuelle, ce qui entraîne des oublis et des pertes de chiffre d\'affaires.',
    source: 'Déclaré pendant l\'audit — étape "Commercial"',
    severity: 'high',
    confidence: 'high',
  },
  {
    id: 'f3',
    title: 'Absence de tableau de bord d\'activité',
    explanation:
      'Il n\'existe pas de vue consolidée de l\'activité en cours. Le dirigeant reconstitue la situation à partir de plusieurs sources (cahier, emails, fichiers), ce qui prend du temps et reste approximatif.',
    source: 'Déclaré pendant l\'audit — étape "Pilotage"',
    severity: 'high',
    confidence: 'medium',
  },
  {
    id: 'f4',
    title: 'Dépendance à une personne clé pour le planning',
    explanation:
      'L\'organisation des chantiers repose sur une seule personne. En cas d\'absence, l\'équipe ne sait pas quelles sont les priorités du jour.',
    source: 'Déclaré pendant l\'audit — étapes "Production" et "Équipes"',
    severity: 'medium',
    confidence: 'medium',
  },
];

export const mockScore: ScoreData = {
  label: 'Maturité opérationnelle',
  value: 42,
  explanation:
    'Votre entreprise dispose de bases solides (équipe stable, volume d\'activité régulier) mais repose encore largement sur des process manuels et des outils non connectés. Le potentiel d\'amélioration est significatif.',
  factors: [
    { label: 'Activité commerciale structurée', impact: 'positive', detail: 'Volume de devis régulier, clientèle identifiée' },
    { label: 'Équipe stable', impact: 'positive', detail: 'Faible turnover, compétences métier en place' },
    { label: 'Ressaisie généralisée', impact: 'negative', detail: 'Pas de connexion entre les outils de devis et de facturation' },
    { label: 'Pilotage à vue', impact: 'negative', detail: 'Pas de tableau de bord, décisions basées sur l\'intuition' },
    { label: 'Suivi client absent', impact: 'negative', detail: 'Pas de relance structurée, pas de CRM' },
  ],
};

export const mockEvidences: Evidence[] = [
  { text: 'Devis réalisés sous Excel, facturation sous EBP Bâtiment', source: 'Réponse audit — étape Commercial' },
  { text: '60 devis par mois, chacun ressaisi manuellement', source: 'Réponse audit — étape Administration' },
  { text: 'Aucun outil de suivi des relances en place', source: 'Réponse audit — étape Commercial' },
  { text: 'Le planning chantier est dans la tête du conducteur de travaux', source: 'Réponse audit — étape Production' },
];

export const mockConfidence = {
  level: 'medium' as const,
  message:
    'Ce diagnostic repose sur vos déclarations. Il n\'a pas été corroboré par une analyse de vos outils ou de vos données réelles. La fiabilité est bonne sur les frictions déclarées, plus incertaine sur les estimations de temps.',
  missingData: [
    'Accès aux outils réels (Excel, EBP) non effectué',
    'Données RH non renseignées en détail',
    'Volume financier non communiqué',
  ],
};

export const mockOpportunity: Opportunity = {
  id: 'o1',
  title: 'Automatiser la chaîne devis → facture',
  friction: 'Ressaisie systématique des devis',
  expectedValue: '~5h par semaine récupérées, réduction des erreurs de transcription',
  feasibility: 'high',
  risk: 'low',
  reasoning:
    'Vous ressaisissez 60 devis par mois d\'Excel vers EBP. Un outil intégré (type Obat, Batappli, ou Pennylane + module bâtiment) supprimerait cette étape et fiabiliserait la facturation.',
};

export const mockPremiumValue = {
  gratuit: [
    'Synthèse des frictions principales',
    'Score de maturité global',
    '1 piste d\'amélioration prioritaire',
    'Niveau de confiance du diagnostic',
  ],
  premium: [
    'Toutes les opportunités classées par impact et faisabilité',
    'Coûts estimés et prérequis pour chaque amélioration',
    'Risques identifiés avec stratégies de mitigation',
    'Plan pilote concret : périmètre, durée, budget',
    'Recommandation outillage adaptée à votre secteur',
  ],
  conseil: [
    'Cadrage du projet pilote avec un expert',
    'Sélection et mise en place de l\'outil adapté',
    'Formation de votre équipe',
    'Suivi des résultats sur 3 mois',
  ],
};

export const mockCompanyProfile = {
  sector: 'Menuiserie / BTP',
  size: '22 salariés',
  location: 'Gironde',
  activity: 'B2B, marchés publics et privés',
  volume: '~60 devis/mois',
  tools: 'Excel + EBP Bâtiment',
};
