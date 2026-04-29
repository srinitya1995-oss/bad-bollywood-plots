import { useState } from 'react';
import { useGameActions } from '../hooks/useGameActions';
import { useResumeSession } from '../hooks/useResumeSession';
import { track } from '../analytics/posthog';
import { SuggestSheet } from './SuggestSheet';
import { FeedbackSheet } from './FeedbackSheet';
import { HowToScreen } from './HowToScreen';
import { SettingsScreen } from './SettingsScreen';
import type { Industry } from '../core/types';

const FOOTER_LINKS = [
  { key: 'how_to',   label: 'HOW TO PLAY' },
  { key: 'suggest',  label: 'SUGGEST A MOVIE' },
  { key: 'feedback', label: 'FEEDBACK' },
  { key: 'settings', label: 'SETTINGS' },
] as const;

// Hero font scales smoothly mobile (78) → tablet (~110) → desktop (158) per spec §10.
const HERO_STYLES = {
  bg: { background: 'var(--cream)', height: '100%', overflow: 'hidden',
        display: 'flex', flexDirection: 'column' as const,
        padding: 'clamp(22px, 4vw, 56px) clamp(22px, 5vw, 72px) 20px' },
  kicker: { fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: '0.3em',
            color: 'var(--tomato)', textTransform: 'uppercase' as const },
  title: { marginTop: 8, fontFamily: 'Anton, Impact, sans-serif',
           fontSize: 'clamp(72px, 14vw, 158px)',
           lineHeight: 0.86, color: 'var(--ink)', textTransform: 'uppercase' as const,
           letterSpacing: '-0.02em' },
  titleAccent: { color: 'var(--tomato)',
                 textShadow: '3px 3px 0 var(--ink), 6px 6px 0 var(--gold)' },
  tag: { marginTop: 14, fontFamily: 'Fraunces, serif', fontStyle: 'italic' as const,
         fontWeight: 300, fontSize: 'clamp(14px, 1.4vw, 22px)', color: 'var(--ink)',
         lineHeight: 1.45, maxWidth: 520 },
  tagSub: { marginTop: 4, fontFamily: 'Fraunces, serif', fontStyle: 'italic' as const,
            fontWeight: 300, fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.4 },
  meta: { marginTop: 12, fontFamily: 'Bebas Neue, sans-serif', fontSize: 11,
          letterSpacing: '0.3em', color: 'var(--ink-muted)', textTransform: 'uppercase' as const },
};

export function HomeScreen() {
  const actions = useGameActions();
  const { canResume } = useResumeSession();
  const [showSuggest, setShowSuggest] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cinema, setCinema] = useState<Industry>('HI');

  const handleFooter = (key: typeof FOOTER_LINKS[number]['key']) => {
    window.posthog?.capture('footer_open', { target: key });
    if (key === 'how_to')   setShowHowTo(true);
    if (key === 'feedback') setShowFeedback(true);
    if (key === 'settings') setShowSettings(true);
    if (key === 'suggest') {
      // Spec §2 SheetE: open the mail client. Form stays in src/components/SuggestSheet.tsx as a fallback.
      const subject = encodeURIComponent('Bad Desi Plots: Movie suggestion');
      const body = encodeURIComponent('Movie name:\nCinema (Hindi/Telugu):\nWhy it would land:\n\nSent from baddesiplots.com');
      const mailto = `mailto:hello@baddesiplots.com?subject=${subject}&body=${body}`;
      try { window.location.href = mailto; } catch { setShowSuggest(true); }
    }
  };

  return (
    <main className="screen active v8-home" aria-label="Home" style={{ background: 'var(--cream)' }}>
      <div className="v8-home-hero" style={HERO_STYLES.bg}>

        {/* LEFT: hero stack (becomes column 1 on desktop) */}
        <div className="v8-home-stack">
          <p className="v8-home-kicker" style={HERO_STYLES.kicker}>THE DESI PARTY GAME</p>
          <h1 className="v8-home-title" style={HERO_STYLES.title}>
            <span>BAD</span><br />
            <span className="v8-home-title__accent" style={HERO_STYLES.titleAccent}>DESI</span><br />
            <span>PLOTS.</span>
          </h1>
          <p className="v8-home-tag" style={HERO_STYLES.tag}>
            We describe desi movies badly. You guess which film it is.
          </p>
          <p className="v8-home-sub" style={HERO_STYLES.tagSub}>
            Simple, chaotic, best played with chai and friends.
          </p>
          <div className="v8-home-meta" aria-label="Game details" style={HERO_STYLES.meta}>
            Solo · Party · No setup
          </div>
        </div>

        {/* RIGHT: cinema + CTAs + footer (becomes column 2 on desktop) */}
        <div className="v8-home-actions">

        {/* Cinema toggle */}
        <div style={{ marginTop: 16 }}>
          <div
            className="v8-home-cinema-label"
            aria-hidden="true"
            style={{
              fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.28em',
              color: 'var(--ink-muted)', marginBottom: 6, textTransform: 'uppercase',
            }}
          >
            PICK YOUR CINEMA
          </div>
          <div
            className="v8-home-cinema"
            role="radiogroup"
            aria-label="Choose cinema"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '2px solid var(--ink)' }}
          >
            <button
              className={`v8-home-cinema__btn${cinema === 'HI' ? ' is-active' : ''}`}
              role="radio"
              aria-checked={cinema === 'HI'}
              onClick={() => { window.posthog?.capture('cinema_pick', { cinema: 'HI' }); setCinema('HI'); }}
              style={{
                padding: '10px', cursor: 'pointer',
                background: cinema === 'HI' ? 'var(--tomato)' : 'var(--cream)',
                color: cinema === 'HI' ? 'var(--cream)' : 'var(--ink)',
                fontFamily: 'Anton, Impact, sans-serif', fontSize: 18,
                textTransform: 'uppercase', letterSpacing: '-0.005em',
                borderRight: '2px solid var(--ink)', border: 'none', borderRightWidth: 2, borderRightStyle: 'solid', borderRightColor: 'var(--ink)',
              }}
            >
              BOLLYWOOD
            </button>
            <button
              className={`v8-home-cinema__btn${cinema === 'TE' ? ' is-active' : ''}`}
              role="radio"
              aria-checked={cinema === 'TE'}
              onClick={() => { window.posthog?.capture('cinema_pick', { cinema: 'TE' }); setCinema('TE'); }}
              style={{
                padding: '10px', cursor: 'pointer',
                background: cinema === 'TE' ? 'var(--tomato)' : 'var(--cream)',
                color: cinema === 'TE' ? 'var(--cream)' : 'var(--ink)',
                fontFamily: 'Anton, Impact, sans-serif', fontSize: 18,
                textTransform: 'uppercase', letterSpacing: '-0.005em',
                opacity: cinema === 'TE' ? 1 : 0.82, border: 'none',
              }}
            >
              TOLLYWOOD
            </button>
          </div>
        </div>

        {/* CTAs */}
        <div className="v8-home-ctas" style={{ marginTop: 14, display: 'grid', gap: 8 }}>
          {canResume && (
            <button
              className="v8-home-resume"
              onClick={() => { track.resumeUsed(); window.location.reload(); }}
              style={{
                padding: '10px 12px', background: 'var(--gold)', color: 'var(--ink)',
                border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)',
                fontFamily: 'Bebas Neue, sans-serif', fontSize: 13, letterSpacing: '0.22em',
                textTransform: 'uppercase', textAlign: 'left', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <span>↺ Resume last game</span>
              <span style={{ fontSize: 14 }}>→</span>
            </button>
          )}
          <button
            className="v8-home-btn v8-home-btn--primary"
            onClick={() => actions.selectMode(cinema)}
            aria-label="Pass and Play"
            style={{
              padding: '16px 16px', background: 'var(--ink)', color: 'var(--cream)',
              border: '3px solid var(--ink)', boxShadow: '5px 5px 0 var(--tomato)',
              fontFamily: 'Anton, Impact, sans-serif', fontSize: 24,
              textTransform: 'uppercase', letterSpacing: '-0.005em', textAlign: 'left',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <span>
              <span style={{ display: 'block', fontFamily: 'Bebas Neue, sans-serif', fontSize: 10,
                             letterSpacing: '0.24em', color: 'var(--gold)' }}>2–8 PLAYERS</span>
              <span>PASS &amp; PLAY</span>
            </span>
            <span style={{ fontSize: 22, color: 'var(--gold)' }}>→</span>
          </button>
          <button
            className="v8-home-btn v8-home-btn--secondary"
            onClick={() => actions.startSoloGame(cinema)}
            aria-label="Solo"
            style={{
              padding: '14px 16px', background: 'var(--cream)', color: 'var(--ink)',
              border: '3px solid var(--ink)', boxShadow: '5px 5px 0 var(--ink)',
              fontFamily: 'Anton, Impact, sans-serif', fontSize: 20,
              textTransform: 'uppercase', letterSpacing: '-0.005em', textAlign: 'left',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <span>
              <span style={{ display: 'block', fontFamily: 'Bebas Neue, sans-serif', fontSize: 10,
                             letterSpacing: '0.24em', color: 'var(--tomato)' }}>JUST ME</span>
              <span>SOLO</span>
            </span>
            <span style={{ fontSize: 20 }}>→</span>
          </button>
        </div>

        {/* Footer 2x2 grid */}
        <footer
          className="v8-home-footer"
          style={{
            marginTop: 'auto', paddingTop: 14,
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
          }}
        >
          {FOOTER_LINKS.map((f) => (
            <button
              key={f.key}
              className="v8-home-footer__link"
              onClick={() => handleFooter(f.key)}
              style={{
                padding: '9px 10px', border: '2px solid var(--ink)',
                background: 'var(--cream)', color: 'var(--ink)',
                fontFamily: 'Anton, Impact, sans-serif', fontSize: 14,
                textTransform: 'uppercase', letterSpacing: '0.01em', textAlign: 'left',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <span>{f.label}</span>
              <span style={{ color: 'var(--tomato)' }}>→</span>
            </button>
          ))}
        </footer>
        </div> {/* /.v8-home-actions */}
      </div>

      {showHowTo && <HowToScreen onClose={() => setShowHowTo(false)} />}
      {showSuggest && <SuggestSheet onClose={() => setShowSuggest(false)} />}
      {showFeedback && <FeedbackSheet onClose={() => setShowFeedback(false)} />}
      {showSettings && <SettingsScreen onClose={() => setShowSettings(false)} />}
    </main>
  );
}
