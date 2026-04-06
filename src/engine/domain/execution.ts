/* CARACALLA ENGINE V2 — Execution Plan Types */

import type { Confidence } from './types';

export type ExecutionStepKind = 'prerequisite' | 'pilot' | 'backlog';

export interface ExecutionStep {
  id: string;
  title: string;
  kind: ExecutionStepKind;
  linked_opportunity_ids: string[];
  depends_on: string[];
  unlocks: string[];
  expected_time_to_value: string;
  confidence: Confidence;
  why: string;
}
