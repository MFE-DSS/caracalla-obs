import './ProgressIndicator.css';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  labels?: string[];
}

export function ProgressIndicator({ current, total, labels }: ProgressIndicatorProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="progress" aria-label={`Étape ${current} sur ${total}`}>
      <div className="progress__bar">
        <div className="progress__fill" style={{ width: `${percentage}%` }} />
      </div>
      <div className="progress__text">
        <span className="progress__step">
          Étape {current} sur {total}
          {labels && labels[current - 1] && ` — ${labels[current - 1]}`}
        </span>
        <span className="progress__percent">{percentage}%</span>
      </div>
    </div>
  );
}
