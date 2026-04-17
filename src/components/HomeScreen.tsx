import { useState } from 'react';
import { useGameActions } from '../hooks/useGameActions';
import { useResumeSession } from '../hooks/useResumeSession';
import { SuggestSheet } from './SuggestSheet';
import { FeedbackSheet } from './FeedbackSheet';

export function HomeScreen() {
  const actions = useGameActions();
  const { canResume } = useResumeSession();
  const [showSuggest, setShowSuggest] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <main className="screen active v8-home" aria-label="Home">

      {/* Hero card */}
      <div className="v8-home-hero">
        <p className="v8-home-kicker">THE DESI PARTY GAME</p>
        <h1 className="v8-home-title">
          <span>BAD</span>
          <br />
          <span className="v8-home-title__accent">BOLLYWOOD</span>
          <br />
          <span>PLOTS</span>
        </h1>
        <p className="v8-home-tag">
          We describe Bollywood movies badly. You guess which film it is.
        </p>
        <p className="v8-home-sub">
          Simple, chaotic, and best played with chai and friends.
        </p>
        <div className="v8-home-meta" aria-label="Game details">
          <span>5 CARDS</span>
          <span className="v8-home-meta__dot" aria-hidden="true" />
          <span>6 MIN ROUNDS</span>
          <span className="v8-home-meta__dot" aria-hidden="true" />
          <span>SOLO</span>
          <span className="v8-home-meta__dot" aria-hidden="true" />
          <span>PARTY</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="v8-home-ctas">
        {canResume && (
          <button
            className="v8-home-resume"
            onClick={() => {
              window.location.reload();
            }}
          >
            Resume last game
          </button>
        )}
        <button
          className="v8-home-btn v8-home-btn--primary"
          onClick={() => actions.selectMode('HI')}
          aria-label="Pass and Play"
        >
          PASS &amp; PLAY
        </button>
        <button
          className="v8-home-btn v8-home-btn--secondary"
          onClick={() => actions.startSoloGame('HI')}
          aria-label="Solo"
        >
          SOLO
        </button>
      </div>

      {/* Footer */}
      <footer className="v8-home-footer">
        <button className="v8-home-footer__link" onClick={() => setShowSuggest(true)}>
          Suggest a Movie
        </button>
        <span className="v8-home-footer__dot" aria-hidden="true">&middot;</span>
        <button className="v8-home-footer__link" onClick={() => setShowFeedback(true)}>
          Feedback
        </button>
        <span className="v8-home-footer__dot" aria-hidden="true">&middot;</span>
        <a
          href="https://www.linkedin.com/in/srinityaduppanapudisatya/"
          target="_blank"
          rel="noopener"
          className="v8-home-footer__link"
        >
          Made by @Srinitya
        </a>
      </footer>

      {showSuggest && <SuggestSheet onClose={() => setShowSuggest(false)} />}
      {showFeedback && <FeedbackSheet onClose={() => setShowFeedback(false)} />}
    </main>
  );
}
