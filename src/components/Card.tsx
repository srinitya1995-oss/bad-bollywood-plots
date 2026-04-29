import { useRef, useCallback, useEffect } from 'react';
import type { Card as CardType, Player } from '../core/types';
import { INDUSTRY_META, POINT_MAP } from '../core/types';
import { useCardTextFit } from '../hooks/useCardTextFit';

interface CardProps {
  card: CardType;
  isFlipped: boolean;
  onFlip: () => void;
  players?: Player[];
  readerIdx?: number;
  onAwardPoints?: (playerIdx: number, card: CardType) => void;
  onAwardNobody?: (card: CardType) => void;
  /** Reports are now handled by the outer mast row in GameScreen, not the card face. */
  onReport?: (card: CardType) => void;
  progressLabel?: string;
}

const DIFF_COLORS: Record<string, string> = {
  easy: '#3EA87A',     // emerald
  medium: '#F2A72E',   // saffron / gold
  hard: '#C8321C',     // tomato
};

const PLAYER_COLORS = ['#C8321C', '#F2A72E', '#3EA87A', '#8C6BA8'];

export function Card({
  card,
  isFlipped,
  onFlip,
  players = [],
  readerIdx = 0,
  onAwardPoints,
  onAwardNobody,
  onReport: _onReport,
  progressLabel,
}: CardProps) {
  const meta = INDUSTRY_META[card.ind];
  const indLabel = meta.lang.toUpperCase();
  const packId = meta.packId;
  const pts = POINT_MAP[card.diff];
  const plotRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { fontSize: fittedSize, compact: isLongCard } = useCardTextFit(card.c, plotRef);

  useEffect(() => {
    if (!isFlipped) stageRef.current?.focus({ preventScroll: true });
  }, [isFlipped, card.id]);

  const ariaLabel = isFlipped
    ? `${card.n} (${card.y}) -- ${meta.lang} ${card.diff}`
    : `${meta.lang} ${card.diff} card -- tap to flip and reveal answer`;

  const handlePick = useCallback(
    (playerIdx: number) => { onAwardPoints?.(playerIdx, card); },
    [onAwardPoints, card],
  );
  const handleNobody = useCallback(() => { onAwardNobody?.(card); }, [onAwardNobody, card]);

  const isSolo = players.length <= 1;
  // Spec §4: reader is excluded from the picker grid (they see the answer).
  // Solo mode keeps the single "I got it" chip, there's no reader to exclude.
  const pickerEntries = players
    .map((p, i) => ({ ...p, originalIdx: i }))
    .filter((p) => isSolo || p.originalIdx !== readerIdx);

  const readerName = players[readerIdx]?.name || '';
  const isBW = packId === 'hi';

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
      style={{
        flex: 1, perspective: 1200, cursor: isFlipped ? 'default' : 'pointer',
        outline: 'none',
      }}
    >
      <div
        className="v8-card-flip"
        style={{
          position: 'relative', width: '100%', height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 280ms cubic-bezier(.2,.8,.2,1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── FRONT ── */}
        <div
          className="v8-card-face v8-card-front"
          style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            background: 'var(--cream)', color: 'var(--ink)',
            border: '3px solid var(--ink)', boxShadow: '6px 6px 0 var(--ink)',
            padding: '14px 16px', display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Card mast: "The plot" + No. */}
          <div
            className="v8-card-mast"
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              paddingBottom: 8, borderBottom: '2px solid var(--ink)',
            }}
          >
            <span
              className="v8-card-mast__title"
              style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 16, color: 'var(--ink)' }}
            >
              THE PLOT
            </span>
            {progressLabel && (
              <span
                className="v8-card-mast__num"
                style={{
                  fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.24em',
                  color: 'var(--ink-muted)', textTransform: 'uppercase',
                }}
              >
                {progressLabel}
              </span>
            )}
          </div>

          {/* Industry tag + difficulty pip */}
          <div
            className="v8-card-meta"
            style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}
          >
            <span
              className={`v8-chip v8-chip--${packId}`}
              style={{
                padding: '3px 8px',
                background: isBW ? 'var(--tomato)' : 'var(--emerald)',
                color: 'var(--cream)',
                fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              {indLabel}
            </span>
            <span
              className="v8-card-diff"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.22em',
                color: 'var(--ink)', textTransform: 'uppercase',
              }}
            >
              <span
                className="v8-card-diff__dot"
                aria-hidden="true"
                style={{ width: 7, height: 7, borderRadius: '50%', background: DIFF_COLORS[card.diff] }}
              />
              {card.diff.toUpperCase()} · {pts} PTS
            </span>
          </div>

          {/* Plot copy */}
          <div
            className="v8-plot-wrap"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px 4px' }}
          >
            <div
              ref={plotRef}
              className="v8-card-plot"
              style={{
                fontFamily: 'Fraunces, serif',
                // Long cards drop italic so the smaller floor (14px) stays legible
                // for the elder cohort (simulator P0 row 3, panel P1-8).
                fontStyle: isLongCard ? 'normal' : 'italic',
                fontWeight: 400,
                fontSize: `${fittedSize}px`, color: 'var(--ink)', lineHeight: 1.35,
                letterSpacing: '-0.005em', textAlign: 'center',
              }}
            >
              {card.c}
            </div>
          </div>

          {/* Foot: "READ BY" + tap to reveal */}
          <div
            className="v8-card-foot"
            style={{ paddingTop: 10, borderTop: '2px solid var(--ink)' }}
          >
            {readerName && !isSolo ? (
              <span
                className="v8-card-foot__cream"
                style={{
                  display: 'inline-block', padding: '3px 8px',
                  background: 'var(--ink)', color: 'var(--cream)',
                  fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                }}
              >
                READ BY: {readerName.toUpperCase()}
              </span>
            ) : null}
            <div
              style={{
                marginTop: 10, fontFamily: 'Anton, Impact, sans-serif', fontSize: 22,
                color: 'var(--tomato)', textTransform: 'uppercase', letterSpacing: '-0.005em',
                textAlign: 'center',
                animation: 'v4-pulse 1.6s ease-in-out infinite',
              }}
            >
              TAP TO REVEAL →
            </div>
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className={`v8-card-face v8-card-back v8-card-back--${isBW ? 'bw' : 'tw'}`}
          style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'var(--ink)', color: 'var(--cream)',
            border: '3px solid var(--ink)', boxShadow: '6px 6px 0 var(--tomato)',
            padding: '20px 16px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22,
            overflow: 'hidden',
          }}
        >
          {/* radial burst */}
          <div
            aria-hidden="true"
            className="v8-back-burst"
            style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at 50% 40%, rgba(232,93,58,0.45), transparent 60%)',
              pointerEvents: 'none',
            }}
          />

          {/* Center: title */}
          <div className="v8-back-inner" style={{ textAlign: 'center', position: 'relative' }}>
            <div
              className="v8-back-kicker"
              style={{
                fontFamily: 'Bebas Neue, sans-serif', fontSize: 11, letterSpacing: '0.34em',
                color: 'var(--gold)', textTransform: 'uppercase',
              }}
            >
              THE ANSWER
            </div>
            <div
              className="v8-back-title"
              style={{
                marginTop: 6, fontFamily: 'Anton, Impact, sans-serif', fontSize: 58, lineHeight: 0.88,
                color: 'var(--cream)', textTransform: 'uppercase', letterSpacing: '-0.02em',
                textShadow: '3px 3px 0 var(--tomato)',
              }}
            >
              {card.n}
            </div>
            <div
              className="v8-back-year"
              style={{
                marginTop: 8, display: 'inline-block', padding: '2px 8px',
                border: '1px solid var(--gold)', color: 'var(--gold)',
                fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.24em',
              }}
            >
              {card.y}
            </div>
            {card.f && (
              <div
                className="v8-back-cast"
                style={{
                  marginTop: 10, fontFamily: 'Fraunces, serif', fontStyle: 'italic',
                  fontSize: 13, color: 'rgba(243,233,210,0.8)', lineHeight: 1.4, maxWidth: 280,
                  margin: '10px auto 0',
                }}
              >
                {card.f}
              </div>
            )}
          </div>

          {/* Picker grid */}
          {pickerEntries.length > 0 && (
            <div className="v8-picker" style={{ position: 'relative' }}>
              {isSolo && (
                <div
                  className="v8-picker-label"
                  style={{
                    fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.28em',
                    color: 'var(--gold)', textTransform: 'uppercase',
                    textAlign: 'center', marginBottom: 8,
                  }}
                >
                  DID YOU GET IT?
                </div>
              )}
              <div className="v8-picker-chips" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {pickerEntries.map((p) => (
                  <button
                    key={p.originalIdx}
                    className="v8-pchip"
                    onClick={(e) => { e.stopPropagation(); handlePick(p.originalIdx); }}
                    type="button"
                    style={{
                      padding: '10px 12px',
                      background: 'var(--cream)', color: 'var(--ink)',
                      border: '2px solid var(--cream)', boxShadow: '3px 3px 0 var(--tomato)',
                      fontFamily: 'Anton, Impact, sans-serif', fontSize: 18,
                      textTransform: 'uppercase', letterSpacing: '-0.005em',
                      textAlign: 'left', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                    }}
                  >
                    <span>{isSolo ? 'I GOT IT 🔥' : (p.name || `P${p.originalIdx + 1}`)}</span>
                    <span
                      style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: PLAYER_COLORS[p.originalIdx % PLAYER_COLORS.length],
                      }}
                      aria-hidden="true"
                    />
                  </button>
                ))}
                <button
                  className="v8-pchip v8-pchip--nobody"
                  onClick={(e) => { e.stopPropagation(); handleNobody(); }}
                  type="button"
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(243,233,210,0.05)', color: 'var(--cream)',
                    border: '2px solid var(--cream)', boxShadow: 'none',
                    fontFamily: 'Anton, Impact, sans-serif', fontSize: 18,
                    textTransform: 'uppercase', letterSpacing: '-0.005em',
                    textAlign: 'left', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    gridColumn: pickerEntries.length % 2 === 0 ? '1 / -1' : 'auto',
                  }}
                >
                  <span>{isSolo ? 'NOPE 😔' : 'NOBODY'}</span>
                  <span
                    style={{
                      width: 10, height: 10, border: '1px solid var(--cream)', background: 'transparent',
                    }}
                    aria-hidden="true"
                  />
                </button>
              </div>
              {!isSolo && (
                <button
                  className="v8-skip-link"
                  onClick={(e) => { e.stopPropagation(); handleNobody(); }}
                  type="button"
                  aria-label="Skip this card without scoring"
                  style={{
                    marginTop: 8, width: '100%', textAlign: 'center', padding: 0,
                    fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.28em',
                    color: 'rgba(243,233,210,0.55)', background: 'transparent', border: 'none',
                    textTransform: 'uppercase', cursor: 'pointer',
                  }}
                >
                  <span style={{ borderBottom: '1px solid rgba(243,233,210,0.4)' }}>SKIP THIS CARD</span>
                  <span style={{ margin: '0 10px', color: 'var(--gold)' }}>·</span>
                  <span style={{ color: 'var(--gold)' }}>WORTH +{pts}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
