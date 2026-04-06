import { useEffect } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { PaywallValuePanel } from '../components/PaywallValuePanel';
import { NextStepCard } from '../components/NextStepCard';
import { Footer } from '../components/Footer';
import type { EngineOutputV2 } from '../engine/domain/arbitration';
import { track } from '../analytics';
import './ValuePage.css';

interface ValuePageProps {
  engineOutput: EngineOutputV2;
  auditId?: string | null;
  onBack: () => void;
  onViewPremium?: () => void;
}

const premiumValue = {
  gratuit: [
    'Synthèse des frictions principales',
    'Score de maturité global',
    'Première action recommandée avec justification',
    'Niveau de confiance du diagnostic',
  ],
  premium: [
    'Toutes les opportunités classées par impact et faisabilité',
    'Plan d\'exécution séquencé avec prérequis',
    'Contraintes identifiées et pénalités expliquées',
    'Plan pilote concret : périmètre, durée, budget',
    'Recommandation outillage adaptée à votre secteur',
  ],
  conseil: [
    'Cadrage du projet pilote avec un expert',
    'Sélection et mise en place de l\'outil adapté',
    'Formation de votre équipe',
    'Suivi des résultats sur 3 mois',
  ],
};

const kindLabels: Record<string, string> = {
  prerequisite: 'Prérequis',
  pilot: 'Projet pilote',
  backlog: 'À planifier ensuite',
};

export function ValuePage({ engineOutput, auditId: _auditId, onBack, onViewPremium }: ValuePageProps) {
  useEffect(() => {
    track('paywall_viewed');
  }, []);

  const handlePremium = () => {
    track('paywall_cta_clicked', { price: '49' });
    if (onViewPremium) {
      onViewPremium();
    } else {
      alert('Intégration Stripe à venir. Merci de votre intérêt !');
    }
  };

  const handleConseil = () => {
    track('consulting_cta_clicked', { source: 'value_page' });
    alert('Prise de rendez-vous à venir. Merci de votre intérêt !');
    track('flow_completed');
  };

  const nba = engineOutput.next_best_action;

  return (
    <div className="value-page">
      <header className="value-page__header">
        <div className="value-page__container">
          <button className="value-page__back" onClick={onBack} type="button">← Retour au diagnostic</button>
        </div>
      </header>

      <main className="value-page__main">
        <div className="value-page__container">
          {/* Intro with real data */}
          <section className="value-page__section" aria-label="Ce que vous avez obtenu">
            <SectionHeader
              title="Vous avez déjà une première lecture de votre situation"
              subtitle="Voici ce que vous pouvez obtenir en allant plus loin."
            />
            <p className="value-page__recap">
              Votre diagnostic gratuit a identifié <strong>{engineOutput.frictions.length} point(s) de friction</strong>,
              un <strong>score de maturité de {engineOutput.global_score}/100</strong>,
              et <strong>{engineOutput.constraints.length} contrainte(s) d'exécution</strong>.
              {nba && <> Notre recommandation : <strong>{nba.title}</strong> (retour estimé : {nba.expected_time_to_value}).</>}
            </p>
          </section>

          {/* Execution plan */}
          {engineOutput.execution_plan.length > 0 && (
            <section className="value-page__section" aria-label="Plan d'exécution">
              <SectionHeader title="Votre séquence d'action recommandée" subtitle="Ce que nous recommandons de faire, dans cet ordre" />
              <div className="value-page__plan">
                {engineOutput.execution_plan.map((step, i) => (
                  <article key={step.id} className={`value-page__step value-page__step--${step.kind}`}>
                    <div className="value-page__step-header">
                      <span className="value-page__step-number">{i + 1}</span>
                      <span className={`value-page__step-kind value-page__step-kind--${step.kind}`}>
                        {kindLabels[step.kind]}
                      </span>
                    </div>
                    <h3 className="value-page__step-title">{step.title}</h3>
                    <p className="value-page__step-why">{step.why}</p>
                    <div className="value-page__step-meta">
                      <span>Retour estimé : {step.expected_time_to_value}</span>
                      {step.unlocks.length > 0 && (
                        <span> · Débloque {step.unlocks.length} action(s)</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Prerequisites */}
          {engineOutput.prerequisites.length > 0 && (
            <section className="value-page__section" aria-label="Prérequis">
              <SectionHeader title="Ce qui doit être en place d'abord" />
              <ul className="value-page__prereqs">
                {engineOutput.prerequisites.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Paywall */}
          <section className="value-page__section" aria-label="Offres">
            <SectionHeader title="Trois façons de continuer" />
            <PaywallValuePanel
              gratuit={premiumValue.gratuit}
              premium={premiumValue.premium}
              conseil={premiumValue.conseil}
              price="49 € HT"
              onPremiumClick={handlePremium}
              onConseilClick={handleConseil}
            />
          </section>

          {/* Concrete next steps */}
          <section className="value-page__section" aria-label="Prochaines étapes concrètes">
            <SectionHeader title="Ce que le rapport complet vous permettra de décider" />
            <div className="value-page__steps">
              <NextStepCard
                title="Prioriser vos chantiers"
                description={`${engineOutput.opportunities.length} piste(s) d'amélioration classée(s) par impact, faisabilité et contraintes. Plan d'exécution séquencé.`}
                ctaLabel="Obtenir le rapport"
                onCtaClick={handlePremium}
                variant="highlight"
              />
              <NextStepCard
                title="Lancer un projet pilote"
                description="Un plan pilote concret avec périmètre, durée, budget et résultat attendu. Prêt à partager avec votre équipe ou un prestataire."
                ctaLabel="Obtenir le rapport"
                onCtaClick={handlePremium}
              />
              <NextStepCard
                title="Être accompagné"
                description="Un expert vous aide à cadrer le pilote, choisir le bon outil, former vos équipes et mesurer les résultats sur 3 mois."
                ctaLabel="Demander un échange"
                onCtaClick={handleConseil}
              />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
