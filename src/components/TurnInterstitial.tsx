import { useGameState } from '../hooks/useGameState';
import { useGameActions } from '../hooks/useGameActions';
import { getGameInstance } from '../hooks/gameInstance';

export function TurnInterstitial() {
  const { state, payload } = useGameState();
  const actions = useGameActions();
  const { scorer } = payload;
  const isContinue = state === 'continue';
  const currentPlayer = scorer.players[scorer.currentPlayerIdx];

  const handleSeeResults = () => { getGameInstance().endGame('completed'); };

  return (
    <main className="turn-interstitial" aria-label={isContinue ? 'Continue or see results' : 'Turn change'}>
      <div className="turn-atmosphere" aria-hidden="true" />
      <h2 className="turn-name">{isContinue ? `${scorer.totalPts} pts` : currentPlayer?.name ?? 'Your turn'}</h2>
      <p className="turn-sub">{isContinue ? `${scorer.correctCount} of ${payload.idx} correct — keep going?` : 'Pass the phone!'}</p>
      {!isContinue && scorer.players.length > 1 && (
        <div className="turn-standings">
          {[...scorer.players].sort((a, b) => b.score - a.score).map((p, i) => (
            <span key={i} className={`turn-player${p.name === currentPlayer?.name ? ' current' : ''}`}>
              {p.name || `P${i + 1}`}: {p.score}
            </span>
          ))}
        </div>
      )}
      <button className="btn-primary" onClick={isContinue ? actions.continueGame : actions.ready}>{isContinue ? 'Keep going' : 'Ready'}</button>
      {isContinue && <button className="btn-secondary" onClick={handleSeeResults}>See results</button>}
    </main>
  );
}
