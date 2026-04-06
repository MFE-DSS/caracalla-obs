/* CARACALLA ENGINE — Domain Types
 * All core types for the scoring/decision engine.
 * No UI concern here — pure domain.
 */

// ── Input ──────────────────────────────────────────────

export interface RawAuditInput {
  company_name: string;
  company_size_band: string;
  industry_hint: string;
  pain_text: string;
}

// ── Normalization ──────────────────────────────────────

export type Signal =
  | 'spreadsheet'
  | 'email'
  | 'intake'
  | 'duplicate_entry'
  | 'reporting'
  | 'document'
  | 'validation'
  | 'planning'
  | 'followup'
  | 'visibility'
  | 'dependency'
  | 'multi_tool'
  | 'generation'
  | 'master_data'
  | 'crm'
  | 'erp';

export interface NormalizedAudit {
  company_name: string;
  company_size_band: string;
  industry_guess: string;
  tokens: string[];
  tool_signals: Signal[];
  pain_signals: Signal[];
  process_signals: Signal[];
}

// ── Archetypes ─────────────────────────────────────────

export type ArchetypeId =
  | 'manual_intake'
  | 'manual_reporting'
  | 'document_chasing'
  | 'multi_tool_coordination'
  | 'manual_validation'
  | 'data_reentry'
  | 'exception_followup'
  | 'planning_dispatch'
  | 'document_generation'
  | 'master_data_update';

export interface ProceduralArchetype {
  id: ArchetypeId;
  label: string;
  description: string;
  trigger_signals: Signal[];
  common_frictions: FrictionPatternId[];
  candidate_opportunities: OpportunityType[];
}

export type Confidence = 'low' | 'medium' | 'high';

export interface DetectedArchetype {
  archetype_id: ArchetypeId;
  label: string;
  confidence: Confidence;
  matched_signals: Signal[];
}

// ── Frictions ──────────────────────────────────────────

export type FrictionPatternId =
  | 'duplicate_entry'
  | 'email_as_workflow'
  | 'spreadsheet_dependency'
  | 'missing_visibility'
  | 'document_dispersion'
  | 'manual_followup'
  | 'single_person_dependency'
  | 'non_traceable_validation'
  | 'slow_information_retrieval'
  | 'manual_reporting_rebuild';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface FrictionPattern {
  id: FrictionPatternId;
  label: string;
  description: string;
  trigger_signals: Signal[];
}

export interface DetectedFriction {
  friction_id: FrictionPatternId;
  label: string;
  description: string;
  severity: Severity;
  confidence: Confidence;
  evidence: string[];
}

// ── Opportunities ──────────────────────────────────────

export type OpportunityType =
  | 'standardize_first'
  | 'structure_data_first'
  | 'assist_human_work'
  | 'automate_bounded_step'
  | 'partial_workflow_automation';

export type Tier = 'top_candidate' | 'candidate' | 'backlog' | 'not_now';

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  archetype_id: ArchetypeId;
  linked_frictions: FrictionPatternId[];
  value_score: number;
  feasibility_score: number;
  effort_score: number;
  risk_score: number;
  priority_score: number;
  tier: Tier;
  explanation: string;
}

// ── Engine Output ──────────────────────────────────────

export interface EngineOutput {
  company_name: string;
  company_size_band: string;
  industry_guess: string;
  global_score: number;
  global_level: string;
  confidence: Confidence;
  reason_trace: string[];
  detected_archetypes: DetectedArchetype[];
  frictions: DetectedFriction[];
  opportunities: Opportunity[];
}
