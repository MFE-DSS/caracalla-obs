import { useState } from 'react';
import { PrimaryCTA } from './PrimaryCTA';
import { authFetch } from '../api';
import './ExportReportButton.css';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

interface Props {
  auditId: string;
}

export function ExportReportButton({ auditId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await authFetch(`${API_BASE}/api/audits/${auditId}/export`);

      if (res.status === 402) {
        setError('Le rapport PDF nécessite un déverrouillage premium.');
        return;
      }
      if (res.status === 403) {
        setError('Lien invalide ou expiré.');
        return;
      }
      if (!res.ok) {
        setError('Erreur lors de la génération du PDF.');
        return;
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `caracalla-report-${auditId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      setError('Impossible de télécharger le rapport. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="export-btn">
      <PrimaryCTA
        label={loading ? 'Génération en cours...' : 'Télécharger le dossier PDF'}
        onClick={handleDownload}
        variant="secondary"
        disabled={loading}
      />
      {error && <p className="export-btn__error">{error}</p>}
    </div>
  );
}
