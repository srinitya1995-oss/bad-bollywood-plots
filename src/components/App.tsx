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
    <main className="screen active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--stage)' }}>
      <div style={{ textAlign: 'center', padding: '0 24px' }}>
        <h1 style={{ fontFamily: 'Anton, sans-serif', fontSize: '44px', lineHeight: 0.95, color: 'var(--paper)', letterSpacing: '0.02em', marginBottom: '18px', textShadow: '3px 3px 0 var(--tomato)' }}>
          BAD BOLLYWOOD<br />PLOTS
        </h1>
        {loadError ? (
          <button
            onClick={() => window.location.reload()}
            style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px', letterSpacing: '0.12em', color: 'var(--ink)', background: 'var(--paper)', border: '3px solid var(--ink)', borderRadius: '999px', padding: '12px 22px 10px', cursor: 'pointer', boxShadow: '4px 4px 0 var(--tomato)' }}
          >
            COULDN'T LOAD. TAP TO RETRY.
          </button>
        ) : (
          <p style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '13px', letterSpacing: '0.3em', color: 'var(--gold-bright)', opacity: 0.8 }}>LOADING CARDS...</p>
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
