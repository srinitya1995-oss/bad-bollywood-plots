# System Architecture Spec — Bad Desi Plots

> Last updated: 2026-04-20. Canonical architecture reference. Companion docs:
> `product-spec.md`, `design-spec.md`, `engineering-spec.md`,
> `applied-scientist-spec.md`.

---

## 1. High-level picture

```
┌─────────────────────────────────────────────┐
│ Browser (React 18 PWA, TypeScript, Vite 5) │
│                                             │
│  HomeScreen ──┬──> PlayerSetup ──┐          │
│               │                  │          │
│               └─> (solo)         │          │
│                                  ▼          │
│  TurnInterstitial <──> GameScreen (Card)    │
│                             │               │
│                             ▼               │
│                       ResultsScreen         │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  gameFSM (single source of truth)   │   │
│  │  8 states, transition-gated         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  eventBus (pub/sub)                 │   │
│  │  subscribers: analytics, storage    │   │
│  └─────────────────────────────────────┘   │
└────────────┬────────────────────────────────┘
             │ fire-and-forget
             ▼
┌─────────────┬─────────────┬─────────────────┐
│  PostHog    │  Supabase   │  Netlify (SW)   │
│  (events)   │  (feedback) │  (PWA cache)    │
└─────────────┴─────────────┴─────────────────┘
```

## 2. Stack

| Layer | Technology | Version | Why |
|---|---|---|---|
| UI framework | React | 18.2 | Well-understood, massive ecosystem, hooks model fits our event-bus pattern |
| Build | Vite | 5.x | Fast dev, clean prod bundles, first-class PWA plugin |
| Language | TypeScript | 5.3 | Typed FSM + event bus prevents whole categories of bugs |
| Animation | Framer Motion | 12.x | Used sparingly; most motion is CSS keyframes |
| Backend DB | Supabase | free tier | Postgres + REST, anon key OK because writes are fire-and-forget, no auth |
| PWA | vite-plugin-pwa | 0.20 | Service worker + manifest generation |
| Testing | Vitest + Testing Library | 4.x + 16.x | Fast, Vite-native |
| Linting | ESLint + Prettier | 8.x + 3.x | Default Airbnb-ish config |
| Analytics | PostHog | via CDN + MCP | Event tracking, feature flags, product analytics |
| Hosting | Netlify | — | Static + PWA deploy with branch previews, see `netlify.toml` |

No backend server. No authentication. No user accounts. The only network writes are fire-and-forget analytics events to PostHog and optional feedback/suggestions to Supabase.

## 3. Source structure

```
src/
  core/
    types.ts          — Card, Player, GameSession, GameState, POINT_MAP
    gameFSM.ts        — finite state machine driving game flow (8 states)
    deckBuilder.ts    — shuffle, filter, build decks from cards.json
    contentLoader.ts  — fetch and parse card packs
    scorer.ts         — points, streaks, lives, verdicts
    adaptive.ts       — per-session no-repeat card selection
    eventBus.ts       — pub/sub for analytics and cross-cutting concerns
  hooks/
    gameInstance.ts   — singleton game instance
    useGameState.ts   — React hook bridging FSM state to UI
    useGameActions.ts — React hook exposing game actions
    useCardTextFit.ts — auto-fit plot text to locked card size
    useAbandonDetection.ts — detects tab close / app background / navigation
  components/
    App.tsx           — root component, FSM state router
    HomeScreen.tsx    — landing, mode selection
    PlayerSetup.tsx   — player name entry
    GameScreen.tsx    — main game loop (card + controls + pts float)
    Card.tsx          — flip card with front / back / picker
    TurnInterstitial.tsx — turn change overlay
    ResultsScreen.tsx — final scores, verdict, celebration
    MenuPopover.tsx   — in-game menu (end round, mode switch, how-to)
    EndRoundSheet.tsx — end-round confirmation bottom sheet
    FeedbackSheet.tsx — post-game feedback bottom sheet
    SuggestSheet.tsx  — movie suggestion bottom sheet
    ReportSheet.tsx   — card report bottom sheet
    HowToScreen.tsx   — rules overlay
    BgLayer.tsx       — photographic background + wash + bulb glow
    TopBand.tsx       — app-wide top navigation band
    Toast.tsx         — notification toasts
    ErrorBoundary.tsx — React error boundary
    SettingsScreen.tsx — settings (placeholder, minimal v2.1)
  storage/
    interface.ts      — StorageAdapter abstract interface
    localStorage.ts   — localStorage implementation
    supabase.ts       — Supabase fire-and-forget adapter
  analytics/
    posthog.ts        — PostHog event tracking as eventBus subscriber
  style.css           — all design tokens, global styles, component styles
  main.tsx            — React entry point

public/
  bg/                 — photographic backgrounds
  content/            — card pack JSON (copied from cards.json at build)
  icons/              — PWA icons
  manifest.webmanifest — PWA manifest (generated by vite-plugin-pwa)

tests/
  core/               — FSM, scorer, deckBuilder, adaptive, eventBus, contentLoader, types
  components/         — Card, HowTo, TurnInterstitial, Home, PlayerSetup, Results, Report

scripts/
  generate.js         — card generation pipeline (LLM + Wikipedia verify)
  audit-cards.js      — dedupe + field-validity check

docs/
  product-spec.md, design-spec.md, system-architecture-spec.md,
  engineering-spec.md, applied-scientist-spec.md,
  card-voice-rubric.md, full-redesign-prompt.md,
  phase1-new-cards-{bw,tw}-round{1,2}.json — staged card expansions

cards.json            — the card database (149 cards at v2.1.0)
```

## 4. Game FSM

Single source of truth for game flow. Defined in `src/core/gameFSM.ts`. Components subscribe via `useGameState` and dispatch via `useGameActions` — they never bypass the FSM.

### States (8)
1. `home` — landing screen, pre-game
2. `setup` — player setup overlay
3. `playing` — card front visible
4. `flipped` — card back visible with picker chips
5. `scoring` — transient, applying points + bonus
6. `turnChange` — Pass & Play interstitial (skipped in solo)
7. `continue` — transient, advancing to next card or moving to results
8. `results` — final scores screen

### Transition rules
- `home → setup` on mode pick
- `setup → playing` on LET'S GO
- `playing → flipped` on card tap
- `flipped → scoring` on picker click (solo: I GOT IT / NOPE; party: player chip or NOBODY)
- `scoring → turnChange` if party mode and more cards remain
- `scoring → continue → playing` if solo and lives remain
- `scoring → results` when lives hit zero (solo) or 12 cards played (party)
- `turnChange → playing` on tap-to-continue
- Any state `→ home` on abandon (menu → end round) or tab close (useAbandonDetection)
- `results → home` on HOME CTA
- `results → playing` (direct) on PLAY AGAIN — reuses current industry and mode

Invalid transitions emit to the event bus (`[FSM] Invalid transition: X → Y`) for analytics and fail-loud debugging. They do not crash the UI.

## 5. Event bus

`src/core/eventBus.ts` — tiny pub/sub. Not Redux, not Zustand. Motivation: analytics, storage writes, and future integrations should not be called directly from component code.

### Known events
- `game:started` — payload: `{ industry, mode, players }`
- `card:shown` — payload: `{ cardId, industry, difficulty, idx }`
- `card:flipped` — payload: `{ cardId, timeSinceShown }`
- `card:scored` — payload: `{ cardId, playerIdx, basePts, bonus, streak }`
- `card:missed` — payload: `{ cardId }`
- `card:reported` — payload: `{ cardId }`
- `round:ended` — payload: `{ reason: 'complete' | 'abandon', cardsPlayed, scores }`
- `feedback:submitted` — payload: `{ thumbs, note }`
- `suggestion:submitted` — payload: `{ movie, industry }`

### Subscribers
- `src/analytics/posthog.ts` — translates events to PostHog `capture()` calls
- `src/storage/supabase.ts` — writes feedback, suggestions, reports to Supabase tables
- Future: a subscriber per integration. Never let analytics live inside a component.

## 6. Storage adapter pattern

`src/storage/interface.ts` defines a minimal contract:
```ts
interface StorageAdapter {
  writeFeedback(payload): Promise<void>;
  writeSuggestion(payload): Promise<void>;
  writeReport(payload): Promise<void>;
}
```

Two implementations:
- `localStorage.ts` — dev fallback, stores drafts and session state
- `supabase.ts` — prod, fire-and-forget writes with `void fetch(...)` pattern

The game never awaits a storage write. If the network is down, the player never knows — their feedback is simply not persisted.

## 7. Card loading

Cards ship statically in `cards.json` at the repo root. At build, they're copied into `public/content/` and fetched by `contentLoader.ts` on first game start.

### Schema (per card)
```ts
{
  id: string;        // e.g. "bw001", "tw247"
  ind: 'HI' | 'TE';  // industry: Hindi (Bollywood) or Telugu (Tollywood)
  diff: 'easy' | 'medium' | 'hard';
  era: string;       // e.g. "2010s", "1990s"
  y: string;         // release year
  n: string;         // movie name
  f: string;         // fact / cast hint (shown on back)
  c: string;         // terrible plot description (shown on front)
}
```

### Rules
- Every card must have all fields. Missing fields fail the `audit-cards.js` gate.
- `c` (plot) must pass the voice rubric (`docs/card-voice-rubric.md`).
- `n` + `y` must match Wikipedia (verified by the fact-check pipeline).
- Difficulty targets: 40% easy, 35% medium, 25% hard across the deck.
- No duplicates by `id` OR by `n + y` pair.

### Deck building
`deckBuilder.ts` takes the full card pool, filters by industry pick (BW / TW / mixed), excludes `adaptive.ts` played IDs for this session, shuffles, and returns the next N cards. 12 for party, unbounded for solo (endless until lives run out).

## 8. PWA caching strategy

Managed by `vite-plugin-pwa` with default "generateSW" workbox config plus tuning in `vite.config.ts`.

### Cache behavior
- App shell (HTML, JS, CSS): precache on install, update on new service worker activation
- Cards (`/content/*.json`): precache
- Backgrounds (`/bg/*`): precache (they're a few hundred KB total)
- Icons: precache
- Fonts (Google Fonts): runtime cache with stale-while-revalidate

### Offline guarantee
After first successful load, the game is fully playable offline. Only feature that requires network: Supabase writes (feedback / suggestions / reports), which silently queue and drop on close (acceptable tradeoff for our volume).

## 9. Deployment pipeline

### Branches
- `main` — prod, auto-deploys to baddesiplots.com (legacy badbollywoodplots.com is a Netlify alias, 301s to the primary via `netlify.toml` rules)
- `ship/v*` — release branches, auto-deploy to Netlify deploy-previews
- Feature branches — PR to `ship/v*` first, not directly to main

### Per-push
- Netlify runs `npm run build` on a Linux runner
- Bundle + PWA assets pushed to Netlify CDN
- Prod deploy: `main` only, auto on merge
- Preview deploy: every PR gets a unique `deploy-preview-N--seedhaplot.netlify.app` URL

### Netlify config (`netlify.toml`)
- Build command: `npm run build`
- Publish dir: `dist`
- Node version pinned
- Redirect: all unmatched paths → `/index.html` (SPA)

### Release flow
1. Finish features on feature branches, merge to `ship/vX.Y.Z`
2. Test on Netlify deploy-preview (mobile + desktop)
3. Run gates: typecheck, test, build, visual QA
4. Open PR `ship/vX.Y.Z` → `main`
5. User re-tests preview, gives explicit approval (per `feedback_seedhaplot_no_prod_push.md`)
6. Squash-merge PR → Netlify deploys prod
7. Tag release + update changelog

## 10. Third-party services

### PostHog
- Project ID stored in `.env` → `VITE_POSTHOG_KEY`
- Client-side only, no server-side proxy
- Feature flags used sparingly (none active in v2.1)
- Events listed in `applied-scientist-spec.md`

### Supabase
- URL + anon key stored in `.env` → `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Three tables: `feedback`, `suggestions`, `reports`
- RLS policies: anon can INSERT only, no SELECT / UPDATE / DELETE
- No PII collected beyond user-entered feedback text
- Writes use the Supabase REST endpoint with fire-and-forget `void fetch()`

### Google Fonts
- Anton, Bebas Neue, Fraunces, DM Sans loaded via CSS `@import` in `src/style.css`
- Cached by the PWA service worker after first load

## 11. Security posture

- No authentication = no auth vulnerabilities
- No server = no server-side injection surface
- Supabase RLS = anon key can only write, not read or mutate
- PostHog anon key = OK to expose, that's its design
- Dependency scanning: `npm audit` on every install; `dependabot` watches for CVEs
- CSP: default Netlify settings; tighten if we ever accept user-submitted HTML (we don't)
- User data: names are local-only unless user submits feedback; feedback is the only stored user input

## 12. Performance budgets

| Metric | Target | Current (v2.1.0) |
|---|---|---|
| First Contentful Paint (3G) | < 2s | ~1.2s |
| Time to Interactive (3G) | < 3s | ~2.1s |
| JS bundle (gzipped) | < 80KB | 63KB |
| CSS bundle (gzipped) | < 20KB | 13.5KB |
| PWA precache total | < 500KB | 420KB |
| Lighthouse PWA | ≥ 90 | 95 |
| Lighthouse Performance (mobile) | ≥ 85 | 91 |

Budgets fail → build fails (enforced via Lighthouse CI hook in `/ship-playbook`).

## 13. Known architectural debt

Tracked so it doesn't get lost:

- `useAbandonDetection.ts` is heuristic, not deterministic. iOS Safari swiping-to-close does not always fire. If we ever needed precise "user left mid-round" telemetry, this needs a rewrite using `visibilitychange` + `pagehide` + `beforeunload`.
- `eventBus.ts` has no typed event names. Subscribers match on string. A typed discriminated-union event set would catch typos.
- `gameInstance.ts` is a singleton. Fine for now (one game at a time), but a future rewrite for spectator mode or multiple concurrent games would need rethinking.
- Card rendering uses an auto-fit JS measurement (`useCardTextFit.ts`) because CSS container queries weren't reliable enough in 2026-early Safari. If / when they stabilize, the hook can go away.
- Fonts load from Google Fonts CDN. A future hardening would self-host the four families with `font-display: swap` + preload.

## 14. Don't touch list

Settled decisions. Do not change without explicit user approval.

- `src/core/gameFSM.ts` state names and transitions — the FSM is tested and stable
- `src/core/types.ts` Card interface — card generation scripts depend on it
- Card flip timing (`0.62s`, overshoot easing) — validated by user testing
- Red / green glow card design — validated by user testing
- `vite.config.ts` PWA configuration — service worker caching strategy is tuned
- `scripts/generate.js` — card generation pipeline, changes require full card re-audit

## 15. Future architectural questions

For v3+ planning:

- Should we add a shared-round mode (all devices see the same card at once via WebRTC signaling)?
- Should we add a server-side component to handle richer social features (rivalries, shared rounds, daily card)?
- If we localize Hindi / Telugu UI, where does the i18n layer sit (runtime lookup vs build-time code-split bundles)?
- If decks grow past 2000 cards, do we split into code-chunked packs loaded on demand vs keep one big JSON?
