import { useEffect } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { PaywallValuePanel } from '../components/PaywallValuePanel';
import { NextStepCard } from '../components/NextStepCard';
import { Footer } from '../components/Footer';
import type { EngineOutput } from '../engine/domain/types';
import { track } from '../analytics';
import './ValuePage.css';

interface ValuePageProps {
  engineOutput: EngineOutput;
  onBack: () => void;
}

const premiumValue = {
  gratuit: [
    'Synthèse des frictions principales',
    'Score de maturité global',
    '1 piste d\'amélioration prioritaire',
    'Niveau de confiance du diagnostic',
  ],
  premium: [
    'Toutes les opportunités classées par impact et faisabilité',
    'Coûts estimés et prérequis pour chaque amélioration',
    'Risques identifiés avec stratégies de mitigation',
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

export function ValuePage({ engineOutput, onBack }: ValuePageProps) {
  useEffect(() => {
    track('paywall_viewed');
  }, []);

  const handlePremium = () => {
    track('paywall_cta_clicked', { price: '49' });
    alert('Intégration Stripe à venir. Merci de votre intérêt !');
  };

  const handleConseil = () => {
    track('consulting_cta_clicked', { source: 'value_page' });
    alert('Prise de rendez-vous à venir. Merci de votre intérêt !');
    track('flow_completed');
  };

  const topOpp = engineOutput.opportunities[0];

  return (
    <div className="value-page">
      <header className="value-page__header">
        <div className="value-page__container">
          <button className="value-page__back" onClick={onBack} type="button">← Retour au diagnostic</button>
        </div>
      </header>

      <main className="value-page__main">
        <div className="value-page__container">
          {/* Intro */}
          <section className="value-page__section" aria-label="Ce que vous avez obtenu">
            <SectionHeader
              title="Vous avez déjà une première lecture de votre situation"
              subtitle="Voici ce que vous pouvez obtenir en allant plus loin."
            />
            <p className="value-page__recap">
              Votre diagnostic gratuit a identifié <strong>{engineOutput.frictions.length} point(s) de friction</strong> et
              un <strong>score de maturité de {engineOutput.global_score}/100</strong>.
              {topOpp && <> Votre piste prioritaire : <strong>{topOpp.title}</strong>.</>}
            </p>
          </section>

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
                description={`${engineOutput.opportunities.length} piste(s) d'amélioration classée(s) par impact, faisabilité et coût estimé. Plus besoin de deviner par où commencer.`}
                ctaLabel="Obtenir le rapport"
                onCtaClick={handlePremium}
                variant="highlight"
              />
              <NextStepCard
                title="Lancer un projet pilote"
                description="Un plan pilote concret : périmètre, durée, budget, résultat attendu. Prêt à partager avec votre équipe ou un prestataire."
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
