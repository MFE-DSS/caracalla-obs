import type { RawAuditInput } from '../../../src/engine/domain/types.js';
import type { EngineOutputV2 } from '../../../src/engine/domain/arbitration.js';
import { buildEngineOutputV2 } from '../../../src/engine/services/buildEngineOutputV2.js';

/**
 * Adapts DB audit fields into RawAuditInput and runs ENGINE V2.
 * Single point of contact between backend and engine — no engine logic rewritten here.
 */
export function computeEngine(input: {
  company_name: string;
  company_size_band: string;
  industry_hint: string;
  pain_text: string;
}): EngineOutputV2 {
  const raw: RawAuditInput = {
    company_name: input.company_name,
    company_size_band: input.company_size_band,
    industry_hint: input.industry_hint,
    pain_text: input.pain_text,
  };
  return buildEngineOutputV2(raw);
}
