import type { PremiumOpportunityCard as CardData } from '../types/premiumReport';
import './PremiumOpportunityCard.css';

interface Props {
  card: CardData;
  highlight?: boolean;
}

export function PremiumOpportunityCard({ card, highlight = false }: Props) {
  return (
    <article className={`premium-opp ${highlight ? 'premium-opp--highlight' : ''}`}>
      <div className="premium-opp__header">
        <span className="premium-opp__rank">#{card.rank}</span>
        <span className="premium-opp__priority">{card.priority_label}</span>
        <span className="premium-opp__type">{card.type_label}</span>
      </div>
      <h3 className="premium-opp__title">{card.title}</h3>
      <p className="premium-opp__why">{card.why_it_matters}</p>
      {card.why_now && card.why_now !== card.why_it_matters && (
        <p className="premium-opp__now"><strong>Pourquoi maintenant :</strong> {card.why_now}</p>
      )}
      <div className="premium-opp__scores">
        <span className="premium-opp__score">Valeur : {card.value_label}</span>
        <span className="premium-opp__score">Effort : {card.effort_label}</span>
        <span className="premium-opp__score">Risque : {card.risk_label}</span>
      </div>
      {card.archetype_label && (
        <div className="premium-opp__context">
          <span>Forme de travail : {card.archetype_label}</span>
          {card.dominant_friction_label && <span>Friction : {card.dominant_friction_label}</span>}
        </div>
      )}
    </article>
  );
}
