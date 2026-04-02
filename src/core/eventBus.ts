import type { Industry, GameMode, GameState, Difficulty, EndReason } from './types';

export interface GameEventMap {
  'game:started': { mode: Industry; gameMode: GameMode; playerCount: number };
  'game:ended': { reason: EndReason; totalPts: number; correctCount: number; totalPlayed: number };
  'card:loaded': { cardId: string; idx: number; difficulty: Difficulty };
  'card:flipped': { cardId: string; idx: number };
  'score:updated': { result: 'correct' | 'miss' | 'skip'; pts: number; totalPts: number };
  'deck:exhausted': { mode: Industry };
  'player:turn-changed': { playerIdx: number; playerName: string };
  'fsm:transition': { from: GameState; to: GameState };
}

type Handler<T> = (data: T) => void;

export class TypedEventBus {
  private handlers = new Map<string, Set<Handler<unknown>>>();

  emit<K extends keyof GameEventMap>(event: K, data: GameEventMap[K]): void {
    const set = this.handlers.get(event);
    if (set) {
      for (const handler of set) {
        handler(data);
      }
    }
  }

  on<K extends keyof GameEventMap>(event: K, handler: Handler<GameEventMap[K]>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as Handler<unknown>);
  }

  off<K extends keyof GameEventMap>(event: K, handler: Handler<GameEventMap[K]>): void {
    this.handlers.get(event)?.delete(handler as Handler<unknown>);
  }
}
