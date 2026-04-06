import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

// Mock analytics to avoid console noise
vi.mock('../analytics', () => ({
  track: vi.fn(),
  trackOnce: vi.fn(),
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

  it('full flow: landing → audit → frictions → score → value', () => {
    render(<App />);

    // Landing → Audit
    fireEvent.click(screen.getByText('Commencer le diagnostic gratuit'));
    expect(screen.getByText('Parlons de votre entreprise')).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByLabelText('Nom de votre entreprise'), { target: { value: 'Test SARL' } });
    fireEvent.change(screen.getByLabelText("Secteur d'activité"), { target: { value: 'BTP / Construction' } });
    fireEvent.change(screen.getByLabelText('Nombre de salariés'), { target: { value: '6-20' } });
    fireEvent.change(screen.getByLabelText("Votre principale difficulté aujourd'hui"), {
      target: { value: 'Je perds du temps sur des tâches répétitives' },
    });

    // Submit audit → Frictions
    fireEvent.click(screen.getByText('Voir mon diagnostic'));
    expect(screen.getByText('Votre synthèse')).toBeInTheDocument();
    expect(screen.getByText('Ressaisie systématique des devis')).toBeInTheDocument();

    // Frictions → Score
    fireEvent.click(screen.getByText('Voir le diagnostic complet et le score'));
    expect(screen.getByText('Votre diagnostic')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();

    // Score → Value
    fireEvent.click(screen.getByText('Voir comment aller plus loin'));
    expect(screen.getByText('Trois façons de continuer')).toBeInTheDocument();
  });
});
