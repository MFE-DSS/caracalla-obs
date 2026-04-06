/* CARACALLA — Premium Report View Model (frontend mirror)
 * Matches backend/src/domain/premiumReport.ts
 */

export interface ExecutiveVerdict {
  headline: string;
  subheadline: string;
  recommended_motion: string;
  dominant_theme: string;
  time_to_value_hint: string;
  confidence: string;
}

export interface PremiumOpportunityCard {
  id: string;
  rank: number;
  title: string;
  priority_label: string;
  type_label: string;
  archetype_label: string;
  dominant_friction_label: string;
  value_label: string;
  effort_label: string;
  risk_label: string;
  why_it_matters: string;
  why_now: string;
}

export interface PremiumExecutionStep {
  step_number: number;
  title: string;
  kind: string;
  kind_label: string;
  why: string;
  time_to_value: string;
  unlocks_count: number;
}

export interface PrerequisiteItem {
  label: string;
  category: string;
}

export interface BlockedItemView {
  title: string;
  why_blocked: string;
  unblock_condition: string;
}

export interface AdvisoryCTABlock {
  headline: string;
  reasons: string[];
  cta_label: string;
}

export interface PremiumReportViewModel {
  executive_verdict: ExecutiveVerdict;
  decision_summary: string;
  top_opportunity: PremiumOpportunityCard | null;
  priority_board: PremiumOpportunityCard[];
  prerequisites_board: PrerequisiteItem[];
  blocked_items_board: BlockedItemView[];
  execution_plan_board: PremiumExecutionStep[];
  advisory_cta_block: AdvisoryCTABlock;
}
