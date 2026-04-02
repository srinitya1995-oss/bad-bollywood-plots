import type { GameState } from './types';
import type { TypedEventBus } from './eventBus';

const TRANSITIONS: Record<GameState, GameState[]> = {
  home: ['setup'],
  setup: ['playing', 'home'],
  playing: ['flipped', 'home'],
  flipped: ['scoring'],
  scoring: ['playing', 'turnChange', 'continue', 'results'],
  turnChange: ['playing'],
  continue: ['playing', 'results'],
  results: ['home', 'playing'],
};

export interface GameSnapshot {
  state: GameState;
  payload: Record<string, unknown> | null;
}

export class GameFSM {
  private state: GameState = 'home';
  private payload: Record<string, unknown> | null = null;
  private snapshot: GameSnapshot = { state: 'home', payload: null };
  private subscribers = new Set<() => void>();

  constructor(private bus: TypedEventBus) {}

  getState(): GameState { return this.state; }
  getPayload(): Record<string, unknown> | null { return this.payload; }
  getSnapshot(): GameSnapshot { return this.snapshot; }

  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  transition(to: GameState, payload?: Record<string, unknown>): void {
    const allowed = TRANSITIONS[this.state];
    if (!allowed.includes(to)) {
      console.warn(`[FSM] Invalid transition: ${this.state} → ${to}`);
      return;
    }
    const from = this.state;
    this.state = to;
    this.payload = payload ?? null;
    this.snapshot = { state: to, payload: this.payload };
    this.bus.emit('fsm:transition', { from, to });
    for (const cb of this.subscribers) { cb(); }
  }
}
