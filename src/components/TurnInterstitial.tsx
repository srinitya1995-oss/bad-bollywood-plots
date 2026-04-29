import { useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useGameActions } from '../hooks/useGameActions';
import { getGameInstance } from '../hooks/gameInstance';
import { POINT_MAP } from '../core/types';

export interface TurnInterstitialProps {
  onReportLastPlot?: () => void;
}

export function TurnInterstitial({ onReportLastPlot }: TurnInterstitialProps) {
  const { state, payload } = useGameState();
  const actions = useGameActions();
  const { readerIdx, lastResult, idx } = payload;
  const players = payload.scorer.players;
  const isContinue = state === 'continue';
  const isSolo = players.length <= 1;
  const isFirstCard = idx === 0 && !lastResult;

  useEffect(() => {
    if (isSolo && state === 'turnChange' && !isFirstCard) {
      actions.ready();
    }
  }, [isSolo, state, actions, isFirstCard]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isContinue) actions.continueGame();
        else actions.ready();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isContinue, actions]);

  if (isSolo && state === 'turnChange' && !isFirstCard) return null;

  const nextPlayer = players[readerIdx % players.length];
  const nextPlayerName = nextPlayer?.name ?? 'Player';

  const handleTap = () => {
    if (isContinue) actions.continueGame();
    else actions.ready();
  };

  const handleSeeResults = (e: React.MouseEvent) => {
    e.stopPropagation();
    getGameInstance().endGame('completed');
  };

  // ── Pieces ──────────────────────────────────────
  let feedbackNode: React.ReactNode = null;
  if (lastResult) {
    if (lastResult.correct) {
      const winnerName = players[lastResult.winnerIdx]?.name ?? 'Someone';
      const pts = POINT_MAP[lastResult.card.diff] ?? 1;
      feedbackNode = (
        <div
          className="v8-inter-feedback v8-inter-feedback--correct"
          data-testid="feedback-pill"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', background: 'var(--cream)', color: 'var(--ink)',
            border: '2px solid var(--cream)', boxShadow: '3px 3px 0 var(--tomato)',
            fontFamily: 'Anton, Impact, sans-serif', fontSize: 16,
            textTransform: 'uppercase', letterSpacing: '-0.005em',
          }}
        >
          <span className="v8-inter-feedback__winner">{winnerName.toUpperCase()}</span>
          <span className="v8-inter-feedback__pts" style={{ color: 'var(--tomato)' }}>{`+${pts} PTS`}</span>
        </div>
      );
    } else {
      feedbackNode = (
        <div
          className="v8-inter-feedback v8-inter-feedback--miss"
          data-testid="feedback-pill"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', background: 'var(--cream)', color: 'var(--ink)',
            border: '2px solid var(--cream)', boxShadow: '3px 3px 0 var(--ink-muted)',
            fontFamily: 'Anton, Impact, sans-serif', fontSize: 16,
            textTransform: 'uppercase', letterSpacing: '-0.005em',
          }}
        >
          <span className="v8-inter-feedback__winner">NOBODY GOT IT</span>
        </div>
      );
    }
  }

  const titleShadow = '3px 3px 0 var(--tomato), 6px 6px 0 var(--gold)';
  const tapHint = (
    <div
      className="v8-inter-tap"
      style={{
        fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.28em',
        color: 'rgba(243,233,210,0.5)', textTransform: 'uppercase', textAlign: 'center',
      }}
    >
      TAP ANYWHERE TO CONTINUE
    </div>
  );

  return (
    <main
      className="v8-inter"
      aria-label={isContinue ? 'Continue or see results' : 'Turn change'}
      onClick={handleTap}
      style={{
        flex: 1, background: 'var(--ink)', color: 'var(--cream)',
        padding: '22px 24px 28px',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', alignItems: 'center', textAlign: 'center',
        cursor: 'pointer',
      }}
    >
      <button
        className="sr-only"
        onClick={handleTap}
        aria-label={isContinue ? 'Continue playing' : 'Tap to continue'}
      >
        Continue
      </button>

      {/* Top: feedback pill + report */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        {feedbackNode}
        {lastResult && onReportLastPlot && (
          <button
            className="v8-inter-report"
            onClick={(e) => { e.stopPropagation(); onReportLastPlot(); }}
            aria-label="Report last plot"
            style={{
              padding: '4px 10px', background: 'transparent', color: 'var(--gold)',
              border: '1px solid rgba(241,190,58,0.5)',
              fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.24em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            ⚑ REPORT LAST PLOT
          </button>
        )}
      </div>

      {/* Center */}
      <div className="v8-inter-center">
        {isContinue ? (
          <>
            <div
              className="v8-inter-kicker"
              style={{
                fontFamily: 'Bebas Neue, sans-serif', fontSize: 12, letterSpacing: '0.32em',
                color: 'var(--gold)', textTransform: 'uppercase',
              }}
            >
              INTERVAL
            </div>
            <div
              className="v8-inter-score"
              style={{
                marginTop: 14, fontFamily: 'Anton, Impact, sans-serif', fontSize: 84, lineHeight: 0.86,
                color: 'var(--cream)', textTransform: 'uppercase', letterSpacing: '-0.02em',
                textShadow: titleShadow,
              }}
            >
              {payload.scorer.totalPts} PTS
            </div>
            <div
              className="v8-inter-stat"
              style={{
                marginTop: 18, fontFamily: 'Fraunces, serif', fontStyle: 'italic',
                fontSize: 17, color: 'rgba(243,233,210,0.85)', maxWidth: 280, lineHeight: 1.45,
              }}
            >
              {payload.scorer.correctCount} of {payload.idx} correct so far
            </div>
          </>
        ) : isSolo && isFirstCard ? (
          <>
            <div
              className="v8-inter-pass"
              style={{
                fontFamily: 'Bebas Neue, sans-serif', fontSize: 12, letterSpacing: '0.32em',
                color: 'var(--gold)', textTransform: 'uppercase',
              }}
            >
              SOLO MODE
            </div>
            <div
              className="v8-inter-name"
              data-testid="player-name"
              style={{
                marginTop: 14, fontFamily: 'Anton, Impact, sans-serif', fontSize: 84, lineHeight: 0.86,
                color: 'var(--cream)', textTransform: 'uppercase', letterSpacing: '-0.02em',
                textShadow: titleShadow,
              }}
            >
              READY?
            </div>
            <div
              className="v8-inter-stat"
              style={{
                marginTop: 18, fontFamily: 'Fraunces, serif', fontStyle: 'italic',
                fontSize: 17, color: 'rgba(243,233,210,0.85)', maxWidth: 280, lineHeight: 1.45,
              }}
            >
              Guess in your head. Tap the card to flip.
            </div>
          </>
        ) : isFirstCard ? (
          <>
            <div
              className="v8-inter-pass"
              style={{
                fontFamily: 'Bebas Neue, sans-serif', fontSize: 12, letterSpacing: '0.32em',
                color: 'var(--gold)', textTransform: 'uppercase',
              }}
            >
              YOU'RE UP FIRST
            </div>
            <div
              className="v8-inter-name"
              data-testid="player-name"
              style={{
                marginTop: 14, fontFamily: 'Anton, Impact, sans-serif', fontSize: 84, lineHeight: 0.86,
                color: 'var(--cream)', textTransform: 'uppercase', letterSpacing: '-0.02em',
                textShadow: titleShadow,
              }}
            >
              {nextPlayerName.toUpperCase()}.
            </div>
            <div
              className="v8-inter-stat"
              style={{
                marginTop: 18, fontFamily: 'Fraunces, serif', fontStyle: 'italic',
                fontSize: 17, color: 'rgba(243,233,210,0.85)', maxWidth: 280, lineHeight: 1.45,
              }}
            >
              Read the plot out loud. Others guess.
            </div>
          </>
        ) : (
          <>
            <div
              className="v8-inter-pass"
              style={{
                fontFamily: 'Bebas Neue, sans-serif', fontSize: 12, letterSpacing: '0.28em',
                color: 'var(--gold)', textTransform: 'uppercase',
              }}
            >
              HAND THE PHONE TO
            </div>
            <div
              className="v8-inter-name"
              data-testid="player-name"
              style={{
                marginTop: 14, fontFamily: 'Anton, Impact, sans-serif', fontSize: 84, lineHeight: 0.86,
                color: 'var(--cream)', textTransform: 'uppercase', letterSpacing: '-0.02em',
                textShadow: titleShadow,
              }}
            >
              {nextPlayerName.toUpperCase()}.
            </div>
          </>
        )}
      </div>

      {/* Bottom */}
      {isContinue ? (
        <div
          className="v8-inter-actions"
          onClick={(e) => e.stopPropagation()}
          style={{ display: 'grid', gap: 8, width: '100%', maxWidth: 340 }}
        >
          <button
            className="v8-inter-btn v8-inter-btn--primary"
            onClick={handleTap}
            style={{
              padding: '14px', background: 'var(--cream)', color: 'var(--ink)',
              border: '3px solid var(--ink)', boxShadow: '4px 4px 0 var(--tomato)',
              fontFamily: 'Anton, Impact, sans-serif', fontSize: 20,
              textTransform: 'uppercase', letterSpacing: '-0.005em', cursor: 'pointer',
            }}
          >
            KEEP GOING →
          </button>
          <button
            className="v8-inter-btn v8-inter-btn--secondary"
            onClick={handleSeeResults}
            style={{
              padding: '12px', background: 'transparent', color: 'var(--cream)',
              border: '2px solid rgba(243,233,210,0.4)',
              fontFamily: 'Bebas Neue, sans-serif', fontSize: 12, letterSpacing: '0.22em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            SEE RESULTS
          </button>
        </div>
      ) : (
        tapHint
      )}
    </main>
  );
}
