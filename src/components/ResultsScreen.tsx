import { useMemo } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useGameActions } from '../hooks/useGameActions';

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

export function ResultsScreen() {
  const { payload } = useGameState();
  const actions = useGameActions();
  const { scorer, idx, scores } = payload;

  const isMultiplayer = scorer.players.length > 1;

  // Sort players by score descending for display
  const sortedPlayers = useMemo(() => {
    return scorer.players
      .map((p, i) => ({ name: p.name, score: scores[i] ?? p.score, idx: i }))
      .sort((a, b) => b.score - a.score);
  }, [scorer.players, scores]);

  const winner = isMultiplayer ? sortedPlayers[0] : null;
  const topScore = sortedPlayers[0]?.score ?? 0;

  const quote = useMemo(() => pickRandomQuote(), []);

  return (
    <main
      className="screen active v8-results"
      aria-label="Results"
      style={{ background: 'var(--stage)' }}
    >
      {/* FINAL VERDICT header */}
      <h2 className="v8-results-header">FINAL VERDICT</h2>

      {/* Verdict panel */}
      <div className="v8-results-panel">
        {/* Panel masthead */}
        <div className="v8-results-mast">
          <span className="v8-results-mast__title">Final Verdict</span>
          <span className="v8-results-mast__sub">{`${idx} Plots Played`}</span>
        </div>

        {/* Winner section (multiplayer) */}
        {isMultiplayer && winner && (
          <div className="v8-results-winner">
            <div className="v8-results-winner__crown">{'\u2605'} Top Guesser {'\u2605'}</div>
            <div className="v8-results-winner__name">{winner.name}</div>
            <div className="v8-results-winner__title">MOVIE BUFF</div>
          </div>
        )}

        {/* Solo stats */}
        {!isMultiplayer && (
          <div className="v8-results-solo">
            <div className="v8-results-solo__stat">
              <span className="v8-results-solo__value">
                {`${scorer.correctCount}/${idx}`}
              </span>
              <span className="v8-results-solo__label">Correct</span>
            </div>
            <div className="v8-results-solo__stat">
              <span className="v8-results-solo__value">{scorer.totalPts}</span>
              <span className="v8-results-solo__label">Points</span>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="v8-results-board">
          <div className="v8-results-board__label">The Line-Up</div>
          {sortedPlayers.map((p, i) => (
            <div
              key={p.idx}
              className={`v8-results-row${p.score === topScore && topScore > 0 ? ' v8-results-row--leader' : ''}`}
            >
              <span className={`v8-results-rank${i === 0 ? ' v8-results-rank--first' : ''}`}>
                {i + 1}
              </span>
              <span className="v8-results-name">{p.name}</span>
              <span className="v8-results-pts">{`${p.score} pts`}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Random desi quote */}
      <p className="v8-results-quote">{`"${quote}"`}</p>

      {/* CTAs */}
      <div className="v8-results-ctas">
        <button
          className="v8-results-btn v8-results-btn--primary"
          onClick={actions.replay}
        >
          PLAY AGAIN
        </button>
        <button
          className="v8-results-btn v8-results-btn--secondary"
          onClick={actions.exitGame}
        >
          HOME
        </button>
      </div>
    </main>
  );
}
