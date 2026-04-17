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

        {/* ── Title ── */}
        <header className="home-hero">
          <h1 className="home-title">
            <span className="home-title__bad">BAD</span>
            <span className="home-title__plots">PLOTS</span>
          </h1>
          <p className="home-tagline">Guess the movie from the terrible plot</p>
        </header>

        {/* ── Pick your cinema ── */}
        <section className="home-cinema">
          {activeIndustries.map(([code, meta]) => (
            <button
              key={code}
              className={`cinema-btn cinema-btn--${meta.packId}`}
              onClick={() => handleCinemaClick(code)}
              aria-label={`Play ${meta.label}`}
            >
              <span className="cinema-btn__lang">{meta.lang}</span>
              <span className="cinema-btn__sub">{meta.label}</span>
            </button>
          ))}
        </section>

        {/* ── Mode + options ── */}
        <section className="home-options">
          <div className="home-mode-pill" role="group" aria-label="Game mode">
            <button
              className={`mode-pill__btn${gameMode === 'party' ? ' is-active' : ''}`}
              onClick={() => handleModeChange('party')}
              aria-pressed={gameMode === 'party'}
            >
              Party
            </button>
            <button
              className={`mode-pill__btn${gameMode === 'endless' ? ' is-active' : ''}`}
              onClick={() => handleModeChange('endless')}
              aria-pressed={gameMode === 'endless'}
            >
              Endless
            </button>
          </div>
          <p className="home-mode-desc">
            {gameMode === 'party'
              ? '12 cards · mixed difficulty'
              : 'Keep going until you drop'
            }
          </p>
          <button
            className={`home-friends-btn${wantMultiplayer ? ' is-active' : ''}`}
            onClick={() => setWantMultiplayer(!wantMultiplayer)}
            aria-pressed={wantMultiplayer}
            aria-label="Play with friends"
          >
            {wantMultiplayer ? '✓ With friends' : '+ Add friends'}
          </button>
        </section>

        {/* ── Coming soon ── */}
        {comingSoonIndustries.length > 0 && (
          <section className="home-coming">
            {comingSoonIndustries.map(([code, meta]) => (
              <button
                key={code}
                className="coming-chip"
                onClick={() => handleComingSoonSuggest(meta.lang)}
                aria-label={`Suggest movies for ${meta.lang}`}
              >
                <span className="coming-chip__lang">{meta.lang}</span>
                <span className="coming-chip__label">Coming soon</span>
              </button>
            ))}
          </section>
        )}

        {/* ── Footer ── */}
        <footer className="home-footer">
          <button className="home-footer__link" onClick={() => { setSuggestIndustry(undefined); setShowSuggest(true); }}>
            Suggest a Movie
          </button>
          <span className="home-footer__dot" aria-hidden="true">·</span>
          <button className="home-footer__link" onClick={() => setShowFeedback(true)}>
            Feedback
          </button>
          <span className="home-footer__dot" aria-hidden="true">·</span>
          <a
            href="https://www.linkedin.com/in/srinityaduppanapudisatya/"
            target="_blank"
            rel="noopener"
            className="home-footer__link"
          >
            @Srinitya
          </a>
        </footer>

      </div>

      {showSuggest && <SuggestSheet onClose={handleCloseSuggest} defaultIndustry={suggestIndustry} />}
      {showFeedback && <FeedbackSheet onClose={() => setShowFeedback(false)} />}
    </main>
  );
}
