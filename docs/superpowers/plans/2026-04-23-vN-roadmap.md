# Bad Desi Plots v3.0 Roadmap ("vN")

> **For agentic workers:** This is a multi-phase roadmap. Each phase gets its own executable plan file (see below). Start at Phase 0. Do NOT attempt to execute this roadmap file directly.

**Goal:** Evolve Bad Desi Plots from a trivia quiz into a party game that produces shareable stories. Ship back-end, data, game-engine, science, and quality work for v3.0 across 7 gated phases. Frontend work is owned by the user.

**Version:** v2.2.0 → v3.0.0 (major bump; mechanics change)

**Scope boundary:** This roadmap covers engineering, applied science, system architecture, data, analytics, quality, and tests. Frontend component work (JSX, CSS, motion) is out of scope and owned by the user.

**Reading order before execution:**
1. This roadmap
2. `CLAUDE.md` §1-10 (STOP & THINK + gates)
3. `docs/product-spec.md`, `docs/system-architecture-spec.md`, `docs/engineering-spec.md`, `docs/applied-scientist-spec.md`
4. The current phase's plan file in this directory

---

## 1. Thesis (one paragraph)

The current game loop is passive: a reader reads a plot, the room guesses verbally, the reader taps correct on the honour system. This produces a score but not a story. v3 adds pressure (timer), verification (guess capture), asymmetric player-decisions (reader strategy), social artifacts (generated share card), a retention beat (daily plot + streak), meta-identity (Bollywood persona), and true network growth (async WhatsApp challenge). All of this lives behind feature flags so each phase ships to prod dark, gets measured, and stays or reverts.

## 2. Non-negotiables (apply to every phase)

- **No destructive migrations.** All schema changes are additive. Old clients continue to work for the whole rollout window.
- **Every new surface is flagged.** Default-off feature flag in PostHog. Only the flag's owner flips it to `on` once gates pass.
- **Every new event is typed.** No untyped `capture(...)` calls. Add to `track.*` wrappers in `src/analytics/posthog.ts` or to the typed bus in `src/core/eventBus.ts`.
- **Every phase is shippable alone.** No phase may depend on an unshipped phase. Phases are ordered by dependency, not by priority.
- **Tests lead.** Every task writes a failing test first. No production code without a test that fails before the code exists.
- **No PII.** Player names are local-only. Session ids are random UUIDs. Typed guesses stored for analytics must be truncated to 200 chars and stripped of anything that looks like an email or phone before write.
- **Prod pushes gated by user.** Migrations applied to prod DB and flags flipped to `on` require an explicit go from the user, per `feedback_seedhaplot_no_prod_push.md`.

## 3. The seven phases

| # | Phase | Ships | Plan file (to create when entering phase) |
|---|-------|-------|--------------------------------------------|
| 0 | Data & Telemetry Foundation | Backend schema, storage methods, event schema, flags | `2026-04-23-vN-phase-0-data-foundation.md` (**included below as first plan**) |
| 1 | Timer + Guess Engine | Game FSM extension, fuzzy-match library, typed-guess capture | `2026-04-23-vN-phase-1-timer-guess.md` |
| 2 | Reader Strategy | 3-option reader menu, scoring changes, telemetry | `2026-04-23-vN-phase-2-reader-strategy.md` |
| 3 | Share Card Generator | Server-rendered 1080x1080 PNG via Supabase Edge Function | `2026-04-23-vN-phase-3-share-card.md` |
| 4 | Daily Plot + Streak | Daily card selector, streak counter, shareable grid | `2026-04-23-vN-phase-4-daily-plot.md` |
| 5 | Persona Engine | Client-side archetype classifier from play history | `2026-04-23-vN-phase-5-persona.md` |
| 6 | Async Challenge + Two-Phone Sync | Challenge deck storage, WhatsApp deep link, realtime pairing | `2026-04-23-vN-phase-6-network-modes.md` |

Phases 1-5 are linearly ordered by dependency. Phase 6 may happen in parallel with Phase 4 or 5 once Phase 0 is done.

### Dependency graph

```
Phase 0 ──┬──> Phase 1 ──> Phase 2 ──> Phase 3
          │                               │
          ├──> Phase 4 ───────────────────┤
          │                               │
          ├──> Phase 5                    │
          │                               │
          └──> Phase 6 (can run parallel with 4/5)
```

## 4. Phase gates

Every phase must clear the gates below before being marked Done.

### Gate A: Spec alignment
- Each task cites the REQ from the game-design critique brief (REQ-1 through REQ-10) and the CLAUDE.md spec section it relates to.

### Gate B: Integration
- `npm run typecheck` → zero errors
- `npm run test -- --run` → all tests pass (+ new tests for the phase)
- `npm run build` → clean
- `npm run lint` → zero warnings

### Gate C: Data integrity
- New migrations applied to a dev Supabase project.
- Round-trip test: write → read → assertion for every new table.
- RLS verified: anon can `INSERT` only, `service_role` can `SELECT`.

### Gate D: Observability
- Every new user-visible action emits a typed analytics event.
- The event is visible in PostHog "Live events" inside 2 minutes of the test.

### Gate E: Rollout readiness
- Feature flag exists in PostHog, default OFF.
- Kill-switch tested: flip flag off, old behavior returns within one page load.
- Runbook note added to the phase plan: what to watch on the dashboard for the first 24h.

## 5. Cross-cutting data contracts

These apply across every phase. Defined here so the seven plans reference a single source of truth.

### 5.1 Canonical `session_id`

Unchanged from v2: random UUID created at first app load, persisted in `localStorage.sess_id`. All new tables reference it verbatim. Never hashed, never emailed.

### 5.2 Canonical `card_id`

The existing `bw<n>` / `tw<n>` / `hi<n>` / `te<n>` string ids from `cards.json`. Treat as opaque text. Never parse substrings for industry; use the `ind` column or derive from the card lookup.

### 5.3 New types to land in Phase 0

```ts
// src/core/types.ts — add after existing types

export type GuessOutcome = 'correct' | 'close' | 'wrong' | 'timeout' | 'skipped';

export interface GuessAttempt {
  cardId: string;
  attemptIdx: 0 | 1 | 2;   // up to 3 typed guesses per card
  raw: string;             // what the user typed, truncated to 200 chars
  normalized: string;      // lowercase, stripped, collapsed whitespace
  outcome: GuessOutcome;
  msFromFlip: number;      // time since card revealed
  sessionId: string;
}

export type CardReaction = 'fire' | 'meh' | 'confused';

export interface CardReactionEntry {
  cardId: string;
  reaction: CardReaction;
  sessionId: string;
  timestamp: number;
}

export interface DailyPlot {
  playedAt: string;        // YYYY-MM-DD in IST
  cardId: string;
  attempts: number;        // 1-3
  outcome: GuessOutcome;
  sessionId: string;
}

export interface DailyStreak {
  sessionId: string;
  currentStreak: number;
  longestStreak: number;
  lastPlayed: string;      // YYYY-MM-DD in IST
}

export type PersonaId =
  | 'gossip_monger'
  | 'chai_uncle'
  | 'film_school_brat'
  | 'nri'
  | 'multiplex_regular'
  | 'festival_scout'
  | 'undiscovered';

export interface PersonaAssignment {
  sessionId: string;
  personaId: PersonaId;
  confidence: number;      // 0.0 - 1.0
  evidence: {              // small counts, not full history
    samplesSeen: number;
    bestDecade: string;
    bestIndustry: Industry;
    weakestCell: string;   // e.g. "TE-2010s"
  };
  computedAt: number;
}

export interface ChallengeDeck {
  code: string;            // 4-char uppercase alphanumeric
  creatorSession: string;
  cardIds: string[];       // exactly 5
  createdAt: number;
  expiresAt: number;       // createdAt + 7 days
}

export interface ChallengeResult {
  code: string;
  playerSession: string;
  correctCount: number;
  totalMs: number;
  completedAt: number;
}
```

### 5.4 New PostHog events

All events carry `{ session, ts }` from the existing `capture()` wrapper. Phase-owning events below:

| Event name | Phase | Props |
|---|---|---|
| `guess_captured` | 1 | `cardId, attemptIdx, outcome, msFromFlip` |
| `guess_timeout` | 1 | `cardId, attempts` |
| `reader_strategy_picked` | 2 | `cardId, choice` (`straight`/`dramatic`/`burn`) |
| `reader_strategy_resolved` | 2 | `cardId, choice, outcome, roomBonus` |
| `card_reacted` | 1 | `cardId, reaction` |
| `share_card_generated` | 3 | `cardId, kind` (`session_fail`/`daily`) |
| `share_card_channel` | 3 | `channel, kind` (extends existing `results_share`) |
| `daily_plot_viewed` | 4 | `playedAt` |
| `daily_plot_attempted` | 4 | `playedAt, attemptIdx, outcome` |
| `daily_streak_broken` | 4 | `lastStreak` |
| `persona_assigned` | 5 | `personaId, confidence, samplesSeen` |
| `challenge_created` | 6 | `code, cardCount` |
| `challenge_opened` | 6 | `code` |
| `challenge_completed` | 6 | `code, creatorCorrect, playerCorrect, ms` |
| `two_phone_pair_requested` | 6 | `code` |
| `two_phone_paired` | 6 | `code, latencyMs` |

### 5.5 New feature flags

| Flag | Default | Owner phase | Purpose |
|---|---|---|---|
| `v3_guess_capture` | off | 1 | Enables typed-guess UI + fuzzy match |
| `v3_timer` | off | 1 | Enables per-card countdown |
| `v3_reader_strategy` | off | 2 | Enables 3-option reader menu |
| `v3_share_card_image` | off | 3 | Enables generated PNG share |
| `v3_daily_plot` | off | 4 | Enables daily card + streak |
| `v3_persona` | off | 5 | Enables persona surface on home |
| `v3_async_challenge` | off | 6 | Enables deck challenges |
| `v3_two_phone` | off | 6 | Enables realtime pairing |

All eight get seeded during Phase 0 so later phases can gate from day one.

## 6. Science + data workstreams (what the applied scientist owns)

### 6.1 Fuzzy-match (Phase 1)
- Client-side, pure-TS, zero network.
- Input: typed guess, canonical movie name + aliases.
- Transforms: lowercase, strip punctuation, collapse whitespace, ASCII-fold common transliterations ("baahubali" matches "bahubali", "sholay" matches "sholey").
- Compare: Levenshtein ratio via the `js-levenshtein` package (2.2 KB, zero deps).
- Thresholds: ratio >= 0.92 → `correct`, 0.75-0.91 → `close` (prompts "did you mean..."), <0.75 → `wrong`.
- Eval set: the 355 canonical movies + 2 common misspellings each = 710 test pairs, live in `tests/fuzzy/golden.json`.

### 6.2 Persona classifier (Phase 5)
- Runs locally, zero server dependency for v3.0.
- Input: last 50 guess outcomes grouped by decade × industry.
- Features: accuracy rate per (decade, industry) cell, guess speed bucket (fast/med/slow), fire-reaction rate.
- Rules-based mapping (no ML): deterministic thresholds select one of 7 personas + `undiscovered` fallback for fewer than 15 samples.
- Evaluation: hand-label 30 historical session logs, target >= 0.70 agreement between rules and hand-labels. Codified in `tests/persona/eval.ts`.

### 6.3 Card health aggregation (ongoing, starts Phase 1)
- Supabase view `card_health_v` computed from `card_reactions` + `guess_log`:
  - `fire_rate = fires / (fires + mehs + confused)`
  - `stump_rate = timeouts / attempts`
  - `rewrite_flag = fire_rate < 0.20 AND samples >= 30`
- Read by the internal admin page (user-facing, no public auth), NOT by the game client.
- The `seedhaplot-card-auditor` skill consumes this view for weekly card-voice passes.

### 6.4 Daily-plot selection (Phase 4)
- Deterministic: `cardId = sha256(date + salt) % len(hardDeck)`.
- Salt stored as Supabase secret so pre-computing the schedule a month ahead is easy.
- Repeat window: no card reappears within 180 days.

## 7. Architecture changes (system architect owns)

- **Supabase Edge Functions introduced.** First function in Phase 3 (`share-card`). Second in Phase 4 (`daily-plot`). Third in Phase 6 (`challenge-resolve`). Functions live in `supabase/functions/`.
- **New realtime channel (Phase 6).** Supabase Realtime Postgres Changes on `challenges` + a lightweight presence channel for two-phone pairing. No WebRTC needed.
- **Storage adapter extended, not replaced.** `src/storage/interface.ts` grows by seven methods; `localStorage.ts` and `supabase.ts` both implement them. Adapter pattern stays.
- **Game FSM extended, not replaced.** New states added in Phase 1 (`awaiting-guess`, `guess-resolved`) between `flipped` and `scoring`. Existing states and transitions untouched per `CLAUDE.md §12 Don't Touch List`.
- **No new frontend framework.** Stays React 18 + Vite. No SWR, no Redux, no Zustand. Game state already lives in the FSM + event bus.
- **No auth system.** Anonymous session-id continues to be the only identity. Streaks + personas keyed off it.

## 8. Efficiency workstream

Bundle budget stays at 200 KB gzipped JS. Each phase adds < 10 KB gzipped:

| Phase | New deps | Expected JS delta (gz) |
|---|---|---|
| 0 | none | ~0 KB (types + no-op storage methods) |
| 1 | `js-levenshtein@1.2.0` | ~1.5 KB |
| 2 | none | ~0.5 KB |
| 3 | none (server-rendered) | ~0.2 KB (client just requests URL) |
| 4 | none | ~1 KB |
| 5 | none | ~1 KB |
| 6 | `@supabase/supabase-js` Realtime module | ~5 KB |

**Total delta budget:** 9.2 KB gzipped over v2.2 baseline of 56 KB → v3 target 65 KB gzipped.

## 9. Quality + testing workstream (QA owns)

- **Test coverage floor raised to 80% for `src/core/**`.** Enforced via `vitest.config.ts` coverage threshold.
- **New test file per phase under `tests/v3/phase-<n>/`.** Phases do not share test files.
- **Golden-file tests for fuzzy-match (Phase 1) and persona classifier (Phase 5).** See §6.
- **Edge Function integration tests.** Use `supabase functions serve` locally, call with `fetch`, assert response shape + status.
- **No `any` types** in any new file. Lint rule `@typescript-eslint/no-explicit-any` set to `error` for `src/**/*.v3.ts` files.
- **Migration dry-run in CI.** `scripts/migrations-dryrun.sh` applies each new migration to a throwaway Postgres container and rolls back. Runs on every PR.

## 9b. Parked ideas (promote to REQs when ready)

### REQ-11: Cinema Jail / FIR results (parked 2026-04-23)

Reimagine the Results screen as a First Information Report filed against the losing counsel. Winner is acquitted. Everyone else is sentenced to cinema dares, scaled to how badly they lost. Rank 2 gets 1 act of penance. Rank 3 gets 2. Last place gets 3.

**Mechanic**
- Dare severity is a function of `(idx in sorted players) × (miss rate)`, mapped to buckets 1 / 2 / 3.
- Dares come from a new `dares.json` content database (target 200-400 entries) with fields:
  - `id`
  - `text` (the actual dare, one or two beats, voice-fingerprint compliant)
  - `severity` (1 / 2 / 3)
  - `tags` (e.g., `hindi`, `telugu`, `sing`, `perform`, `memory`, `silence`, `family-safe`)
  - `era` (2000s / 2010s / 2020s / classic)
- Each sentenced player gets `severity` dares, randomly drawn from that bucket, filtered by deck industry.
- Winner sees "ACQUITTED. No cinema dare." Verdict plate. No dare.
- Dares must pass the Q19 NO list. No anti-feminist dares. No family-rude dares. No caste content.

**Shareable artifact**
- Replaces the current session share card (REQ-4) for party mode.
- Server-rendered PNG (Phase 3) renders the FIR form with filled fields: FIR no., date, time, bench, the accused, their verdict, their dare.
- "Share the FIR" becomes the default share action.
- Copy voice is legal-document register: "Convicted", "Released on bond", "Two cinema-years", "Filed and stamped". Drily amused grandma in a police uniform.

**Engineering surface (non-frontend)**
- New content file: `dares.json` at repo root, same pattern as `cards.json`.
- New core module: `src/core/sentencer.ts` which takes `GameSession + Player[]` and returns `{ playerId: string, dareId: string | null }[]`.
- New types in `src/core/types.ts`: `Dare`, `Sentence`, `Verdict`.
- New storage method: `saveSentence(sessionId, playerId, dareId, completed: boolean)` for both localStorage and Supabase.
- New Supabase table: `sentences (session_id, player_idx, dare_id, severity, completed, created_at)`.
- New analytics events: `sentence_assigned`, `sentence_shared`, `sentence_marked_complete`.
- New feature flag: `v3_cinema_jail` (default off).

**Content pipeline**
- The existing `seedhaplot-card-auditor` skill gets a sibling: `seedhaplot-dare-auditor` applying the Q19 NO list plus the two-beat rule.
- First dare set seeded by owner + generator run, 50-100 entries. Expand after first ship.

**Sequencing**
- Depends on Phase 0 (data foundation) and Phase 3 (share card generator).
- Ships as Phase 2.5 or rolls into Phase 3, reviewer's call when Phase 3 is being planned.
- Do NOT cut Phase 2 reader-strategy to make room. Both can land in v3.

**Why this matters to the thesis**
- This is the single cleanest answer to §1 Thesis "every card must produce a story." The dare IS the story. Losing becomes memorable. The phone doing the sentencing removes social friction (nobody has to dare their cousin personally).
- The FIR is an IP-safe, culturally-legible visual frame. Form-paper, olive file-green, rubber-stamp red, handwritten sindoor pen are the art direction locks.
- Share-the-FIR is the viral loop REQ-4 always wanted. You don't share a score; you share Arjun being sentenced to perform Chulbul Pandey's entry walk as Robert De Niro. That gets screenshotted.

---

## 10. What's explicitly out of scope for v3.0

- Account system / login
- In-app friend graph
- Push notifications (web push, iOS push)
- Payments, coins, cosmetics
- Offline multiplayer beyond pass-and-play
- Tamil/Malayalam industries (they stay `comingSoon: true` from `types.ts`)
- Card generation pipeline changes (handled separately by the content team)
- Any frontend component work (owned by the user)

## 11. Execution order

1. User approves this roadmap (or edits it).
2. Execute `2026-04-23-vN-phase-0-data-foundation.md` (Phase 0 — this same folder).
3. Gate Phase 0 against §4. Land on `main` behind default-off flags.
4. For each later phase: write that phase's plan file, execute it, gate it, land it, flip its flag to on ramped `5% → 25% → 100%` across ~1 week.

---

## 12. Self-review checklist (for the author, filled in on save)

- [x] Every REQ-1 through REQ-10 has a phase assignment (see §3)
- [x] No placeholders in this roadmap
- [x] Frontend work is called out as out-of-scope (§2, §10)
- [x] Every new table has a migration phase (0) and consumer phase
- [x] Bundle budget exists (§8)
- [x] Test strategy exists (§9)
- [x] Feature flag strategy exists (§5.5)
- [x] Data contracts are typed in one place (§5.3)
- [x] No em dashes (global rule per memory)

End of roadmap.
