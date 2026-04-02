# Seedha Plot v2 — Architecture Design Spec

**Date:** 2026-04-02
**Status:** Approved
**Approach:** Selective Port — Pebl's skeleton, Seedha Plot's muscles

---

## 1. Goals

Three drivers, all equally weighted:

1. **Quality** — Type safety, testable modules, clean separation. No more scattered global state and transition bugs.
2. **Platform** — Core game logic must be pure TypeScript with zero DOM/React/browser dependencies, enabling a React Native mobile app on App Store / Play Store.
3. **Learning** — Apply Pebl's proven architecture patterns (event bus, FSM, storage adapter) to a second project, validating them as reusable infrastructure.

## 2. Architecture Overview

Three layers with strict dependency rules:

```
Pure TS Core (portable)          React Bridge           React UI (web-specific)
┌─────────────────────┐    ┌──────────────────┐    ┌──────────────────────┐
│ TypedEventBus       │    │ useGameState()   │    │ HomeScreen           │
│ GameFSM             │───▶│ useGameActions() │───▶│ GameScreen           │
│ DeckBuilder         │    │                  │    │ ResultsScreen        │
│ Scorer              │    │ (useSyncExternal │    │ Card, Sheets, Toast  │
│ ContentLoader       │    │  Store)          │    │                      │
│ StorageAdapter      │    └──────────────────┘    └──────────────────────┘
└─────────────────────┘
```

**Dependency rule:** Core imports nothing from Bridge or UI. Bridge imports Core + React. UI imports Bridge only (via hooks).

**Portability boundary:** When building React Native, you keep the Core, rewrite Bridge (likely identical — RN has `useSyncExternalStore`), and build new UI components.

## 3. Core Layer — Pure TypeScript

Zero dependencies. Zero DOM. Zero React. Testable with plain Node.js.

### 3.1 TypedEventBus

Ported from Pebl (`electron/core/eventBus.ts`). ~60 lines. Typed `EventEmitter` wrapper with compile-time event map enforcement.

**Game event map:**

```typescript
interface GameEventMap {
  'game:started': { mode: Industry; gameMode: GameMode; playerCount: number };
  'game:ended': { reason: EndReason; totalPts: number; correctCount: number; totalPlayed: number };
  'card:loaded': { cardId: string; idx: number; difficulty: Difficulty };
  'card:flipped': { cardId: string; idx: number };
  'score:updated': { result: 'correct' | 'miss' | 'skip'; pts: number; totalPts: number };
  'deck:exhausted': { mode: Industry };
  'player:turn-changed': { playerIdx: number; playerName: string };
  'fsm:transition': { from: GameState; to: GameState };
}
```

**Why an event bus for a card game:** Analytics becomes a subscriber, not inline `track()` calls. Sound effects become a subscriber. Animations become a subscriber. Each concern subscribes to the events it cares about without the game logic knowing they exist.

### 3.2 GameFSM

Ported pattern from Pebl (`electron/core/stateMachine.ts`). Single source of truth for all UI states.

**States:**

| State | Description | Allowed transitions |
|-------|-------------|-------------------|
| `home` | Landing screen — cinema + mode selection | → `setup` |
| `setup` | Player setup bottom sheet (party mode) | → `playing`, → `home` |
| `playing` | Card front visible, waiting for tap | → `flipped`, → `home` (exit) |
| `flipped` | Card back visible, score zone shown | → `scoring` |
| `scoring` | Processing result, updating points. Transient — auto-transitions in the same tick after applying score. | → `playing`, → `turnChange`, → `continue`, → `results` |
| `turnChange` | Multiplayer interstitial — "Player 2, your turn" | → `playing` |
| `continue` | "Keep going?" interstitial after party deck exhausted | → `playing`, → `results` |
| `results` | Game over — verdict, stats, leaderboard | → `home`, → `playing` (replay) |

**Transition rules:**
- Every transition emits `fsm:transition` on the event bus
- Invalid transitions are no-ops with a warning log (not thrown errors — a party game should never crash)
- The FSM holds the current state + payload (current card, scores, lives, etc.)
- External subscribers (React hook, analytics) read state via `getState()` and `getPayload()`
- State changes notify subscribers via a callback pattern compatible with `useSyncExternalStore`

### 3.3 DeckBuilder

Built fresh. Extracted from current `app.js` (`buildPartyDeck`, `buildEndlessDeck`, `filterSeen`, `shuffle`).

**API:**

```typescript
buildPartyDeck(pool: Card[], sessionDealt: Set<string>, seen: string[]): Card[]
buildEndlessDeck(pool: Card[], sessionDealt: Set<string>, seen: string[]): Card[]
shuffle<T>(arr: T[]): T[]
filterSeen(cards: Card[], seen: string[], sessionDealt: Set<string>): Card[]
```

Pure functions. No side effects. No localStorage access — the caller provides seen/session state.

### 3.4 Scorer

Built fresh. Extracted from current `markCard()`, `endGame()`, and verdict logic.

**API:**

```typescript
interface ScorerState {
  totalPts: number;
  correctCount: number;
  streak: number;
  lives: number;  // endless mode
  players: Player[];
  currentPlayerIdx: number;
}

scoreCard(state: ScorerState, card: Card, result: 'correct' | 'miss' | 'skip'): ScorerState
getVerdict(correctCount: number, totalPlayed: number): { title: string; verdict: string }
getLeaderboard(players: Player[]): Player[]  // sorted by score descending
```

Pure functions. Immutable state updates. Easy to test.

### 3.5 ContentLoader

Built fresh. Inspired by Pebl's ContentResolver but simpler — no time-of-day matching, no active-minutes filtering, no tag preferences. Just packs + manifest.

**API:**

```typescript
interface ContentPack {
  id: string;
  name: string;
  industry: Industry;
  cards: Card[];
}

interface Manifest {
  packs: { id: string; file: string; enabled: boolean }[];
}

loadManifest(): Promise<Manifest>
loadPack(file: string): Promise<ContentPack>
loadAllEnabled(): Promise<Card[]>
getCardPool(cards: Card[], industry: Industry): Card[]
```

**Migration from current `cards.json`:** The single flat file gets split into packs during migration:
- `bw-classics.json` — Bollywood 70s-90s
- `bw-modern.json` — Bollywood 2000s-2020s
- `tw-all.json` — Tollywood all eras

Manifest controls which packs are active. Enables future: seasonal packs, community submissions, A/B testing.

### 3.6 StorageAdapter Interface

Ported pattern from Pebl (`electron/platform/interfaces.ts`).

```typescript
interface StorageAdapter {
  // Seen cards
  getSeenCards(): string[];
  markCardsSeen(cardIds: string[]): void;
  clearSeenCards(): void;

  // Sessions
  saveSession(session: GameSession): void;

  // High score
  getHighScore(): number;
  setHighScore(score: number): void;

  // Feedback & suggestions
  saveFeedback(entry: FeedbackEntry): void;
  saveSuggestion(entry: SuggestionEntry): void;

  // Events (analytics buffer)
  logEvent(event: AnalyticsEvent): void;
  getEventBuffer(): AnalyticsEvent[];
  clearEventBuffer(): void;
}
```

**Two implementations:**
- `LocalStorageAdapter` — wraps current localStorage calls behind the interface. Default for all reads + offline writes.
- `SupabaseAdapter` — fire-and-forget inserts for sessions, feedback, suggestions. Same as current behavior, just behind the interface.

### 3.7 Types

Shared type definitions used across all core modules:

```typescript
type Industry = 'BW' | 'TW';
type GameMode = 'party' | 'endless';
type Difficulty = 'easy' | 'medium' | 'hard';
type GameState = 'home' | 'setup' | 'playing' | 'flipped' | 'scoring' | 'turnChange' | 'continue' | 'results';
type EndReason = 'completed' | 'exit' | 'abandon' | 'lives-exhausted';

interface Card {
  id: string;
  ind: Industry;
  diff: Difficulty;
  era: string;
  y: string;
  n: string;  // movie name
  f: string;  // fun fact
  c: string;  // clue
}

interface Player {
  name: string;
  score: number;
}

interface GameSession {
  sessionId: string;
  mode: Industry;
  gameMode: GameMode;
  totalPts: number;
  correctCount: number;
  totalPlayed: number;
  pct: number;
  reason: EndReason;
  playerCount: number;
  timestamp: number;
}
```

## 4. Bridge Layer — React Hooks

Two files. Only layer that imports both React and Core.

### 4.1 useGameState

```typescript
function useGameState(): { state: GameState; payload: GamePayload }
```

Uses `useSyncExternalStore` to subscribe to the GameFSM. Returns the current state and payload. React re-renders only on FSM transitions.

### 4.2 useGameActions

```typescript
function useGameActions(): {
  selectMode: (industry: Industry) => void;
  setGameMode: (mode: GameMode) => void;
  startGame: (players: Player[]) => void;
  flipCard: () => void;
  markCorrect: () => void;
  markMiss: () => void;
  skip: () => void;
  ready: () => void;          // turn change ready
  continueGame: () => void;   // keep going after party deck
  exitGame: () => void;
  replay: () => void;
}
```

Stable references (wrapped in `useCallback` or returned from a ref). Components call these, FSM processes the transition, event bus emits, subscribers react.

## 5. UI Layer — Dumb Renderer

React components that receive state via hooks and render. Zero business logic.

| Component | FSM State | Responsibility |
|-----------|-----------|---------------|
| `App.tsx` | All | Router — renders the component matching current FSM state |
| `HomeScreen.tsx` | `home` | Cinema selection, game mode selection, hero, footer links |
| `GameScreen.tsx` | `playing`, `flipped`, `scoring` | Progress bar, lives, player tabs, card stage, score zone |
| `Card.tsx` | (sub-component) | Flip card with CSS 3D transform. Front = clue, back = answer + fact |
| `ResultsScreen.tsx` | `results` | Verdict, stats grid, leaderboard, replay/share buttons |
| `PlayerSetup.tsx` | `setup` | Bottom sheet — add/remove players, name inputs |
| `TurnInterstitial.tsx` | `turnChange`, `continue` | "Your turn" / "Keep going?" overlay |
| `FeedbackSheet.tsx` | (overlay) | Tag selection + freetext feedback |
| `SuggestSheet.tsx` | (overlay) | Movie suggestion form |
| `Toast.tsx` | (overlay) | Transient notification |

**Animation:** Framer Motion for card flip, screen transitions, and score flash. Keeps the existing feel but with a proper animation library instead of raw CSS class toggling.

## 6. Analytics

PostHog becomes an event bus subscriber instead of manual `track()` calls.

```typescript
// analytics/posthog.ts
function initAnalytics(bus: TypedEventBus): void {
  bus.on('game:started', (data) => posthog.capture('game_start', data));
  bus.on('card:flipped', (data) => posthog.capture('card_flip', data));
  bus.on('score:updated', (data) => posthog.capture('card_result', data));
  bus.on('game:ended', (data) => posthog.capture('game_end', data));
  bus.on('fsm:transition', (data) => posthog.capture('state_transition', data));
}
```

**Bonus:** Because every FSM transition and game event flows through the bus, UX auditing gets full interaction cost profiling for free. Time between `card:loaded` and `card:flipped` = decision time. Time between `card:flipped` and `score:updated` = confidence. Patterns emerge from the event stream.

**Abandon detection:** Same visibility change + beforeunload approach as current `app.js`, but cleaner — the FSM knows if a game is in progress, and the analytics subscriber handles the `game:ended` with reason `'abandon'`.

## 7. Offline / PWA

Replace hand-written `sw.js` with `vite-plugin-pwa`. Same cache-first behavior for assets, network-first for HTML. The plugin handles:
- Auto-generating the service worker from Vite's build manifest
- Cache versioning (no more manual `CACHE_NAME = 'badplots-v6'`)
- Precaching all build assets
- Runtime caching strategies

`manifest.json` moves to `public/manifest.json` and gets picked up by the plugin.

## 8. Build & Tooling

| Tool | Purpose |
|------|---------|
| Vite | Dev server + build. React plugin for JSX/TSX. |
| TypeScript | Strict mode. Two configs: `tsconfig.json` (app) + `tsconfig.node.json` (scripts) |
| Vitest | Unit tests for core (pure Node.js) + component tests (jsdom) |
| ESLint + Prettier | Code quality. Same setup as Pebl. |
| vite-plugin-pwa | Service worker generation |

**Deployment:** `npm run build` → static output in `dist/` → deploy to Netlify.

**Netlify config:** `netlify.toml` with build command `npm run build`, publish directory `dist`, SPA redirect rule.

## 9. Content Migration

Current `cards.json` (flat array) gets split into packs:

| Pack file | Content |
|-----------|---------|
| `content/packs/bw-classics.json` | Bollywood 70s-90s cards |
| `content/packs/bw-modern.json` | Bollywood 2000s-2020s cards |
| `content/packs/tw-all.json` | All Tollywood cards |
| `content/manifest.json` | Registry — which packs are enabled |

**Generation scripts:** Existing `scripts/generate.js` stays, updated to output to `content/packs/` and follow the ContentPack schema.

## 10. Testing Strategy

| Layer | Test type | Runner | DOM needed? |
|-------|-----------|--------|-------------|
| Core (eventBus, FSM, deckBuilder, scorer) | Unit | Vitest | No — pure TS |
| Storage adapters | Unit | Vitest | No (mock localStorage) |
| Bridge hooks | Integration | Vitest + jsdom | Yes |
| Components | Component | Vitest + React Testing Library | Yes |

**Priority:** Core tests first. The FSM and scorer are the most critical — if transitions or scoring are wrong, the game is broken. Component tests are lower priority since the UI is a dumb renderer.

## 11. What Does NOT Change

- **Visual design** — The architecture migration preserves the current look. Design rework (v8 prototype) is a separate workstream.
- **Card content** — Same cards, just restructured into packs.
- **Game rules** — Party mode (12 cards), Endless mode (3 lives), scoring (easy=1, medium=2, hard=3), dedup logic — all preserved.
- **Supabase tables** — Same schema, same fire-and-forget pattern, just behind the StorageAdapter.
- **PostHog project** — Same project key, events get richer (FSM transitions) but existing events are preserved.
- **Domain** — badbollywoodplots.com, Netlify deployment.

## 12. Migration Strategy

This is a rewrite, not a refactor. The current `app.js` + `index.html` stay untouched as the production version while v2 is built in a new `src/` directory.

1. Scaffold Vite + React + TypeScript project
2. Build and test core modules (FSM, event bus, deck builder, scorer, content loader)
3. Build storage adapters
4. Build bridge hooks
5. Build React components, screen by screen
6. Wire analytics
7. Split cards.json into packs
8. Add PWA plugin
9. Verify feature parity with current app
10. Switch production to v2 build output
11. Remove old `app.js` / `index.html` / `style.css` / `sw.js`

**Rollback:** Old files stay in git history. Netlify instant rollback to previous deploy if v2 has issues.
