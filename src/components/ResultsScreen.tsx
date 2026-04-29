import { useCallback, useMemo } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useGameActions } from '../hooks/useGameActions';
import { toast } from './Toast';

const SHARE_URL = 'https://baddesiplots.com';

type ShareChannel = 'whatsapp' | 'x' | 'reddit' | 'facebook' | 'email' | 'copy';

const DESI_QUOTES = [
  'Picture abhi baaki hai mere dost',
  'Mogambo khush hua',
  'Ek baar jo maine commitment kar di',
  'Kitne aadmi the?',
  'Don ko pakadna mushkil hi nahi, namumkin hai',
  'Mere paas maa hai',
  'Rahul, naam toh suna hoga',
  'Hum jahan khade hote hain, line wahin se shuru hoti hai',
  'Pushpa, I hate tears',
  'Rishte mein toh hum tumhare baap lagte hain',
  'Babumoshai, zindagi badi honi chahiye, lambi nahi',
  'Koi dharma adharma nahi hota, bas karma hota hai',
  'Bade bade deshon mein aisi chhoti chhoti baatein hoti rehti hain',
];

function pickRandomQuote(): string {
  return DESI_QUOTES[Math.floor(Math.random() * DESI_QUOTES.length)];
}

const SHARE_ICONS: Record<ShareChannel, React.ReactNode> = {
  whatsapp: (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7 0-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.7l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5H7.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.3-.6.3-1.2.2-1.4 0-.2-.3-.3-.6-.4zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 4.9L2 22l5.2-1.3c1.4.7 3 1.1 4.7 1.1 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.3c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.2.8.9-3.1-.2-.3C4 15.1 3.5 13.6 3.5 12c0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5-3.8 8.3-8.5 8.3z"/></svg>),
  x: (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>),
  reddit: (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12.14a2.14 2.14 0 0 0-3.63-1.53 10.44 10.44 0 0 0-5.69-1.8l.97-4.55 3.16.67a1.53 1.53 0 1 0 .16-.76l-3.53-.75a.38.38 0 0 0-.45.29l-1.08 5.1a10.44 10.44 0 0 0-5.77 1.8 2.14 2.14 0 1 0-2.35 3.5 4.2 4.2 0 0 0-.05.65c0 3.3 3.84 5.98 8.58 5.98s8.58-2.68 8.58-5.98a4.2 4.2 0 0 0-.05-.65A2.14 2.14 0 0 0 22 12.14zM7 13.6a1.53 1.53 0 1 1 3.06 0 1.53 1.53 0 0 1-3.06 0zm8.58 4.06a5.5 5.5 0 0 1-3.58 1.1 5.5 5.5 0 0 1-3.58-1.1.38.38 0 0 1 .54-.54 4.73 4.73 0 0 0 3.04.92 4.73 4.73 0 0 0 3.04-.92.38.38 0 0 1 .54.54zm-.18-2.52a1.53 1.53 0 1 1 0-3.06 1.53 1.53 0 0 1 0 3.06z"/></svg>),
  facebook: (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.4 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6a22.7 22.7 0 0 0-2.5-.1c-2.4 0-4.1 1.5-4.1 4.2v2.3H7.4V13h2.7v8h3.3Z"/></svg>),
  email: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14"/><path d="m3 7 9 6 9-6"/></svg>),
  copy: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>),
};

export function ResultsScreen() {
  const { payload } = useGameState();
  const actions = useGameActions();
  const { scorer, idx, scores, verdict } = payload;

  const isMultiplayer = scorer.players.length > 1;

  const sortedPlayers = useMemo(() => scorer.players
    .map((p, i) => ({ name: p.name, score: scores[i] ?? 0, idx: i }))
    .sort((a, b) => b.score - a.score), [scorer.players, scores]);

  const winner = isMultiplayer ? sortedPlayers[0] : null;
  const topScore = sortedPlayers[0]?.score ?? 0;
  const soloName = !isMultiplayer ? (scorer.players[0]?.name?.trim() || 'You') : '';
  const quote = useMemo(() => pickRandomQuote(), []);

  const handleShare = useCallback((channel: ShareChannel) => {
    const text = actions.getShareText();
    // Build a per-channel UTM-tagged URL so PostHog can attribute incoming traffic.
    const taggedUrl = (ch: ShareChannel) =>
      `${SHARE_URL}?utm_source=${ch}&utm_medium=results_share&utm_campaign=results_share`;
    const encText = encodeURIComponent(text);
    const encTitle = encodeURIComponent('Bad Desi Plots');

    window.posthog?.capture('results_share', { channel });

    if (channel === 'copy') {
      const copyText = `${text}\n${taggedUrl('copy')}`;
      const copyPromise = navigator.clipboard?.writeText
        ? navigator.clipboard.writeText(copyText)
        : Promise.reject(new Error('clipboard unavailable'));
      copyPromise
        .then(() => toast('Copied. Now paste it somewhere loud.'))
        .catch(() => toast('Copy failed. Long press to select.'));
      return;
    }

    const encTaggedUrl = encodeURIComponent(taggedUrl(channel));
    const encTextWithTaggedUrl = encodeURIComponent(`${text}\n${taggedUrl(channel)}`);

    const targets: Record<Exclude<ShareChannel, 'copy'>, string> = {
      whatsapp: `https://wa.me/?text=${encTextWithTaggedUrl}`,
      x: `https://twitter.com/intent/tweet?text=${encText}&url=${encTaggedUrl}`,
      reddit: `https://www.reddit.com/submit?title=${encTitle}&url=${encTaggedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encTaggedUrl}`,
      email: `mailto:?subject=${encTitle}&body=${encTextWithTaggedUrl}`,
    };
    window.open(targets[channel], '_blank', 'noopener,noreferrer');
  }, [actions]);

  return (
    <main
      className="screen active v8-results"
      aria-label="Results"
      style={{
        background: 'var(--cream)', flex: 1, overflow: 'auto',
        padding: '14px 14px 20px', display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      <h1
        className="v8-results-header"
        style={{
          textAlign: 'center', fontFamily: 'Anton, Impact, sans-serif', fontSize: 22,
          color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '-0.005em',
          margin: 0,
        }}
      >
        FINAL VERDICT
      </h1>

      {/* The big Poster */}
      <div
        className="v8-results-panel"
        style={{
          background: 'var(--cream)', color: 'var(--ink)',
          border: '3px solid var(--ink)', boxShadow: '5px 5px 0 var(--ink)', overflow: 'hidden',
        }}
      >
        {/* Mast */}
        <div
          className="v8-results-mast"
          style={{
            background: 'var(--tomato)', color: 'var(--cream)',
            padding: '10px 14px', borderBottom: '3px solid var(--ink)',
          }}
        >
          <div
            className="v8-results-mast__title"
            style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 22, textTransform: 'uppercase', letterSpacing: '-0.005em' }}
          >
            {verdict?.title ?? 'Final Verdict'}
          </div>
          <div
            className="v8-results-mast__sub"
            style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.24em', color: 'var(--gold)', textTransform: 'uppercase' }}
          >
            {`${idx} Plots Played`}
          </div>
        </div>

        <div style={{ padding: '12px 14px 14px' }}>
          {verdict && (
            <p
              className="v8-results-verdict"
              style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 13, color: 'var(--ink)', lineHeight: 1.45, textAlign: 'center', margin: 0 }}
            >
              {verdict.verdict}
            </p>
          )}

          {/* WINNER block (multiplayer) */}
          {isMultiplayer && winner && (
            <div
              className="v8-results-winner"
              style={{
                marginTop: 14, textAlign: 'center', position: 'relative',
                padding: '16px 8px', background: 'rgba(241,190,58,0.12)',
                border: '2px dashed var(--gold)',
              }}
            >
              <div
                className="v8-results-winner__crown"
                style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: '0.28em', color: 'var(--tomato)', textTransform: 'uppercase' }}
              >
                ★ TOP GUESSER ★
              </div>
              <div
                className="v8-results-winner__name"
                style={{
                  marginTop: 4, fontFamily: 'Anton, Impact, sans-serif', fontSize: 58,
                  color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '-0.02em',
                  lineHeight: 0.94,
                  textShadow: '3px 3px 0 var(--tomato), 6px 6px 0 var(--gold)',
                }}
              >
                {winner.name}
              </div>
              <div
                className="v8-results-winner__title"
                style={{ marginTop: 6, fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: '0.3em', color: 'var(--ink)', textTransform: 'uppercase' }}
              >
                MOVIE BUFF
              </div>
            </div>
          )}

          {/* SOLO summary */}
          {!isMultiplayer && (
            <div
              className="v8-results-solo-wrap"
              style={{
                marginTop: 14, textAlign: 'center', position: 'relative',
                padding: '16px 8px', background: 'rgba(241,190,58,0.12)',
                border: '2px dashed var(--gold)',
              }}
            >
              <div
                className="v8-results-solo__name"
                style={{
                  fontFamily: 'Anton, Impact, sans-serif', fontSize: 48,
                  color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '-0.02em',
                  lineHeight: 1, textShadow: '3px 3px 0 var(--tomato), 6px 6px 0 var(--gold)',
                }}
              >
                {soloName}
              </div>
              <div
                className="v8-results-solo"
                style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
              >
                <div className="v8-results-solo__stat">
                  <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 32, color: 'var(--tomato)' }}>
                    {scorer.correctCount}/{idx}
                  </div>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.22em', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                    Correct
                  </div>
                </div>
                <div className="v8-results-solo__stat">
                  <div style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 32, color: 'var(--ink)' }}>
                    {scorer.totalPts}
                  </div>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.22em', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
                    Points
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {sortedPlayers.length > 1 && (
            <div className="v8-results-board" style={{ marginTop: 14 }}>
              <div
                className="v8-results-board__label"
                style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.24em', color: 'var(--ink-muted)', marginBottom: 6, textTransform: 'uppercase' }}
              >
                THE LINE-UP
              </div>
              {sortedPlayers.map((p, i) => {
                const isLeader = p.score === topScore && topScore > 0 && i === 0;
                return (
                  <div
                    key={p.idx}
                    className={`v8-results-row${isLeader ? ' v8-results-row--leader' : ''}`}
                    style={{
                      display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 10,
                      alignItems: 'center', padding: '8px 10px',
                      background: isLeader ? 'rgba(241,190,58,0.15)' : 'transparent',
                      borderLeft: isLeader ? '3px solid var(--gold)' : '3px solid transparent',
                      borderBottom: i === sortedPlayers.length - 1 ? 'none' : '1px solid var(--ink-line)',
                    }}
                  >
                    <span
                      className={`v8-results-rank${i === 0 ? ' v8-results-rank--first' : ''}`}
                      style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 12, letterSpacing: '0.14em', color: 'var(--ink-muted)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="v8-results-name"
                      style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 22, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '-0.005em' }}
                    >
                      {p.name}
                    </span>
                    <span
                      className="v8-results-pts"
                      style={{ fontFamily: 'Anton, Impact, sans-serif', fontSize: 22, color: i === 0 ? 'var(--tomato)' : 'var(--ink)' }}
                    >
                      {`${p.score} pts`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quote */}
          <p
            className="v8-results-quote"
            style={{
              marginTop: 14, padding: '8px 10px', borderTop: '2px dashed var(--ink)',
              fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 14,
              color: 'var(--ink-muted)', textAlign: 'center', lineHeight: 1.4,
            }}
          >
            "{quote}"
          </p>

          {/* CTAs */}
          <div
            className="v8-results-ctas"
            style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
          >
            <button
              className="v8-results-btn v8-results-btn--primary"
              onClick={() => { window.posthog?.capture('results_cta', { cta: 'play_again' }); actions.replay(); }}
              style={{
                padding: 12, background: 'var(--ink)', color: 'var(--cream)',
                border: '3px solid var(--ink)', boxShadow: '4px 4px 0 var(--gold)',
                fontFamily: 'Anton, Impact, sans-serif', fontSize: 16,
                textTransform: 'uppercase', letterSpacing: '-0.005em', cursor: 'pointer',
              }}
            >
              PLAY AGAIN
            </button>
            <button
              className="v8-results-btn v8-results-btn--secondary"
              onClick={() => { window.posthog?.capture('results_cta', { cta: 'home' }); actions.exitGame(); }}
              style={{
                padding: 12, background: 'var(--cream)', color: 'var(--ink)',
                border: '3px solid var(--ink)', boxShadow: '4px 4px 0 var(--ink)',
                fontFamily: 'Anton, Impact, sans-serif', fontSize: 16,
                textTransform: 'uppercase', letterSpacing: '-0.005em', cursor: 'pointer',
              }}
            >
              HOME
            </button>
          </div>

          {/* Share band */}
          <section
            className="v8-results-share"
            aria-label="Share Bad Desi Plots"
            style={{ marginTop: 14, paddingTop: 12, borderTop: '2px dashed var(--ink)' }}
          >
            <div
              className="v8-results-share__head"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <div style={{ display: 'flex', gap: 3 }} aria-hidden="true">
                <span style={{ width: 3, height: 12, background: 'var(--tomato)' }} />
                <span style={{ width: 3, height: 12, background: 'var(--gold)' }} />
                <span style={{ width: 3, height: 12, background: 'var(--emerald)' }} />
              </div>
              <div
                className="v8-results-share__label"
                style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: '0.26em', color: 'var(--tomato)', textTransform: 'uppercase' }}
              >
                SPREAD THE WORD
              </div>
            </div>
            <p
              className="v8-results-share__sub"
              style={{ marginTop: 4, fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-muted)' }}
            >
              Send to the friend who starts the movie argument.
            </p>
            <div
              className="v8-results-share__row"
              style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}
            >
              {(['whatsapp', 'x', 'reddit', 'facebook', 'email', 'copy'] as ShareChannel[]).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  className="v8-results-share__btn"
                  aria-label={`Share via ${ch}`}
                  onClick={() => handleShare(ch)}
                  style={{
                    width: '100%', aspectRatio: '1 / 1',
                    background: 'var(--cream)', color: 'var(--ink)',
                    border: '2px solid var(--ink)', boxShadow: '2px 2px 0 var(--ink)',
                    display: 'grid', placeItems: 'center', padding: 6, cursor: 'pointer',
                  }}
                >
                  <span style={{ width: '70%', display: 'block' }}>{SHARE_ICONS[ch]}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
