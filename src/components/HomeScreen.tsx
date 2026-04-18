import { useState } from 'react';
import { useGameActions } from '../hooks/useGameActions';
import { useResumeSession } from '../hooks/useResumeSession';
import { track } from '../analytics/posthog';
import { SuggestSheet } from './SuggestSheet';
import { FeedbackSheet } from './FeedbackSheet';
import { HowToScreen } from './HowToScreen';
import { SettingsScreen } from './SettingsScreen';
import type { Industry } from '../core/types';

export function HomeScreen() {
  const actions = useGameActions();
  const { canResume } = useResumeSession();
  const [showSuggest, setShowSuggest] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cinema, setCinema] = useState<Industry>('HI');

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
          <span>SOLO</span>
          <span className="v8-home-meta__dot" aria-hidden="true" />
          <span>PARTY</span>
          <span className="v8-home-meta__dot" aria-hidden="true" />
          <span>NO SETUP</span>
        </div>
      </div>

      {/* Cinema toggle */}
      <div className="v8-home-cinema-label" aria-hidden="true">PICK YOUR CINEMA</div>
      <div className="v8-home-cinema" role="radiogroup" aria-label="Choose cinema">
        <button
          className={`v8-home-cinema__btn${cinema === 'HI' ? ' is-active' : ''}`}
          role="radio"
          aria-checked={cinema === 'HI'}
          onClick={() => { window.posthog?.capture('cinema_pick', { cinema: 'HI' }); setCinema('HI'); }}
        >
          BOLLYWOOD
        </button>
        <button
          className={`v8-home-cinema__btn${cinema === 'TE' ? ' is-active' : ''}`}
          role="radio"
          aria-checked={cinema === 'TE'}
          onClick={() => { window.posthog?.capture('cinema_pick', { cinema: 'TE' }); setCinema('TE'); }}
        >
          TOLLYWOOD
        </button>
      </div>

      {/* CTAs */}
      <div className="v8-home-ctas">
        {canResume && (
          <button
            className="v8-home-resume"
            onClick={() => {
              track.resumeUsed();
              window.location.reload();
            }}
          >
            Resume last game
          </button>
        )}
        <button
          className="v8-home-btn v8-home-btn--primary"
          onClick={() => actions.selectMode(cinema)}
          aria-label="Pass and Play"
        >
          PASS &amp; PLAY
        </button>
        <button
          className="v8-home-btn v8-home-btn--secondary"
          onClick={() => actions.startSoloGame(cinema)}
          aria-label="Solo"
        >
          SOLO
        </button>
      </div>

      {/* Footer */}
      <footer className="v8-home-footer">
        <button className="v8-home-footer__link" onClick={() => { window.posthog?.capture('footer_open', { target: 'how_to' }); setShowHowTo(true); }}>
          How to Play
        </button>
        <span className="v8-home-footer__dot" aria-hidden="true">&middot;</span>
        <button className="v8-home-footer__link" onClick={() => { window.posthog?.capture('footer_open', { target: 'suggest' }); setShowSuggest(true); }}>
          Suggest a Movie
        </button>
        <span className="v8-home-footer__dot" aria-hidden="true">&middot;</span>
        <button className="v8-home-footer__link" onClick={() => { window.posthog?.capture('footer_open', { target: 'feedback' }); setShowFeedback(true); }}>
          Feedback
        </button>
        <span className="v8-home-footer__dot" aria-hidden="true">&middot;</span>
        <button className="v8-home-footer__link" onClick={() => { window.posthog?.capture('footer_open', { target: 'settings' }); setShowSettings(true); }}>
          Settings
        </button>
        <span className="v8-home-footer__dot" aria-hidden="true">&middot;</span>
        <a
          href="https://www.instagram.com/srinitya_satya/"
          target="_blank"
          rel="noopener"
          className="v8-home-footer__link"
        >
          Made by @srinitya_satya
        </a>
      </footer>

      {showHowTo && <HowToScreen onClose={() => setShowHowTo(false)} />}
      {showSuggest && <SuggestSheet onClose={() => setShowSuggest(false)} />}
      {showFeedback && <FeedbackSheet onClose={() => setShowFeedback(false)} />}
      {showSettings && <SettingsScreen onClose={() => setShowSettings(false)} />}
    </main>
  );
}
