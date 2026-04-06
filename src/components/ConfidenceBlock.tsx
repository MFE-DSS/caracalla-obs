import './ConfidenceBlock.css';

interface ConfidenceBlockProps {
  level: 'low' | 'medium' | 'high';
  message: string;
  missingData?: string[];
}

const levelLabels: Record<string, string> = {
  high: 'Diagnostic fiable',
  medium: 'Confiance moyenne',
  low: 'Données insuffisantes',
};

export function ConfidenceBlock({ level, message, missingData }: ConfidenceBlockProps) {
  if (level === 'high') return null;

  return (
    <aside className={`confidence-block confidence-block--${level}`} aria-label="Niveau de confiance du diagnostic">
      <div className="confidence-block__header">
        <span className="confidence-block__icon" aria-hidden="true">
          {level === 'low' ? '⚠' : 'ℹ'}
        </span>
        <span className="confidence-block__level">{levelLabels[level]}</span>
      </div>
      <p className="confidence-block__message">{message}</p>
      {missingData && missingData.length > 0 && (
        <ul className="confidence-block__missing">
          {missingData.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </aside>
  );
}
