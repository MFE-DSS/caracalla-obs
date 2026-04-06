import './EvidenceBlock.css';

interface EvidenceItem {
  text: string;
  source: string;
}

interface EvidenceBlockProps {
  label: string;
  items: EvidenceItem[];
}

export function EvidenceBlock({ label, items }: EvidenceBlockProps) {
  return (
    <aside className="evidence-block" aria-label="Éléments de preuve">
      <p className="evidence-block__label">{label}</p>
      <ul className="evidence-block__list">
        {items.map((item, i) => (
          <li key={i} className="evidence-block__item">
            <span className="evidence-block__text">{item.text}</span>
            <span className="evidence-block__source">{item.source}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
