import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { HeroBlock } from '../components/HeroBlock';
import { SectionHeader } from '../components/SectionHeader';
import { PrimaryCTA } from '../components/PrimaryCTA';
import { ResponsiveStack } from '../components/ResponsiveStack';
import { Footer } from '../components/Footer';
import { loadSession } from '../services/session';
import { track } from '../analytics';
import './LandingPage.css';

interface LandingPageProps {
  onStart?: () => void; // Optional: for backward compat with tests
}

const painPoints = [
  {
    title: 'Ressaisie permanente',
    text: 'Vous entrez les mêmes informations dans plusieurs outils, à chaque devis, chaque commande, chaque facture.',
  },
  {
    title: 'Relances oubliées',
    text: 'Les devis envoyés ne sont pas suivis. Les relances dépendent de la mémoire de chacun.',
  },
  {
    title: 'Visibilité absente',
    text: 'Impossible de savoir en un coup d\'œil où en est l\'activité, quels chantiers avancent, lesquels bloquent.',
  },
  {
    title: 'Dépendance à une personne',
    text: 'Si votre responsable planning est absent, personne ne sait quoi faire le lendemain matin.',
  },
];

const steps = [
  { number: '1', title: 'Répondez à l\'audit', detail: '4 questions simples, 2 minutes' },
  { number: '2', title: 'Recevez votre diagnostic', detail: 'Frictions identifiées, score expliqué' },
  { number: '3', title: 'Décidez quoi améliorer', detail: 'Rapport complet avec plan d\'action' },
];

export function LandingPage({ onStart }: LandingPageProps) {
  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    navigate = useNavigate();
  } catch {
    // Not inside a Router (e.g., in tests)
  }

  const session = loadSession();

  useEffect(() => {
    track('landing_viewed');
  }, []);

  const goToAudit = () => {
    if (onStart) {
      onStart();
    } else if (navigate) {
      navigate('/audit/new');
    }
  };

  const handleCta = () => {
    track('landing_cta_clicked', { cta_position: 'hero' });
    goToAudit();
  };

  const handleCtaBottom = () => {
    track('landing_cta_clicked', { cta_position: 'bottom' });
    goToAudit();
  };

  const handleResume = () => {
    if (!session || !navigate) return;
    const target = session.last_known_paid
      ? `/audit/${session.last_audit_id}/premium`
      : `/audit/${session.last_audit_id}/summary`;
    navigate(target);
  };

  return (
    <div className="landing">
      <HeroBlock
        title="Votre entreprise a des process. Sont-ils au bon niveau ?"
        subtitle="Un diagnostic opérationnel gratuit pour voir où votre activité perd du temps, où elle bloque, et ce qu'il faut améliorer en priorité."
        ctaLabel="Commencer le diagnostic gratuit"
        onCtaClick={handleCta}
      />

      {/* Resume last audit */}
      {session && navigate && (
        <section className="landing__section landing__resume" aria-label="Reprendre">
          <div className="landing__container" style={{ textAlign: 'center' }}>
            <PrimaryCTA
              label="Reprendre mon dernier diagnostic"
              onClick={handleResume}
              variant="secondary"
            />
          </div>
        </section>
      )}

      {/* Pain points */}
      <section className="landing__section" aria-label="Difficultés courantes">
        <div className="landing__container">
          <SectionHeader title="Vous vous reconnaissez ?" />
          <ResponsiveStack columns={2}>
            {painPoints.map((p) => (
              <article key={p.title} className="landing__pain-card">
                <h3 className="landing__pain-title">{p.title}</h3>
                <p className="landing__pain-text">{p.text}</p>
              </article>
            ))}
          </ResponsiveStack>
        </div>
      </section>

      {/* How it works */}
      <section className="landing__section landing__section--alt" aria-label="Comment ça marche">
        <div className="landing__container">
          <SectionHeader title="Comment ça marche" />
          <ResponsiveStack columns={3} gap="lg">
            {steps.map((s) => (
              <article key={s.number} className="landing__step-card">
                <span className="landing__step-number">{s.number}</span>
                <h3 className="landing__step-title">{s.title}</h3>
                <p className="landing__step-detail">{s.detail}</p>
              </article>
            ))}
          </ResponsiveStack>
        </div>
      </section>

      {/* Trust */}
      <section className="landing__section" aria-label="Transparence">
        <div className="landing__container landing__trust">
          <SectionHeader title="Transparence totale" />
          <p className="landing__trust-text">
            Pas de boîte noire. Chaque résultat vous montre d'où il vient et pourquoi il remonte.
            Vous voyez les sources, le raisonnement, et le niveau de confiance du diagnostic.
          </p>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="landing__section landing__section--cta" aria-label="Appel à l'action">
        <div className="landing__container" style={{ textAlign: 'center' }}>
          <p className="landing__cta-text">C'est gratuit — 2 minutes pour commencer.</p>
          <PrimaryCTA label="Commencer le diagnostic" onClick={handleCtaBottom} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
