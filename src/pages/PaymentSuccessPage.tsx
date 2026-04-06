import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { SectionHeader } from '../components/SectionHeader';
import { PrimaryCTA } from '../components/PrimaryCTA';
import { track } from '../analytics';
import './PaymentPages.css';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auditId = searchParams.get('audit_id');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    track('paywall_cta_clicked', { result: 'success' });
  }, []);

  useEffect(() => {
    if (!auditId) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          navigate(`/audit/${auditId}/premium`);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [auditId, navigate]);

  if (!auditId) {
    return (
      <div className="payment-page">
        <div className="payment-page__container">
          <SectionHeader title="Paiement confirmé" subtitle="Mais nous n'avons pas trouvé votre diagnostic." />
          <PrimaryCTA label="Retour à l'accueil" onClick={() => navigate('/')} />
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page payment-page--success">
      <div className="payment-page__container">
        <div className="payment-page__icon" aria-hidden="true">✓</div>
        <SectionHeader
          title="Paiement confirmé"
          subtitle="Votre rapport premium est maintenant débloqué."
        />
        <p className="payment-page__detail">
          Vous allez être redirigé vers votre dossier premium dans {countdown} seconde(s).
        </p>
        <PrimaryCTA
          label="Voir mon rapport premium"
          onClick={() => navigate(`/audit/${auditId}/premium`)}
        />
      </div>
    </div>
  );
}
