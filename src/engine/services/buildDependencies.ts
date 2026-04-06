import type { Opportunity, OpportunityType } from '../domain/types';

export interface DependencyEdge {
  from_id: string;
  to_id: string;
  reason: string;
}

/**
 * Dependency rules:
 * - structure_data_first can unlock automate_bounded_step
 * - standardize_first can unlock partial_workflow_automation
 * - assist_human_work can precede automate_bounded_step or partial_workflow_automation
 */
const UNLOCK_RULES: [OpportunityType, OpportunityType, string][] = [
  ['structure_data_first', 'automate_bounded_step', 'Structurer les données avant d\'automatiser'],
  ['standardize_first', 'partial_workflow_automation', 'Standardiser avant d\'automatiser un workflow'],
  ['assist_human_work', 'automate_bounded_step', 'Outiller d\'abord, automatiser ensuite'],
  ['assist_human_work', 'partial_workflow_automation', 'Outiller d\'abord, automatiser ensuite'],
  ['structure_data_first', 'partial_workflow_automation', 'Structurer les données avant un workflow'],
];

export function buildDependencies(opportunities: Opportunity[]): DependencyEdge[] {
  const edges: DependencyEdge[] = [];

  for (const [fromType, toType, reason] of UNLOCK_RULES) {
    const froms = opportunities.filter((o) => o.type === fromType);
    const tos = opportunities.filter((o) => o.type === toType);

    for (const from of froms) {
      for (const to of tos) {
        if (from.id === to.id) continue;
        // Only create edge if they share an archetype or friction context
        const sharesContext =
          from.archetype_id === to.archetype_id ||
          from.linked_frictions.some((f) => to.linked_frictions.includes(f));
        if (!sharesContext) continue;

        edges.push({ from_id: from.id, to_id: to.id, reason });
      }
    }
  }

  return edges;
}

/** Get IDs of opportunities that `oppId` unlocks */
export function getUnlocked(oppId: string, edges: DependencyEdge[]): string[] {
  return edges.filter((e) => e.from_id === oppId).map((e) => e.to_id);
}

/** Get IDs of opportunities that `oppId` depends on */
export function getDependsOn(oppId: string, edges: DependencyEdge[]): string[] {
  return edges.filter((e) => e.to_id === oppId).map((e) => e.from_id);
}
