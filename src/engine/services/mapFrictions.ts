import type {
  NormalizedAudit,
  DetectedArchetype,
  DetectedFriction,
  FrictionPatternId,
  Confidence,
  Signal,
  Severity,
} from '../domain/types';
import { FRICTION_PATTERNS } from '../domain/frictions';
import { ARCHETYPES } from '../domain/archetypes';

function computeSeverity(signalCount: number, archetypeCount: number): Severity {
  const total = signalCount + archetypeCount;
  if (total >= 4) return 'critical';
  if (total >= 3) return 'high';
  if (total >= 2) return 'medium';
  return 'low';
}

function computeConfidence(signalCount: number): Confidence {
  if (signalCount >= 3) return 'high';
  if (signalCount >= 2) return 'medium';
  return 'low';
}

const SIGNAL_LABELS: Record<string, string> = {
  spreadsheet: 'Tableur détecté (Excel ou similaire)',
  email: 'Email utilisé comme outil de travail',
  intake: 'Traitement de demandes entrantes identifié',
  duplicate_entry: 'Ressaisie de données détectée',
  reporting: 'Activité de reporting identifiée',
  document: 'Manipulation de documents détectée',
  validation: 'Process de validation identifié',
  planning: 'Activité de planification identifiée',
  followup: 'Besoin de relances/suivi détecté',
  visibility: 'Manque de visibilité signalé',
  dependency: 'Dépendance à une personne détectée',
  multi_tool: 'Outils multiples non connectés',
  generation: 'Génération de documents identifiée',
  master_data: 'Données de référence à maintenir',
};

function buildEvidence(matchedSignals: Signal[], matchedArchetypes: string[]): string[] {
  const evidence: string[] = [];
  for (const s of matchedSignals) {
    if (SIGNAL_LABELS[s]) evidence.push(SIGNAL_LABELS[s]);
  }
  for (const a of matchedArchetypes) {
    evidence.push(`Archétype associé : ${a}`);
  }
  return evidence;
}

export function mapFrictions(
  audit: NormalizedAudit,
  detectedArchetypes: DetectedArchetype[],
): DetectedFriction[] {
  const allSignals = new Set<Signal>([
    ...audit.tool_signals,
    ...audit.pain_signals,
    ...audit.process_signals,
  ]);

  // Collect frictions declared by detected archetypes
  const archetypeFrictions = new Set<FrictionPatternId>();
  const archetypeLabels = new Map<FrictionPatternId, string[]>();

  for (const da of detectedArchetypes) {
    const def = ARCHETYPES.find((a) => a.id === da.archetype_id);
    if (!def) continue;
    for (const fId of def.common_frictions) {
      archetypeFrictions.add(fId);
      if (!archetypeLabels.has(fId)) archetypeLabels.set(fId, []);
      archetypeLabels.get(fId)!.push(da.label);
    }
  }

  const detected: DetectedFriction[] = [];
  const seen = new Set<FrictionPatternId>();

  for (const pattern of FRICTION_PATTERNS) {
    const matchedSignals = pattern.trigger_signals.filter((s) => allSignals.has(s));
    const fromArchetype = archetypeFrictions.has(pattern.id);

    if (matchedSignals.length === 0 && !fromArchetype) continue;
    if (seen.has(pattern.id)) continue;
    seen.add(pattern.id);

    const archetypeNames = archetypeLabels.get(pattern.id) ?? [];

    detected.push({
      friction_id: pattern.id,
      label: pattern.label,
      description: pattern.description,
      severity: computeSeverity(matchedSignals.length, fromArchetype ? 1 : 0),
      confidence: computeConfidence(matchedSignals.length + (fromArchetype ? 1 : 0)),
      evidence: buildEvidence(matchedSignals, archetypeNames),
    });
  }

  // Sort by severity descending
  const severityOrder: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  detected.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

  return detected;
}
