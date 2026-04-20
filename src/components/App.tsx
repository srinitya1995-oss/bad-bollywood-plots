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
    <>
      <BgLayer />
      <main className="screen active v8-home" aria-label="Loading">
        <div className="v8-home-hero">
          <p className="v8-home-kicker">THE DESI PARTY GAME</p>
          <h1 className="v8-home-title">
            <span>BAD</span>
            <br />
            <span className="v8-home-title__accent">DESI</span>
            <br />
            <span>PLOTS</span>
          </h1>
          <p className="v8-home-sub" style={{ marginTop: 18, color: loadError ? 'var(--tomato)' : 'var(--v8-ink)', opacity: loadError ? 1 : 0.6 }}>
            {loadError ? "COULDN'T LOAD. TAP TO RETRY." : 'LOADING CARDS...'}
          </p>
          {loadError && (
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: 14, fontFamily: 'Bebas Neue, sans-serif', fontSize: 13, letterSpacing: '0.2em', color: 'var(--v8-ink)', background: 'var(--gold-bright)', border: '2px solid var(--v8-ink)', borderRadius: 999, padding: '10px 20px', cursor: 'pointer' }}
            >
              RETRY
            </button>
          )}
        </div>
      </main>
    </>
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
