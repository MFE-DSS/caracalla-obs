import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PremiumReportPage } from '../pages/PremiumReportPage';
import { buildLocalPremiumReport } from '../services/localPremiumBuilder';
import { buildEngineOutputV2 } from '../engine/services/buildEngineOutputV2';
import { FIXTURE_A } from '../engine/fixtures/mockAudits.fixture';

vi.mock('../analytics', () => ({
  track: vi.fn(),
  trackOnce: vi.fn(),
}));

const engineOutput = buildEngineOutputV2(FIXTURE_A);
const premiumView = buildLocalPremiumReport(engineOutput);

describe('PremiumReportPage', () => {
  it('renders executive verdict headline', () => {
    render(<PremiumReportPage premiumView={premiumView} engineOutput={engineOutput} onBack={() => {}} />);
    expect(screen.getByText(premiumView.executive_verdict.headline)).toBeInTheDocument();
  });

  it('renders "Rapport premium" badge', () => {
    render(<PremiumReportPage premiumView={premiumView} engineOutput={engineOutput} onBack={() => {}} />);
    expect(screen.getByText('Rapport premium')).toBeInTheDocument();
  });

  it('renders top opportunity', () => {
    render(<PremiumReportPage premiumView={premiumView} engineOutput={engineOutput} onBack={() => {}} />);
    if (premiumView.top_opportunity) {
      expect(screen.getAllByText(premiumView.top_opportunity.title).length).toBeGreaterThan(0);
    }
  });

  it('renders "Ce qu\'il faut faire en premier" section', () => {
    render(<PremiumReportPage premiumView={premiumView} engineOutput={engineOutput} onBack={() => {}} />);
    expect(screen.getByText("Ce qu'il faut faire en premier")).toBeInTheDocument();
  });

  it('renders execution plan steps', () => {
    render(<PremiumReportPage premiumView={premiumView} engineOutput={engineOutput} onBack={() => {}} />);
    expect(screen.getByText("Votre plan d'exécution recommandé")).toBeInTheDocument();
    for (const step of premiumView.execution_plan_board) {
      expect(screen.getAllByText(step.title).length).toBeGreaterThan(0);
    }
  });

  it('renders advisory CTA', () => {
    render(<PremiumReportPage premiumView={premiumView} engineOutput={engineOutput} onBack={() => {}} />);
    expect(screen.getByText(premiumView.advisory_cta_block.headline)).toBeInTheDocument();
    expect(screen.getByText(premiumView.advisory_cta_block.cta_label)).toBeInTheDocument();
  });

  it('renders score badge', () => {
    render(<PremiumReportPage premiumView={premiumView} engineOutput={engineOutput} onBack={() => {}} />);
    expect(screen.getByText(String(engineOutput.global_score))).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  it('renders prerequisites if present', () => {
    render(<PremiumReportPage premiumView={premiumView} engineOutput={engineOutput} onBack={() => {}} />);
    if (premiumView.prerequisites_board.length > 0) {
      expect(screen.getByText("Ce qui doit être en place d'abord")).toBeInTheDocument();
    }
  });
});

describe('localPremiumBuilder', () => {
  it('produces different views for different fixtures', () => {
    const fixtureB = { company_name: 'Cabinet Lefèvre', company_size_band: '1-5', industry_hint: 'Services aux entreprises', pain_text: 'Les dossiers clients sont répartis entre emails, serveur, clés USB et papier. Retrouver un document prend 20 minutes.' };
    const viewA = buildLocalPremiumReport(buildEngineOutputV2(FIXTURE_A));
    const viewB = buildLocalPremiumReport(buildEngineOutputV2(fixtureB));
    // Different inputs should produce at least a different top opportunity
    expect(viewA.top_opportunity?.title).not.toBe(viewB.top_opportunity?.title);
  });

  it('produces max 3 priority board cards', () => {
    expect(premiumView.priority_board.length).toBeLessThanOrEqual(3);
  });

  it('produces max 3 execution plan steps', () => {
    expect(premiumView.execution_plan_board.length).toBeLessThanOrEqual(3);
  });

  it('advisory CTA has contextual reasons', () => {
    expect(premiumView.advisory_cta_block.reasons.length).toBeGreaterThan(0);
    expect(premiumView.advisory_cta_block.cta_label.length).toBeGreaterThan(5);
  });
});
