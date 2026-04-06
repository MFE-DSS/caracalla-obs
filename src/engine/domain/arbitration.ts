/* CARACALLA ENGINE V2 — Arbitration Types */

import type { EngineOutput, Confidence } from './types';
import type { CompanyContext } from './context';
import type { Constraint } from './constraints';
import type { ExecutionStep } from './execution';

export interface NextBestAction {
  opportunity_id: string;
  title: string;
  type: string;
  arbitration_score: number;
  expected_time_to_value: string;
}

export interface BlockedItem {
  opportunity_id: string;
  title: string;
  why_blocked: string;
}

export interface EngineOutputV2 extends EngineOutput {
  context: CompanyContext;
  constraints: Constraint[];
  execution_plan: ExecutionStep[];
  next_best_action: NextBestAction | null;
  why_this_first: string[];
  blocked_items: BlockedItem[];
  prerequisites: string[];
  execution_confidence: Confidence;
  arbitration_trace: string[];
}
