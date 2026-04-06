import { useEffect } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { FrictionCard } from '../components/FrictionCard';
import { ConfidenceBlock } from '../components/ConfidenceBlock';
import { PrimaryCTA } from '../components/PrimaryCTA';
import { ResponsiveStack } from '../components/ResponsiveStack';
import type { EngineOutput } from '../engine/domain/types';
import { track } from '../analytics';
import './FrictionsPage.css';

interface FrictionsPageProps {
  engineOutput: EngineOutput;
  onNext: () => void;
  onBack: () => void;
}

const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
  low: 'low', medium: 'medium', high: 'high', critical: 'critical',
};

export function FrictionsPage({ engineOutput, onNext, onBack }: FrictionsPageProps) {
  useEffect(() => {
    track('summary_viewed');
  }, []);

  const handleExpand = (frictionId: string, frictionTitle: string) => {
    track('summary_friction_expanded', { friction_id: frictionId, friction_title: frictionTitle });
  };

  const confidenceMessage = engineOutput.confidence === 'high'
    ? 'Ce diagnostic repose sur des signaux clairs et cohérents.'
    : engineOutput.confidence === 'medium'
    ? 'Ce diagnostic repose sur vos déclarations. Il n\'a pas été corroboré par une analyse de vos outils. La fiabilité est bonne sur les frictions déclarées, plus incertaine sur les estimations.'
    : 'Peu de signaux détectés. Le diagnostic est indicatif et mériterait d\'être approfondi.';

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
                <strong>{engineOutput.industry_guess}</strong>, {engineOutput.company_size_band} salariés.
                Entreprise : {engineOutput.company_name}.
              </p>
              {engineOutput.detected_archetypes.length > 0 && (
                <p className="frictions-page__profile-text">
                  Formes de travail identifiées : {engineOutput.detected_archetypes.map((a) => a.label).join(', ')}.
                </p>
              )}
            </div>
          </section>

          {/* Frictions */}
          <section className="frictions-page__section" aria-label="Points de friction">
            <SectionHeader
              title="Points de friction identifiés"
              subtitle={`${engineOutput.frictions.length} élément(s) détecté(s), classé(s) par impact`}
            />
            <ResponsiveStack columns={2}>
              {engineOutput.frictions.map((f) => (
                <FrictionCard
                  key={f.friction_id}
                  title={f.label}
                  explanation={f.description}
                  source={f.evidence.join(' · ')}
                  severity={severityMap[f.severity]}
                  confidence={f.confidence}
                  onExpand={() => handleExpand(f.friction_id, f.label)}
                />
              ))}
            </ResponsiveStack>
          </section>

          {/* Confidence */}
          <section className="frictions-page__section" aria-label="Niveau de confiance">
            <ConfidenceBlock
              level={engineOutput.confidence}
              message={confidenceMessage}
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
