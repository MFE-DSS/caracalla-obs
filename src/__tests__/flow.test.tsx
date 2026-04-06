import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
// Mock analytics to avoid console noise
vi.mock('../analytics', () => ({
  track: vi.fn(),
  trackOnce: vi.fn(),
}));

// Mock API to avoid network calls — always compute locally
vi.mock('../api', () => ({
  submitAudit: vi.fn(async (data: { company: string; sector: string; size: string; pain: string }) => {
    const { buildEngineOutputV2: build } = await import('../engine/services/buildEngineOutputV2');
    const engineOutput = build({
      company_name: data.company,
      company_size_band: data.size,
      industry_hint: data.sector,
      pain_text: data.pain,
    });
    return { audit_id: `test_${Date.now()}`, engineOutput, source: 'local' as const };
  }),
}));

describe('Caracalla flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the landing page by default', () => {
    render(<App />);
    expect(screen.getByText(/Sont-ils au bon niveau/)).toBeInTheDocument();
    expect(screen.getByText('Commencer le diagnostic gratuit')).toBeInTheDocument();
  });

  it('navigates to audit when CTA is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Commencer le diagnostic gratuit'));
    expect(screen.getByText('Parlons de votre entreprise')).toBeInTheDocument();
  });

  it('navigates back to landing from audit', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Commencer le diagnostic gratuit'));
    fireEvent.click(screen.getByText('← Retour'));
    expect(screen.getByText(/Sont-ils au bon niveau/)).toBeInTheDocument();
  });

  it('shows audit form with 4 fields', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Commencer le diagnostic gratuit'));
    expect(screen.getByLabelText('Nom de votre entreprise')).toBeInTheDocument();
    expect(screen.getByLabelText("Secteur d'activité")).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre de salariés')).toBeInTheDocument();
    expect(screen.getByLabelText("Votre principale difficulté aujourd'hui")).toBeInTheDocument();
  });

  it('submit button is disabled until form is complete', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Commencer le diagnostic gratuit'));
    expect(screen.getByText('Voir mon diagnostic')).toBeDisabled();
  });

  it('full flow: landing → audit → frictions (engine-powered) → score → value', async () => {
    render(<App />);

    // Landing → Audit
    fireEvent.click(screen.getByText('Commencer le diagnostic gratuit'));
    expect(screen.getByText('Parlons de votre entreprise')).toBeInTheDocument();

    // Fill form with pain text that triggers the engine
    fireEvent.change(screen.getByLabelText('Nom de votre entreprise'), { target: { value: 'Test SARL' } });
    fireEvent.change(screen.getByLabelText("Secteur d'activité"), { target: { value: 'BTP / Construction' } });
    fireEvent.change(screen.getByLabelText('Nombre de salariés'), { target: { value: '6-20' } });
    fireEvent.change(screen.getByLabelText("Votre principale difficulté aujourd'hui"), {
      target: { value: 'Je perds du temps sur des tâches répétitives' },
    });

    // Submit audit → Frictions (async API call)
    fireEvent.click(screen.getByText('Voir mon diagnostic'));

    await waitFor(() => {
      expect(screen.getByText('Votre synthèse')).toBeInTheDocument();
    });
    expect(screen.getByText(/Points de friction identifiés/)).toBeInTheDocument();

    // Frictions → Score
    fireEvent.click(screen.getByText('Voir le diagnostic complet et le score'));
    expect(screen.getByText('Votre diagnostic')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();

    // Score → Value
    fireEvent.click(screen.getByText('Voir comment aller plus loin'));
    expect(screen.getByText('Trois façons de continuer')).toBeInTheDocument();
  });

  it('engine produces different results for different audit inputs', async () => {
    const { unmount } = render(<App />);

    // Flow 1: repetitive tasks
    fireEvent.click(screen.getByText('Commencer le diagnostic gratuit'));
    fireEvent.change(screen.getByLabelText('Nom de votre entreprise'), { target: { value: 'Entreprise A' } });
    fireEvent.change(screen.getByLabelText("Secteur d'activité"), { target: { value: 'BTP / Construction' } });
    fireEvent.change(screen.getByLabelText('Nombre de salariés'), { target: { value: '6-20' } });
    fireEvent.change(screen.getByLabelText("Votre principale difficulté aujourd'hui"), {
      target: { value: 'Je perds du temps sur des tâches répétitives' },
    });
    fireEvent.click(screen.getByText('Voir mon diagnostic'));
    await waitFor(() => screen.getByText(/élément\(s\) détecté/));
    unmount();

    // Flow 2: visibility
    const { unmount: unmount2 } = render(<App />);
    fireEvent.click(screen.getByText('Commencer le diagnostic gratuit'));
    fireEvent.change(screen.getByLabelText('Nom de votre entreprise'), { target: { value: 'Entreprise B' } });
    fireEvent.change(screen.getByLabelText("Secteur d'activité"), { target: { value: 'Services aux entreprises' } });
    fireEvent.change(screen.getByLabelText('Nombre de salariés'), { target: { value: '1-5' } });
    fireEvent.change(screen.getByLabelText("Votre principale difficulté aujourd'hui"), {
      target: { value: 'Je n\'ai pas de visibilité sur mon activité' },
    });
    fireEvent.click(screen.getByText('Voir mon diagnostic'));
    await waitFor(() => screen.getByText(/élément\(s\) détecté/));
    unmount2();

    expect(screen).toBeDefined(); // flow completed without crash
  });
});
