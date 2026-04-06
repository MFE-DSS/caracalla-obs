import { PrimaryCTA } from './PrimaryCTA';
import './NextStepCard.css';

interface NextStepCardProps {
  title: string;
  description: string;
  ctaLabel: string;
  onCtaClick: () => void;
  variant?: 'default' | 'highlight';
}

export function NextStepCard({ title, description, ctaLabel, onCtaClick, variant = 'default' }: NextStepCardProps) {
  return (
    <article className={`next-step next-step--${variant}`}>
      <h3 className="next-step__title">{title}</h3>
      <p className="next-step__description">{description}</p>
      <PrimaryCTA
        label={ctaLabel}
        onClick={onCtaClick}
        variant={variant === 'highlight' ? 'primary' : 'secondary'}
      />
    </article>
  );
}
