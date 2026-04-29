import { useGameState } from '../hooks/useGameState';
import { getGameInstance } from '../hooks/gameInstance';
import { Logo } from './Logo';

type Props = {
  leader?: string;
  points?: number;
  onMenuClick?: () => void;
};

export function TopBand({ leader, points, onMenuClick }: Props) {
  const { state } = useGameState();

  const truncated = leader && leader.length > 8 ? `${leader.slice(0, 8)}…` : leader;
  const inActiveRound =
    state === 'playing' || state === 'flipped' || state === 'scoring' ||
    state === 'turnChange' || state === 'continue';

  const handleTitleClick = () => {
    if (!inActiveRound) return;
    const ok = window.confirm('Leave this round and go home?');
    if (ok) getGameInstance().exitGame();
  };

  return (
    <div
      className="v8-topband"
      role="banner"
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', background: 'var(--ink)', color: 'var(--cream)',
        borderBottom: '3px solid var(--tomato)', height: 52, flexShrink: 0,
      }}
    >
      <button
        type="button"
        className="v8-topband__title"
        onClick={handleTitleClick}
        aria-label={inActiveRound ? 'Leave round and go home' : 'Bad Desi Plots'}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', color: 'var(--cream)',
          fontFamily: 'Anton, Impact, sans-serif', fontSize: 16,
          textTransform: 'uppercase', letterSpacing: '-0.005em',
          cursor: inActiveRound ? 'pointer' : 'default', padding: 0,
        }}
      >
        {inActiveRound && (
          <span className="v8-topband__home" aria-hidden="true" style={{ fontSize: 14, color: 'var(--gold)' }}>&#8962;</span>
        )}
        <Logo size={18} />
        <span>
          Bad <span className="v8-topband__accent" style={{ color: 'var(--tomato)' }}>Desi</span> Plots
        </span>
      </button>
      <div className="v8-topband__right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {truncated && (
          <span
            className="v8-topband__leader"
            style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gold)' }}
          >
            {truncated}{typeof points === 'number' ? ` · ${points}` : ''}
          </span>
        )}
        {onMenuClick && (
          <button
            className="v8-topband__menu"
            onClick={onMenuClick}
            aria-label="Game menu"
            style={{
              width: 28, height: 28, display: 'grid', placeItems: 'center',
              background: 'none', border: 'none', color: 'var(--cream)',
              fontSize: 16, opacity: 0.7, cursor: 'pointer',
            }}
          >
            •••
          </button>
        )}
      </div>
    </div>
  );
}
