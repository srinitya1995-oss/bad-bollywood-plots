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

  if (!ready) return null;

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
