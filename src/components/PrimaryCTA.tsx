import './PrimaryCTA.css';

interface PrimaryCTAProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
  disabled?: boolean;
}

export function PrimaryCTA({ label, onClick, variant = 'primary', fullWidth = false, disabled = false }: PrimaryCTAProps) {
  return (
    <button
      className={`cta cta--${variant}${fullWidth ? ' cta--full' : ''}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {label}
    </button>
  );
}
