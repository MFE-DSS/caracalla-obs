import { PrimaryCTA } from './PrimaryCTA';
import './HeroBlock.css';

interface HeroBlockProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  onCtaClick: () => void;
}

export function HeroBlock({ title, subtitle, ctaLabel, onCtaClick }: HeroBlockProps) {
  return (
    <section className="hero" aria-label="Promesse produit">
      <div className="hero__content">
        <h1 className="hero__title">{title}</h1>
        <p className="hero__subtitle">{subtitle}</p>
        <div className="hero__cta">
          <PrimaryCTA label={ctaLabel} onClick={onCtaClick} />
        </div>
      </div>
    </section>
  );
}
