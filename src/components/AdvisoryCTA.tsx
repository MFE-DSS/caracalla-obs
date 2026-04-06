import type { AdvisoryCTABlock } from '../types/premiumReport';
import { PrimaryCTA } from './PrimaryCTA';
import './AdvisoryCTA.css';

interface Props {
  block: AdvisoryCTABlock;
  onCtaClick: () => void;
}

export function AdvisoryCTA({ block, onCtaClick }: Props) {
  return (
    <section className="advisory-cta" aria-label="Accompagnement conseil">
      <h3 className="advisory-cta__headline">{block.headline}</h3>
      <ul className="advisory-cta__reasons">
        {block.reasons.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
      <PrimaryCTA label={block.cta_label} onClick={onCtaClick} />
    </section>
  );
}
