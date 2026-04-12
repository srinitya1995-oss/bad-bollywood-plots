import { useState, useCallback, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useGameActions } from '../hooks/useGameActions';
import { Card } from './Card';

type FeedbackType = 'correct' | 'wrong' | null;

export function GameScreen() {
  const { state, payload } = useGameState();
  const actions = useGameActions();
  const { deck, idx, currentCard, scorer, gameMode } = payload;
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [scoreFlash, setScoreFlash] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  const [livesPulse, setLivesPulse] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>();

  const triggerFeedback = useCallback((type: FeedbackType) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback(type);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 350);
  }, []);

  const handleCorrect = useCallback(() => {
    // Streak check before marking (current streak will increment after mark)
    const willHaveStreak = scorer.streak + 1 >= 3;
    triggerFeedback('correct');
    setScoreFlash(true);
    setTimeout(() => setScoreFlash(false), 400);
    if (willHaveStreak) {
      setShowStreak(true);
      setTimeout(() => setShowStreak(false), 800);
    }
    actions.markCorrect();
  }, [actions, scorer.streak, triggerFeedback]);

  const handleMiss = useCallback(() => {
    triggerFeedback('wrong');
    if (gameMode === 'endless') {
      setLivesPulse(true);
      setTimeout(() => setLivesPulse(false), 400);
    }
    actions.markMiss();
  }, [actions, gameMode, triggerFeedback]);

  if (!currentCard) return null;

  const isFlipped = state === 'flipped';
  const progress = gameMode === 'party' ? `${idx + 1} / ${deck.length}` : `Card ${idx + 1}`;
  const progressPct = gameMode === 'party' ? (idx / deck.length) * 100 : 0;

  const cardStageClass = [
    'card-stage',
    feedback === 'correct' ? 'correct-flash' : '',
    feedback === 'wrong' ? 'wrong-flash' : '',
  ].filter(Boolean).join(' ');

  return (
    <main className="screen active" aria-label="Game">
      <header className="game-bar">
        <button className="game-exit-btn" onClick={actions.exitGame}>
          <span aria-hidden="true">{'\u2190'}</span> Exit
        </button>
        <div className="game-info"><span className="game-prog" aria-live="polite" aria-atomic="true">{progress}</span></div>
        <div className={`game-score${scoreFlash ? ' flash' : ''}`} aria-live="polite" aria-atomic="true">{scorer.totalPts} pts</div>
      </header>
      {gameMode === 'party' && (
        <div className="prog-track" role="progressbar" aria-valuenow={Math.round(progressPct)} aria-valuemin={0} aria-valuemax={100}>
          <div className="prog-fill" style={{ width: `${progressPct}%` }} />
        </div>
      )}
      {gameMode === 'endless' && (
        <div className={`game-lives${livesPulse ? ' lives-pulse' : ''}`} aria-label="Lives remaining">
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
      <div className={cardStageClass}>
        <Card key={currentCard.id} card={currentCard} isFlipped={isFlipped} onFlip={actions.flipCard} />
        {showStreak && (
          <div className="streak-overlay" aria-live="polite">
            <span className="streak-text">{'\uD83D\uDD25'} Streak!</span>
          </div>
        )}
      </div>
      {isFlipped && (
        <div className="score-zone">
          <div className="score-btns">
            <button className="score-btn btn-got" onClick={handleCorrect}>Got it</button>
            <button className="score-btn btn-miss" onClick={handleMiss}>Missed</button>
          </div>
          <button className="btn-skip" onClick={actions.skip}>Skip</button>
        </div>
      )}
    </main>
  );
}
