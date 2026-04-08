import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { PremiumReportPage } from './PremiumReportPage';
import { fetchSharedReport, type SharedReportResult } from '../services/shareApi';
import { track } from '../analytics';
import './SharedReportPage.css';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ready'; result: SharedReportResult };

export function SharedReportPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  useEffect(() => {
    if (!token) {
      setState({ kind: 'ready', result: { status: 'not_found' } });
      return;
    }

    let cancelled = false;
    (async () => {
      const result = await fetchSharedReport(token);
      if (cancelled) return;
      setState({ kind: 'ready', result });
      track('report_viewed' as any, { source: 'shared_link' } as any);
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.kind === 'loading') {
    return (
      <div className="shared-report-status" role="status" aria-live="polite">
        <div className="shared-report-status__card">
          <p className="shared-report-status__title">Chargement du rapport partagé…</p>
          <p className="shared-report-status__detail">Merci de patienter un instant.</p>
        </div>
      </div>
    );
  }

  const { result } = state;

  if (result.status === 'expired') {
    return (
      <div className="shared-report-status" role="alert">
        <div className="shared-report-status__card shared-report-status__card--warn">
          <p className="shared-report-status__title">Ce lien de partage n'est plus valide</p>
          <p className="shared-report-status__detail">
            Il a peut-être expiré ou été révoqué par son propriétaire. Demandez un nouveau lien à la personne qui vous l'a envoyé.
          </p>
        </div>
      </div>
    );
  }

  if (result.status === 'not_found') {
    return (
      <div className="shared-report-status" role="alert">
        <div className="shared-report-status__card shared-report-status__card--warn">
          <p className="shared-report-status__title">Lien de partage introuvable</p>
          <p className="shared-report-status__detail">
            Le lien que vous avez ouvert ne correspond à aucun rapport partagé.
          </p>
        </div>
      </div>
    );
  }

  if (result.status === 'error') {
    return (
      <div className="shared-report-status" role="alert">
        <div className="shared-report-status__card shared-report-status__card--warn">
          <p className="shared-report-status__title">Rapport indisponible</p>
          <p className="shared-report-status__detail">
            Le rapport partagé n'a pas pu être chargé. Vérifiez votre connexion et réessayez.
          </p>
        </div>
      </div>
    );
  }

  // status === 'ok'
  const { data } = result;
  return (
    <PremiumReportPage
      premiumView={data.premium_view}
      engineOutput={data.report}
      mode="shared"
    />
  );
}
