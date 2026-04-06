import type {
  DetectedArchetype,
  DetectedFriction,
  Opportunity,
  FrictionPatternId,
  ArchetypeId,
} from '../domain/types';
import { OPPORTUNITY_RULES } from '../domain/opportunities';

let idCounter = 0;
function nextId(): string {
  idCounter++;
  return `opp_${String(idCounter).padStart(3, '0')}`;
}

export function resetIdCounter(): void {
  idCounter = 0;
}

export function generateOpportunities(
  detectedArchetypes: DetectedArchetype[],
  detectedFrictions: DetectedFriction[],
): Opportunity[] {
  resetIdCounter();

  const frictionIds = new Set<FrictionPatternId>(detectedFrictions.map((f) => f.friction_id));
  const archetypeIds = new Set<ArchetypeId>(detectedArchetypes.map((a) => a.archetype_id));

  const opportunities: Opportunity[] = [];
  const seenKeys = new Set<string>();

  for (const rule of OPPORTUNITY_RULES) {
    // Rule fires if both friction and archetype are detected
    if (!frictionIds.has(rule.friction_id)) continue;
    if (!archetypeIds.has(rule.archetype_id)) continue;

    // Deduplicate by title
    const key = `${rule.archetype_id}:${rule.friction_id}:${rule.opportunity_type}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    const priority_score = Math.round(
      0.35 * rule.value +
      0.30 * rule.feasibility -
      0.20 * rule.effort -
      0.15 * rule.risk,
    );

    let tier: Opportunity['tier'];
    if (priority_score >= 43) tier = 'top_candidate';
    else if (priority_score >= 33) tier = 'candidate';
    else if (priority_score >= 20) tier = 'backlog';
    else tier = 'not_now';

    opportunities.push({
      id: nextId(),
      title: rule.title,
      type: rule.opportunity_type,
      archetype_id: rule.archetype_id,
      linked_frictions: [rule.friction_id],
      value_score: rule.value,
      feasibility_score: rule.feasibility,
      effort_score: rule.effort,
      risk_score: rule.risk,
      priority_score,
      tier,
      explanation: rule.explanation_template,
    });
  }

  // Sort by priority_score descending
  opportunities.sort((a, b) => b.priority_score - a.priority_score);

  return opportunities;
}
