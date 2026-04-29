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

const HERO_LOADING_STYLES: React.CSSProperties = {
  background: 'var(--cream)', flex: 1,
  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
  textAlign: 'center', padding: '0 28px',
};

export function App() {
  const { state } = useGameState();
  const [ready, setReady] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const prevStateRef = useRef(state);
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);

  useAbandonDetection();

  useEffect(() => {
    if (prevStateRef.current !== state && ready) {
      requestAnimationFrame(() => {
        const main = document.querySelector('main.screen.active, .v8-inter');
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
    }).catch(() => setLoadError(true));
  }, []);

  useEffect(() => { setShowSetup(state === 'setup'); }, [state]);

  useEffect(() => {
    if (state !== 'playing' && state !== 'flipped' && state !== 'scoring') {
      setMenuOpen(false);
    }
  }, [state]);

  if (!ready) {
    return (
      <>
        <BgLayer />
        <div className="phone-frame">
          <TopBand />
          <main className="screen active v8-home" aria-label="Loading" style={HERO_LOADING_STYLES}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 12, letterSpacing: '0.32em', color: 'var(--tomato)', textTransform: 'uppercase' }}>
              The desi party game
            </div>
            <div
              style={{
                marginTop: 18, fontFamily: 'Anton, Impact, sans-serif', fontSize: 82, lineHeight: 0.88,
                color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '-0.02em',
              }}
            >
              Bad<br />
              <span style={{ color: 'var(--tomato)', textShadow: '3px 3px 0 var(--ink), 6px 6px 0 var(--gold)' }}>Desi</span><br />
              Plots.
            </div>
            <div style={{ marginTop: 26, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span className="loading-dot loading-dot--a" style={{ width: 8, height: 8, background: 'var(--tomato)' }} />
              <span className="loading-dot loading-dot--b" style={{ width: 8, height: 8, background: 'var(--tomato)' }} />
              <span className="loading-dot loading-dot--c" style={{ width: 8, height: 8, background: 'var(--tomato)' }} />
            </div>
            <div
              style={{
                marginTop: 10, fontFamily: 'Bebas Neue, sans-serif', fontSize: 11,
                letterSpacing: '0.3em', color: loadError ? 'var(--tomato)' : 'var(--ink-muted)',
                textTransform: 'uppercase',
              }}
            >
              {loadError ? "Couldn't load. Tap to retry." : 'Loading cards…'}
            </div>
            {loadError && (
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginTop: 14, fontFamily: 'Bebas Neue, sans-serif', fontSize: 13,
                  letterSpacing: '0.2em', color: 'var(--ink)', background: 'var(--gold)',
                  border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)',
                  padding: '10px 20px', cursor: 'pointer', textTransform: 'uppercase',
                }}
              >
                Retry
              </button>
            )}
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <BgLayer />
      <div className="phone-frame">
        <TopBand onMenuClick={toggleMenu} />
        {state === 'home' && <HomeScreen />}
        {(state === 'playing' || state === 'flipped' || state === 'scoring') && (
          <GameScreen menuOpen={menuOpen} onMenuClose={() => setMenuOpen(false)} />
        )}
        {(state === 'turnChange' || state === 'continue') && <TurnInterstitial />}
        {state === 'results' && <ResultsScreen />}
        {showSetup && (
          <PlayerSetup onClose={() => {
            setShowSetup(false);
            if (getGameInstance().fsm.getState() === 'setup') {
              getGameInstance().fsm.transition('home');
            }
          }} />
        )}
      </div>
      <Toast />
    </>
  );
}
