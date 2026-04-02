import { useGameState } from '../hooks/useGameState';
import { useGameActions } from '../hooks/useGameActions';
import { Card } from './Card';

export function GameScreen() {
  const { state, payload } = useGameState();
  const actions = useGameActions();
  const { deck, idx, currentCard, scorer, gameMode } = payload;

  if (!currentCard) return null;

  const isFlipped = state === 'flipped';
  const progress = gameMode === 'party' ? `${idx + 1} / ${deck.length}` : `Card ${idx + 1}`;
  const progressPct = gameMode === 'party' ? (idx / deck.length) * 100 : 0;

  return (
    <main className="screen active" aria-label="Game">
      <header className="game-bar">
        <button className="game-exit-btn" onClick={actions.exitGame}>
          <span aria-hidden="true">{'\u2190'}</span> Exit
        </button>
        <div className="game-info"><span className="game-prog">{progress}</span></div>
        <div className="game-score">{scorer.totalPts} pts</div>
      </header>
      {gameMode === 'party' && (
        <div className="prog-track" role="progressbar" aria-valuenow={Math.round(progressPct)} aria-valuemin={0} aria-valuemax={100}>
          <div className="prog-fill" style={{ width: `${progressPct}%` }} />
        </div>
      )}
      {gameMode === 'endless' && (
        <div className="game-lives" aria-label="Lives remaining">
          {[0, 1, 2].map(i => <span key={i} className={`life${i < scorer.lives ? ' active' : ''}`} aria-label={`Life ${i + 1}`} />)}
        </div>
      )}
      {scorer.players.length > 1 && (
        <div className="player-tabs" role="tablist" aria-label="Players">
          {scorer.players.map((p, i) => (
            <button key={i} className={`player-tab${i === scorer.currentPlayerIdx ? ' active' : ''}`} role="tab" aria-selected={i === scorer.currentPlayerIdx}>
              {p.name || `P${i + 1}`}: {p.score}
            </button>
          ))}
        </div>
      )}
      <div className="card-stage">
        <Card card={currentCard} isFlipped={isFlipped} onFlip={actions.flipCard} />
      </div>
      {isFlipped && (
        <div className="score-zone">
          <div className="score-btns">
            <button className="score-btn btn-got" onClick={actions.markCorrect}>Got it</button>
            <button className="score-btn btn-miss" onClick={actions.markMiss}>Missed</button>
          </div>
          <button className="btn-skip" onClick={actions.skip}>Skip</button>
        </div>
      )}
    </main>
  );
}
