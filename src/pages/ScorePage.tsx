import { useEffect } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { ScoreBadge } from '../components/ScoreBadge';
import { EvidenceBlock } from '../components/EvidenceBlock';
import { ConfidenceBlock } from '../components/ConfidenceBlock';
import { PrimaryCTA } from '../components/PrimaryCTA';
import type { EngineOutput } from '../engine/domain/types';
import { track } from '../analytics';
import './ScorePage.css';

interface ScorePageProps {
  engineOutput: EngineOutput;
  onNext: () => void;
  onBack: () => void;
}

export function ScorePage({ engineOutput, onNext, onBack }: ScorePageProps) {
  useEffect(() => {
    track('score_viewed');
  }, []);

  // Build factors from frictions and archetypes
  const factors: { label: string; impact: 'positive' | 'negative'; detail: string }[] = [
    ...engineOutput.detected_archetypes.slice(0, 2).map((a) => ({
      label: a.label,
      impact: 'negative' as const,
      detail: `Détecté avec une confiance ${a.confidence === 'high' ? 'forte' : a.confidence === 'medium' ? 'moyenne' : 'faible'}`,
    })),
    ...engineOutput.frictions.filter((f) => f.severity === 'critical' || f.severity === 'high').slice(0, 3).map((f) => ({
      label: f.label,
      impact: 'negative' as const,
      detail: f.description,
    })),
  ];

  // Add positive factors if score is decent
  if (engineOutput.global_score >= 35) {
    factors.unshift({
      label: 'Activité structurée',
      impact: 'positive',
      detail: 'Des bases opérationnelles sont en place',
    });
  }

  // Build evidence items from frictions evidence
  const evidenceItems = engineOutput.frictions
    .flatMap((f) => f.evidence.map((e) => ({ text: e, source: `Friction : ${f.label}` })))
    .slice(0, 6);

  // Top opportunity
  const topOpp = engineOutput.opportunities[0];

  const confidenceMessage = engineOutput.confidence === 'high'
    ? 'Ce diagnostic repose sur des signaux clairs et cohérents.'
    : engineOutput.confidence === 'medium'
    ? 'Ce diagnostic repose sur vos déclarations. La fiabilité est bonne sur les frictions principales, plus incertaine sur les estimations de valeur.'
    : 'Peu de signaux détectés. Le diagnostic est indicatif.';

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
              label={`Maturité opérationnelle`}
              value={engineOutput.global_score}
              explanation={engineOutput.reason_trace[0] ?? 'Score calculé à partir de vos réponses.'}
            />
          </section>

          {/* Factors */}
          {factors.length > 0 && (
            <section className="score-page__section" aria-label="Facteurs du score">
              <SectionHeader title="Ce qui compose votre score" subtitle="Ce qui tire le score vers le haut ou vers le bas" />
              <div className="score-page__factors">
                {factors.map((f, i) => (
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
          )}

          {/* Opportunity teaser */}
          {topOpp && (
            <section className="score-page__section" aria-label="Piste prioritaire">
              <SectionHeader title="Votre piste prioritaire" />
              <article className="score-page__opportunity">
                <span className="score-page__opportunity-rank">#1</span>
                <h3 className="score-page__opportunity-title">{topOpp.title}</h3>
                <p className="score-page__opportunity-detail">
                  <strong>Friction adressée :</strong> {topOpp.linked_frictions.join(', ')}
                </p>
                <p className="score-page__opportunity-detail">
                  <strong>Explication :</strong> {topOpp.explanation}
                </p>
                <p className="score-page__opportunity-detail">
                  <strong>Score de priorité :</strong> {topOpp.priority_score} — {topOpp.tier === 'top_candidate' ? 'Priorité haute' : topOpp.tier === 'candidate' ? 'Priorité moyenne' : 'À considérer'}
                </p>
              </article>
            </section>
          )}

          {/* Evidence */}
          {evidenceItems.length > 0 && (
            <section className="score-page__section" aria-label="Éléments de preuve">
              <EvidenceBlock
                label="Basé sur vos réponses"
                items={evidenceItems}
              />
            </section>
          )}

          {/* Confidence */}
          <section className="score-page__section" aria-label="Confiance">
            <ConfidenceBlock
              level={engineOutput.confidence}
              message={confidenceMessage}
            />
          </section>

          {/* Reason trace */}
          {engineOutput.reason_trace.length > 1 && (
            <section className="score-page__section" aria-label="Trace de raisonnement">
              <SectionHeader title="Comment nous avons raisonné" />
              <ul className="score-page__trace">
                {engineOutput.reason_trace.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Next */}
          <section className="score-page__section score-page__next" aria-label="Étape suivante">
            <PrimaryCTA label="Voir comment aller plus loin" onClick={onNext} />
          </section>
        </div>
      </main>
    </div>
  );
}
