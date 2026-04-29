import { useGameState } from '../hooks/useGameState';
import { getGameInstance } from '../hooks/gameInstance';

type Props = {
  leader?: string;
  points?: number;
  onMenuClick?: () => void;
};

export function TopBand({ leader, points, onMenuClick }: Props) {
  const { state } = useGameState();
  if (state === 'home' || state === 'setup') return null;

  const truncated = leader && leader.length > 8 ? `${leader.slice(0, 8)}…` : leader;

  // Click the brand in the topband to leave the current round and go home.
  // Gives a discoverable "exit" affordance for users who don't find the •• menu.
  const inActiveRound = state === 'playing' || state === 'flipped' || state === 'scoring' || state === 'turnChange' || state === 'continue';
  const handleTitleClick = () => {
    if (!inActiveRound) return;
    const ok = window.confirm('Leave this round and go home?');
    if (ok) getGameInstance().exitGame();
  };

  return (
    <div className="v8-topband" role="banner">
      <button
        type="button"
        className="v8-topband__title"
        onClick={handleTitleClick}
        aria-label={inActiveRound ? 'Leave round and go home' : 'Bad Desi Plots'}
      >
        {inActiveRound && <span className="v8-topband__home" aria-hidden="true">&#8962;</span>}
        Bad <span className="v8-topband__accent">Desi</span> Plots
      </button>
      <div className="v8-topband__right">
        {truncated && (
          <>
            <span className="v8-topband__leader">{truncated}</span>
            {typeof points === 'number' && (
              <>
                <span className="v8-topband__divider" aria-hidden="true" />
                <span className="v8-topband__pts">{points}</span>
              </>
            )}
          </>
        )}
        {onMenuClick && (
          <button
            className="v8-topband__menu"
            onClick={onMenuClick}
            aria-label="Game menu"
          >
            •••
          </button>
        )}
      </div>
    </div>
  );
}
