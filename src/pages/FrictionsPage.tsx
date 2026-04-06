import { useEffect } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { FrictionCard } from '../components/FrictionCard';
import { ConfidenceBlock } from '../components/ConfidenceBlock';
import { PrimaryCTA } from '../components/PrimaryCTA';
import { ResponsiveStack } from '../components/ResponsiveStack';
import { mockFrictions, mockConfidence, mockCompanyProfile } from '../data/mockData';
import { track } from '../analytics';
import './FrictionsPage.css';

interface FrictionsPageProps {
  onNext: () => void;
  onBack: () => void;
}

export function FrictionsPage({ onNext, onBack }: FrictionsPageProps) {
  useEffect(() => {
    track('summary_viewed');
  }, []);

  const handleExpand = (frictionId: string, frictionTitle: string) => {
    track('summary_friction_expanded', { friction_id: frictionId, friction_title: frictionTitle });
  };

  return (
    <div className="frictions-page">
      <header className="frictions-page__header">
        <div className="frictions-page__container">
          <PrimaryCTA label="← Retour" onClick={onBack} variant="ghost" />
        </div>
      </header>

      <main className="frictions-page__main">
        <div className="frictions-page__container">
          {/* Executive snapshot */}
          <section className="frictions-page__snapshot" aria-label="Résumé">
            <SectionHeader title="Votre synthèse" subtitle="Voici ce que nous avons identifié" />
            <div className="frictions-page__profile">
              <p className="frictions-page__profile-text">
                <strong>{mockCompanyProfile.sector}</strong>, {mockCompanyProfile.size}, basée en {mockCompanyProfile.location}.
                Activité {mockCompanyProfile.activity} avec un volume de {mockCompanyProfile.volume}.
                Outils actuels : {mockCompanyProfile.tools}.
              </p>
            </div>
          </section>

          {/* Frictions */}
          <section className="frictions-page__section" aria-label="Points de friction">
            <SectionHeader
              title="Points de friction identifiés"
              subtitle={`${mockFrictions.length} éléments détectés, classés par impact`}
            />
            <ResponsiveStack columns={2}>
              {mockFrictions.map((f) => (
                <FrictionCard
                  key={f.id}
                  title={f.title}
                  explanation={f.explanation}
                  source={f.source}
                  severity={f.severity}
                  confidence={f.confidence}
                  onExpand={() => handleExpand(f.id, f.title)}
                />
              ))}
            </ResponsiveStack>
          </section>

          {/* Confidence */}
          <section className="frictions-page__section" aria-label="Niveau de confiance">
            <ConfidenceBlock
              level={mockConfidence.level}
              message={mockConfidence.message}
              missingData={mockConfidence.missingData}
            />
          </section>

          {/* Next */}
          <section className="frictions-page__section frictions-page__next" aria-label="Étape suivante">
            <PrimaryCTA label="Voir le diagnostic complet et le score" onClick={onNext} />
          </section>
        </div>
      </main>
    </div>
  );
}
