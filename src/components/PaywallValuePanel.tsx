import { PrimaryCTA } from './PrimaryCTA';
import './PaywallValuePanel.css';

interface PaywallValuePanelProps {
  gratuit: string[];
  premium: string[];
  conseil: string[];
  price: string;
  onPremiumClick: () => void;
  onConseilClick: () => void;
}

export function PaywallValuePanel({ gratuit, premium, conseil, price, onPremiumClick, onConseilClick }: PaywallValuePanelProps) {
  return (
    <div className="paywall">
      <div className="paywall__columns">
        {/* Gratuit column */}
        <div className="paywall__column paywall__column--gratuit">
          <h3 className="paywall__column-title">Synthèse gratuite</h3>
          <p className="paywall__column-subtitle">Ce que vous avez</p>
          <ul className="paywall__list">
            {gratuit.map((item, i) => (
              <li key={i} className="paywall__item paywall__item--check">{item}</li>
            ))}
          </ul>
          <div className="paywall__price">Gratuit</div>
        </div>

        {/* Premium column */}
        <div className="paywall__column paywall__column--premium">
          <h3 className="paywall__column-title">Rapport complet</h3>
          <p className="paywall__column-subtitle">Ce que vous obtenez en plus</p>
          <ul className="paywall__list">
            {premium.map((item, i) => (
              <li key={i} className="paywall__item paywall__item--check paywall__item--highlight">{item}</li>
            ))}
          </ul>
          <div className="paywall__price">{price}</div>
          <PrimaryCTA label="Obtenir mon rapport complet" onClick={onPremiumClick} fullWidth />
          <p className="paywall__guarantee">Satisfait ou remboursé sous 7 jours.</p>
        </div>

        {/* Conseil column */}
        <div className="paywall__column paywall__column--conseil">
          <h3 className="paywall__column-title">Accompagnement</h3>
          <p className="paywall__column-subtitle">Pour passer à l'action</p>
          <ul className="paywall__list">
            {conseil.map((item, i) => (
              <li key={i} className="paywall__item paywall__item--check">{item}</li>
            ))}
          </ul>
          <div className="paywall__price">Sur mesure</div>
          <PrimaryCTA label="Demander un échange" onClick={onConseilClick} variant="secondary" fullWidth />
        </div>
      </div>
    </div>
  );
}
