import { useSearchParams, useNavigate } from 'react-router';
import { SectionHeader } from '../components/SectionHeader';
import { PrimaryCTA } from '../components/PrimaryCTA';
import './PaymentPages.css';

export function PaymentCancelPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auditId = searchParams.get('audit_id');

  return (
    <div className="payment-page payment-page--cancel">
      <div className="payment-page__container">
        <SectionHeader
          title="Paiement non finalisé"
          subtitle="Le rapport complet n'a pas été débloqué."
        />
        <p className="payment-page__detail">
          Votre diagnostic gratuit reste disponible. Vous pouvez revenir débloquer le rapport complet à tout moment.
        </p>
        <div className="payment-page__actions">
          {auditId && (
            <PrimaryCTA
              label="Retour à ma synthèse"
              onClick={() => navigate(`/audit/${auditId}/summary`)}
            />
          )}
          <PrimaryCTA
            label="Retour à l'accueil"
            onClick={() => navigate('/')}
            variant="secondary"
          />
        </div>
      </div>
    </div>
  );
}
