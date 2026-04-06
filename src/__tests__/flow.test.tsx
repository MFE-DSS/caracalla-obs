import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LandingPage } from '../pages/LandingPage';
import { AuditPage } from '../pages/AuditPage';
import { FrictionsPage } from '../pages/FrictionsPage';
import { ScorePage } from '../pages/ScorePage';
import { ValuePage } from '../pages/ValuePage';
import { buildEngineOutputV2 } from '../engine/services/buildEngineOutputV2';

// Mock analytics
vi.mock('../analytics', () => ({
  track: vi.fn(),
  trackOnce: vi.fn(),
}));

// Mock session
vi.mock('../services/session', () => ({
  saveSession: vi.fn(),
  loadSession: vi.fn(() => null),
  clearSession: vi.fn(),
}));

const FIXTURE_OUTPUT = buildEngineOutputV2({
  company_name: 'Test SARL',
  company_size_band: '6-20',
  industry_hint: 'BTP / Construction',
  pain_text: 'Je perds du temps sur des tâches répétitives',
});

describe('Caracalla flow (component-level)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the landing page', () => {
    const onStart = vi.fn();
    render(
      <MemoryRouter>
        <LandingPage onStart={onStart} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Sont-ils au bon niveau/)).toBeInTheDocument();
    expect(screen.getByText('Commencer le diagnostic gratuit')).toBeInTheDocument();
  });

  it('landing CTA calls onStart', () => {
    const onStart = vi.fn();
    render(
      <MemoryRouter>
        <LandingPage onStart={onStart} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText('Commencer le diagnostic gratuit'));
    expect(onStart).toHaveBeenCalled();
  });

  it('shows audit form with 4 fields', () => {
    render(
      <MemoryRouter>
        <AuditPage onSubmit={() => {}} onBack={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Nom de votre entreprise')).toBeInTheDocument();
    expect(screen.getByLabelText("Secteur d'activité")).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre de salariés')).toBeInTheDocument();
    expect(screen.getByLabelText("Votre principale difficulté aujourd'hui")).toBeInTheDocument();
  });

  it('submit button is disabled until form is complete', () => {
    render(
      <MemoryRouter>
        <AuditPage onSubmit={() => {}} onBack={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Voir mon diagnostic')).toBeDisabled();
  });

  it('frictions page shows engine output', () => {
    render(
      <MemoryRouter>
        <FrictionsPage engineOutput={FIXTURE_OUTPUT} onNext={() => {}} onBack={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Votre synthèse')).toBeInTheDocument();
    expect(screen.getByText(/Points de friction identifiés/)).toBeInTheDocument();
  });

  it('score page shows diagnostic', () => {
    render(
      <MemoryRouter>
        <ScorePage engineOutput={FIXTURE_OUTPUT} onNext={() => {}} onBack={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Votre diagnostic')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  it('value page shows paywall', () => {
    render(
      <MemoryRouter>
        <ValuePage engineOutput={FIXTURE_OUTPUT} auditId="test_123" onBack={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Trois façons de continuer')).toBeInTheDocument();
  });

  it('full sub-flow: frictions → score → value', () => {
    let screen_state = 'frictions';
    const { rerender } = render(
      <MemoryRouter>
        <FrictionsPage
          engineOutput={FIXTURE_OUTPUT}
          onNext={() => { screen_state = 'score'; }}
          onBack={() => {}}
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Voir le diagnostic complet et le score'));
    expect(screen_state).toBe('score');
  });
});
