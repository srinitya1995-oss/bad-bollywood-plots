import { TypedEventBus } from '../core/eventBus';
import { GameFSM } from '../core/gameFSM';
import { ContentLoader } from '../core/contentLoader';
import { LocalStorageAdapter } from '../storage/localStorage';
import { SupabaseAdapter } from '../storage/supabase';
import type { StorageAdapter } from '../storage/interface';
import type { Card, Industry, GameMode, Player, DifficultyFilter, RoundLength } from '../core/types';
import { INDUSTRY_META, POINT_MAP } from '../core/types';
import { buildPartyDeck } from '../core/deckBuilder';
import { createScorerState, scoreCard, getVerdict, getLeaderboard, type ScorerState } from '../core/scorer';
import { createAdaptiveState, updateAbility, pickAdaptiveCard, getAbilityTier, getAbilityPercentile, type AdaptiveState } from '../core/adaptive';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://wmfxkkgktmfsipiihsjq.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

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

export interface LastResult {
  card: Card;
  winnerIdx: number;
  correct: boolean;
}

export interface GameSettings {
  sound?: boolean;
  difficultyFilter?: DifficultyFilter;
  roundLen?: RoundLength;
}

const SESSION_STORAGE_KEY = 'badDesiPlots.v8';
const SETTINGS_STORAGE_KEY = 'sp_settings';

export interface SessionSnapshot {
  players: Player[];
  scores: number[];
  cardIdx: number;
  readerIdx: number;
  lastResult: LastResult | null;
  sessionId: string;
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
  adaptive: AdaptiveState;
  abilityTier: string;
  abilityPercentile: number;
  readerIdx: number;
  lastResult: LastResult | null;
  scores: number[];
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
  private adaptive: AdaptiveState = createAdaptiveState();
  private sessionDealt = new Set<string>();
  private _readerIdx = 0;
  private _lastResult: LastResult | null = null;
  private _scores: number[] = [];
  private _settings: GameSettings = {};
  readonly sessionId = crypto.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

  constructor() {
    this.fsm = new GameFSM(this.bus);
    const localStorage = new LocalStorageAdapter(window.localStorage);
    const supabaseClient = initSupabaseClient();
    this.storage = new SupabaseAdapter(supabaseClient as never, localStorage);
    this.contentLoader = new ContentLoader(async (url: string) => {
      const res = await fetch(url);
      return res.json();
    });

    // Load persisted settings from localStorage
    try {
      const saved = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) this._settings = JSON.parse(saved) as GameSettings;
    } catch { /* non-critical */ }

    // Persist session snapshot on every FSM transition
    this.bus.on('fsm:transition', () => {
      this.persistSession();
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
      adaptive: this.adaptive,
      abilityTier: getAbilityTier(this.adaptive.ability),
      abilityPercentile: getAbilityPercentile(this.adaptive.ability),
      readerIdx: this._readerIdx,
      lastResult: this._lastResult,
      scores: [...this._scores],
    };
  }

  selectMode(industry: Industry): void {
    this.industry = industry;
    this.fsm.transition('setup');
  }

  /** Skip PlayerSetup for solo play — go directly from home to playing */
  startSoloGame(industry: Industry): void {
    this.industry = industry;
    this.startGame([{ name: 'Player 1', score: 0 }]);
  }

  setGameMode(mode: GameMode): void {
    this.gameMode = mode;
  }

  startGame(players: Player[]): void {
    const pool = ContentLoader.getCardPool(this.cards, this.industry!);
    this.sessionDealt.clear();
    this.idx = 0;
    this.scorer = createScorerState(players, this.gameMode === 'endless' ? 3 : 0);
    this.adaptive = createAdaptiveState();
    this._readerIdx = 0;
    this._lastResult = null;
    this._scores = players.map(() => 0);

    if (this.gameMode === 'endless') {
      // Adaptive: pick first card at starting ability (1100 → medium-ish)
      const first = pickAdaptiveCard(pool, this.sessionDealt, this.storage.getSeenCards(), this.adaptive.ability);
      this.deck = first ? [first] : [];
    } else {
      // Party mode: start with 3 calibration cards (easy, medium, hard) then 9 adaptive
      const seen = this.storage.getSeenCards();
      const calibration = buildPartyDeck(pool, this.sessionDealt, seen).slice(0, 3); // 1 easy, 1 med, 1 hard
      this.deck = calibration;
      // Remaining 9 cards will be picked adaptively in markResult
    }

    this.fsm.transition('turnChange');
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
    if (!card) return;
    this.scorer = scoreCard(this.scorer, card, result);
    this.adaptive = updateAbility(this.adaptive, card, result === 'correct');
    this.fsm.transition('scoring');

    const pts = result === 'correct' ? ({ easy: 1, medium: 2, hard: 3 }[card.diff] ?? 1) : 0;
    this.bus.emit('score:updated', { result, pts, totalPts: this.scorer.totalPts, ability: this.adaptive.ability });
    this.idx++;

    // In endless mode, pick next card adaptively based on ability estimate
    if (this.gameMode === 'endless') {
      if (this.scorer.lives <= 0) {
        this.endGame('lives-exhausted');
        return;
      }
      const pool = ContentLoader.getCardPool(this.cards, this.industry!);
      const next = pickAdaptiveCard(pool, this.sessionDealt, this.storage.getSeenCards(), this.adaptive.ability);
      if (next) {
        this.deck.push(next);
      } else {
        this.endGame('completed');
        return;
      }
    }

    // Party mode: after calibration (3 cards), pick adaptive cards up to 12 total
    if (this.gameMode === 'party' && this.idx >= this.deck.length && this.deck.length < 12) {
      const pool = ContentLoader.getCardPool(this.cards, this.industry!);
      const next = pickAdaptiveCard(pool, this.sessionDealt, this.storage.getSeenCards(), this.adaptive.ability);
      if (next) this.deck.push(next);
    }

    if (this.gameMode === 'party' && this.idx >= this.deck.length) {
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
    // Continue with adaptive cards at current ability (not static deck)
    const first = pickAdaptiveCard(pool, this.sessionDealt, this.storage.getSeenCards(), this.adaptive.ability);
    if (first) this.deck.push(first);
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
    if (this.gameMode === 'endless' && this.adaptive.ability > this.storage.getHighScore()) {
      this.storage.setHighScore(this.adaptive.ability);
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
    const ind = this.industry ? INDUSTRY_META[this.industry].lang : 'Cinema';
    const tier = getAbilityTier(this.adaptive.ability);
    const pct = getAbilityPercentile(this.adaptive.ability);
    const emoji = this.adaptive.ability >= 1500 ? '\u{1F525}' : this.adaptive.ability >= 1300 ? '\u{1F4AA}' : this.adaptive.ability >= 1100 ? '\u{1F3AC}' : '\u{1F605}';
    return [
      `${emoji} ${tier} (${this.adaptive.ability} rating)`,
      `${this.scorer.correctCount}/${this.idx} ${ind} movies · Top ${pct}%`,
      '',
      'Terrible plots. Real movies.',
      'Think you can beat that?',
      'badbollywoodplots.com',
    ].join('\n');
  }

  /** Award points to the player at winnerIdx. Includes streak bonus. */
  awardPoints(winnerIdx: number, card: Card): void {
    const basePts = POINT_MAP[card.diff] ?? 1;
    const streak = this.scorer.streak;
    const bonus = streak >= 7 ? 3 : streak >= 5 ? 2 : streak >= 3 ? 1 : 0;
    const totalPts = basePts + bonus;
    if (winnerIdx >= 0 && winnerIdx < this._scores.length) {
      this._scores[winnerIdx] += totalPts;
    }
    this._lastResult = { card, winnerIdx, correct: true };
    this.bus.emit('card:scored', { cardId: card.id, winnerIdx, pts: totalPts });
  }

  /** Nobody guessed correctly. */
  awardNobody(card: Card): void {
    this._lastResult = { card, winnerIdx: -1, correct: false };
  }

  /** Advance the reader to the next player. Call after each turn. */
  advanceReader(): void {
    const playerCount = this.scorer.players.length;
    if (playerCount > 0) {
      this._readerIdx = (this._readerIdx + 1) % playerCount;
    }
  }

  /** Current reader index (rotates 0 -> 1 -> ... -> 0). */
  get readerIdx(): number {
    return this._readerIdx;
  }

  /** Last round result. */
  get lastResult(): LastResult | null {
    return this._lastResult;
  }

  /** Store settings for the next startGame call. Persists to localStorage. */
  setSettings(settings: { sound?: boolean; difficultyFilter?: DifficultyFilter; roundLen?: RoundLength }): void {
    this._settings = { ...this._settings, ...settings };
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this._settings));
    } catch { /* storage full or unavailable */ }
  }

  /** Get current settings. */
  getSettings(): GameSettings {
    return { ...this._settings };
  }

  /** Write current game state snapshot to sessionStorage for resume capability. */
  private persistSession(): void {
    try {
      const snapshot: SessionSnapshot = {
        players: this.scorer.players,
        scores: [...this._scores],
        cardIdx: this.idx,
        readerIdx: this._readerIdx,
        lastResult: this._lastResult,
        sessionId: this.sessionId,
      };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(snapshot));
    } catch { /* sessionStorage unavailable or full */ }
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
