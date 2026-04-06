import { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { AuditPage } from './pages/AuditPage';
import { FrictionsPage } from './pages/FrictionsPage';
import { ScorePage } from './pages/ScorePage';
import { ValuePage } from './pages/ValuePage';

type Screen = 'landing' | 'audit' | 'frictions' | 'score' | 'value';

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');

  const navigate = (to: Screen) => {
    setScreen(to);
    window.scrollTo(0, 0);
  };

  switch (screen) {
    case 'landing':
      return <LandingPage onStart={() => navigate('audit')} />;
    case 'audit':
      return (
        <AuditPage
          onSubmit={() => navigate('frictions')}
          onBack={() => navigate('landing')}
        />
      );
    case 'frictions':
      return (
        <FrictionsPage
          onNext={() => navigate('score')}
          onBack={() => navigate('audit')}
        />
      );
    case 'score':
      return (
        <ScorePage
          onNext={() => navigate('value')}
          onBack={() => navigate('frictions')}
        />
      );
    case 'value':
      return <ValuePage onBack={() => navigate('score')} />;
  }
}
