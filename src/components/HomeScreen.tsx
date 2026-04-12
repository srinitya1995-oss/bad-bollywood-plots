import { useState } from 'react';
import { useGameActions } from '../hooks/useGameActions';
import { SuggestSheet } from './SuggestSheet';
import { FeedbackSheet } from './FeedbackSheet';
import type { GameMode } from '../core/types';

export function HomeScreen() {
  const actions = useGameActions();
  const [gameMode, setGameMode] = useState<GameMode>('party');
  const [showSuggest, setShowSuggest] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [wantMultiplayer, setWantMultiplayer] = useState(false);

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode);
    actions.setGameMode(mode);
  };

  const handleCinemaClick = (industry: 'BW' | 'TW') => {
    if (wantMultiplayer) {
      actions.selectMode(industry);
    } else {
      actions.startSoloGame(industry);
    }
  };

  return (
    <main className="screen active" aria-label="Home">
      <div className="home-page">

        {/* ── Atmospheric background patches ── */}
        <div className="home-bg-patches" aria-hidden="true">
          <div className="home-patch home-patch--tl" />
          <div className="home-patch home-patch--br" />
        </div>

        {/* ── Top utility bar ── */}
        <div className="home-topbar">
          <span className="home-toplink" aria-hidden="true">Bad Plots</span>
          <a
            href="https://www.linkedin.com/in/srinityaduppanapudisatya/"
            target="_blank"
            rel="noopener"
            className="home-toplink"
          >
            @Srinitya
          </a>
        </div>

        {/* ── Logo lockup ── */}
        <div className="home-logo-block">
          {/* Ornamental top rule */}
          <div className="home-ornament-top" aria-hidden="true">
            <svg viewBox="0 0 280 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="9" x2="110" y2="9" stroke="#D4A843" strokeWidth="1"/>
              <circle cx="120" cy="9" r="3" fill="#D4A843"/>
              <circle cx="133" cy="9" r="2" fill="#D4A843" fillOpacity="0.6"/>
              <polygon points="140,2 148,9 140,16 132,9" fill="#D4A843"/>
              <circle cx="147" cy="9" r="2" fill="#D4A843" fillOpacity="0.6"/>
              <circle cx="160" cy="9" r="3" fill="#D4A843"/>
              <line x1="170" y1="9" x2="280" y2="9" stroke="#D4A843" strokeWidth="1"/>
            </svg>
          </div>

          {/* The title — this is the hero */}
          <h1 className="home-title">
            <span className="home-title__bad">BAD</span>
            <span className="home-title__plots">PLOTS</span>
          </h1>

          <p className="home-tagline">Terrible plots. Real movies.</p>
          <p className="home-how">Read the terrible plot → Guess the movie → Tap to reveal</p>

          {/* Ornamental bottom rule */}
          <div className="home-ornament-bottom" aria-hidden="true">
            <svg viewBox="0 0 280 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="9" x2="90" y2="9" stroke="#D4A843" strokeWidth="1" strokeOpacity="0.5"/>
              <circle cx="98" cy="9" r="2" fill="#D4A843" fillOpacity="0.5"/>
              <circle cx="107" cy="9" r="3" fill="#D4A843" fillOpacity="0.7"/>
              <circle cx="116" cy="9" r="2" fill="#D4A843" fillOpacity="0.5"/>
              {/* Paisley centre */}
              <path d="M134,5 Q144,9 134,13 Q126,9 134,5z" fill="#D4A843" fillOpacity="0.8"/>
              <circle cx="134" cy="9" r="1.5" fill="#1A0F0A"/>
              <circle cx="164" cy="9" r="2" fill="#D4A843" fillOpacity="0.5"/>
              <circle cx="173" cy="9" r="3" fill="#D4A843" fillOpacity="0.7"/>
              <circle cx="182" cy="9" r="2" fill="#D4A843" fillOpacity="0.5"/>
              <line x1="190" y1="9" x2="280" y2="9" stroke="#D4A843" strokeWidth="1" strokeOpacity="0.5"/>
            </svg>
          </div>
        </div>

        {/* ── Cinema panels ── */}
        <div className="home-cinema">
          <button
            className="cinema-panel cinema-panel--bw"
            onClick={() => handleCinemaClick('BW')}
            aria-label="Play Bollywood — Hindi films"
          >
            {/* Texture patch inside panel */}
            <div className="cinema-panel__texture" aria-hidden="true" />
            <div className="cinema-panel__content">
              <span className="cinema-panel__industry">Bollywood</span>
              <span className="cinema-panel__lang">Hindi films</span>
            </div>
            {/* Corner ornaments */}
            <svg className="cinema-panel__corner cinema-panel__corner--tl" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M2,12 Q2,2 12,2 Q8,2 8,8 Q8,14 2,14z" fill="#D4A843" fillOpacity="0.5"/>
              <circle cx="6" cy="6" r="1.5" fill="#D4A843" fillOpacity="0.7"/>
            </svg>
            <svg className="cinema-panel__corner cinema-panel__corner--br" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M22,12 Q22,22 12,22 Q16,22 16,16 Q16,10 22,10z" fill="#D4A843" fillOpacity="0.5"/>
              <circle cx="18" cy="18" r="1.5" fill="#D4A843" fillOpacity="0.7"/>
            </svg>
          </button>

          <button
            className="cinema-panel cinema-panel--tw"
            onClick={() => handleCinemaClick('TW')}
            aria-label="Play Tollywood — Telugu films"
          >
            <div className="cinema-panel__texture" aria-hidden="true" />
            <div className="cinema-panel__content">
              <span className="cinema-panel__industry">Tollywood</span>
              <span className="cinema-panel__lang">Telugu films</span>
            </div>
            <svg className="cinema-panel__corner cinema-panel__corner--tl" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M2,12 Q2,2 12,2 Q8,2 8,8 Q8,14 2,14z" fill="#D4A843" fillOpacity="0.5"/>
              <circle cx="6" cy="6" r="1.5" fill="#D4A843" fillOpacity="0.7"/>
            </svg>
            <svg className="cinema-panel__corner cinema-panel__corner--br" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M22,12 Q22,22 12,22 Q16,22 16,16 Q16,10 22,10z" fill="#D4A843" fillOpacity="0.5"/>
              <circle cx="18" cy="18" r="1.5" fill="#D4A843" fillOpacity="0.7"/>
            </svg>
          </button>
        </div>

        {/* ── Options strip ── */}
        <div className="home-options">
          {/* Friends toggle */}
          <button
            className={`home-friends-toggle${wantMultiplayer ? ' is-active' : ''}`}
            onClick={() => setWantMultiplayer(!wantMultiplayer)}
            aria-pressed={wantMultiplayer}
            aria-label="Play with friends"
          >
            {wantMultiplayer
              ? <><span className="home-friends-toggle__check">✓</span> Playing with friends</>
              : '+ Play with friends?'
            }
          </button>

          {/* Mode pill */}
          <div className="home-mode-pill" role="group" aria-label="Game mode">
            <button
              className={`home-mode-pill__btn${gameMode === 'party' ? ' is-active' : ''}`}
              onClick={() => handleModeChange('party')}
              aria-pressed={gameMode === 'party'}
            >
              Party
            </button>
            <button
              className={`home-mode-pill__btn${gameMode === 'endless' ? ' is-active' : ''}`}
              onClick={() => handleModeChange('endless')}
              aria-pressed={gameMode === 'endless'}
            >
              Endless
            </button>
          </div>
          <p className="home-mode-desc">
            {gameMode === 'party'
              ? '12 cards · mixed difficulty · perfect for game night'
              : 'Keep going until you run out of lives'
            }
          </p>
        </div>

        {/* ── Footer ── */}
        <footer className="home-footer">
          <button className="home-footer__link" onClick={() => setShowSuggest(true)}>
            Suggest a Movie
          </button>
          <span className="home-footer__dot" aria-hidden="true">·</span>
          <button className="home-footer__link" onClick={() => setShowFeedback(true)}>
            Feedback
          </button>
        </footer>

      </div>

      {showSuggest && <SuggestSheet onClose={() => setShowSuggest(false)} />}
      {showFeedback && <FeedbackSheet onClose={() => setShowFeedback(false)} />}
    </main>
  );
}
