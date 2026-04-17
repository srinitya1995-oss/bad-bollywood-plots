import type { Card as CardType } from '../core/types';
import { INDUSTRY_META, POINT_MAP } from '../core/types';

interface CardProps {
  card: CardType;
  isFlipped: boolean;
  onFlip: () => void;
}

export function Card({ card, isFlipped, onFlip }: CardProps) {
  const meta = INDUSTRY_META[card.ind];
  const indLabel = meta.lang.toUpperCase();
  const packId = meta.packId;
  const pts = POINT_MAP[card.diff];

  const ariaLabel = isFlipped
    ? `${card.n} (${card.y}) ${meta.lang} ${card.diff} difficulty`
    : `${meta.lang} ${card.diff} card, tap to flip and reveal answer`;

  return (
    <div
      className={`v6-card-wrap${isFlipped ? ' flipped' : ''}`}
      onClick={isFlipped ? undefined : onFlip}
      onKeyDown={(e) => {
        if (!isFlipped && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onFlip();
        }
      }}
      role="button"
      tabIndex={isFlipped ? -1 : 0}
      aria-label={ariaLabel}
    >
      <div className="v6-card-3d">
        {/* FRONT — plot */}
        <div className="v6-face v6-face-front">
          <div className="v6-card v6-plot-card">
            <div className="v6-top-row">
              <span className={`v6-pill v6-pill-${packId}`}>{indLabel}</span>
              <span className={`v6-pts-chip v6-diff-${card.diff}`}>+{pts}</span>
            </div>
            <p className="v6-plot">{card.c}</p>
            <div className="v6-hint-row"><span>TAP TO FLIP</span></div>
          </div>
        </div>
        {/* BACK — reveal */}
        <div className="v6-face v6-face-back">
          <div className="v6-card v6-reveal-card">
            <div className="v6-top-row">
              <span className={`v6-pill v6-pill-${packId}`}>{indLabel}</span>
              <span className={`v6-pts-chip v6-diff-${card.diff}`}>+{pts}</span>
            </div>
            <h3 className="v6-movie">
              {card.n}
              <span className="v6-year">{card.y}</span>
            </h3>
            <div className="v6-divider" />
            <div className="v6-fun-label">Fun fact</div>
            <p className="v6-fun">{card.f}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
