import './ScoreBadge.css';

interface ScoreBadgeProps {
  label: string;
  value: number;
  explanation: string;
}

function getScoreColor(value: number): string {
  if (value >= 70) return 'var(--semantic-candidate)';
  if (value >= 40) return 'var(--semantic-warning)';
  return 'var(--semantic-blocked)';
}

function getScoreLevel(value: number): string {
  if (value >= 70) return 'Avancé';
  if (value >= 40) return 'Intermédiaire';
  return 'À structurer';
}

export function ScoreBadge({ label, value, explanation }: ScoreBadgeProps) {
  const color = getScoreColor(value);
  const level = getScoreLevel(value);

  return (
    <div className="score-badge" aria-label={`${label} : ${value} sur 100`}>
      <div className="score-badge__visual" style={{ '--score-color': color } as React.CSSProperties}>
        <span className="score-badge__value">{value}</span>
        <span className="score-badge__max">/100</span>
      </div>
      <div className="score-badge__info">
        <span className="score-badge__label">{label}</span>
        <span className="score-badge__level" style={{ color }}>{level}</span>
        <p className="score-badge__explanation">{explanation}</p>
      </div>
    </div>
  );
}
