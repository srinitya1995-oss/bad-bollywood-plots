import { useGameState } from '../hooks/useGameState';

type Props = {
  leader?: string;
  points?: number;
  onMenuClick?: () => void;
};

export function TopBand({ leader, points, onMenuClick }: Props) {
  const { state } = useGameState();
  if (state === 'home' || state === 'setup') return null;

  const truncated = leader && leader.length > 8 ? `${leader.slice(0, 8)}…` : leader;

  return (
    <div className="v8-topband" role="banner">
      <div className="v8-topband__title">
        Bad <span className="v8-topband__accent">Bollywood</span> Plots
      </div>
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
