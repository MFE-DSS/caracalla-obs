import { useEffect } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { ExecutiveVerdictCard } from '../components/ExecutiveVerdictCard';
import { PremiumOpportunityCard } from '../components/PremiumOpportunityCard';
import { ExecutionPlanBoard } from '../components/ExecutionPlanBoard';
import { BlockedItemsBoard } from '../components/BlockedItemsBoard';
import { AdvisoryCTA } from '../components/AdvisoryCTA';
import { ScoreBadge } from '../components/ScoreBadge';
import { Footer } from '../components/Footer';
import type { PremiumReportViewModel } from '../types/premiumReport';
import type { EngineOutputV2 } from '../engine/domain/arbitration';
import { track } from '../analytics';
import './PremiumReportPage.css';

interface Props {
  premiumView: PremiumReportViewModel;
  engineOutput: EngineOutputV2;
  onBack: () => void;
}

export function PremiumReportPage({ premiumView, engineOutput, onBack }: Props) {
  useEffect(() => {
    track('report_viewed' as any);
  }, []);

  const handleConseil = () => {
    track('consulting_cta_clicked', { source: 'premium_report' });
    alert('Prise de rendez-vous à venir. Merci de votre intérêt !');
  };

  return (
    <div className="premium-report">
      <header className="premium-report__header">
        <div className="premium-report__container">
          <button className="premium-report__back" onClick={onBack} type="button">← Retour</button>
          <span className="premium-report__badge">Rapport premium</span>
        </div>
      </header>

      <main className="premium-report__main">
        <div className="premium-report__container">

          {/* A. Executive verdict */}
          <section className="premium-report__section">
            <ExecutiveVerdictCard verdict={premiumView.executive_verdict} />
          </section>

          {/* Score */}
          <section className="premium-report__section">
            <ScoreBadge
              label="Maturité opérationnelle"
              value={engineOutput.global_score}
              explanation={premiumView.decision_summary}
            />
          </section>

          {/* B. Top action */}
          {premiumView.top_opportunity && (
            <section className="premium-report__section">
              <SectionHeader title="Ce qu'il faut faire en premier" subtitle="L'action recommandée pour un retour rapide" />
              <PremiumOpportunityCard card={premiumView.top_opportunity} highlight />
            </section>
          )}

          {/* C. Priority board */}
          {premiumView.priority_board.length > 1 && (
            <section className="premium-report__section">
              <SectionHeader title="Vos pistes classées par priorité" subtitle={`${premiumView.priority_board.length} opportunité(s) identifiée(s)`} />
              <div className="premium-report__board">
                {premiumView.priority_board.slice(1).map((card) => (
                  <PremiumOpportunityCard key={card.id} card={card} />
                ))}
              </div>
            </section>
          )}

          {/* D. Prerequisites */}
          {premiumView.prerequisites_board.length > 0 && (
            <section className="premium-report__section">
              <SectionHeader title="Ce qui doit être en place d'abord" subtitle="Les fondations à consolider avant de lancer un projet" />
              <ul className="premium-report__prereqs">
                {premiumView.prerequisites_board.map((p, i) => (
                  <li key={i}>
                    <span className="premium-report__prereq-cat">{p.category}</span>
                    <span>{p.label}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* E. Blocked items */}
          {premiumView.blocked_items_board.length > 0 && (
            <section className="premium-report__section">
              <SectionHeader title="Ce qui serait prématuré à ce stade" subtitle="Ces pistes sont pertinentes mais nécessitent des prérequis" />
              <BlockedItemsBoard items={premiumView.blocked_items_board} />
            </section>
          )}

          {/* F. Execution plan */}
          <section className="premium-report__section">
            <SectionHeader title="Votre plan d'exécution recommandé" subtitle="Les étapes dans l'ordre, avec le temps de retour estimé" />
            <ExecutionPlanBoard steps={premiumView.execution_plan_board} />
          </section>

          {/* G. Advisory CTA */}
          <section className="premium-report__section">
            <AdvisoryCTA block={premiumView.advisory_cta_block} onCtaClick={handleConseil} />
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
