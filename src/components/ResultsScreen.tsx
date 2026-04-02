import { useGameState } from '../hooks/useGameState';
import { useGameActions } from '../hooks/useGameActions';
import { toast } from './Toast';

export function ResultsScreen() {
  const { payload } = useGameState();
  const actions = useGameActions();
  const { scorer, verdict, leaderboard, gameMode, highScore, idx } = payload;

  const handleShare = () => {
    const text = actions.getShareText();
    if (navigator.share) {
      navigator.share({ title: 'Bad Plots', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => toast('Score copied!')).catch(() => toast('Could not copy'));
    }
  };

  return (
    <main className="screen active" aria-label="Results">
      <header className="res-top">
        <p className="res-eyebrow">Game over</p>
        <h1 className="res-title">{verdict?.title ?? 'Done!'}</h1>
        <p className="res-sub">{gameMode === 'endless' ? `High score: ${highScore} pts` : `${scorer.correctCount} of ${idx} correct`}</p>
        <div className="res-stats">
          <div className="res-stat"><span className="res-stat-n">{scorer.correctCount}</span><span className="res-stat-l">Correct</span></div>
          <div className="res-stat"><span className="res-stat-n">{idx}</span><span className="res-stat-l">Played</span></div>
          <div className="res-stat"><span className="res-stat-n">{scorer.totalPts}</span><span className="res-stat-l">Points</span></div>
        </div>
      </header>
      <div className="res-body">
        <blockquote className="res-verdict"><p className="res-verdict-text">{verdict?.verdict}</p></blockquote>
        {leaderboard.length > 1 && (
          <div className="leaderboard">
            <h2 className="lb-title">Leaderboard</h2>
            {leaderboard.map((p, i) => (
              <div key={i} className="lb-row">
                <span className="lb-rank">{i + 1}</span>
                <span className="lb-name">{p.name}</span>
                <span className="lb-score">{p.score} pts</span>
              </div>
            ))}
          </div>
        )}
        <div className="res-actions">
          <button className="btn-primary" onClick={actions.replay}>Play again</button>
          <button className="btn-secondary" onClick={handleShare}>Share score</button>
          <button className="link-btn">How was that?</button>
        </div>
      </div>
    </main>
  );
}
