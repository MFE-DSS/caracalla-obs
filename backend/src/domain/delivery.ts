import type { EngineOutputV2 } from '../../../src/engine/domain/arbitration.js';

export interface SummaryPayload {
  global_score: number;
  global_level: string;
  confidence: string;
  reason_trace: string[];
  frictions: {
    id: string;
    label: string;
    severity: string;
    confidence: string;
  }[];
  next_best_action_preview: {
    title: string;
    expected_time_to_value: string;
  } | null;
}

export interface ReportPayload extends EngineOutputV2 {}

export interface SummaryResponse {
  audit_id: string;
  summary: SummaryPayload;
  premium_locked: boolean;
}

export interface ReportResponse {
  audit_id: string;
  report: ReportPayload;
}

export interface PremiumLockedResponse {
  error: 'premium_locked';
  message: string;
  audit_id: string;
}

export interface CreateAuditResponse {
  audit_id: string;
  status: string;
  summary: {
    global_score: number;
    global_level: string;
    confidence: string;
    frictions_count: number;
    top_opportunity_title: string | null;
  };
}
