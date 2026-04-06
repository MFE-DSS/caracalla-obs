import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { PremiumReportPage } from './PremiumReportPage';
import { getAuditStatus, getAuditReport } from '../api';
import { buildEngineOutputV2 } from '../engine/services/buildEngineOutputV2';
import { buildLocalPremiumReport } from '../services/localPremiumBuilder';
import { saveSession } from '../services/session';
import type { EngineOutputV2 } from '../engine/domain/arbitration';
import type { PremiumReportViewModel } from '../types/premiumReport';

export function PremiumPage() {
  const { auditId } = useParams<{ auditId: string }>();
  const navigate = useNavigate();
  const [engineOutput, setEngineOutput] = useState<EngineOutputV2 | null>(null);
  const [premiumView, setPremiumView] = useState<PremiumReportViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!auditId) return;

    async function load() {
      setLoading(true);

      // Check access
      const status = await getAuditStatus(auditId!);
      if (!status) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      if (!status.paid) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      saveSession(auditId!, true, 'premium');

      // Try to fetch the full report from backend
      const report = await getAuditReport(auditId!);
      if (report && !('locked' in report)) {
        setEngineOutput(report.report);
        setPremiumView(report.premium_view);
      } else {
        // Fallback: compute locally
        const output = buildEngineOutputV2({
          company_name: status.company_name,
          company_size_band: '',
          industry_hint: '',
          pain_text: '',
        });
        setEngineOutput(output);
        setPremiumView(buildLocalPremiumReport(output));
      }

      setLoading(false);
    }

    load();
  }, [auditId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--gray-400)' }}>
        Chargement du rapport premium...
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px', padding: '16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--text-base)', maxWidth: '400px' }}>
          Le rapport complet n'est pas encore débloqué pour ce diagnostic.
        </p>
        <button
          onClick={() => navigate(auditId ? `/audit/${auditId}/summary` : '/')}
          style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '12px 24px', cursor: 'pointer', fontFamily: 'var(--font-family)' }}
        >
          Retour à la synthèse
        </button>
      </div>
    );
  }

  if (!engineOutput || !premiumView) return null;

  return (
    <PremiumReportPage
      premiumView={premiumView}
      engineOutput={engineOutput}
      auditId={auditId}
      onBack={() => navigate(auditId ? `/audit/${auditId}/summary` : '/')}
    />
  );
}
