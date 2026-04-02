import { TypedEventBus } from '../core/eventBus';
import { GameFSM } from '../core/gameFSM';
import { ContentLoader } from '../core/contentLoader';
import { LocalStorageAdapter } from '../storage/localStorage';
import { SupabaseAdapter } from '../storage/supabase';
import type { StorageAdapter } from '../storage/interface';
import type { Card, Industry, GameMode, Player } from '../core/types';
import { buildPartyDeck, buildEndlessDeck } from '../core/deckBuilder';
import { createScorerState, scoreCard, getVerdict, getLeaderboard, type ScorerState } from '../core/scorer';

const SUPABASE_URL = 'https://wmfxkkgktmfsipiihsjq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZnhra2drdG1mc2lwaWloc2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzA2MTYsImV4cCI6MjA5MDA0NjYxNn0.eV3m6O_-Ti3cl8C2yq-Ffp7M2hdBj9qasEWSD3lnrTg';

function initSupabaseClient(): unknown {
  try {
    const win = window as unknown as Record<string, unknown>;
    if (win.supabase) {
      const sb = win.supabase as { createClient: (url: string, key: string) => unknown };
      return sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  } catch { /* non-critical */ }
  return null;
}

export interface GamePayload {
  industry: Industry | null;
  gameMode: GameMode;
  deck: Card[];
  idx: number;
  currentCard: Card | null;
  isFlipped: boolean;
  scorer: ScorerState;
  sessionDealt: Set<string>;
  highScore: number;
  verdict: { title: string; verdict: string } | null;
  leaderboard: Player[];
}

class GameInstance {
  readonly bus = new TypedEventBus();
  readonly fsm: GameFSM;
  readonly storage: StorageAdapter;
  readonly contentLoader: ContentLoader;

  private cards: Card[] = [];
  private industry: Industry | null = null;
  private gameMode: GameMode = 'party';
  private deck: Card[] = [];
  private idx = 0;
  private scorer: ScorerState = createScorerState([]);
  private sessionDealt = new Set<string>();
  private sessionId = crypto.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

  constructor() {
    this.fsm = new GameFSM(this.bus);
    const localStorage = new LocalStorageAdapter(window.localStorage);
    const supabaseClient = initSupabaseClient();
    this.storage = new SupabaseAdapter(supabaseClient as never, localStorage);
    this.contentLoader = new ContentLoader(async (url: string) => {
      const res = await fetch(url);
      return res.json();
    });
  }

  async init(): Promise<void> {
    this.cards = await this.contentLoader.loadAllEnabled();
  }

  getPayload(): GamePayload {
    return {
      industry: this.industry,
      gameMode: this.gameMode,
      deck: this.deck,
      idx: this.idx,
      currentCard: this.deck[this.idx] ?? null,
      isFlipped: this.fsm.getState() === 'flipped',
      scorer: this.scorer,
      sessionDealt: this.sessionDealt,
      highScore: this.storage.getHighScore(),
      verdict: this.fsm.getState() === 'results' ? getVerdict(this.scorer.correctCount, this.idx) : null,
      leaderboard: getLeaderboard(this.scorer.players),
    };
  }

  selectMode(industry: Industry): void {
    this.industry = industry;
    this.fsm.transition('setup');
  }

  setGameMode(mode: GameMode): void {
    this.gameMode = mode;
  }

  startGame(players: Player[]): void {
    const pool = ContentLoader.getCardPool(this.cards, this.industry!);
    this.sessionDealt.clear();
    this.deck = this.gameMode === 'party'
      ? buildPartyDeck(pool, this.sessionDealt, this.storage.getSeenCards())
      : buildEndlessDeck(pool, this.sessionDealt, this.storage.getSeenCards());
    this.idx = 0;
    this.scorer = createScorerState(players, this.gameMode === 'endless' ? 3 : 0);
    this.fsm.transition('playing');
    this.bus.emit('game:started', { mode: this.industry!, gameMode: this.gameMode, playerCount: players.length });
    this.bus.emit('card:loaded', { cardId: this.deck[0]?.id ?? '', idx: 0, difficulty: this.deck[0]?.diff ?? 'easy' });
  }

  flipCard(): void {
    if (this.fsm.getState() !== 'playing') return;
    this.fsm.transition('flipped');
    const card = this.deck[this.idx];
    if (card) this.bus.emit('card:flipped', { cardId: card.id, idx: this.idx });
  }

  markResult(result: 'correct' | 'miss' | 'skip'): void {
    if (this.fsm.getState() !== 'flipped') return;
    const card = this.deck[this.idx];
    this.scorer = scoreCard(this.scorer, card, result);
    this.fsm.transition('scoring');

    const pts = result === 'correct' ? ({ easy: 1, medium: 2, hard: 3 }[card.diff] ?? 1) : 0;
    this.bus.emit('score:updated', { result, pts, totalPts: this.scorer.totalPts });
    this.idx++;

    if (this.gameMode === 'endless' && this.scorer.lives <= 0) {
      this.endGame('lives-exhausted');
    } else if (this.gameMode === 'party' && this.idx >= this.deck.length) {
      this.fsm.transition('continue');
    } else if (this.scorer.players.length > 1) {
      this.scorer = { ...this.scorer, currentPlayerIdx: (this.scorer.currentPlayerIdx + 1) % this.scorer.players.length };
      this.fsm.transition('turnChange');
      this.bus.emit('player:turn-changed', { playerIdx: this.scorer.currentPlayerIdx, playerName: this.scorer.players[this.scorer.currentPlayerIdx].name });
    } else {
      this.fsm.transition('playing');
      this.emitCardLoaded();
    }
  }

  ready(): void {
    this.fsm.transition('playing');
    this.emitCardLoaded();
  }

  continueGame(): void {
    const pool = ContentLoader.getCardPool(this.cards, this.industry!);
    const moreDeck = buildPartyDeck(pool, this.sessionDealt, this.storage.getSeenCards());
    this.deck.push(...moreDeck);
    this.fsm.transition('playing');
    this.emitCardLoaded();
  }

  exitGame(): void {
    this.endGame('exit');
    this.fsm.transition('home');
  }

  replay(): void {
    this.startGame(this.scorer.players.map(p => ({ name: p.name, score: 0 })));
  }

  endGame(reason: 'completed' | 'exit' | 'abandon' | 'lives-exhausted' = 'completed'): void {
    this.storage.markCardsSeen([...this.sessionDealt]);
    const totalPlayed = this.idx;
    const pct = totalPlayed > 0 ? Math.round((this.scorer.correctCount / totalPlayed) * 100) : 0;
    if (this.gameMode === 'endless' && this.scorer.totalPts > this.storage.getHighScore()) {
      this.storage.setHighScore(this.scorer.totalPts);
    }
    this.bus.emit('game:ended', { reason, totalPts: this.scorer.totalPts, correctCount: this.scorer.correctCount, totalPlayed });
    this.storage.saveSession({
      sessionId: this.sessionId, mode: this.industry!, gameMode: this.gameMode,
      totalPts: this.scorer.totalPts, correctCount: this.scorer.correctCount,
      totalPlayed, pct, reason, playerCount: this.scorer.players.length, timestamp: Date.now(),
    });
    if (reason !== 'exit') this.fsm.transition('results');
  }

  getShareText(): string {
    const ind = this.industry === 'BW' ? 'Bollywood' : 'Tollywood';
    const emoji = this.scorer.totalPts >= 30 ? '\u{1F525}' : this.scorer.totalPts >= 20 ? '\u{1F4AA}' : this.scorer.totalPts >= 10 ? '\u{1F3AC}' : '\u{1F605}';
    return [`${emoji} ${this.scorer.totalPts} pts on Bad Plots!`, `${this.scorer.correctCount}/${this.idx} ${ind} movies guessed.`, '', 'Terrible plots. Real movies.', 'Think you can beat that?', 'badbollywoodplots.com'].join('\n');
  }

  private emitCardLoaded(): void {
    const card = this.deck[this.idx];
    if (card) this.bus.emit('card:loaded', { cardId: card.id, idx: this.idx, difficulty: card.diff });
  }
}

let instance: GameInstance | null = null;

export function getGameInstance(): GameInstance {
  if (!instance) instance = new GameInstance();
  return instance;
}
