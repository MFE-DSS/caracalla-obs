import { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { AuditPage } from './pages/AuditPage';
import { FrictionsPage } from './pages/FrictionsPage';
import { ScorePage } from './pages/ScorePage';
import { ValuePage } from './pages/ValuePage';
import { buildEngineOutputV2 } from './engine/services/buildEngineOutputV2';
import type { EngineOutputV2 } from './engine/domain/arbitration';
import type { RawAuditInput } from './engine/domain/types';

type Screen = 'landing' | 'audit' | 'frictions' | 'score' | 'value';

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [engineOutput, setEngineOutput] = useState<EngineOutputV2 | null>(null);

  const navigate = (to: Screen) => {
    setScreen(to);
    window.scrollTo(0, 0);
  };

  const handleAuditSubmit = (data: Record<string, string>) => {
    const input: RawAuditInput = {
      company_name: data.company || '',
      company_size_band: data.size || '',
      industry_hint: data.sector || '',
      pain_text: data.pain || '',
    };
    const output = buildEngineOutputV2(input);
    setEngineOutput(output);
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
          onBack={() => navigate('score')}
        />
      );
  }
}
