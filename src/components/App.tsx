import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameState } from '../hooks/useGameState';
import { getGameInstance } from '../hooks/gameInstance';
import { initPostHog, initAnalyticsSubscriber } from '../analytics/posthog';
import { HomeScreen } from './HomeScreen';
import { GameScreen } from './GameScreen';
import { ResultsScreen } from './ResultsScreen';
import { PlayerSetup } from './PlayerSetup';
import { TurnInterstitial } from './TurnInterstitial';
import { Toast } from './Toast';
import { BgLayer } from './BgLayer';
import { TopBand } from './TopBand';
import { useAbandonDetection } from '../hooks/useAbandonDetection';
import '../style.css';

export function App() {
  const { state } = useGameState();
  const [ready, setReady] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const prevStateRef = useRef(state);
  const toggleMenu = useCallback(() => setMenuOpen(prev => !prev), []);

  useAbandonDetection();

  // Focus management: move focus to the new screen's heading on state change
  useEffect(() => {
    if (prevStateRef.current !== state && ready) {
      // Defer focus to after render
      requestAnimationFrame(() => {
        const main = document.querySelector('main.screen.active, .turn-interstitial');
        if (main) {
          const heading = main.querySelector('h1, h2') as HTMLElement | null;
          if (heading) {
            heading.setAttribute('tabindex', '-1');
            heading.focus({ preventScroll: false });
          }
        }
      });
    }
    prevStateRef.current = state;
  }, [state, ready]);

  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const instance = getGameInstance();
    instance.init().then(() => {
      initPostHog();
      initAnalyticsSubscriber(instance.bus, instance.sessionId);
      setReady(true);
    }).catch(() => {
      setLoadError(true);
    });
  }, []);

  useEffect(() => { setShowSetup(state === 'setup'); }, [state]);

  // Close menu when leaving game screens
  useEffect(() => {
    if (state !== 'playing' && state !== 'flipped' && state !== 'scoring') {
      setMenuOpen(false);
    }
  }, [state]);

  if (!ready) return (
    <main className="screen active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '48px', color: 'var(--cream)', marginBottom: '0.5rem' }}>Bad Plots</h1>
        {loadError ? (
          <button
            onClick={() => window.location.reload()}
            style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: 'var(--cream)', opacity: 0.8, background: 'none', border: '1px solid var(--cream)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}
          >
            Could not load cards. Tap to retry.
          </button>
        ) : (
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: 'var(--cream)', opacity: 0.6 }}>Loading cards...</p>
        )}
      </div>
    </main>
  );

  return (
    <>
      <BgLayer />
      <TopBand onMenuClick={toggleMenu} />
      {state === 'home' && <HomeScreen />}
      {(state === 'playing' || state === 'flipped' || state === 'scoring') && <GameScreen menuOpen={menuOpen} onMenuClose={() => setMenuOpen(false)} />}
      {(state === 'turnChange' || state === 'continue') && <TurnInterstitial />}
      {state === 'results' && <ResultsScreen />}
      {showSetup && <PlayerSetup onClose={() => { setShowSetup(false); if (getGameInstance().fsm.getState() === 'setup') { getGameInstance().fsm.transition('home'); } }} />}
      <Toast />
    </>
  );
}
