import type { ExecutiveVerdict } from '../types/premiumReport';
import './ExecutiveVerdictCard.css';

interface Props {
  verdict: ExecutiveVerdict;
}

export function ExecutiveVerdictCard({ verdict }: Props) {
  return (
    <section className="verdict-card" aria-label="Verdict exécutif">
      <h2 className="verdict-card__headline">{verdict.headline}</h2>
      <p className="verdict-card__subheadline">{verdict.subheadline}</p>
      <div className="verdict-card__meta">
        <span className="verdict-card__tag">Thème : {verdict.dominant_theme}</span>
        <span className="verdict-card__tag">Retour estimé : {verdict.time_to_value_hint}</span>
        <span className="verdict-card__tag">Confiance : {verdict.confidence}</span>
      </div>
    </section>
  );
}
