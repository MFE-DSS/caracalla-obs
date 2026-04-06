import type { RawAuditInput, EngineOutput, Confidence } from '../domain/types';
import { normalizeAudit } from './normalizeAudit';
import { detectArchetypes } from './detectArchetypes';
import { mapFrictions } from './mapFrictions';
import { generateOpportunities } from './generateOpportunities';
import { rankOpportunities } from './rankOpportunities';

function computeGlobalScore(
  frictionCount: number,
  topOpportunityScore: number,
  archetypeCount: number,
): number {
  // Base score: 50 (neutral)
  // Penalize: more frictions = lower score
  // Boost: having clear opportunities = system found actionable paths
  // More archetypes detected = more patterns found = slightly lower
  let score = 50;
  score -= Math.min(frictionCount * 5, 25); // -5 per friction, max -25
  score += Math.min(topOpportunityScore > 60 ? 10 : 0, 10); // +10 if strong opportunity exists
  score -= Math.min(archetypeCount * 2, 10); // -2 per archetype, max -10
  return Math.max(10, Math.min(90, score));
}

function computeGlobalLevel(score: number): string {
  if (score >= 70) return 'Avancé';
  if (score >= 40) return 'Intermédiaire';
  return 'À structurer';
}

function computeConfidence(
  frictionCount: number,
  archetypeCount: number,
): Confidence {
  const totalSignals = frictionCount + archetypeCount;
  if (totalSignals >= 5) return 'high';
  if (totalSignals >= 3) return 'medium';
  return 'low';
}

function buildReasonTrace(
  normalized: ReturnType<typeof normalizeAudit>,
  archetypes: ReturnType<typeof detectArchetypes>,
  frictions: ReturnType<typeof mapFrictions>,
): string[] {
  const traces: string[] = [];

  if (archetypes.length > 0) {
    traces.push(`${archetypes.length} forme(s) de travail identifiée(s) : ${archetypes.map((a) => a.label).join(', ')}`);
  }

  if (frictions.length > 0) {
    traces.push(`${frictions.length} point(s) de friction détecté(s)`);
    const highSeverity = frictions.filter((f) => f.severity === 'critical' || f.severity === 'high');
    if (highSeverity.length > 0) {
      traces.push(`Dont ${highSeverity.length} à impact fort : ${highSeverity.map((f) => f.label).join(', ')}`);
    }
  }

  if (normalized.tool_signals.length > 0) {
    const tools = normalized.tool_signals.filter((s) => ['spreadsheet', 'email', 'crm', 'erp'].includes(s));
    if (tools.length > 0) {
      traces.push(`Outils détectés dans vos réponses : ${tools.join(', ')}`);
    }
  }

  if (normalized.pain_signals.length > 0) {
    traces.push(`Signaux de douleur identifiés : ${normalized.pain_signals.length}`);
  }

  return traces;
}

/**
 * Main engine entry point.
 * Takes raw audit input and produces the full engine output.
 */
export function buildEngineOutput(input: RawAuditInput): EngineOutput {
  // 1. Normalize
  const normalized = normalizeAudit(input);

  // 2. Detect archetypes
  const archetypes = detectArchetypes(normalized);

  // 3. Map frictions
  const frictions = mapFrictions(normalized, archetypes);

  // 4. Generate opportunities
  const rawOpportunities = generateOpportunities(archetypes, frictions);

  // 5. Rank opportunities
  const opportunities = rankOpportunities(rawOpportunities);

  // 6. Compute global score
  const topScore = opportunities.length > 0 ? opportunities[0].priority_score : 0;
  const globalScore = computeGlobalScore(frictions.length, topScore, archetypes.length);

  // 7. Build output
  return {
    company_name: normalized.company_name,
    company_size_band: normalized.company_size_band,
    industry_guess: normalized.industry_guess,
    global_score: globalScore,
    global_level: computeGlobalLevel(globalScore),
    confidence: computeConfidence(frictions.length, archetypes.length),
    reason_trace: buildReasonTrace(normalized, archetypes, frictions),
    detected_archetypes: archetypes,
    frictions,
    opportunities,
  };
}
