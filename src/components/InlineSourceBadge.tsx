import './InlineSourceBadge.css';

interface InlineSourceBadgeProps {
  source: string;
}

export function InlineSourceBadge({ source }: InlineSourceBadgeProps) {
  return (
    <span className="source-badge" aria-label="Source du diagnostic">
      {source}
    </span>
  );
}
