import type { NormalizedAudit, DetectedArchetype, Confidence, Signal } from '../domain/types';
import { ARCHETYPES } from '../domain/archetypes';

function computeConfidence(matchCount: number): Confidence {
  if (matchCount >= 3) return 'high';
  if (matchCount >= 2) return 'medium';
  return 'low';
}

export function detectArchetypes(audit: NormalizedAudit): DetectedArchetype[] {
  const allSignals = new Set<Signal>([
    ...audit.tool_signals,
    ...audit.pain_signals,
    ...audit.process_signals,
  ]);

  const detected: DetectedArchetype[] = [];

  for (const archetype of ARCHETYPES) {
    const matched: Signal[] = archetype.trigger_signals.filter((s) => allSignals.has(s));
    if (matched.length === 0) continue;

    detected.push({
      archetype_id: archetype.id,
      label: archetype.label,
      confidence: computeConfidence(matched.length),
      matched_signals: matched,
    });
  }

  // Sort by confidence (high first), then by number of matches
  detected.sort((a, b) => {
    const confOrder: Record<Confidence, number> = { high: 3, medium: 2, low: 1 };
    const confDiff = confOrder[b.confidence] - confOrder[a.confidence];
    if (confDiff !== 0) return confDiff;
    return b.matched_signals.length - a.matched_signals.length;
  });

  return detected;
}
