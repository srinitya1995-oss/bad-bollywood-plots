import type { Card as CardType } from '../core/types';

interface CardProps {
  card: CardType;
  isFlipped: boolean;
  onFlip: () => void;
}

export function Card({ card, isFlipped, onFlip }: CardProps) {
  const isBW = card.ind === 'BW';
  const indLabel = isBW ? 'Bollywood' : 'Tollywood';

  return (
    <div
      className={`card-wrap${isFlipped ? ' flipped' : ''}`}
      onClick={isFlipped ? undefined : onFlip}
      onKeyDown={(e) => { if (!isFlipped && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onFlip(); } }}
      role="button"
      tabIndex={0}
      aria-label="Tap to flip card and reveal answer"
    >
      <div className="card-inner">
        <div className={`card-face card-front${!isBW ? ' tw' : ''}`}>
          <div className="card-frame" aria-hidden="true" />
          <div className="card-content">
            <div className="card-meta">
              <span className={`card-ind ${card.ind.toLowerCase()}`}>{indLabel}</span>
              <span className="card-era">{card.era} {'\u00b7'} {card.diff.charAt(0).toUpperCase() + card.diff.slice(1)}</span>
              <span className={`card-badge badge-${card.diff}`}>{card.diff}</span>
            </div>
            <p className="card-clue">{card.c}</p>
            <span className="card-tap">Tap to reveal answer</span>
          </div>
        </div>
        <div className={`card-face card-back${!isBW ? ' tw' : ''}`}>
          <div className="card-frame card-frame-back" aria-hidden="true" />
          <div className="card-content">
            <span className={`card-ind-back${isBW ? ' bw' : ' tw'}`}>{indLabel} {'\u00b7'} {card.diff}</span>
            <h3 className="card-answer">{card.n}</h3>
            <span className="card-year">{card.y}</span>
            <hr className="card-divider" aria-hidden="true" />
            <p className="card-fact-label">Did you know</p>
            <p className="card-fact">{card.f}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
