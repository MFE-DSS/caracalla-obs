/* CARACALLA ENGINE V2 — Constraint Types */

export type ConstraintType = 'human' | 'technical' | 'organizational' | 'data' | 'dependency';

export interface Constraint {
  id: string;
  type: ConstraintType;
  label: string;
  severity: 'low' | 'medium' | 'high';
  evidence: string[];
  penalty_score: number;
}
