import { useSyncExternalStore } from 'react';
import { getGameInstance, type GamePayload } from './gameInstance';
import type { GameState } from '../core/types';

interface GameStateResult {
  state: GameState;
  payload: GamePayload;
}

export function useGameState(): GameStateResult {
  const instance = getGameInstance();
  const snapshot = useSyncExternalStore(
    (callback) => instance.fsm.subscribe(callback),
    () => instance.fsm.getSnapshot(),
  );
  return { state: snapshot.state, payload: instance.getPayload() };
}
