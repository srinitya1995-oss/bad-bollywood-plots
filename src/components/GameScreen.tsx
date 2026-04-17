import { useState, useCallback, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useGameActions } from '../hooks/useGameActions';
import { getGameInstance } from '../hooks/gameInstance';
import { Card } from './Card';
import { MenuPopover } from './MenuPopover';
import { EndRoundSheet } from './EndRoundSheet';
import { ReportSheet } from './ReportSheet';
import type { Card as CardType } from '../core/types';
import { POINT_MAP } from '../core/types';

interface GameScreenProps {
  menuOpen?: boolean;
  onMenuClose?: () => void;
}

export function GameScreen({ menuOpen = false, onMenuClose }: GameScreenProps) {
  const { state, payload } = useGameState();
  const actions = useGameActions();
  const { deck, idx, currentCard, readerIdx, scorer } = payload;
  const [ptsFloat, setPtsFloat] = useState<{ value: number; key: number } | null>(null);
  const ptsKey = useRef(0);

  const [endRoundOpen, setEndRoundOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCardId, setReportCardId] = useState('');

  const showPtsFloat = useCallback((pts: number) => {
    ptsKey.current += 1;
    setPtsFloat({ value: pts, key: ptsKey.current });
    setTimeout(() => setPtsFloat(null), 1300);
  }, []);

  const handleAwardPoints = useCallback(
    (playerIdx: number, card: CardType) => {
      const g = getGameInstance();
      g.awardPoints(playerIdx, card);
      showPtsFloat(POINT_MAP[card.diff]);
      // Advance to next card
      g.advanceReader();
      actions.markCorrect();
    },
    [actions, showPtsFloat],
  );

  const handleAwardNobody = useCallback(
    (card: CardType) => {
      const g = getGameInstance();
      g.awardNobody(card);
      g.advanceReader();
      actions.markMiss();
    },
    [actions],
  );

  const handleReport = useCallback((card: CardType) => {
    setReportCardId(card.id);
    setReportOpen(true);
    const g = getGameInstance();
    g.bus.emit('card:reported', { cardId: card.id });
  }, []);

  const handleEndRound = useCallback(() => {
    const g = getGameInstance();
    g.endGame('abandon');
  }, []);

  const handleBackHome = useCallback(() => {
    const g = getGameInstance();
    g.exitGame();
  }, []);

  if (!currentCard) return null;

  const isFlipped = state === 'flipped';
  const progress = `CARD ${idx + 1} OF ${deck.length}`;

  return (
    <main className="screen active v8-game-screen" aria-label="Game">
      <div className="v8-game-progress">{progress}</div>
      <div className="v8-game-card-area">
        <Card
          key={currentCard.id}
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={actions.flipCard}
          players={scorer.players}
          readerIdx={readerIdx}
          onAwardPoints={handleAwardPoints}
          onAwardNobody={handleAwardNobody}
          onReport={handleReport}
          progressLabel={`No. ${String(idx + 1).padStart(3, '0')}`}
        />
        {ptsFloat && (
          <div
            key={ptsFloat.key}
            className="v8-pts-float v8-pts-float--show"
            aria-live="polite"
          >
            +{ptsFloat.value}
          </div>
        )}
      </div>

      <MenuPopover
        open={menuOpen}
        onClose={() => onMenuClose?.()}
        onEndRound={() => setEndRoundOpen(true)}
        onBackHome={handleBackHome}
      />

      <EndRoundSheet
        open={endRoundOpen}
        onKeepPlaying={() => setEndRoundOpen(false)}
        onEndRound={() => { setEndRoundOpen(false); handleEndRound(); }}
      />

      <ReportSheet
        open={reportOpen}
        cardId={reportCardId}
        onClose={() => setReportOpen(false)}
      />
    </main>
  );
}
