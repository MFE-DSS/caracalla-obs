import { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { AuditPage } from './pages/AuditPage';
import { FrictionsPage } from './pages/FrictionsPage';
import { ScorePage } from './pages/ScorePage';
import { ValuePage } from './pages/ValuePage';
import { submitAudit } from './api';
import type { EngineOutputV2 } from './engine/domain/arbitration';

type Screen = 'landing' | 'audit' | 'frictions' | 'score' | 'value';

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [engineOutput, setEngineOutput] = useState<EngineOutputV2 | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);

  const navigate = (to: Screen) => {
    setScreen(to);
    window.scrollTo(0, 0);
  };

  const handleAuditSubmit = async (data: Record<string, string>) => {
    const result = await submitAudit({
      company: data.company || '',
      sector: data.sector || '',
      size: data.size || '',
      pain: data.pain || '',
    });
    setAuditId(result.audit_id);
    setEngineOutput(result.engineOutput);
    navigate('frictions');
  };

  switch (screen) {
    case 'landing':
      return <LandingPage onStart={() => navigate('audit')} />;
    case 'audit':
      return (
        <AuditPage
          onSubmit={handleAuditSubmit}
          onBack={() => navigate('landing')}
        />
      );
    case 'frictions':
      return (
        <FrictionsPage
          engineOutput={engineOutput!}
          onNext={() => navigate('score')}
          onBack={() => navigate('audit')}
        />
      );
    case 'score':
      return (
        <ScorePage
          engineOutput={engineOutput!}
          onNext={() => navigate('value')}
          onBack={() => navigate('frictions')}
        />
      );
    case 'value':
      return (
        <ValuePage
          engineOutput={engineOutput!}
          auditId={auditId}
          onBack={() => navigate('score')}
        />
      );
  }
}
