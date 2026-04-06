import { useEffect } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { ScoreBadge } from '../components/ScoreBadge';
import { EvidenceBlock } from '../components/EvidenceBlock';
import { ConfidenceBlock } from '../components/ConfidenceBlock';
import { PrimaryCTA } from '../components/PrimaryCTA';
import { mockScore, mockEvidences, mockConfidence, mockOpportunity } from '../data/mockData';
import { track } from '../analytics';
import './ScorePage.css';

interface ScorePageProps {
  onNext: () => void;
  onBack: () => void;
}

export function ScorePage({ onNext, onBack }: ScorePageProps) {
  useEffect(() => {
    track('score_viewed');
  }, []);

  return (
    <div className="score-page">
      <header className="score-page__header">
        <div className="score-page__container">
          <PrimaryCTA label="← Retour" onClick={onBack} variant="ghost" />
        </div>
      </header>

      <main className="score-page__main">
        <div className="score-page__container">
          {/* Score */}
          <section className="score-page__section" aria-label="Score de maturité">
            <SectionHeader title="Votre diagnostic" subtitle="Score de maturité opérationnelle" />
            <ScoreBadge
              label={mockScore.label}
              value={mockScore.value}
              explanation={mockScore.explanation}
            />
          </section>

          {/* Factors */}
          <section className="score-page__section" aria-label="Facteurs du score">
            <SectionHeader title="Ce qui compose votre score" subtitle="Ce qui tire le score vers le haut ou vers le bas" />
            <div className="score-page__factors">
              {mockScore.factors.map((f, i) => (
                <div key={i} className={`score-page__factor score-page__factor--${f.impact}`}>
                  <span className="score-page__factor-icon" aria-hidden="true">
                    {f.impact === 'positive' ? '+' : '−'}
                  </span>
                  <div className="score-page__factor-content">
                    <span className="score-page__factor-label">{f.label}</span>
                    <span className="score-page__factor-detail">{f.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Opportunity teaser */}
          <section className="score-page__section" aria-label="Piste prioritaire">
            <SectionHeader title="Votre piste prioritaire" />
            <article className="score-page__opportunity">
              <span className="score-page__opportunity-rank">#1</span>
              <h3 className="score-page__opportunity-title">{mockOpportunity.title}</h3>
              <p className="score-page__opportunity-detail">
                <strong>Friction adressée :</strong> {mockOpportunity.friction}
              </p>
              <p className="score-page__opportunity-detail">
                <strong>Valeur attendue :</strong> {mockOpportunity.expectedValue}
              </p>
            </article>
          </section>

          {/* Evidence */}
          <section className="score-page__section" aria-label="Éléments de preuve">
            <EvidenceBlock
              label="Basé sur vos réponses"
              items={mockEvidences}
            />
          </section>

          {/* Confidence */}
          <section className="score-page__section" aria-label="Confiance">
            <ConfidenceBlock
              level={mockConfidence.level}
              message={mockConfidence.message}
              missingData={mockConfidence.missingData}
            />
          </section>

          {/* Next */}
          <section className="score-page__section score-page__next" aria-label="Étape suivante">
            <PrimaryCTA label="Voir comment aller plus loin" onClick={onNext} />
          </section>
        </div>
      </main>
    </div>
  );
}
