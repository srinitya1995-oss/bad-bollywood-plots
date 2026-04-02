# Seedha Plot v2 Architecture — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate Seedha Plot from a single-file vanilla JS app to a typed, testable, platform-portable architecture using Pebl's proven patterns (event bus, FSM, storage adapter) with React as the view layer.

**Architecture:** Pure TypeScript core (zero DOM/React deps) → React bridge via `useSyncExternalStore` → dumb React renderer. Core is portable to React Native. Event bus decouples analytics, sound, and animations from game logic.

**Tech Stack:** Vite, React 18, TypeScript (strict), Vitest, Framer Motion, PostHog, Supabase, vite-plugin-pwa, Netlify

**Spec:** `docs/superpowers/specs/2026-04-02-architecture-v2-design.md`

---

## Task 1: Scaffold Vite + React + TypeScript Project

**Files:**
- Create: `src/main.tsx`
- Create: `index.html` (new Vite entry — replaces old one at project root)
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vitest.config.ts`
- Create: `package.json` (new — replace existing)
- Create: `.eslintrc.cjs`
- Create: `.prettierrc`
- Create: `netlify.toml`

- [ ] **Step 1: Back up old files**

Move the current production files into an `old/` directory so they're preserved but don't conflict with the new build:

```bash
cd /Users/srinityaduppanapudisatya/Desktop/seedhaplot
mkdir -p old
mv index.html old/index.html
mv app.js old/app.js
mv style.css old/style.css
mv sw.js old/sw.js
mv manifest.json old/manifest.json
```

- [ ] **Step 2: Create package.json**

```json
{
  "name": "seedhaplot",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "generate": "node scripts/generate.js"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^12.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.20.0",
    "vitest": "^4.1.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jsdom": "^25.0.0",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "prettier": "^3.2.0"
  }
}
```

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Bad Plots: The Desi Party Game',
        short_name: 'Bad Plots',
        description: 'Terrible plots. Real movies. Guess Bollywood and Tollywood films from hilariously bad descriptions.',
        theme_color: '#1A0F0A',
        background_color: '#1A0F0A',
        display: 'standalone',
        icons: [
          { src: '/assets/logo.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /\.json$/,
            handler: 'StaleWhileRevalidate',
          },
        ],
      },
    }),
  ],
});
```

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 6: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    environmentMatchGlobs: [
      ['tests/components/**', 'jsdom'],
      ['tests/hooks/**', 'jsdom'],
    ],
  },
});
```

- [ ] **Step 7: Create index.html (Vite entry)**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#1A0F0A">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Bad Plots">
  <meta name="description" content="Terrible plots. Real movies. Guess Bollywood and Tollywood films from hilariously bad descriptions.">
  <link rel="icon" href="/assets/logo-favicon.svg" type="image/svg+xml">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap" rel="stylesheet">
  <title>Bad Plots: The Desi Party Game</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

- [ ] **Step 8: Create src/main.tsx (minimal)**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return <div>Seedha Plot v2</div>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 9: Create netlify.toml**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- [ ] **Step 10: Install and verify**

```bash
npm install
npm run dev
```

Expected: Vite dev server starts, browser shows "Seedha Plot v2" at localhost:5173.

```bash
npm run build
```

Expected: Build succeeds, output in `dist/`.

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json tsconfig.node.json vitest.config.ts index.html src/main.tsx netlify.toml old/
git commit -m "feat: scaffold Vite + React + TypeScript project

Move old production files to old/. Set up Vite with React plugin,
TypeScript strict mode, Vitest, PWA plugin, Netlify config."
```

---

## Task 2: Types + EventBus

**Files:**
- Create: `src/core/types.ts`
- Create: `src/core/eventBus.ts`
- Create: `tests/core/eventBus.test.ts`

- [ ] **Step 1: Create src/core/types.ts**

```typescript
export type Industry = 'BW' | 'TW';
export type GameMode = 'party' | 'endless';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameState =
  | 'home'
  | 'setup'
  | 'playing'
  | 'flipped'
  | 'scoring'
  | 'turnChange'
  | 'continue'
  | 'results';
export type EndReason = 'completed' | 'exit' | 'abandon' | 'lives-exhausted';

export interface Card {
  id: string;
  ind: Industry;
  diff: Difficulty;
  era: string;
  y: string;
  n: string;
  f: string;
  c: string;
}

export interface Player {
  name: string;
  score: number;
}

export interface GameSession {
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

export interface FeedbackEntry {
  tags: string[];
  text: string;
  timestamp: number;
  sessionId: string;
}

export interface SuggestionEntry {
  movie: string;
  industry: string;
  timestamp: number;
  sessionId: string;
}

export interface AnalyticsEvent {
  event: string;
  props: Record<string, unknown>;
  sessionId: string;
  timestamp: number;
}

export const POINT_MAP: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};
```

- [ ] **Step 2: Write the failing test for EventBus**

Create `tests/core/eventBus.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { TypedEventBus } from '../../src/core/eventBus';

describe('TypedEventBus', () => {
  it('emits and receives typed events', () => {
    const bus = new TypedEventBus();
    const handler = vi.fn();

    bus.on('game:started', handler);
    bus.emit('game:started', { mode: 'BW', gameMode: 'party', playerCount: 2 });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ mode: 'BW', gameMode: 'party', playerCount: 2 });
  });

  it('does not call unsubscribed handlers', () => {
    const bus = new TypedEventBus();
    const handler = vi.fn();

    bus.on('card:flipped', handler);
    bus.off('card:flipped', handler);
    bus.emit('card:flipped', { cardId: 'bw01', idx: 0 });

    expect(handler).not.toHaveBeenCalled();
  });

  it('supports multiple handlers for the same event', () => {
    const bus = new TypedEventBus();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    bus.on('score:updated', handler1);
    bus.on('score:updated', handler2);
    bus.emit('score:updated', { result: 'correct', pts: 2, totalPts: 5 });

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it('does not cross-fire between event types', () => {
    const bus = new TypedEventBus();
    const handler = vi.fn();

    bus.on('game:started', handler);
    bus.emit('game:ended', { reason: 'completed', totalPts: 10, correctCount: 8, totalPlayed: 12 });

    expect(handler).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx vitest run tests/core/eventBus.test.ts
```

Expected: FAIL — `Cannot find module '../../src/core/eventBus'`

- [ ] **Step 4: Create src/core/eventBus.ts**

```typescript
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
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npx vitest run tests/core/eventBus.test.ts
```

Expected: 4 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/core/types.ts src/core/eventBus.ts tests/core/eventBus.test.ts
git commit -m "feat: add shared types and TypedEventBus

Port typed event bus pattern from Pebl. Pure TS, no DOM deps.
Game event map covers all card, score, and FSM transition events."
```

---

## Task 3: GameFSM

**Files:**
- Create: `src/core/gameFSM.ts`
- Create: `tests/core/gameFSM.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/core/gameFSM.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { GameFSM } from '../../src/core/gameFSM';
import { TypedEventBus } from '../../src/core/eventBus';

function createFSM() {
  const bus = new TypedEventBus();
  const fsm = new GameFSM(bus);
  return { bus, fsm };
}

describe('GameFSM', () => {
  it('starts in home state', () => {
    const { fsm } = createFSM();
    expect(fsm.getState()).toBe('home');
  });

  it('transitions home → setup', () => {
    const { fsm } = createFSM();
    fsm.transition('setup');
    expect(fsm.getState()).toBe('setup');
  });

  it('transitions setup → playing', () => {
    const { fsm } = createFSM();
    fsm.transition('setup');
    fsm.transition('playing');
    expect(fsm.getState()).toBe('playing');
  });

  it('rejects invalid transitions silently', () => {
    const { fsm } = createFSM();
    // home → flipped is not allowed
    fsm.transition('flipped');
    expect(fsm.getState()).toBe('home');
  });

  it('emits fsm:transition on the event bus', () => {
    const { bus, fsm } = createFSM();
    const handler = vi.fn();
    bus.on('fsm:transition', handler);

    fsm.transition('setup');

    expect(handler).toHaveBeenCalledWith({ from: 'home', to: 'setup' });
  });

  it('does not emit on invalid transitions', () => {
    const { bus, fsm } = createFSM();
    const handler = vi.fn();
    bus.on('fsm:transition', handler);

    fsm.transition('results'); // invalid from home

    expect(handler).not.toHaveBeenCalled();
  });

  it('holds and returns payload', () => {
    const { fsm } = createFSM();
    fsm.transition('setup', { industry: 'BW' });
    expect(fsm.getPayload()).toEqual({ industry: 'BW' });
  });

  it('notifies subscribers on transition', () => {
    const { fsm } = createFSM();
    const subscriber = vi.fn();
    fsm.subscribe(subscriber);

    fsm.transition('setup');

    expect(subscriber).toHaveBeenCalledOnce();
  });

  it('full game flow: home → setup → playing → flipped → scoring → results', () => {
    const { fsm } = createFSM();
    fsm.transition('setup');
    fsm.transition('playing');
    fsm.transition('flipped');
    fsm.transition('scoring');
    fsm.transition('results');
    expect(fsm.getState()).toBe('results');
  });

  it('results → home (back to menu)', () => {
    const { fsm } = createFSM();
    fsm.transition('setup');
    fsm.transition('playing');
    fsm.transition('flipped');
    fsm.transition('scoring');
    fsm.transition('results');
    fsm.transition('home');
    expect(fsm.getState()).toBe('home');
  });

  it('results → playing (replay)', () => {
    const { fsm } = createFSM();
    fsm.transition('setup');
    fsm.transition('playing');
    fsm.transition('flipped');
    fsm.transition('scoring');
    fsm.transition('results');
    fsm.transition('playing');
    expect(fsm.getState()).toBe('playing');
  });

  it('scoring → turnChange (multiplayer)', () => {
    const { fsm } = createFSM();
    fsm.transition('setup');
    fsm.transition('playing');
    fsm.transition('flipped');
    fsm.transition('scoring');
    fsm.transition('turnChange');
    expect(fsm.getState()).toBe('turnChange');
  });

  it('turnChange → playing', () => {
    const { fsm } = createFSM();
    fsm.transition('setup');
    fsm.transition('playing');
    fsm.transition('flipped');
    fsm.transition('scoring');
    fsm.transition('turnChange');
    fsm.transition('playing');
    expect(fsm.getState()).toBe('playing');
  });

  it('scoring → continue (party deck exhausted)', () => {
    const { fsm } = createFSM();
    fsm.transition('setup');
    fsm.transition('playing');
    fsm.transition('flipped');
    fsm.transition('scoring');
    fsm.transition('continue');
    expect(fsm.getState()).toBe('continue');
  });

  it('continue → playing (keep going)', () => {
    const { fsm } = createFSM();
    fsm.transition('setup');
    fsm.transition('playing');
    fsm.transition('flipped');
    fsm.transition('scoring');
    fsm.transition('continue');
    fsm.transition('playing');
    expect(fsm.getState()).toBe('playing');
  });

  it('continue → results (done)', () => {
    const { fsm } = createFSM();
    fsm.transition('setup');
    fsm.transition('playing');
    fsm.transition('flipped');
    fsm.transition('scoring');
    fsm.transition('continue');
    fsm.transition('results');
    expect(fsm.getState()).toBe('results');
  });

  it('playing → home (exit game)', () => {
    const { fsm } = createFSM();
    fsm.transition('setup');
    fsm.transition('playing');
    fsm.transition('home');
    expect(fsm.getState()).toBe('home');
  });

  it('getSnapshot returns a stable reference when state has not changed', () => {
    const { fsm } = createFSM();
    const snap1 = fsm.getSnapshot();
    const snap2 = fsm.getSnapshot();
    expect(snap1).toBe(snap2);
  });

  it('getSnapshot returns a new reference after transition', () => {
    const { fsm } = createFSM();
    const snap1 = fsm.getSnapshot();
    fsm.transition('setup');
    const snap2 = fsm.getSnapshot();
    expect(snap1).not.toBe(snap2);
    expect(snap2.state).toBe('setup');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/core/gameFSM.test.ts
```

Expected: FAIL — `Cannot find module '../../src/core/gameFSM'`

- [ ] **Step 3: Create src/core/gameFSM.ts**

```typescript
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

  getState(): GameState {
    return this.state;
  }

  getPayload(): Record<string, unknown> | null {
    return this.payload;
  }

  getSnapshot(): GameSnapshot {
    return this.snapshot;
  }

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

    for (const cb of this.subscribers) {
      cb();
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/core/gameFSM.test.ts
```

Expected: All 18 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/gameFSM.ts tests/core/gameFSM.test.ts
git commit -m "feat: add GameFSM with transition map and snapshot API

State machine controls all UI states. Invalid transitions are no-ops.
Snapshot API compatible with useSyncExternalStore. Emits fsm:transition
on the event bus for analytics."
```

---

## Task 4: DeckBuilder

**Files:**
- Create: `src/core/deckBuilder.ts`
- Create: `tests/core/deckBuilder.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/core/deckBuilder.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { shuffle, filterSeen, buildPartyDeck, buildEndlessDeck } from '../../src/core/deckBuilder';
import type { Card } from '../../src/core/types';

function makeCard(id: string, diff: 'easy' | 'medium' | 'hard' = 'easy'): Card {
  return { id, ind: 'BW', diff, era: '90s', y: '1995', n: `Movie ${id}`, f: 'Fact', c: 'Clue' };
}

describe('shuffle', () => {
  it('returns a new array with the same elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect(result.sort()).toEqual(input.sort());
    expect(result).not.toBe(input); // new array
  });
});

describe('filterSeen', () => {
  it('excludes cards in seen list', () => {
    const cards = [makeCard('a'), makeCard('b'), makeCard('c')];
    const result = filterSeen(cards, ['a'], new Set());
    expect(result.map(c => c.id)).toEqual(['b', 'c']);
  });

  it('excludes cards in sessionDealt', () => {
    const cards = [makeCard('a'), makeCard('b'), makeCard('c')];
    const result = filterSeen(cards, [], new Set(['b']));
    expect(result.map(c => c.id)).toEqual(['a', 'c']);
  });

  it('resets seen when fewer than 4 cards remain', () => {
    const cards = [makeCard('a'), makeCard('b'), makeCard('c'), makeCard('d')];
    // All 4 seen, none in session — should reset and return all
    const result = filterSeen(cards, ['a', 'b', 'c', 'd'], new Set());
    expect(result).toHaveLength(4);
  });

  it('keeps session dedup even when cross-session resets', () => {
    const cards = [makeCard('a'), makeCard('b'), makeCard('c'), makeCard('d'), makeCard('e')];
    // a,b,c,d seen cross-session; a also dealt this session
    const result = filterSeen(cards, ['a', 'b', 'c', 'd'], new Set(['a']));
    // cross-session resets, but session dedup keeps 'a' out
    expect(result.map(c => c.id)).not.toContain('a');
  });
});

describe('buildPartyDeck', () => {
  it('returns up to 12 cards (4 easy, 4 medium, 4 hard)', () => {
    const pool = [
      ...Array.from({ length: 10 }, (_, i) => makeCard(`e${i}`, 'easy')),
      ...Array.from({ length: 10 }, (_, i) => makeCard(`m${i}`, 'medium')),
      ...Array.from({ length: 10 }, (_, i) => makeCard(`h${i}`, 'hard')),
    ];
    const result = buildPartyDeck(pool, new Set(), []);
    expect(result).toHaveLength(12);
    expect(result.filter(c => c.diff === 'easy')).toHaveLength(4);
    expect(result.filter(c => c.diff === 'medium')).toHaveLength(4);
    expect(result.filter(c => c.diff === 'hard')).toHaveLength(4);
  });

  it('tracks dealt cards in sessionDealt', () => {
    const pool = Array.from({ length: 20 }, (_, i) => makeCard(`c${i}`, 'easy'));
    const sessionDealt = new Set<string>();
    const result = buildPartyDeck(pool, sessionDealt, []);
    for (const card of result) {
      expect(sessionDealt.has(card.id)).toBe(true);
    }
  });
});

describe('buildEndlessDeck', () => {
  it('returns all available cards shuffled', () => {
    const pool = [makeCard('a'), makeCard('b'), makeCard('c')];
    const result = buildEndlessDeck(pool, new Set(), []);
    expect(result).toHaveLength(3);
  });

  it('tracks dealt cards in sessionDealt', () => {
    const pool = [makeCard('a'), makeCard('b')];
    const sessionDealt = new Set<string>();
    buildEndlessDeck(pool, sessionDealt, []);
    expect(sessionDealt.has('a')).toBe(true);
    expect(sessionDealt.has('b')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/core/deckBuilder.test.ts
```

Expected: FAIL — `Cannot find module '../../src/core/deckBuilder'`

- [ ] **Step 3: Create src/core/deckBuilder.ts**

```typescript
import type { Card } from './types';

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function filterSeen(
  cards: Card[],
  seen: string[],
  sessionDealt: Set<string>,
): Card[] {
  const seenSet = new Set(seen);
  let filtered = cards.filter((c) => !seenSet.has(c.id) && !sessionDealt.has(c.id));

  if (filtered.length < 4) {
    // Cross-session history exhausted — drop it, keep session dedup
    filtered = cards.filter((c) => !sessionDealt.has(c.id));
  }

  if (filtered.length < 4) {
    // Truly exhausted — full reset
    filtered = cards;
  }

  return filtered;
}

export function buildPartyDeck(
  pool: Card[],
  sessionDealt: Set<string>,
  seen: string[],
): Card[] {
  const available = filterSeen(pool, seen, sessionDealt);
  const easy = shuffle(available.filter((c) => c.diff === 'easy')).slice(0, 4);
  const medium = shuffle(available.filter((c) => c.diff === 'medium')).slice(0, 4);
  const hard = shuffle(available.filter((c) => c.diff === 'hard')).slice(0, 4);
  const dealt = shuffle([...easy, ...medium, ...hard]);
  for (const c of dealt) sessionDealt.add(c.id);
  return dealt;
}

export function buildEndlessDeck(
  pool: Card[],
  sessionDealt: Set<string>,
  seen: string[],
): Card[] {
  const dealt = shuffle(filterSeen(pool, seen, sessionDealt));
  for (const c of dealt) sessionDealt.add(c.id);
  return dealt;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/core/deckBuilder.test.ts
```

Expected: All 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/deckBuilder.ts tests/core/deckBuilder.test.ts
git commit -m "feat: add DeckBuilder with party/endless modes and dedup

Pure functions. No localStorage — caller provides seen/session state.
Extracted from app.js buildPartyDeck/buildEndlessDeck logic."
```

---

## Task 5: Scorer

**Files:**
- Create: `src/core/scorer.ts`
- Create: `tests/core/scorer.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/core/scorer.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { createScorerState, scoreCard, getVerdict, getLeaderboard } from '../../src/core/scorer';
import type { Card, Player } from '../../src/core/types';

function makeCard(diff: 'easy' | 'medium' | 'hard' = 'easy'): Card {
  return { id: 'bw01', ind: 'BW', diff, era: '90s', y: '1995', n: 'Test', f: 'Fact', c: 'Clue' };
}

describe('scoreCard', () => {
  it('adds points for correct answer', () => {
    const state = createScorerState([{ name: 'P1', score: 0 }]);
    const next = scoreCard(state, makeCard('medium'), 'correct');
    expect(next.totalPts).toBe(2);
    expect(next.correctCount).toBe(1);
    expect(next.streak).toBe(1);
    expect(next.players[0].score).toBe(2);
  });

  it('resets streak on miss', () => {
    let state = createScorerState([{ name: 'P1', score: 0 }]);
    state = scoreCard(state, makeCard(), 'correct'); // streak=1
    state = scoreCard(state, makeCard(), 'miss');
    expect(state.streak).toBe(0);
    expect(state.totalPts).toBe(1); // only first card's point
  });

  it('decrements lives on miss in endless mode', () => {
    const state = createScorerState([{ name: 'P1', score: 0 }], 3);
    const next = scoreCard(state, makeCard(), 'miss');
    expect(next.lives).toBe(2);
  });

  it('does not change score on skip', () => {
    const state = createScorerState([{ name: 'P1', score: 0 }]);
    const next = scoreCard(state, makeCard('hard'), 'skip');
    expect(next.totalPts).toBe(0);
    expect(next.streak).toBe(0);
  });

  it('awards correct points per difficulty', () => {
    const state = createScorerState([{ name: 'P1', score: 0 }]);
    const afterEasy = scoreCard(state, makeCard('easy'), 'correct');
    expect(afterEasy.totalPts).toBe(1);

    const afterMedium = scoreCard(state, makeCard('medium'), 'correct');
    expect(afterMedium.totalPts).toBe(2);

    const afterHard = scoreCard(state, makeCard('hard'), 'correct');
    expect(afterHard.totalPts).toBe(3);
  });

  it('scores to current player in multiplayer', () => {
    const state = createScorerState([
      { name: 'P1', score: 0 },
      { name: 'P2', score: 0 },
    ]);
    // currentPlayerIdx = 0
    const next = scoreCard(state, makeCard('hard'), 'correct');
    expect(next.players[0].score).toBe(3);
    expect(next.players[1].score).toBe(0);
  });
});

describe('getVerdict', () => {
  it('returns Legendary for 90%+', () => {
    const v = getVerdict(10, 10);
    expect(v.title).toBe('Legendary!');
  });

  it('returns Impressive for 70-89%', () => {
    const v = getVerdict(8, 10);
    expect(v.title).toBe('Impressive!');
  });

  it('returns Not bad for 50-69%', () => {
    const v = getVerdict(6, 10);
    expect(v.title).toBe('Not bad!');
  });

  it('returns Keep trying for 25-49%', () => {
    const v = getVerdict(3, 10);
    expect(v.title).toBe('Keep trying!');
  });

  it('returns Oof for <25%', () => {
    const v = getVerdict(1, 10);
    expect(v.title).toBe('Oof.');
  });
});

describe('getLeaderboard', () => {
  it('sorts players by score descending', () => {
    const players: Player[] = [
      { name: 'A', score: 5 },
      { name: 'B', score: 10 },
      { name: 'C', score: 3 },
    ];
    const sorted = getLeaderboard(players);
    expect(sorted.map((p) => p.name)).toEqual(['B', 'A', 'C']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/core/scorer.test.ts
```

Expected: FAIL — `Cannot find module '../../src/core/scorer'`

- [ ] **Step 3: Create src/core/scorer.ts**

```typescript
import type { Card, Player, Difficulty } from './types';
import { POINT_MAP } from './types';

export interface ScorerState {
  totalPts: number;
  correctCount: number;
  streak: number;
  lives: number;
  players: Player[];
  currentPlayerIdx: number;
}

export function createScorerState(players: Player[], lives = 0): ScorerState {
  return {
    totalPts: 0,
    correctCount: 0,
    streak: 0,
    lives,
    players: players.map((p) => ({ ...p })),
    currentPlayerIdx: 0,
  };
}

export function scoreCard(
  state: ScorerState,
  card: Card,
  result: 'correct' | 'miss' | 'skip',
): ScorerState {
  const pts = POINT_MAP[card.diff] ?? 1;
  const next: ScorerState = {
    ...state,
    players: state.players.map((p) => ({ ...p })),
  };

  if (result === 'correct') {
    next.totalPts += pts;
    next.correctCount += 1;
    next.streak += 1;
    next.players[state.currentPlayerIdx].score += pts;
  } else if (result === 'miss') {
    next.streak = 0;
    if (state.lives > 0) {
      next.lives = state.lives - 1;
    }
  } else {
    // skip — no change to score, reset streak
    next.streak = 0;
  }

  return next;
}

export function getVerdict(
  correctCount: number,
  totalPlayed: number,
): { title: string; verdict: string } {
  const pct = totalPlayed > 0 ? (correctCount / totalPlayed) * 100 : 0;

  if (pct >= 90) return { title: 'Legendary!', verdict: 'You are the ultimate Bollywood/Tollywood buff. Take a bow.' };
  if (pct >= 70) return { title: 'Impressive!', verdict: 'You clearly know your movies. Almost perfect.' };
  if (pct >= 50) return { title: 'Not bad!', verdict: 'Decent knowledge, but there is room to grow.' };
  if (pct >= 25) return { title: 'Keep trying!', verdict: 'You got some, missed some. Watch more movies!' };
  return { title: 'Oof.', verdict: 'Those plots were too terrible even for you. Try again!' };
}

export function getLeaderboard(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.score - a.score);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/core/scorer.test.ts
```

Expected: All 10 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/scorer.ts tests/core/scorer.test.ts
git commit -m "feat: add Scorer with points, streaks, lives, and verdicts

Pure functions, immutable state updates. Extracted from app.js
markCard/endGame logic. Supports multiplayer score tracking."
```

---

## Task 6: StorageAdapter + LocalStorageAdapter

**Files:**
- Create: `src/storage/interface.ts`
- Create: `src/storage/localStorage.ts`
- Create: `tests/storage/localStorage.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/storage/localStorage.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageAdapter } from '../../src/storage/localStorage';
import type { StorageAdapter } from '../../src/storage/interface';

// Minimal localStorage mock for Node
const store = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
} as Storage;

describe('LocalStorageAdapter', () => {
  let adapter: StorageAdapter;

  beforeEach(() => {
    store.clear();
    adapter = new LocalStorageAdapter(mockLocalStorage);
  });

  it('returns empty seen cards initially', () => {
    expect(adapter.getSeenCards()).toEqual([]);
  });

  it('marks and retrieves seen cards', () => {
    adapter.markCardsSeen(['bw01', 'bw02']);
    expect(adapter.getSeenCards()).toEqual(['bw01', 'bw02']);
  });

  it('accumulates seen cards across calls', () => {
    adapter.markCardsSeen(['bw01']);
    adapter.markCardsSeen(['bw02']);
    expect(adapter.getSeenCards()).toEqual(['bw01', 'bw02']);
  });

  it('deduplicates seen cards', () => {
    adapter.markCardsSeen(['bw01', 'bw01']);
    expect(adapter.getSeenCards()).toEqual(['bw01']);
  });

  it('clears seen cards', () => {
    adapter.markCardsSeen(['bw01']);
    adapter.clearSeenCards();
    expect(adapter.getSeenCards()).toEqual([]);
  });

  it('returns 0 for high score initially', () => {
    expect(adapter.getHighScore()).toBe(0);
  });

  it('sets and gets high score', () => {
    adapter.setHighScore(42);
    expect(adapter.getHighScore()).toBe(42);
  });

  it('saves and retrieves events in buffer', () => {
    const event = { event: 'test', props: {}, sessionId: 'abc', timestamp: 1000 };
    adapter.logEvent(event);
    expect(adapter.getEventBuffer()).toEqual([event]);
  });

  it('clears event buffer', () => {
    adapter.logEvent({ event: 'test', props: {}, sessionId: 'abc', timestamp: 1000 });
    adapter.clearEventBuffer();
    expect(adapter.getEventBuffer()).toEqual([]);
  });

  it('caps event buffer at 500', () => {
    for (let i = 0; i < 510; i++) {
      adapter.logEvent({ event: `e${i}`, props: {}, sessionId: 'abc', timestamp: i });
    }
    expect(adapter.getEventBuffer()).toHaveLength(500);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/storage/localStorage.test.ts
```

Expected: FAIL — modules not found

- [ ] **Step 3: Create src/storage/interface.ts**

```typescript
import type { GameSession, FeedbackEntry, SuggestionEntry, AnalyticsEvent } from '../core/types';

export interface StorageAdapter {
  getSeenCards(): string[];
  markCardsSeen(cardIds: string[]): void;
  clearSeenCards(): void;

  saveSession(session: GameSession): void;

  getHighScore(): number;
  setHighScore(score: number): void;

  saveFeedback(entry: FeedbackEntry): void;
  saveSuggestion(entry: SuggestionEntry): void;

  logEvent(event: AnalyticsEvent): void;
  getEventBuffer(): AnalyticsEvent[];
  clearEventBuffer(): void;
}
```

- [ ] **Step 4: Create src/storage/localStorage.ts**

```typescript
import type { StorageAdapter } from './interface';
import type { GameSession, FeedbackEntry, SuggestionEntry, AnalyticsEvent } from '../core/types';

const MAX_EVENTS = 500;

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private storage: Storage) {}

  getSeenCards(): string[] {
    try {
      return JSON.parse(this.storage.getItem('sp_seen') || '[]');
    } catch {
      return [];
    }
  }

  markCardsSeen(cardIds: string[]): void {
    const seen = this.getSeenCards();
    const updated = [...new Set([...seen, ...cardIds])];
    this.storage.setItem('sp_seen', JSON.stringify(updated));
  }

  clearSeenCards(): void {
    this.storage.removeItem('sp_seen');
  }

  saveSession(session: GameSession): void {
    try {
      const sessions = JSON.parse(this.storage.getItem('sp_sessions') || '[]');
      sessions.push(session);
      this.storage.setItem('sp_sessions', JSON.stringify(sessions));
    } catch { /* non-critical */ }
  }

  getHighScore(): number {
    return parseInt(this.storage.getItem('sp_highScore') || '0', 10);
  }

  setHighScore(score: number): void {
    this.storage.setItem('sp_highScore', String(score));
  }

  saveFeedback(entry: FeedbackEntry): void {
    try {
      const fb = JSON.parse(this.storage.getItem('sp_feedback') || '[]');
      fb.push(entry);
      this.storage.setItem('sp_feedback', JSON.stringify(fb));
    } catch { /* non-critical */ }
  }

  saveSuggestion(entry: SuggestionEntry): void {
    try {
      const suggestions = JSON.parse(this.storage.getItem('sp_suggestions') || '[]');
      suggestions.push(entry);
      this.storage.setItem('sp_suggestions', JSON.stringify(suggestions));
    } catch { /* non-critical */ }
  }

  logEvent(event: AnalyticsEvent): void {
    try {
      const events: AnalyticsEvent[] = JSON.parse(this.storage.getItem('sp_events') || '[]');
      events.push(event);
      if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
      this.storage.setItem('sp_events', JSON.stringify(events));
    } catch { /* non-critical */ }
  }

  getEventBuffer(): AnalyticsEvent[] {
    try {
      return JSON.parse(this.storage.getItem('sp_events') || '[]');
    } catch {
      return [];
    }
  }

  clearEventBuffer(): void {
    this.storage.removeItem('sp_events');
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run tests/storage/localStorage.test.ts
```

Expected: All 10 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/storage/interface.ts src/storage/localStorage.ts tests/storage/localStorage.test.ts
git commit -m "feat: add StorageAdapter interface and localStorage implementation

Port adapter pattern from Pebl. localStorage keys match existing app.js
keys (sp_seen, sp_highScore, etc.) for data continuity."
```

---

## Task 7: ContentLoader + Card Pack Migration

**Files:**
- Create: `src/core/contentLoader.ts`
- Create: `tests/core/contentLoader.test.ts`
- Create: `public/content/manifest.json`
- Create: `public/content/packs/bw.json`
- Create: `public/content/packs/tw.json`
- Modify: scripts to reference new pack location

- [ ] **Step 1: Split cards.json into packs**

Create a one-time migration script and run it:

```bash
cd /Users/srinityaduppanapudisatya/Desktop/seedhaplot
mkdir -p public/content/packs
node -e "
const cards = JSON.parse(require('fs').readFileSync('cards.json', 'utf-8'));
const bw = cards.filter(c => c.ind === 'BW');
const tw = cards.filter(c => c.ind === 'TW');

const bwPack = { id: 'bw', name: 'Bollywood', industry: 'BW', cards: bw };
const twPack = { id: 'tw', name: 'Tollywood', industry: 'TW', cards: tw };

require('fs').writeFileSync('public/content/packs/bw.json', JSON.stringify(bwPack, null, 2));
require('fs').writeFileSync('public/content/packs/tw.json', JSON.stringify(twPack, null, 2));

console.log('BW:', bw.length, 'cards');
console.log('TW:', tw.length, 'cards');
"
```

Expected: `BW: 74 cards` / `TW: 75 cards`

- [ ] **Step 2: Create public/content/manifest.json**

```json
{
  "packs": [
    { "id": "bw", "file": "packs/bw.json", "enabled": true },
    { "id": "tw", "file": "packs/tw.json", "enabled": true }
  ]
}
```

- [ ] **Step 3: Write the failing tests**

Create `tests/core/contentLoader.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { ContentLoader } from '../../src/core/contentLoader';
import type { Card } from '../../src/core/types';

const mockBwPack = {
  id: 'bw',
  name: 'Bollywood',
  industry: 'BW' as const,
  cards: [
    { id: 'bw01', ind: 'BW' as const, diff: 'easy' as const, era: '90s', y: '1995', n: 'DDLJ', f: 'Fact', c: 'Clue' },
    { id: 'bw02', ind: 'BW' as const, diff: 'hard' as const, era: '2000s', y: '2001', n: 'K3G', f: 'Fact', c: 'Clue' },
  ],
};

const mockTwPack = {
  id: 'tw',
  name: 'Tollywood',
  industry: 'TW' as const,
  cards: [
    { id: 'tw01', ind: 'TW' as const, diff: 'easy' as const, era: '2010s', y: '2015', n: 'Baahubali', f: 'Fact', c: 'Clue' },
  ],
};

const mockManifest = {
  packs: [
    { id: 'bw', file: 'packs/bw.json', enabled: true },
    { id: 'tw', file: 'packs/tw.json', enabled: true },
    { id: 'disabled', file: 'packs/disabled.json', enabled: false },
  ],
};

function createLoader() {
  const fetcher = vi.fn(async (url: string) => {
    if (url.includes('manifest.json')) return mockManifest;
    if (url.includes('bw.json')) return mockBwPack;
    if (url.includes('tw.json')) return mockTwPack;
    throw new Error(`Unknown URL: ${url}`);
  });
  return { loader: new ContentLoader(fetcher), fetcher };
}

describe('ContentLoader', () => {
  it('loads manifest and all enabled packs', async () => {
    const { loader, fetcher } = createLoader();
    const cards = await loader.loadAllEnabled();
    expect(cards).toHaveLength(3); // 2 BW + 1 TW
    // Should not fetch disabled pack
    expect(fetcher).not.toHaveBeenCalledWith(expect.stringContaining('disabled.json'));
  });

  it('getCardPool filters by industry', async () => {
    const { loader } = createLoader();
    const allCards = await loader.loadAllEnabled();
    const bwPool = ContentLoader.getCardPool(allCards, 'BW');
    expect(bwPool).toHaveLength(2);
    expect(bwPool.every((c) => c.ind === 'BW')).toBe(true);
  });

  it('getCardPool returns empty for unknown industry', async () => {
    const { loader } = createLoader();
    const allCards = await loader.loadAllEnabled();
    const pool = ContentLoader.getCardPool(allCards, 'TW');
    expect(pool).toHaveLength(1);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

```bash
npx vitest run tests/core/contentLoader.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 5: Create src/core/contentLoader.ts**

```typescript
import type { Card, Industry } from './types';

export interface ContentPack {
  id: string;
  name: string;
  industry: Industry;
  cards: Card[];
}

export interface Manifest {
  packs: { id: string; file: string; enabled: boolean }[];
}

type Fetcher = (url: string) => Promise<unknown>;

export class ContentLoader {
  private allCards: Card[] = [];

  constructor(private fetcher: Fetcher) {}

  async loadAllEnabled(): Promise<Card[]> {
    const manifest = (await this.fetcher('/content/manifest.json')) as Manifest;
    const enabledPacks = manifest.packs.filter((p) => p.enabled);

    const cards: Card[] = [];
    for (const entry of enabledPacks) {
      const pack = (await this.fetcher(`/content/${entry.file}`)) as ContentPack;
      cards.push(...pack.cards);
    }

    this.allCards = cards;
    return cards;
  }

  getAllCards(): Card[] {
    return this.allCards;
  }

  static getCardPool(cards: Card[], industry: Industry): Card[] {
    return cards.filter((c) => c.ind === industry);
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npx vitest run tests/core/contentLoader.test.ts
```

Expected: All 3 tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/core/contentLoader.ts tests/core/contentLoader.test.ts public/content/
git commit -m "feat: add ContentLoader and migrate cards to pack system

Split cards.json into bw.json (74 cards) and tw.json (75 cards).
Manifest controls which packs are active. ContentLoader uses injected
fetcher for testability."
```

---

## Task 8: SupabaseAdapter

**Files:**
- Create: `src/storage/supabase.ts`

- [ ] **Step 1: Create src/storage/supabase.ts**

```typescript
import type { StorageAdapter } from './interface';
import type { GameSession, FeedbackEntry, SuggestionEntry, AnalyticsEvent } from '../core/types';

interface SupabaseClient {
  from(table: string): { insert(data: unknown): { then(cb: () => void): { catch(cb: () => void): void } } };
}

/**
 * Fire-and-forget Supabase adapter. Only implements write methods.
 * Read methods delegate to a fallback (localStorage) adapter.
 * This matches the current app.js pattern where Supabase is write-only.
 */
export class SupabaseAdapter implements StorageAdapter {
  constructor(
    private client: SupabaseClient | null,
    private fallback: StorageAdapter,
  ) {}

  // Reads delegate to fallback
  getSeenCards(): string[] { return this.fallback.getSeenCards(); }
  markCardsSeen(cardIds: string[]): void { this.fallback.markCardsSeen(cardIds); }
  clearSeenCards(): void { this.fallback.clearSeenCards(); }
  getHighScore(): number { return this.fallback.getHighScore(); }
  setHighScore(score: number): void { this.fallback.setHighScore(score); }
  getEventBuffer(): AnalyticsEvent[] { return this.fallback.getEventBuffer(); }
  clearEventBuffer(): void { this.fallback.clearEventBuffer(); }
  logEvent(event: AnalyticsEvent): void { this.fallback.logEvent(event); }

  // Writes go to both Supabase and fallback
  saveSession(session: GameSession): void {
    this.fallback.saveSession(session);
    this.dbInsert('sessions', {
      session_id: session.sessionId,
      mode: session.mode,
      game_mode: session.gameMode,
      total_pts: session.totalPts,
      correct_count: session.correctCount,
      total_played: session.totalPlayed,
      pct: session.pct,
      reason: session.reason,
      player_count: session.playerCount,
    });
  }

  saveFeedback(entry: FeedbackEntry): void {
    this.fallback.saveFeedback(entry);
    this.dbInsert('feedback', {
      tags: entry.tags,
      text: entry.text,
      session_id: entry.sessionId,
    });
  }

  saveSuggestion(entry: SuggestionEntry): void {
    this.fallback.saveSuggestion(entry);
    this.dbInsert('suggestions', {
      movie_name: entry.movie,
      industry: entry.industry,
      session_id: entry.sessionId,
    });
  }

  private dbInsert(table: string, data: Record<string, unknown>): void {
    if (!this.client) return;
    try {
      this.client.from(table).insert(data).then(() => {}).catch(() => {});
    } catch { /* fire-and-forget */ }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/storage/supabase.ts
git commit -m "feat: add SupabaseAdapter for fire-and-forget writes

Delegates reads to fallback (localStorage). Writes go to both.
Same table schema as current app.js Supabase integration."
```

---

## Task 9: Bridge Hooks

**Files:**
- Create: `src/hooks/useGameState.ts`
- Create: `src/hooks/useGameActions.ts`
- Create: `src/hooks/gameInstance.ts`

- [ ] **Step 1: Create src/hooks/gameInstance.ts**

This is the singleton that wires everything together. Created once, shared via hooks.

```typescript
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
    if ((window as unknown as Record<string, unknown>).supabase) {
      const sb = (window as unknown as { supabase: { createClient: (url: string, key: string) => unknown } }).supabase;
      return sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  } catch { /* non-critical */ }
  return null;
}

export interface GamePayload {
  // Current game state
  industry: Industry | null;
  gameMode: GameMode;
  deck: Card[];
  idx: number;
  currentCard: Card | null;
  isFlipped: boolean;
  scorer: ScorerState;
  sessionDealt: Set<string>;
  highScore: number;
  // Results
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
      verdict: this.fsm.getState() === 'results'
        ? getVerdict(this.scorer.correctCount, this.idx)
        : null,
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
    this.scorer = createScorerState(
      players,
      this.gameMode === 'endless' ? 3 : 0,
    );
    this.fsm.transition('playing');
    this.bus.emit('game:started', {
      mode: this.industry!,
      gameMode: this.gameMode,
      playerCount: players.length,
    });
    this.bus.emit('card:loaded', {
      cardId: this.deck[0]?.id ?? '',
      idx: 0,
      difficulty: this.deck[0]?.diff ?? 'easy',
    });
  }

  flipCard(): void {
    if (this.fsm.getState() !== 'playing') return;
    this.fsm.transition('flipped');
    const card = this.deck[this.idx];
    if (card) {
      this.bus.emit('card:flipped', { cardId: card.id, idx: this.idx });
    }
  }

  markResult(result: 'correct' | 'miss' | 'skip'): void {
    if (this.fsm.getState() !== 'flipped') return;
    const card = this.deck[this.idx];
    this.scorer = scoreCard(this.scorer, card, result);
    this.fsm.transition('scoring');

    const pts = result === 'correct' ? (card.diff === 'easy' ? 1 : card.diff === 'medium' ? 2 : 3) : 0;
    this.bus.emit('score:updated', { result, pts, totalPts: this.scorer.totalPts });

    this.idx++;

    // Determine next state
    if (this.gameMode === 'endless' && this.scorer.lives <= 0) {
      this.endGame('lives-exhausted');
    } else if (this.gameMode === 'party' && this.idx >= this.deck.length) {
      this.fsm.transition('continue');
    } else if (this.scorer.players.length > 1) {
      this.scorer = {
        ...this.scorer,
        currentPlayerIdx: (this.scorer.currentPlayerIdx + 1) % this.scorer.players.length,
      };
      this.fsm.transition('turnChange');
      this.bus.emit('player:turn-changed', {
        playerIdx: this.scorer.currentPlayerIdx,
        playerName: this.scorer.players[this.scorer.currentPlayerIdx].name,
      });
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
    this.startGame(this.scorer.players.map((p) => ({ name: p.name, score: 0 })));
  }

  endGame(reason: 'completed' | 'exit' | 'abandon' | 'lives-exhausted' = 'completed'): void {
    this.storage.markCardsSeen([...this.sessionDealt]);
    const totalPlayed = this.idx;
    const pct = totalPlayed > 0 ? Math.round((this.scorer.correctCount / totalPlayed) * 100) : 0;

    if (this.gameMode === 'endless' && this.scorer.totalPts > this.storage.getHighScore()) {
      this.storage.setHighScore(this.scorer.totalPts);
    }

    this.bus.emit('game:ended', {
      reason,
      totalPts: this.scorer.totalPts,
      correctCount: this.scorer.correctCount,
      totalPlayed,
    });

    this.storage.saveSession({
      sessionId: this.sessionId,
      mode: this.industry!,
      gameMode: this.gameMode,
      totalPts: this.scorer.totalPts,
      correctCount: this.scorer.correctCount,
      totalPlayed,
      pct,
      reason,
      playerCount: this.scorer.players.length,
      timestamp: Date.now(),
    });

    if (reason !== 'exit') {
      this.fsm.transition('results');
    }
  }

  getShareText(): string {
    const ind = this.industry === 'BW' ? 'Bollywood' : 'Tollywood';
    const emoji = this.scorer.totalPts >= 30 ? '\u{1F525}' : this.scorer.totalPts >= 20 ? '\u{1F4AA}' : this.scorer.totalPts >= 10 ? '\u{1F3AC}' : '\u{1F605}';
    return [
      `${emoji} ${this.scorer.totalPts} pts on Bad Plots!`,
      `${this.scorer.correctCount}/${this.idx} ${ind} movies guessed.`,
      '',
      'Terrible plots. Real movies.',
      'Think you can beat that?',
      'badbollywoodplots.com',
    ].join('\n');
  }

  private emitCardLoaded(): void {
    const card = this.deck[this.idx];
    if (card) {
      this.bus.emit('card:loaded', { cardId: card.id, idx: this.idx, difficulty: card.diff });
    }
  }
}

// Singleton
let instance: GameInstance | null = null;

export function getGameInstance(): GameInstance {
  if (!instance) {
    instance = new GameInstance();
  }
  return instance;
}
```

- [ ] **Step 2: Create src/hooks/useGameState.ts**

```typescript
import { useSyncExternalStore } from 'react';
import { getGameInstance, type GamePayload } from './gameInstance';
import type { GameState } from '../core/types';

interface GameStateResult {
  state: GameState;
  payload: GamePayload;
}

export function useGameState(): GameStateResult {
  const instance = getGameInstance();

  const state = useSyncExternalStore(
    (callback) => instance.fsm.subscribe(callback),
    () => instance.fsm.getSnapshot(),
  );

  return {
    state: state.state,
    payload: instance.getPayload(),
  };
}
```

- [ ] **Step 3: Create src/hooks/useGameActions.ts**

```typescript
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
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/
git commit -m "feat: add bridge hooks — useGameState and useGameActions

GameInstance singleton wires core modules together. useGameState
uses useSyncExternalStore for zero-overhead FSM subscription.
useGameActions returns stable refs for all game operations."
```

---

## Task 10: Analytics Subscriber

**Files:**
- Create: `src/analytics/posthog.ts`

- [ ] **Step 1: Create src/analytics/posthog.ts**

```typescript
import type { TypedEventBus } from '../core/eventBus';

declare global {
  interface Window {
    posthog?: {
      init(token: string, config: Record<string, unknown>): void;
      capture(event: string, props?: Record<string, unknown>): void;
    };
  }
}

const POSTHOG_TOKEN = 'phc_im021jzJ6Lx5QSvJdSSeVb23IROC0Kpbrs75X2NOzTd';
const POSTHOG_HOST = 'https://us.i.posthog.com';

export function initPostHog(): void {
  try {
    // PostHog snippet — same as current app.js
    !function(t: Document,e: Record<string, unknown>){var o: unknown,n: unknown,p: HTMLScriptElement,r: HTMLScriptElement;(e as Record<string,unknown>).__SV||(((window as unknown) as Record<string,unknown>).posthog=e,((e as Record<string,unknown>)._i as unknown[])=[],((e as Record<string,unknown>).init as (i: string,s: Record<string,unknown>,a?: string)=>void)=function(i: string,s: Record<string,unknown>,a?: string){function g(t: Record<string,unknown>,e: string){var o=e.split(".");2==o.length&&(t=t[o[0]] as Record<string,unknown>,e=o[1]),(t as Record<string,unknown>)[e]=function(){(t as unknown as unknown[]).push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script") as HTMLScriptElement).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0] as HTMLScriptElement).parentNode!.insertBefore(p,r);var u=e;for(void 0!==a?u=(e as Record<string,unknown>)[a as string]=[]:a="posthog",(u as Record<string,unknown>).people=(u as Record<string,unknown>).people||[],(u as Record<string,unknown>).toString=function(t: boolean){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},(u as Record<string,unknown>).people.toString=function(){return (u as Record<string,unknown>).toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;(n as number)<(o as string[]).length;n++)g(u as Record<string,unknown>,(o as string[])[(n as number)]);((e as Record<string,unknown>)._i as unknown[]).push([i,s,a])},(e as Record<string,unknown>).__SV=1)}(document,(window as unknown as Record<string,unknown>).posthog as Record<string,unknown>||[]);
    window.posthog?.init(POSTHOG_TOKEN, { api_host: POSTHOG_HOST, autocapture: false });
  } catch { /* analytics non-critical */ }
}

export function initAnalyticsSubscriber(bus: TypedEventBus, sessionId: string): void {
  const capture = (event: string, props: Record<string, unknown> = {}) => {
    try {
      window.posthog?.capture(event, { ...props, session: sessionId, ts: Date.now() });
    } catch { /* non-critical */ }
  };

  bus.on('game:started', (data) => capture('game_start', data));
  bus.on('card:loaded', (data) => capture('card_view', data));
  bus.on('card:flipped', (data) => capture('card_flip', data));
  bus.on('score:updated', (data) => capture('card_result', data));
  bus.on('game:ended', (data) => capture('game_end', data));
  bus.on('fsm:transition', (data) => capture('state_transition', data));
  bus.on('player:turn-changed', (data) => capture('turn_change', data));
}
```

- [ ] **Step 2: Commit**

```bash
git add src/analytics/posthog.ts
git commit -m "feat: add PostHog analytics as event bus subscriber

Replaces inline track() calls. All game events auto-captured via bus
subscription. Same PostHog project key as current app."
```

---

## Task 11: React UI Components

**Files:**
- Create: `src/components/App.tsx`
- Create: `src/components/HomeScreen.tsx`
- Create: `src/components/GameScreen.tsx`
- Create: `src/components/Card.tsx`
- Create: `src/components/ResultsScreen.tsx`
- Create: `src/components/PlayerSetup.tsx`
- Create: `src/components/TurnInterstitial.tsx`
- Create: `src/components/FeedbackSheet.tsx`
- Create: `src/components/SuggestSheet.tsx`
- Create: `src/components/Toast.tsx`
- Create: `src/style.css`
- Modify: `src/main.tsx`

This is the largest task. Each component is a dumb renderer — receives state via hooks, calls actions. The visual design is ported directly from the current `old/style.css` and `old/index.html`.

- [ ] **Step 1: Copy style.css from old/**

```bash
cp /Users/srinityaduppanapudisatya/Desktop/seedhaplot/old/style.css /Users/srinityaduppanapudisatya/Desktop/seedhaplot/src/style.css
```

The CSS carries over as-is. Visual rework is a separate workstream.

- [ ] **Step 2: Create src/components/Toast.tsx**

```tsx
import { useState, useEffect, useCallback } from 'react';

let showToastFn: ((msg: string) => void) | null = null;

export function toast(msg: string): void {
  showToastFn?.(msg);
}

export function Toast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const show = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), 2600);
  }, []);

  useEffect(() => {
    showToastFn = show;
    return () => { showToastFn = null; };
  }, [show]);

  return (
    <div className={`toast${visible ? ' show' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
```

- [ ] **Step 3: Create src/components/HomeScreen.tsx**

```tsx
import { useState } from 'react';
import { useGameActions } from '../hooks/useGameActions';
import type { GameMode } from '../core/types';

export function HomeScreen() {
  const actions = useGameActions();
  const [gameMode, setGameMode] = useState<GameMode>('party');

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode);
    actions.setGameMode(mode);
  };

  return (
    <main className="screen active" aria-label="Home">
      <div className="home-page">
        <div className="color-strip" />

        <div className="home-content">
          <div className="top-row">
            <button className="top-link">Suggest a Movie</button>
            <a href="https://www.linkedin.com/in/srinityaduppanapudisatya/" target="_blank" rel="noopener" className="top-link">
              @Srinitya
            </a>
          </div>

          <div className="hero">
            <h1 className="hero-title">
              <span className="title-bad">Bad</span>
              <span className="title-plots">Plots</span>
            </h1>
            <p className="hero-explain">
              We describe Bollywood and Tollywood movies <strong>badly</strong>.
              You guess which film it is. Simple, chaotic, and best played with chai and friends.
            </p>
          </div>

          <div className="section-label">Pick Your Cinema</div>
          <div className="cinema-row">
            <button className="cinema-btn bw" onClick={() => actions.selectMode('BW')}>
              <div className="cinema-name">Bollywood</div>
              <div className="cinema-sub">Hindi films</div>
            </button>
            <button className="cinema-btn tw" onClick={() => actions.selectMode('TW')}>
              <div className="cinema-name">Tollywood</div>
              <div className="cinema-sub">Telugu films</div>
            </button>
          </div>

          <div className="modes">
            <div className="section-label">How Do You Want to Play?</div>
            <div className="mode-cards">
              <button
                className={`mode-card party${gameMode === 'party' ? ' selected' : ''}`}
                onClick={() => handleModeChange('party')}
              >
                <span className="mode-tag">Popular</span>
                <div className="mode-card-name">Party</div>
                <div className="mode-desc">12 cards, mixed difficulty. Perfect for game night with friends.</div>
                <span className="mode-check">{'\u2713'}</span>
              </button>
              <button
                className={`mode-card endless${gameMode === 'endless' ? ' selected' : ''}`}
                onClick={() => handleModeChange('endless')}
              >
                <div className="mode-card-name">Endless</div>
                <div className="mode-desc">Keep going until you run out of lives. How far can you get?</div>
                <span className="mode-check">{'\u2713'}</span>
              </button>
            </div>
          </div>
        </div>

        <footer className="home-footer">
          <button className="footer-link">Feedback</button>
          <a href="#" className="footer-link">About</a>
        </footer>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Create src/components/Card.tsx**

```tsx
import type { Card as CardType } from '../core/types';

interface CardProps {
  card: CardType;
  isFlipped: boolean;
  onFlip: () => void;
}

export function Card({ card, isFlipped, onFlip }: CardProps) {
  const isBW = card.ind === 'BW';
  const indLabel = isBW ? 'Bollywood' : 'Tollywood';

  return (
    <div
      className={`card-wrap${isFlipped ? ' flipped' : ''}`}
      onClick={isFlipped ? undefined : onFlip}
      onKeyDown={(e) => {
        if (!isFlipped && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onFlip();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Tap to flip card and reveal answer"
    >
      <div className="card-inner">
        <div className={`card-face card-front${!isBW ? ' tw' : ''}`}>
          <div className="card-frame" aria-hidden="true" />
          <div className="card-content">
            <div className="card-meta">
              <span className={`card-ind ${card.ind.toLowerCase()}`}>{indLabel}</span>
              <span className="card-era">
                {card.era} {'\u00b7'} {card.diff.charAt(0).toUpperCase() + card.diff.slice(1)}
              </span>
              <span className={`card-badge badge-${card.diff}`}>{card.diff}</span>
            </div>
            <p className="card-clue">{card.c}</p>
            <span className="card-tap">Tap to reveal answer</span>
          </div>
        </div>
        <div className={`card-face card-back${!isBW ? ' tw' : ''}`}>
          <div className="card-frame card-frame-back" aria-hidden="true" />
          <div className="card-content">
            <span className={`card-ind-back${isBW ? ' bw' : ' tw'}`}>
              {indLabel} {'\u00b7'} {card.diff}
            </span>
            <h3 className="card-answer">{card.n}</h3>
            <span className="card-year">{card.y}</span>
            <hr className="card-divider" aria-hidden="true" />
            <p className="card-fact-label">Did you know</p>
            <p className="card-fact">{card.f}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create src/components/GameScreen.tsx**

```tsx
import { useGameState } from '../hooks/useGameState';
import { useGameActions } from '../hooks/useGameActions';
import { Card } from './Card';

export function GameScreen() {
  const { state, payload } = useGameState();
  const actions = useGameActions();
  const { deck, idx, currentCard, scorer, gameMode } = payload;

  if (!currentCard) return null;

  const isFlipped = state === 'flipped';
  const progress = gameMode === 'party' ? `${idx + 1} / ${deck.length}` : `Card ${idx + 1}`;
  const progressPct = gameMode === 'party' ? (idx / deck.length) * 100 : 0;

  return (
    <main className="screen active" aria-label="Game">
      <header className="game-bar">
        <button className="game-exit-btn" onClick={actions.exitGame}>
          <span aria-hidden="true">{'\u2190'}</span> Exit
        </button>
        <div className="game-info">
          <span className="game-prog">{progress}</span>
        </div>
        <div className="game-score">{scorer.totalPts} pts</div>
      </header>

      {gameMode === 'party' && (
        <div className="prog-track" role="progressbar" aria-valuenow={Math.round(progressPct)} aria-valuemin={0} aria-valuemax={100}>
          <div className="prog-fill" style={{ width: `${progressPct}%` }} />
        </div>
      )}

      {gameMode === 'endless' && (
        <div className="game-lives" aria-label="Lives remaining">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`life${i < scorer.lives ? ' active' : ''}`} aria-label={`Life ${i + 1}`} />
          ))}
        </div>
      )}

      {scorer.players.length > 1 && (
        <div className="player-tabs" role="tablist" aria-label="Players">
          {scorer.players.map((p, i) => (
            <button
              key={i}
              className={`player-tab${i === scorer.currentPlayerIdx ? ' active' : ''}`}
              role="tab"
              aria-selected={i === scorer.currentPlayerIdx}
            >
              {p.name || `P${i + 1}`}: {p.score}
            </button>
          ))}
        </div>
      )}

      <div className="card-stage">
        <Card card={currentCard} isFlipped={isFlipped} onFlip={actions.flipCard} />
      </div>

      {isFlipped && (
        <div className="score-zone">
          <div className="score-btns">
            <button className="score-btn btn-got" onClick={actions.markCorrect}>Got it</button>
            <button className="score-btn btn-miss" onClick={actions.markMiss}>Missed</button>
          </div>
          <button className="btn-skip" onClick={actions.skip}>Skip</button>
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 6: Create src/components/ResultsScreen.tsx**

```tsx
import { useGameState } from '../hooks/useGameState';
import { useGameActions } from '../hooks/useGameActions';
import { toast } from './Toast';

export function ResultsScreen() {
  const { payload } = useGameState();
  const actions = useGameActions();
  const { scorer, verdict, leaderboard, gameMode, highScore, idx } = payload;

  const handleShare = () => {
    const text = actions.getShareText();
    if (navigator.share) {
      navigator.share({ title: 'Bad Plots', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => toast('Score copied!')).catch(() => toast('Could not copy'));
    }
  };

  return (
    <main className="screen active" aria-label="Results">
      <header className="res-top">
        <p className="res-eyebrow">Game over</p>
        <h1 className="res-title">{verdict?.title ?? 'Done!'}</h1>
        <p className="res-sub">
          {gameMode === 'endless'
            ? `High score: ${highScore} pts`
            : `${scorer.correctCount} of ${idx} correct`}
        </p>
        <div className="res-stats">
          <div className="res-stat">
            <span className="res-stat-n">{scorer.correctCount}</span>
            <span className="res-stat-l">Correct</span>
          </div>
          <div className="res-stat">
            <span className="res-stat-n">{idx}</span>
            <span className="res-stat-l">Played</span>
          </div>
          <div className="res-stat">
            <span className="res-stat-n">{scorer.totalPts}</span>
            <span className="res-stat-l">Points</span>
          </div>
        </div>
      </header>
      <div className="res-body">
        <blockquote className="res-verdict">
          <p className="res-verdict-text">{verdict?.verdict}</p>
        </blockquote>

        {leaderboard.length > 1 && (
          <div className="leaderboard">
            <h2 className="lb-title">Leaderboard</h2>
            {leaderboard.map((p, i) => (
              <div key={i} className="lb-row">
                <span className="lb-rank">{i + 1}</span>
                <span className="lb-name">{p.name}</span>
                <span className="lb-score">{p.score} pts</span>
              </div>
            ))}
          </div>
        )}

        <div className="res-actions">
          <button className="btn-primary" onClick={actions.replay}>Play again</button>
          <button className="btn-secondary" onClick={handleShare}>Share score</button>
          <button className="link-btn">How was that?</button>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 7: Create src/components/PlayerSetup.tsx**

```tsx
import { useState } from 'react';
import { useGameActions } from '../hooks/useGameActions';
import type { Player } from '../core/types';

const PLAYER_COLORS = ['gold', 'red', 'green', 'indigo'];

interface PlayerSetupProps {
  onClose: () => void;
}

export function PlayerSetup({ onClose }: PlayerSetupProps) {
  const actions = useGameActions();
  const [players, setPlayers] = useState<Player[]>([{ name: '', score: 0 }]);

  const addPlayer = () => {
    if (players.length >= 4) return;
    setPlayers([...players, { name: '', score: 0 }]);
  };

  const removePlayer = (idx: number) => {
    setPlayers(players.filter((_, i) => i !== idx));
  };

  const updateName = (idx: number, name: string) => {
    setPlayers(players.map((p, i) => (i === idx ? { ...p, name } : p)));
  };

  const handleStart = () => {
    const filled = players.map((p, i) => ({
      ...p,
      name: p.name.trim() || `Player ${i + 1}`,
    }));
    actions.startGame(filled);
    onClose();
  };

  return (
    <div className="sheet-overlay open" role="dialog" aria-modal="true">
      <div className="sheet">
        <div className="sheet-handle" aria-hidden="true" />
        <h2 className="sheet-title">Who's playing?</h2>
        <p className="sheet-sub">Add players or just tap Start for solo</p>
        <div className="player-list">
          {players.map((p, i) => (
            <div key={i} className="player-row" style={{ '--player-color': PLAYER_COLORS[i] } as React.CSSProperties}>
              <span className="player-avatar" aria-hidden="true">P{i + 1}</span>
              <input
                className="player-input"
                type="text"
                placeholder={`Player ${i + 1}`}
                value={p.name}
                onChange={(e) => updateName(i, e.target.value)}
                aria-label={`Player ${i + 1} name`}
              />
              <button className="player-remove" aria-label={`Remove player ${i + 1}`} onClick={() => removePlayer(i)}>
                {'\u00d7'}
              </button>
            </div>
          ))}
        </div>
        {players.length < 4 && (
          <button className="add-player-btn" onClick={addPlayer}>+ Add player</button>
        )}
        <button className="btn-primary" onClick={handleStart}>Start game</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Create src/components/TurnInterstitial.tsx**

```tsx
import { useGameState } from '../hooks/useGameState';
import { useGameActions } from '../hooks/useGameActions';
import { getGameInstance } from '../hooks/gameInstance';

export function TurnInterstitial() {
  const { state, payload } = useGameState();
  const actions = useGameActions();
  const { scorer } = payload;

  const isContinue = state === 'continue';
  const currentPlayer = scorer.players[scorer.currentPlayerIdx];

  const handleSeeResults = () => {
    const instance = getGameInstance();
    instance.endGame('completed');
  };

  return (
    <div className="turn-interstitial" style={{ display: '' }}>
      <h2 className="turn-name">
        {isContinue ? `${scorer.totalPts} pts` : currentPlayer?.name ?? 'Your turn'}
      </h2>
      <p className="turn-sub">
        {isContinue
          ? `${scorer.correctCount} of ${payload.idx} correct — keep going?`
          : 'Your turn'}
      </p>
      <button className="btn-primary" onClick={isContinue ? actions.continueGame : actions.ready}>
        {isContinue ? 'Keep going' : 'Ready'}
      </button>
      {isContinue && (
        <button className="btn-secondary" onClick={handleSeeResults}>
          See results
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 9: Create src/components/FeedbackSheet.tsx and SuggestSheet.tsx**

Create `src/components/FeedbackSheet.tsx`:

```tsx
import { useState } from 'react';
import { getGameInstance } from '../hooks/gameInstance';
import { toast } from './Toast';

interface FeedbackSheetProps {
  onClose: () => void;
}

export function FeedbackSheet({ onClose }: FeedbackSheetProps) {
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [text, setText] = useState('');

  const toggleTag = (tag: string) => {
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const handleSubmit = () => {
    if (tags.size === 0 && !text.trim()) {
      toast('Please select at least one tag or write something');
      return;
    }
    const instance = getGameInstance();
    instance.storage.saveFeedback({
      tags: [...tags],
      text: text.trim(),
      timestamp: Date.now(),
      sessionId: '',
    });
    toast('Thanks for your feedback!');
    onClose();
  };

  const tagOptions = [
    { value: 'love_it', label: 'Love it' },
    { value: 'needs_work', label: 'Needs work' },
    { value: 'want_more_cards', label: 'Want more cards' },
    { value: 'great_for_parties', label: 'Great for parties' },
    { value: 'ui_issue', label: 'UI issue' },
    { value: 'bug', label: 'Found a bug' },
  ];

  return (
    <div className="sheet-overlay open" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet">
        <div className="sheet-handle" aria-hidden="true" />
        <h2 className="sheet-title">Share your feedback</h2>
        <p className="sheet-sub">Tell us what's working and what's not</p>
        <div className="fb-tags">
          {tagOptions.map((t) => (
            <button
              key={t.value}
              className="fb-tag"
              aria-pressed={tags.has(t.value)}
              onClick={() => toggleTag(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <textarea
          className="fb-textarea"
          placeholder="Anything else? (optional)"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn-primary" onClick={handleSubmit}>Submit feedback</button>
        <button className="btn-skip" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
```

Create `src/components/SuggestSheet.tsx`:

```tsx
import { useState } from 'react';
import { getGameInstance } from '../hooks/gameInstance';
import { toast } from './Toast';

interface SuggestSheetProps {
  onClose: () => void;
}

export function SuggestSheet({ onClose }: SuggestSheetProps) {
  const [movie, setMovie] = useState('');
  const [industry, setIndustry] = useState('');

  const handleSubmit = () => {
    if (!movie.trim()) {
      toast('Please enter a movie name');
      return;
    }
    const instance = getGameInstance();
    instance.storage.saveSuggestion({
      movie: movie.trim(),
      industry,
      timestamp: Date.now(),
      sessionId: '',
    });
    toast("Thanks! We'll check it out.");
    onClose();
  };

  return (
    <div className="sheet-overlay open" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet">
        <div className="sheet-handle" aria-hidden="true" />
        <h2 className="sheet-title">Suggest a movie</h2>
        <p className="sheet-sub">We'll write a terrible plot description for it</p>
        <input className="form-input" placeholder="Movie name" value={movie} onChange={(e) => setMovie(e.target.value)} />
        <select className="form-input" value={industry} onChange={(e) => setIndustry(e.target.value)}>
          <option value="" disabled>Bollywood / Tollywood / Other</option>
          <option value="Bollywood">Bollywood</option>
          <option value="Tollywood">Tollywood</option>
          <option value="Other">Other</option>
        </select>
        <p className="form-hint">We read every suggestion. If we add it, you'll be in the credits.</p>
        <button className="btn-primary" onClick={handleSubmit}>Submit suggestion</button>
        <button className="btn-skip" onClick={onClose}>Maybe later</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 10: Create src/components/App.tsx**

```tsx
import { useState, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { getGameInstance } from '../hooks/gameInstance';
import { initPostHog, initAnalyticsSubscriber } from '../analytics/posthog';
import { HomeScreen } from './HomeScreen';
import { GameScreen } from './GameScreen';
import { ResultsScreen } from './ResultsScreen';
import { PlayerSetup } from './PlayerSetup';
import { TurnInterstitial } from './TurnInterstitial';
import { Toast } from './Toast';
import '../style.css';

export function App() {
  const { state } = useGameState();
  const [ready, setReady] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    const instance = getGameInstance();
    instance.init().then(() => {
      initPostHog();
      initAnalyticsSubscriber(instance.bus, '');
      setReady(true);
    });
  }, []);

  // Show setup sheet when FSM enters 'setup'
  useEffect(() => {
    setShowSetup(state === 'setup');
  }, [state]);

  if (!ready) return null;

  return (
    <>
      {state === 'home' && <HomeScreen />}
      {(state === 'playing' || state === 'flipped' || state === 'scoring') && <GameScreen />}
      {(state === 'turnChange' || state === 'continue') && <TurnInterstitial />}
      {state === 'results' && <ResultsScreen />}
      {showSetup && <PlayerSetup onClose={() => setShowSetup(false)} />}
      <Toast />
    </>
  );
}
```

- [ ] **Step 11: Update src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 12: Copy assets to public/**

```bash
mkdir -p public/assets
cp /Users/srinityaduppanapudisatya/Desktop/seedhaplot/assets/* public/assets/
```

- [ ] **Step 13: Run dev server and verify**

```bash
npm run dev
```

Expected: Home screen renders with cinema buttons, mode cards, hero text. Clicking Bollywood opens player setup sheet. Starting a game shows cards. Full game loop works.

- [ ] **Step 14: Commit**

```bash
git add src/components/ src/style.css src/main.tsx public/assets/
git commit -m "feat: add React UI components — full game loop

Dumb renderer pattern. All components receive state via useGameState
hook, dispatch actions via useGameActions. Visual design ported from
old/style.css. HomeScreen, GameScreen, Card, ResultsScreen,
PlayerSetup, TurnInterstitial, FeedbackSheet, SuggestSheet, Toast."
```

---

## Task 12: Abandon Detection + Keyboard Shortcuts

**Files:**
- Create: `src/hooks/useAbandonDetection.ts`
- Modify: `src/components/App.tsx`

- [ ] **Step 1: Create src/hooks/useAbandonDetection.ts**

```typescript
import { useEffect } from 'react';
import { getGameInstance } from './gameInstance';

const ABANDON_TIMEOUT = 30_000;

export function useAbandonDetection(): void {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const instance = getGameInstance();

    const fireAbandon = () => {
      const state = instance.fsm.getState();
      if (state === 'playing' || state === 'flipped' || state === 'scoring' || state === 'turnChange') {
        instance.endGame('abandon');
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        timer = setTimeout(fireAbandon, ABANDON_TIMEOUT);
      } else if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const handleBeforeUnload = () => fireAbandon();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Dismiss any open sheets — handled by sheet components
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('keydown', handleKeyDown);
      if (timer) clearTimeout(timer);
    };
  }, []);
}
```

- [ ] **Step 2: Add useAbandonDetection to App.tsx**

Add this import and call inside the App component:

```tsx
// Add import
import { useAbandonDetection } from '../hooks/useAbandonDetection';

// Add inside App component, after useEffect
useAbandonDetection();
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAbandonDetection.ts src/components/App.tsx
git commit -m "feat: add abandon detection and keyboard shortcuts

30s visibility timeout fires game_end with reason 'abandon'.
beforeunload fires immediately. Same behavior as old app.js."
```

---

## Task 13: Supabase CDN Script + Final Wiring

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add Supabase CDN script to index.html**

Add before the closing `</head>` tag:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
```

- [ ] **Step 2: Run full build and verify**

```bash
npm run build
npm run preview
```

Expected: Production build serves correctly. Game loop works end-to-end.

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: All core tests pass (eventBus, gameFSM, deckBuilder, scorer, localStorage).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add Supabase CDN and verify full build

Production build works end-to-end. All core tests passing."
```

---

## Task 14: Feature Parity Verification

**Files:** None — this is a manual verification task.

- [ ] **Step 1: Verify all game flows**

Test each flow manually:

1. **Party mode solo** — Select Bollywood → Start → Play through 12 cards → See results → Replay
2. **Party mode multiplayer** — Add 2 players → Play → Verify turn interstitial → Verify leaderboard
3. **Endless mode** — Select Endless → Play until 3 misses → Verify game ends → Verify high score
4. **Continue playing** — Party mode → Finish 12 cards → "Keep going?" → Continue → See results
5. **Exit mid-game** — Start game → Exit → Confirm → Back to home
6. **Feedback** — Open feedback sheet → Select tags → Submit → Toast appears
7. **Suggest movie** — Open suggest sheet → Enter movie → Submit → Toast appears
8. **Share** — Finish game → Share score → Verify clipboard text
9. **Offline** — Disconnect network → Verify app still works from cache

- [ ] **Step 2: Verify analytics**

Open PostHog and confirm events are landing:
- `game_start`, `card_view`, `card_flip`, `card_result`, `game_end`, `state_transition`

- [ ] **Step 3: Verify Supabase**

Check Supabase dashboard for new rows in `sessions`, `feedback`, `suggestions` tables.

- [ ] **Step 4: Commit any fixes found during verification**

```bash
git add -A
git commit -m "fix: feature parity fixes from manual verification"
```

---

## Task 15: Clean Up Old Files

**Files:**
- Delete: `old/` directory
- Delete: `cards.json` (replaced by content/packs/)
- Update: `.gitignore`

- [ ] **Step 1: Remove old files**

```bash
rm -rf old/
rm cards.json
```

- [ ] **Step 2: Update .gitignore**

Add to `.gitignore`:

```
dist/
node_modules/
.superpowers/
```

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: remove old vanilla JS files, clean up

Old app.js/index.html/style.css/sw.js removed. cards.json replaced
by content/packs/ system. Architecture migration complete."
```
