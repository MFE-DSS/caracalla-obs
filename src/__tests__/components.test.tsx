import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScoreBadge } from '../components/ScoreBadge';
import { EvidenceBlock } from '../components/EvidenceBlock';
import { ConfidenceBlock } from '../components/ConfidenceBlock';
import { FrictionCard } from '../components/FrictionCard';
import { HeroBlock } from '../components/HeroBlock';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { PaywallValuePanel } from '../components/PaywallValuePanel';

describe('ScoreBadge', () => {
  it('displays score value and explanation inline', () => {
    render(<ScoreBadge label="Maturité" value={42} explanation="Niveau intermédiaire." />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
    expect(screen.getByText('Niveau intermédiaire.')).toBeInTheDocument();
    expect(screen.getByText('Intermédiaire')).toBeInTheDocument();
  });

  it('shows correct level for high score', () => {
    render(<ScoreBadge label="Test" value={85} explanation="Bon niveau." />);
    expect(screen.getByText('Avancé')).toBeInTheDocument();
  });

  it('shows correct level for low score', () => {
    render(<ScoreBadge label="Test" value={25} explanation="À améliorer." />);
    expect(screen.getByText('À structurer')).toBeInTheDocument();
  });
});

describe('EvidenceBlock', () => {
  it('displays evidence items with sources', () => {
    render(
      <EvidenceBlock
        label="Preuves"
        items={[
          { text: 'Devis sous Excel', source: 'Audit étape 2' },
          { text: 'Facturation EBP', source: 'Audit étape 4' },
        ]}
      />
    );
    expect(screen.getByText('Preuves')).toBeInTheDocument();
    expect(screen.getByText('Devis sous Excel')).toBeInTheDocument();
    expect(screen.getByText('Audit étape 2')).toBeInTheDocument();
    expect(screen.getByText('Facturation EBP')).toBeInTheDocument();
  });
});

describe('ConfidenceBlock', () => {
  it('renders nothing for high confidence', () => {
    const { container } = render(
      <ConfidenceBlock level="high" message="Tout va bien" />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders warning for medium confidence', () => {
    render(
      <ConfidenceBlock
        level="medium"
        message="Données partielles"
        missingData={['Accès outils non effectué']}
      />
    );
    expect(screen.getByText('Confiance moyenne')).toBeInTheDocument();
    expect(screen.getByText('Données partielles')).toBeInTheDocument();
    expect(screen.getByText('Accès outils non effectué')).toBeInTheDocument();
  });

  it('renders alert for low confidence', () => {
    render(
      <ConfidenceBlock level="low" message="Très peu de données" />
    );
    expect(screen.getByText('Données insuffisantes')).toBeInTheDocument();
  });
});

describe('FrictionCard', () => {
  it('displays title, severity, and source', () => {
    render(
      <FrictionCard
        title="Ressaisie des devis"
        explanation="Détail complet."
        source="Audit étape 2"
        severity="critical"
        confidence="high"
      />
    );
    expect(screen.getByText('Ressaisie des devis')).toBeInTheDocument();
    expect(screen.getByText('Impact fort')).toBeInTheDocument();
    expect(screen.getByText('Audit étape 2')).toBeInTheDocument();
  });

  it('expands to show explanation on click', () => {
    render(
      <FrictionCard
        title="Test friction"
        explanation="Explication détaillée de la friction."
        source="Source test"
        severity="medium"
        confidence="medium"
      />
    );
    // Not visible before expand
    expect(screen.queryByText('Explication détaillée de la friction.')).not.toBeInTheDocument();

    // Expand
    fireEvent.click(screen.getByText('Voir le détail'));
    expect(screen.getByText('Explication détaillée de la friction.')).toBeInTheDocument();
  });

  it('calls onExpand when expanded', () => {
    const onExpand = vi.fn();
    render(
      <FrictionCard
        title="Test"
        explanation="Detail"
        source="Src"
        severity="low"
        confidence="high"
        onExpand={onExpand}
      />
    );
    fireEvent.click(screen.getByText('Voir le détail'));
    expect(onExpand).toHaveBeenCalledOnce();
  });
});

describe('HeroBlock', () => {
  it('renders title, subtitle and CTA', () => {
    const onClick = vi.fn();
    render(
      <HeroBlock
        title="Titre hero"
        subtitle="Sous-titre hero"
        ctaLabel="Commencer"
        onCtaClick={onClick}
      />
    );
    expect(screen.getByText('Titre hero')).toBeInTheDocument();
    expect(screen.getByText('Sous-titre hero')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Commencer'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('EmptyState', () => {
  it('renders message and optional detail', () => {
    render(<EmptyState message="Rien à afficher" detail="Revenez plus tard" />);
    expect(screen.getByText('Rien à afficher')).toBeInTheDocument();
    expect(screen.getByText('Revenez plus tard')).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('renders error message with alert role', () => {
    render(<ErrorState message="Une erreur est survenue" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();
  });
});

describe('PaywallValuePanel', () => {
  it('renders three columns with correct items', () => {
    const onPremium = vi.fn();
    const onConseil = vi.fn();
    render(
      <PaywallValuePanel
        gratuit={['Synthèse gratuite']}
        premium={['Rapport complet']}
        conseil={['Accompagnement']}
        price="49 €"
        onPremiumClick={onPremium}
        onConseilClick={onConseil}
      />
    );
    expect(screen.getAllByText('Synthèse gratuite').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Rapport complet').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Accompagnement').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('49 €')).toBeInTheDocument();
  });
});
