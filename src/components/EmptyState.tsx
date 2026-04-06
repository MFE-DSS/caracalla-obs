import './EmptyState.css';

interface EmptyStateProps {
  message: string;
  detail?: string;
}

export function EmptyState({ message, detail }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <p className="empty-state__message">{message}</p>
      {detail && <p className="empty-state__detail">{detail}</p>}
    </div>
  );
}
