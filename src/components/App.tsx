import { useState, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { getGameInstance } from '../hooks/gameInstance';
import { initPostHog, initAnalyticsSubscriber } from '../analytics/posthog';
import { HomeScreen } from './HomeScreen';
import { GameScreen } from './GameScreen';
import { ResultsScreen } from './ResultsScreen';
import { PlayerSetup } from './PlayerSetup';
import { TurnInterstitial } from './TurnInterstitial';
import { Toast } from './Toast';
import { useAbandonDetection } from '../hooks/useAbandonDetection';
import '../style.css';

export function App() {
  const { state } = useGameState();
  const [ready, setReady] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useAbandonDetection();

  useEffect(() => {
    const instance = getGameInstance();
    instance.init().then(() => {
      initPostHog();
      initAnalyticsSubscriber(instance.bus, instance.sessionId);
      setReady(true);
    });
  }, []);

  useEffect(() => { setShowSetup(state === 'setup'); }, [state]);

  if (!ready) return (
    <main className="screen active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '48px', color: 'var(--cream)', marginBottom: '0.5rem' }}>Bad Plots</h1>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: 'var(--cream)', opacity: 0.6 }}>Loading cards...</p>
      </div>
    </main>
  );

  return (
    <>
      {state === 'home' && <HomeScreen />}
      {(state === 'playing' || state === 'flipped' || state === 'scoring') && <GameScreen />}
      {(state === 'turnChange' || state === 'continue') && <TurnInterstitial />}
      {state === 'results' && <ResultsScreen />}
      {showSetup && <PlayerSetup onClose={() => { setShowSetup(false); if (getGameInstance().fsm.getState() === 'setup') { getGameInstance().fsm.transition('home'); } }} />}
      <Toast />
    </>
  );
}
