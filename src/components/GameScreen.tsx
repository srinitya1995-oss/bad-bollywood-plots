import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useGameActions } from '../hooks/useGameActions';
import { getGameInstance } from '../hooks/gameInstance';
import { Card } from './Card';
import { MenuPopover } from './MenuPopover';
import { EndRoundSheet } from './EndRoundSheet';
import { ReportSheet } from './ReportSheet';
import { HowToScreen } from './HowToScreen';
import type { Card as CardType } from '../core/types';
import { POINT_MAP } from '../core/types';

interface GameScreenProps {
  menuOpen?: boolean;
  onMenuClose?: () => void;
}

export function GameScreen({ menuOpen = false, onMenuClose }: GameScreenProps) {
  const { state, payload } = useGameState();
  const actions = useGameActions();
  const { idx, currentCard, readerIdx, scorer } = payload;
  const [ptsFloat, setPtsFloat] = useState<{ base: number; bonus: number; key: number } | null>(null);
  const ptsKey = useRef(0);
  const ptsTimer = useRef<number | null>(null);

  const [endRoundOpen, setEndRoundOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCardId, setReportCardId] = useState('');
  const [howToOpen, setHowToOpen] = useState(false);

  const showPtsFloat = useCallback((base: number, bonus: number) => {
    if (ptsTimer.current != null) window.clearTimeout(ptsTimer.current);
    ptsKey.current += 1;
    setPtsFloat({ base, bonus, key: ptsKey.current });
    ptsTimer.current = window.setTimeout(() => {
      setPtsFloat(null);
      ptsTimer.current = null;
    }, 1400);
  }, []);

  useEffect(() => () => {
    if (ptsTimer.current != null) window.clearTimeout(ptsTimer.current);
  }, []);

  // Clear the pts-float immediately on new card so the "+X PTS" from the previous round
  // doesn't bleed into the freshly-loaded card's first paint.
  useEffect(() => {
    if (ptsTimer.current != null) window.clearTimeout(ptsTimer.current);
    ptsTimer.current = null;
    setPtsFloat(null);
  }, [idx]);

  const handleAwardPoints = useCallback(
    (playerIdx: number, card: CardType) => {
      const g = getGameInstance();
      // Increment streak FIRST so player award and scorer.totalPts use the same (post-increment) streak.
      actions.markCorrect();
      const basePts = POINT_MAP[card.diff] ?? 1;
      const streak = g.getPayload().scorer.streak;
      const bonus = streak >= 7 ? 3 : streak >= 5 ? 2 : streak >= 3 ? 1 : 0;
      g.awardPoints(playerIdx, card);
      showPtsFloat(basePts, bonus);
      g.advanceReader();
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

  const currentMode: 'solo' | 'party' = (scorer.players.length <= 1) ? 'solo' : 'party';
  const handleSwitchMode = useCallback(() => {
    const g = getGameInstance();
    const industry = g.getPayload().industry ?? 'HI';
    // Abandon the current round (don't show results) and route back through setup.
    g.exitGame();
    if (currentMode === 'solo') {
      g.selectMode(industry); // party mode
    } else {
      g.startSoloGame(industry); // solo mode
    }
  }, [currentMode]);

  if (!currentCard) return null;

  const isFlipped = state === 'flipped';
  // Endless (solo) has no fixed round length — show "CARD N" only.
  // Party caps at 12 via gameFSM, so the /N denominator only applies there.
  const gameMode = getGameInstance().getPayload().gameMode;
  const roundLen = getGameInstance().getSettings().roundLen ?? 10;
  const progress = gameMode === 'endless' ? `CARD ${idx + 1}` : `CARD ${idx + 1} / ${roundLen}`;

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
            aria-atomic="true"
          >
            <span className="v8-pts-float__base">+{ptsFloat.base} PTS</span>
            {ptsFloat.bonus > 0 && (
              <span className="v8-pts-float__bonus">{'\u{1F525}'} +{ptsFloat.bonus} STREAK</span>
            )}
          </div>
        )}
      </div>

      <MenuPopover
        open={menuOpen}
        onClose={() => onMenuClose?.()}
        onEndRound={() => setEndRoundOpen(true)}
        onBackHome={handleBackHome}
        onHowTo={() => setHowToOpen(true)}
        currentMode={currentMode}
        onSwitchMode={handleSwitchMode}
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

      {howToOpen && <HowToScreen onClose={() => setHowToOpen(false)} />}
    </main>
  );
}
