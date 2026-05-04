import { useRef, useCallback, useEffect } from 'react';
import type { Card as CardType, Player } from '../core/types';
import { INDUSTRY_META, POINT_MAP } from '../core/types';
import { useCardTextFit } from '../hooks/useCardTextFit';

interface CardProps {
  card: CardType;
  isFlipped: boolean;
  onFlip: () => void;
  /** All players in the game. */
  players?: Player[];
  /** Index of the current reader (excluded from picker). */
  readerIdx?: number;
  /** Called when a player picks (guessed correctly). */
  onAwardPoints?: (playerIdx: number, card: CardType) => void;
  /** Called when nobody guessed correctly. */
  onAwardNobody?: (card: CardType) => void;
  /** Called when user taps the report link. */
  onReport?: (card: CardType) => void;
  /** Card progress label, e.g. "CARD 3 OF 5" */
  progressLabel?: string;
}

const DIFF_COLORS: Record<string, string> = {
  easy: '#3EA87A',
  medium: '#E9B23E',
  hard: '#C8321C',
};

export function Card({
  card,
  isFlipped,
  onFlip,
  players = [],
  readerIdx = 0,
  onAwardPoints,
  onAwardNobody,
  onReport,
  progressLabel,
}: CardProps) {
  const meta = INDUSTRY_META[card.ind];
  const indLabel = meta.lang.toUpperCase();
  const packId = meta.packId;
  const pts = POINT_MAP[card.diff];
  const plotRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { fontSize: fittedSize, compact } = useCardTextFit(card.c, plotRef);

  useEffect(() => {
    if (!isFlipped) stageRef.current?.focus({ preventScroll: true });
  }, [isFlipped, card.id]);

  const isBW = packId === 'hi';

  const ariaLabel = isFlipped
    ? `${card.n} (${card.y}) -- ${meta.lang} ${card.diff}`
    : `${meta.lang} ${card.diff} card -- tap to flip and reveal answer`;

  const handlePick = useCallback(
    (playerIdx: number) => {
      onAwardPoints?.(playerIdx, card);
    },
    [onAwardPoints, card],
  );

  const handleNobody = useCallback(() => {
    onAwardNobody?.(card);
  }, [onAwardNobody, card]);

  const handleReport = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onReport?.(card);
    },
    [onReport, card],
  );

  const isSolo = players.length <= 1;
  const pickerPlayers = players.map((p, i) => ({ ...p, originalIdx: i }));

  const readerName = players[readerIdx]?.name || '';

  return (
    <div
      ref={stageRef}
      className={`v8-card-stage${isFlipped ? ' flipped' : ''}`}
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
      <div className="v8-card-flip">
        {/* FRONT */}
        <div className="v8-card-face v8-card-front">
          <div className="v8-card-mast">
            <span className="v8-card-mast__title">The Plot</span>
            {progressLabel && (
              <span className="v8-card-mast__num">{progressLabel}</span>
            )}
          </div>
          <div className="v8-card-meta">
            <span className={`v8-chip v8-chip--${packId}`}>{indLabel}</span>
            <span className="v8-card-diff">
              <span
                className="v8-card-diff__dot"
                aria-hidden="true"
                style={{ background: DIFF_COLORS[card.diff] }}
              />
              {card.diff.toUpperCase()} · {pts} PTS
            </span>
          </div>
          <div className="v8-plot-wrap">
            <div
              ref={plotRef}
              className="v8-card-plot"
              style={{
                fontSize: `${fittedSize}px`,
                fontStyle: compact ? 'normal' : undefined,
              }}
            >
              {card.c}
            </div>
          </div>
          <div className="v8-card-foot">
            {readerName && !isSolo ? (
              <span className="v8-card-foot__cream">
                READ BY: {readerName.toUpperCase()}
              </span>
            ) : null}
            <span>TAP TO REVEAL</span>
          </div>
        </div>

        {/* BACK */}
        <div
          className={`v8-card-face v8-card-back v8-card-back--${isBW ? 'bw' : 'tw'}`}
        >
          <button
            className="v8-report-link"
            onClick={handleReport}
            type="button"
            aria-label="Report this card"
          >
            &#9873; REPORT
          </button>
          <div className="v8-back-inner">
            <div className="v8-back-burst" aria-hidden="true" />
            <div className="v8-back-kicker">THE ANSWER</div>
            <div className="v8-back-title">{card.n}</div>
            <div className="v8-back-year">{card.y}</div>
            {card.f && <div className="v8-back-cast">{card.f}</div>}
          </div>
          {pickerPlayers.length > 0 && (
            <div className="v8-picker">
              {isSolo && <div className="v8-picker-label">DID YOU GET IT?</div>}
              <div className="v8-picker-chips">
                {pickerPlayers.map((p) => (
                  <button
                    key={p.originalIdx}
                    className="v8-pchip"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePick(p.originalIdx);
                    }}
                    type="button"
                  >
                    {isSolo ? 'I GOT IT! \u{1F525}' : (p.name || `P${p.originalIdx + 1}`)}
                  </button>
                ))}
                <button
                  className="v8-pchip v8-pchip--nobody"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNobody();
                  }}
                  type="button"
                >
                  {isSolo ? 'NOPE \u{1F614}' : 'NOBODY'}
                </button>
              </div>
              {!isSolo && (
                <button
                  className="v8-skip-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNobody();
                  }}
                  type="button"
                  aria-label="Skip this card without scoring"
                >
                  skip this card
                </button>
              )}
            </div>
          )}
          <div className="v8-back-foot">
            <span className="v8-back-foot__pts">WORTH +{pts}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
