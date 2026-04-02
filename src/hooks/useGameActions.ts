import { useRef } from 'react';
import { getGameInstance } from './gameInstance';
import type { Industry, GameMode, Player } from '../core/types';

export interface GameActions {
  selectMode: (industry: Industry) => void;
  setGameMode: (mode: GameMode) => void;
  startGame: (players: Player[]) => void;
  flipCard: () => void;
  markCorrect: () => void;
  markMiss: () => void;
  skip: () => void;
  ready: () => void;
  continueGame: () => void;
  exitGame: () => void;
  replay: () => void;
  getShareText: () => string;
}

export function useGameActions(): GameActions {
  const actionsRef = useRef<GameActions | null>(null);
  if (!actionsRef.current) {
    const g = getGameInstance();
    actionsRef.current = {
      selectMode: (industry) => g.selectMode(industry),
      setGameMode: (mode) => g.setGameMode(mode),
      startGame: (players) => g.startGame(players),
      flipCard: () => g.flipCard(),
      markCorrect: () => g.markResult('correct'),
      markMiss: () => g.markResult('miss'),
      skip: () => g.markResult('skip'),
      ready: () => g.ready(),
      continueGame: () => g.continueGame(),
      exitGame: () => g.exitGame(),
      replay: () => g.replay(),
      getShareText: () => g.getShareText(),
    };
  }
  return actionsRef.current;
}
