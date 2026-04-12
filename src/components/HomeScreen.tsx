import { useState } from 'react';
import { useGameActions } from '../hooks/useGameActions';
import { SuggestSheet } from './SuggestSheet';
import { FeedbackSheet } from './FeedbackSheet';
import { INDUSTRY_META, type Industry, type GameMode } from '../core/types';

export function HomeScreen() {
  const actions = useGameActions();
  const [gameMode, setGameMode] = useState<GameMode>('party');
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestIndustry, setSuggestIndustry] = useState<string | undefined>(undefined);
  const [showFeedback, setShowFeedback] = useState(false);
  const [wantMultiplayer, setWantMultiplayer] = useState(false);

  const activeIndustries = (Object.entries(INDUSTRY_META) as [Industry, typeof INDUSTRY_META[Industry]][]).filter(([, m]) => !m.comingSoon);
  const comingSoonIndustries = (Object.entries(INDUSTRY_META) as [Industry, typeof INDUSTRY_META[Industry]][]).filter(([, m]) => m.comingSoon);

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode);
    actions.setGameMode(mode);
  };

  const handleCinemaClick = (industry: Industry) => {
    if (wantMultiplayer) {
      actions.selectMode(industry);
    } else {
      actions.startSoloGame(industry);
    }
  };

  const handleComingSoonSuggest = (lang: string) => {
    setSuggestIndustry(lang);
    setShowSuggest(true);
  };

  const handleCloseSuggest = () => {
    setShowSuggest(false);
    setSuggestIndustry(undefined);
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

        {/* ── Active cinema panels (full-width hero) ── */}
        <div className="home-cinema">
          {activeIndustries.map(([code, meta]) => (
            <button
              key={code}
              className={`cinema-panel cinema-panel--${meta.packId}`}
              onClick={() => handleCinemaClick(code)}
              aria-label={`Play ${meta.label}`}
            >
              <div className="cinema-panel__texture" aria-hidden="true" />
              <div className="cinema-panel__content">
                <span className="cinema-panel__industry">{meta.lang}</span>
                <span className="cinema-panel__lang">{meta.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* ── Coming soon section (subordinate) ── */}
        {comingSoonIndustries.length > 0 && (
          <div className="home-coming-soon">
            <p className="home-coming-soon__label">More languages coming</p>
            <div className="home-coming-soon__row">
              {comingSoonIndustries.map(([code, meta]) => (
                <div key={code} className={`coming-soon-card coming-soon-card--${meta.packId}`}>
                  <div className="coming-soon-card__header">
                    <span className="coming-soon-card__dot" />
                    <span className="coming-soon-card__lang">{meta.lang}</span>
                  </div>
                  <span className="coming-soon-card__status">Coming soon</span>
                  <br />
                  <button
                    className="coming-soon-card__cta"
                    onClick={() => handleComingSoonSuggest(meta.lang)}
                    aria-label={`Suggest movies for ${meta.lang}`}
                  >
                    Suggest movies you want to see
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
          <button className="home-footer__link" onClick={() => { setSuggestIndustry(undefined); setShowSuggest(true); }}>
            Suggest a Movie
          </button>
          <span className="home-footer__dot" aria-hidden="true">·</span>
          <button className="home-footer__link" onClick={() => setShowFeedback(true)}>
            Feedback
          </button>
        </footer>

      </div>

      {showSuggest && <SuggestSheet onClose={handleCloseSuggest} defaultIndustry={suggestIndustry} />}
      {showFeedback && <FeedbackSheet onClose={() => setShowFeedback(false)} />}
    </main>
  );
}
