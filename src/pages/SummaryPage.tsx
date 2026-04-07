import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { FrictionsPage } from './FrictionsPage';
import { ScorePage } from './ScorePage';
import { ValuePage } from './ValuePage';
import { buildEngineOutputV2 } from '../engine/services/buildEngineOutputV2';
import { getAuditStatus, createPaymentSession } from '../api';
import { saveSession } from '../services/session';
import { track } from '../analytics';
import type { EngineOutputV2 } from '../engine/domain/arbitration';

type SummaryScreen = 'frictions' | 'score' | 'value';

export function SummaryPage() {
  const { auditId } = useParams<{ auditId: string }>();
  const navigate = useNavigate();
  const [screen, setScreen] = useState<SummaryScreen>('frictions');
  const [engineOutput, setEngineOutput] = useState<EngineOutputV2 | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auditId) return;

    async function load() {
      setLoading(true);
      const status = await getAuditStatus(auditId!);

      if (status) {
        setIsPaid(status.paid);
        saveSession(auditId!, status.paid, 'summary', null, status.refresh_token ?? status.access_token);
        // Reconstruct engine output locally (backend stores it but we need full V2 for UI)
        // In production, we'd fetch the full report payload
        const output = buildEngineOutputV2({
          company_name: status.company_name,
          company_size_band: '',
          industry_hint: '',
          pain_text: '',
        });
        setEngineOutput(output);
      } else {
        // API unavailable — check if we have local data
        setError('Diagnostic introuvable ou indisponible.');
      }
      setLoading(false);
    }

    // If we already have engine output from navigation state, use it
    const navState = window.history.state?.usr as { engineOutput?: EngineOutputV2 } | undefined;
    if (navState?.engineOutput) {
      setEngineOutput(navState.engineOutput);
      setLoading(false);
      return;
    }

    load();
  }, [auditId]);

  const nav = (to: SummaryScreen) => {
    setScreen(to);
    window.scrollTo(0, 0);
  };

  const handlePayment = async () => {
    if (!auditId) return;
    track('paywall_cta_clicked', { price: '49' });

    if (isPaid) {
      navigate(`/audit/${auditId}/premium`);
      return;
    }

    const result = await createPaymentSession(auditId);
    if ('error' in result) {
      if (result.error === 'already_paid') {
        setIsPaid(true);
        saveSession(auditId, true, 'premium');
        navigate(`/audit/${auditId}/premium`);
      }
      return;
    }

    const accessToken = 'access_token' in result ? (result as { access_token?: string }).access_token : undefined;
    const refreshToken = 'refresh_token' in result ? (result as { refresh_token?: string }).refresh_token : undefined;
    if (result.url.includes(window.location.origin)) {
      setIsPaid(true);
      saveSession(auditId, true, 'premium', accessToken, refreshToken);
      navigate(`/audit/${auditId}/premium`);
    } else {
      window.location.href = result.url;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--gray-400)' }}>
        Chargement du diagnostic...
      </div>
    );
  }

  if (error || !engineOutput) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px', padding: '16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--text-base)' }}>
          {error ?? 'Ce diagnostic est introuvable ou n\'est plus disponible.'}
        </p>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '12px 24px', cursor: 'pointer', fontFamily: 'var(--font-family)' }}
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  switch (screen) {
    case 'frictions':
      return (
        <FrictionsPage
          engineOutput={engineOutput}
          onNext={() => nav('score')}
          onBack={() => navigate('/audit/new')}
        />
      );
    case 'score':
      return (
        <ScorePage
          engineOutput={engineOutput}
          onNext={() => nav('value')}
          onBack={() => nav('frictions')}
        />
      );
    case 'value':
      return (
        <ValuePage
          engineOutput={engineOutput}
          auditId={auditId}
          onBack={() => nav('score')}
          onViewPremium={handlePayment}
        />
      );
  }
}
