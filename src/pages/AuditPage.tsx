import { useEffect } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { ShortAuditForm } from '../components/ShortAuditForm';
import { PrimaryCTA } from '../components/PrimaryCTA';
import { track } from '../analytics';
import './AuditPage.css';

interface AuditPageProps {
  onSubmit: (data: Record<string, string>) => void;
  onBack: () => void;
}

export function AuditPage({ onSubmit, onBack }: AuditPageProps) {
  useEffect(() => {
    track('audit_started');
  }, []);

  const handleSubmit = (data: Record<string, string>) => {
    track('audit_step_completed', { step_number: 1, step_name: 'initial' });
    track('audit_submitted', { fields_filled: Object.keys(data).length });
    onSubmit(data);
  };

  return (
    <div className="audit-page">
      <header className="audit-page__header">
        <div className="audit-page__container">
          <PrimaryCTA label="← Retour" onClick={onBack} variant="ghost" />
          <ProgressIndicator current={1} total={1} labels={['Votre entreprise']} />
        </div>
      </header>

      <main className="audit-page__main">
        <div className="audit-page__container">
          <div className="audit-page__intro">
            <SectionHeader
              title="Parlons de votre entreprise"
              subtitle="4 questions simples pour démarrer votre diagnostic. Il n'y a pas de mauvaise réponse."
            />
            <p className="audit-page__feedback">
              Vos réponses servent uniquement à identifier vos points de friction et vos pistes d'amélioration.
            </p>
          </div>

          <ShortAuditForm onSubmit={handleSubmit} />
        </div>
      </main>
    </div>
  );
}
