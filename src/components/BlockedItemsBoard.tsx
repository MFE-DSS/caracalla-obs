import type { BlockedItemView } from '../types/premiumReport';
import './BlockedItemsBoard.css';

interface Props {
  items: BlockedItemView[];
}

export function BlockedItemsBoard({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="blocked-board" aria-label="Éléments bloqués">
      {items.map((item, i) => (
        <article key={i} className="blocked-board__item">
          <h4 className="blocked-board__title">{item.title}</h4>
          <p className="blocked-board__reason"><strong>Pourquoi pas maintenant :</strong> {item.why_blocked}</p>
          <p className="blocked-board__unblock"><strong>Condition de déblocage :</strong> {item.unblock_condition}</p>
        </article>
      ))}
    </div>
  );
}
