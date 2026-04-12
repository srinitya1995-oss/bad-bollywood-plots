import type { Card as CardType } from '../core/types';
import { INDUSTRY_META } from '../core/types';

interface CardProps {
  card: CardType;
  isFlipped: boolean;
  onFlip: () => void;
}

export function Card({ card, isFlipped, onFlip }: CardProps) {
  const meta = INDUSTRY_META[card.ind];
  const indLabel = meta.lang;
  const packId = meta.packId;

  const ariaLabel = isFlipped
    ? `${card.n} (${card.y}) — ${indLabel} ${card.diff}`
    : `${indLabel} ${card.diff} card — tap to flip and reveal answer`;

  return (
    <div
      className={`card-wrap${isFlipped ? ' flipped' : ''}`}
      onClick={isFlipped ? undefined : onFlip}
      onKeyDown={(e) => { if (!isFlipped && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onFlip(); } }}
      role="button"
      tabIndex={isFlipped ? -1 : 0}
      aria-label={ariaLabel}
    >
      <div className="card-inner">
        <div className={`card-face card-front ${packId}`}>
          <div className="card-frame" aria-hidden="true" />
          <div className="card-content">
            <div className="card-meta">
              <span className={`card-ind ${packId}`}>{indLabel}</span>
              <span className={`card-badge badge-${card.diff}`}>{card.era} {'\u00b7'} {card.diff}</span>
            </div>
            <p className="card-clue">{card.c}</p>
            <span className="card-tap">Tap to reveal answer</span>
          </div>
        </div>
        <div className={`card-face card-back ${packId}`}>
          <div className="card-frame card-frame-back" aria-hidden="true" />
          <div className="card-content">
            <span className={`card-ind-back ${packId}`}>{indLabel} {'\u00b7'} {card.diff}</span>
            <h3 className="card-answer">{card.n}</h3>
            <span className="card-year">{card.y}</span>
            <hr className="card-divider" aria-hidden="true" />
            <p className={`card-fact-label ${packId}`}>Did you know</p>
            <p className="card-fact">{card.f}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
