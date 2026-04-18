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

  if (isSolo && state === 'turnChange' && !isFirstCard) return null;

  const nextPlayer = players[readerIdx % players.length];
  const nextPlayerName = nextPlayer?.name ?? 'Player';

  const handleTap = () => {
    if (isContinue) {
      actions.continueGame();
    } else {
      actions.ready();
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isContinue]);

  const handleSeeResults = (e: React.MouseEvent) => {
    e.stopPropagation();
    getGameInstance().endGame('completed');
  };

  // Build feedback pill content
  let feedbackNode: React.ReactNode = null;
  if (lastResult) {
    if (lastResult.correct) {
      const winnerName = players[lastResult.winnerIdx]?.name ?? 'Someone';
      const pts = POINT_MAP[lastResult.card.diff] ?? 1;
      feedbackNode = (
        <div className="v8-inter-feedback v8-inter-feedback--correct" data-testid="feedback-pill">
          <span className="v8-inter-feedback__winner">{winnerName.toUpperCase()}</span>
          {' got it '}
          <span className="v8-inter-feedback__pts">{`+${pts} PTS`}</span>
        </div>
      );
    } else {
      feedbackNode = (
        <div className="v8-inter-feedback v8-inter-feedback--miss" data-testid="feedback-pill">
          <span className="v8-inter-feedback__winner">NOBODY GOT IT</span>
        </div>
      );
    }
  }

  return (
    <main
      className="v8-inter"
      aria-label={isContinue ? 'Continue or see results' : 'Turn change'}
      onClick={handleTap}
    >
      <button
        className="sr-only"
        onClick={handleTap}
        aria-label={isContinue ? 'Continue playing' : 'Tap to continue'}
      >
        Continue
      </button>
      {/* Feedback pill from last round */}
      {feedbackNode}

      {/* Report last plot pill */}
      {lastResult && onReportLastPlot && (
        <button
          className="v8-inter-report"
          onClick={(e) => {
            e.stopPropagation();
            onReportLastPlot();
          }}
          aria-label="Report last plot"
        >
          ⚑ REPORT LAST PLOT
        </button>
      )}

      {/* Center content */}
      <div className="v8-inter-center">
        {isContinue ? (
          <>
            <div className="v8-inter-kicker">INTERVAL</div>
            <div className="v8-inter-score">
              {payload.scorer.totalPts} PTS
            </div>
            <div className="v8-inter-stat">
              {payload.scorer.correctCount} of {payload.idx} correct
            </div>
          </>
        ) : isSolo && isFirstCard ? (
          <>
            <div className="v8-inter-pass">SOLO MODE</div>
            <div className="v8-inter-name" data-testid="player-name">READY?</div>
            <div className="v8-inter-stat" style={{ marginTop: 12 }}>Guess in your head. Tap the card to flip.</div>
          </>
        ) : isFirstCard ? (
          <>
            <div className="v8-inter-pass">YOU&apos;RE UP FIRST</div>
            <div className="v8-inter-name" data-testid="player-name">{nextPlayerName.toUpperCase()}</div>
            <div className="v8-inter-stat" style={{ marginTop: 12 }}>Read the plot out loud. Others guess.</div>
          </>
        ) : (
          <>
            <div className="v8-inter-pass">HAND THE PHONE TO</div>
            <div className="v8-inter-name" data-testid="player-name">{nextPlayerName.toUpperCase()}</div>
          </>
        )}
      </div>

      {/* Continue-specific buttons */}
      {isContinue && (
        <div className="v8-inter-actions" onClick={(e) => e.stopPropagation()}>
          <button className="v8-inter-btn v8-inter-btn--primary" onClick={handleTap}>
            KEEP GOING
          </button>
          <button className="v8-inter-btn v8-inter-btn--secondary" onClick={handleSeeResults}>
            SEE RESULTS
          </button>
        </div>
      )}

      {/* Tap to continue hint */}
      {!isContinue && (
        <div className="v8-inter-tap">TAP ANYWHERE TO CONTINUE</div>
      )}
    </main>
  );
}
