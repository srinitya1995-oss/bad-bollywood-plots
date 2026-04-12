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
    <main className="turn-interstitial" style={{ display: '' }} aria-label={isContinue ? 'Continue or see results' : 'Turn change'}>
      <h2 className="turn-name">{isContinue ? `${scorer.totalPts} pts` : currentPlayer?.name ?? 'Your turn'}</h2>
      <p className="turn-sub">{isContinue ? `${scorer.correctCount} of ${payload.idx} correct — keep going?` : 'Your turn'}</p>
      <button className="btn-primary" onClick={isContinue ? actions.continueGame : actions.ready}>{isContinue ? 'Keep going' : 'Ready'}</button>
      {isContinue && <button className="btn-secondary" onClick={handleSeeResults}>See results</button>}
    </main>
  );
}
