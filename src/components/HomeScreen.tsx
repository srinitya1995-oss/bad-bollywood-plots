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
        <div className="color-strip" />
        <div className="home-content">
          <div className="top-row">
            <button className="top-link" onClick={() => setShowSuggest(true)}>Suggest a Movie</button>
            <a href="https://www.linkedin.com/in/srinityaduppanapudisatya/" target="_blank" rel="noopener" className="top-link">@Srinitya</a>
          </div>
          <div className="hero">
            <h1 className="hero-title">
              <span className="title-bad">Bad</span>
              <span className="title-plots">Plots</span>
            </h1>
            <p className="hero-explain">
              We describe Bollywood and Tollywood movies <strong>badly</strong>.
              You guess which film it is. Simple, chaotic, and best played with chai and friends.
            </p>
          </div>
          <div className="section-label">Pick Your Cinema</div>
          <div className="cinema-row">
            <button className="cinema-btn bw" onClick={() => handleCinemaClick('BW')}>
              <div className="cinema-name">Bollywood</div>
              <div className="cinema-sub">Hindi films</div>
            </button>
            <button className="cinema-btn tw" onClick={() => handleCinemaClick('TW')}>
              <div className="cinema-name">Tollywood</div>
              <div className="cinema-sub">Telugu films</div>
            </button>
          </div>
          <button className="add-players-link" onClick={() => setWantMultiplayer(!wantMultiplayer)}>
            {wantMultiplayer ? '\u2713 Playing with friends' : 'Play with friends?'}
          </button>
          <div className="modes">
            <div className="section-label">How Do You Want to Play?</div>
            <div className="mode-cards">
              <button className={`mode-card party${gameMode === 'party' ? ' selected' : ''}`} onClick={() => handleModeChange('party')}>
                <span className="mode-tag">Popular</span>
                <div className="mode-card-name">Party</div>
                <div className="mode-desc">12 cards, mixed difficulty. Perfect for game night with friends.</div>
                <span className="mode-check">{'\u2713'}</span>
              </button>
              <button className={`mode-card endless${gameMode === 'endless' ? ' selected' : ''}`} onClick={() => handleModeChange('endless')}>
                <div className="mode-card-name">Endless</div>
                <div className="mode-desc">Keep going until you run out of lives. How far can you get?</div>
                <span className="mode-check">{'\u2713'}</span>
              </button>
            </div>
          </div>
        </div>
        <footer className="home-footer">
          <button className="footer-link" onClick={() => setShowFeedback(true)}>Feedback</button>
        </footer>
      </div>
      {showSuggest && <SuggestSheet onClose={() => setShowSuggest(false)} />}
      {showFeedback && <FeedbackSheet onClose={() => setShowFeedback(false)} />}
    </main>
  );
}
