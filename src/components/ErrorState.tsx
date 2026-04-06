import './ErrorState.css';

interface ErrorStateProps {
  message: string;
  detail?: string;
}

export function ErrorState({ message, detail }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <p className="error-state__message">{message}</p>
      {detail && <p className="error-state__detail">{detail}</p>}
    </div>
  );
}
