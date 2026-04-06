import type { PremiumExecutionStep } from '../types/premiumReport';
import './ExecutionPlanBoard.css';

interface Props {
  steps: PremiumExecutionStep[];
}

export function ExecutionPlanBoard({ steps }: Props) {
  if (steps.length === 0) return null;

  return (
    <div className="exec-plan" aria-label="Plan d'exécution">
      {steps.map((step) => (
        <article key={step.step_number} className={`exec-plan__step exec-plan__step--${step.kind}`}>
          <div className="exec-plan__header">
            <span className="exec-plan__number">{step.step_number}</span>
            <span className={`exec-plan__kind exec-plan__kind--${step.kind}`}>{step.kind_label}</span>
          </div>
          <h3 className="exec-plan__title">{step.title}</h3>
          <p className="exec-plan__why">{step.why}</p>
          <div className="exec-plan__meta">
            <span>Retour estimé : {step.time_to_value}</span>
            {step.unlocks_count > 0 && <span>Débloque {step.unlocks_count} action(s)</span>}
          </div>
        </article>
      ))}
    </div>
  );
}
