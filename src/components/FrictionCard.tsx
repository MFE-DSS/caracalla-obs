import { useState } from 'react';
import { InlineSourceBadge } from './InlineSourceBadge';
import './FrictionCard.css';

interface FrictionCardProps {
  title: string;
  explanation: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: 'low' | 'medium' | 'high';
  onExpand?: () => void;
}

const severityLabels: Record<string, string> = {
  critical: 'Impact fort',
  high: 'Impact significatif',
  medium: 'Impact modéré',
  low: 'Impact faible',
};

const confidenceLabels: Record<string, string> = {
  high: 'Diagnostic fiable',
  medium: 'Confiance moyenne',
  low: 'Données insuffisantes',
};

export function FrictionCard({ title, explanation, source, severity, confidence, onExpand }: FrictionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && onExpand) onExpand();
  };

  return (
    <article className={`friction-card friction-card--${severity}`} aria-label={`Friction : ${title}`}>
      <div className="friction-card__header">
        <span className={`friction-card__severity friction-card__severity--${severity}`}>
          {severityLabels[severity]}
        </span>
        <span className="friction-card__confidence">{confidenceLabels[confidence]}</span>
      </div>
      <h3 className="friction-card__title">{title}</h3>
      <button className="friction-card__toggle" onClick={handleToggle} type="button" aria-expanded={expanded}>
        {expanded ? 'Réduire' : 'Voir le détail'}
      </button>
      {expanded && (
        <div className="friction-card__detail">
          <p className="friction-card__explanation">{explanation}</p>
          <InlineSourceBadge source={source} />
        </div>
      )}
      {!expanded && (
        <div className="friction-card__source-preview">
          <InlineSourceBadge source={source} />
        </div>
      )}
    </article>
  );
}
