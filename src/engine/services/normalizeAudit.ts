import type { RawAuditInput, NormalizedAudit, Signal } from '../domain/types';

/** Synonym → signal mapping */
const SIGNAL_MAP: [RegExp, Signal][] = [
  // Tools
  [/\b(excel|tableur|sheet|google\s*sheet|calc|classeur)\b/i, 'spreadsheet'],
  [/\b(mail|email|outlook|gmail|courrier|messagerie)\b/i, 'email'],
  [/\b(crm|salesforce|hubspot|pipedrive)\b/i, 'crm'],
  [/\b(erp|sap|sage|ebp|cegid|odoo)\b/i, 'erp'],

  // Processes
  [/\b(devis|commande|demande|client|ticket|entrée|réception)\b/i, 'intake'],
  [/\b(copier|ressaisi\w*|retap\w*|double\s*saisie|re-?saisie|recopie)\b/i, 'duplicate_entry'],
  [/\b(reporting|rapport|tableau\s*de\s*bord|kpi|indicateur|bilan)\b/i, 'reporting'],
  [/\b(document|pdf|dossier|fichier|archive|papier|pièce)\b/i, 'document'],
  [/\b(valid|approbation|approuv|signer|accord|visa)\b/i, 'validation'],
  [/\b(planning|planif|dispatch|agenda|calendrier|chantier)\b/i, 'planning'],
  [/\b(relance|suivi|rappel|follow|rattrapage|retard)\b/i, 'followup'],
  [/\b(visibilit|vue\s*d.ensemble|consolid|synth[eè]se|global)\b/i, 'visibility'],
  [/\b(dépend|seul|irremplaçable|absence|concentré|clé)\b/i, 'dependency'],
  [/\b(plusieurs\s*outils|pas\s*connect|pas\s*intégr|silo|dispersé)\b/i, 'multi_tool'],
  [/\b(générer|créer|modèle|template|courrier|contrat)\b/i, 'generation'],
  [/\b(référence|tarif|catalogue|base\s*clients|base\s*produits)\b/i, 'master_data'],
];

/** Industry hint → normalized guess */
const INDUSTRY_MAP: Record<string, string> = {
  'btp / construction': 'BTP',
  'industrie / fabrication': 'Industrie',
  'commerce / négoce': 'Commerce',
  'services aux entreprises': 'Services',
  'transport / logistique': 'Transport',
  'santé / médical': 'Santé',
  'restauration / hôtellerie': 'Restauration',
  'autre': 'Autre',
};

function extractSignals(text: string): Signal[] {
  const found = new Set<Signal>();
  for (const [pattern, signal] of SIGNAL_MAP) {
    if (pattern.test(text)) {
      found.add(signal);
    }
  }
  return Array.from(found);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^\wàâäéèêëïîôùûüÿçæœ'\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export function normalizeAudit(input: RawAuditInput): NormalizedAudit {
  const allText = [input.industry_hint, input.pain_text].join(' ');
  const tokens = tokenize(allText);

  const industryKey = input.industry_hint.toLowerCase().trim();
  const industry_guess = INDUSTRY_MAP[industryKey] ?? input.industry_hint;

  // Extract signals from different fields
  const tool_signals = extractSignals(input.industry_hint + ' ' + input.pain_text);
  const pain_signals = extractSignals(input.pain_text);
  const process_signals = extractSignals(allText);

  return {
    company_name: input.company_name.trim(),
    company_size_band: input.company_size_band,
    industry_guess,
    tokens,
    tool_signals: Array.from(new Set(tool_signals)),
    pain_signals: Array.from(new Set(pain_signals)),
    process_signals: Array.from(new Set(process_signals)),
  };
}
