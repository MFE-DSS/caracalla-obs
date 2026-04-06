import { z } from 'zod';

const SIZE_BANDS = ['1-5', '6-20', '21-50', '51-250'] as const;

export const createAuditSchema = z.object({
  company_name: z.string().min(2).max(120).transform((s) => s.trim()),
  company_size_band: z.enum(SIZE_BANDS),
  industry_hint: z.string().min(2).max(200).transform((s) => s.trim()),
  pain_text: z.string().min(5).max(2000).transform((s) => s.trim()),
});

export type CreateAuditInput = z.infer<typeof createAuditSchema>;
