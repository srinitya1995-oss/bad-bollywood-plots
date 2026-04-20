# CLAUDE.md — Seedha Plot (Bad Plots: The Desi Party Game)

> This file is the brain for every Claude Code session. Read it top-to-bottom before touching anything.

---

## 1. First Thing: Read State + Vision

Before writing a single line of code, ingest these files in order:

1. `.project-state.md` — current sprint, blockers, what shipped last session
2. `docs/product-spec.md` — what we're building, for whom, why, roadmap
3. `docs/design-spec.md` — v8 visual language, tokens, components, motion vocabulary
4. `docs/system-architecture-spec.md` — FSM, event bus, storage, deployment
5. `docs/engineering-spec.md` — conventions, gates, PR workflow, anti-patterns
6. `docs/applied-scientist-spec.md` — analytics schema, metrics, experiments, content quality
7. `inspiration/` — 20 reference images defining the visual target
8. `cards.json` — the card database (BW + TW entries with difficulty, era, plot descriptions)
9. `src/style.css` — live design tokens (`:root` block is the source of truth)
10. `src/core/types.ts` — canonical type definitions for Card, Player, GameSession, GameState FSM

If `.project-state.md` does not exist, create it from the git log and current file inventory before proceeding.

### Companion docs (read as needed per task)
- `docs/full-redesign-prompt.md` — design brief history (kept for reference; design-spec.md supersedes)
- `docs/card-voice-rubric.md` — card content voice gate
- `docs/prod-readiness-2026-04-17.md` — last pre-ship audit snapshot
- `docs/phase1-new-cards-*.json` — staged card expansion batches (v2.2 pipeline)

---

## 2. STOP & THINK Protocol

Before executing ANY task, run this checklist silently:

1. **Scan inventory** — What files exist? What agents/skills are available? What MCPs are connected?
2. **Assess quality bar** — Is this a quick fix or a design-critical surface? If design-critical, engage Visual Gate.
3. **Assess model fit** — Am I the right tool for this? Would a specialized agent (visual-qa, player-simulator) do better?
4. **Assess efficiency** — Can I batch this with other pending work? Will this change break dependents?
5. **Output toolchain plan** — State which playbook, agents, and skills you will use.
6. **Wait for approval** — If the task is destructive (deleting files, rewriting core modules, changing card data), pause and confirm with the user. If the user has said "go build" or "full autonomy", skip this step.

This protocol prevents wasted cycles. Never skip it.

---

## 3. Project Identity

### What It Is
Seedha Plot (shipped as "Bad Plots") is a desi party trivia game. Players guess Bollywood and Tollywood movies from intentionally terrible plot descriptions. It is a React 18 + Vite + TypeScript PWA designed for phones-first, played at house parties, Diwali gatherings, and chai sessions.

### Audience
- 18-35 year old desis (India + diaspora)
- Bollywood/Tollywood fans who argue about movies at every gathering
- Party game lovers (Codenames, Wavelength energy)

### Design Metaphor
**"A Bollywood poster in a Rajasthan palace."** Rich, ornate, loud in the right places, but navigable. The app should feel like walking into a haveli decorated for a filmi mela — gold leaf, deep reds, jewel tones, theatrical typography — but with the interaction clarity of a modern card game app.

### Design Philosophy: Masala Mix
- **Maximalist aesthetics** — desi ornamental richness, no sterile minimalism
- **Minimalist UX** — zero learning curve, tap-to-play, no tutorials needed
- **Theatrical reveal** — every card flip is a moment; the answer reveal is the punchline
- **Cultural authenticity** — patterns, colors, and language choices that feel genuinely desi, not "Indian-themed by someone who Googled it"

### Color System (7 Core Tokens)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#1A0F0A` | App background, deep warm brown-black |
| `--card-bw` | `#E85D3A` | Bollywood card accent (flame orange-red) |
| `--card-tw` | `#3EA87A` | Tollywood card accent (emerald green) |
| `--gold` | `#F2A72E` | Highlights, scores, gold leaf accents |
| `--cream` | `#F5E8D4` | Primary text, paper tone |
| `--ink` | `#1A0F0A` | Text on light surfaces |
| `--glow-bw` / `--glow-tw` | `rgba(232,93,58,0.35)` / `rgba(62,168,122,0.35)` | Card glow halos |

**Extended palette** (in `style.css`): `--flame-bright`, `--saffron`, `--emerald-bright`, `--mauve`, `--ink-muted`, `--paper-dim`.

### Color Rules
- BW cards always use `--card-bw` family. TW cards always use `--card-tw` family. Never mix.
- Glow intensity scales with difficulty: easy = 0.2 opacity, medium = 0.35, hard = 0.5.
- Gold is reserved for scores, streaks, and celebration moments. Do not use gold for navigation.
- `--cream` on `--bg` is the default text pairing. Minimum contrast ratio 7:1.
- Never use pure white (`#fff`) or pure black (`#000`) anywhere in the app.

### Typography
- **Display**: Playfair Display (titles, card movie names, score numbers)
- **Body**: DM Sans (UI text, descriptions, buttons, labels)
- **Scale**: `--text-xs: 12px`, `--text-sm: 14px`, `--text-base: 16px`, `--text-lg: 20px`, `--text-xl: 24px`, `--text-2xl: 32px`, `--text-3xl: 48px`
- Playfair only at `--text-xl` and above. DM Sans for everything else.
- Line height: 1.2 for display, 1.5 for body. Letter-spacing: -0.02em for display, 0 for body.

### Ornament System
- Use real SVG/image ornaments inspired by Rajasthani jharokha arches, mehendi patterns, and filmi poster borders.
- CSS-only ornaments (box-shadows, gradients pretending to be decorations) are banned. If it doesn't look like it belongs on a Bollywood poster, it doesn't ship.
- Ornaments are decorative only — never interactive, never blocking content.
- Keep ornament file sizes under 10KB SVG each. Inline critical ornaments, lazy-load the rest.

### Card Design Specs
- Max width: `360px`. Centered on screen. Responsive down to `320px` viewport.
- Flip animation: `0.4s` duration, cubic-bezier overshoot (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
- Front face: industry badge + difficulty indicator + terrible plot description.
- Back face: movie name (Playfair Display, large), year, cast hint.
- Glow: `box-shadow` halo using `--glow-bw` or `--glow-tw`, pulsing on hard cards.
- Cards have a worn-paper texture background (CSS or subtle image overlay).
- Red glow cards and fast flip timing have been validated by user testing. Do not change.

### Logo
- SVG at `/assets/logo.svg`. Used in PWA manifest, home screen, splash.
- Do not rasterize. Keep as vector for all sizes.

---

## 4. Available Agents

### Project-Specific Agents
| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `seedhaplot-visual-qa` | Screenshot-based visual quality audit | After any UI change, before presenting to user |
| `seedhaplot-player-simulator` | Simulates a real play session to catch UX issues | After game flow changes, card additions, FSM edits |
| `seedhaplot-panel` | Multi-perspective review panel (designer + player + engineer) | Major feature reviews, pre-ship audits |

### Shared Creative Agents
| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `creative-designer` | Visual exploration, mood boards, design concepts | When exploring new visual directions |
| `designer` | Production design implementation | Translating approved designs into code |
| `karen` | Harsh user perspective, finds UX pain points | Devil's advocate review before shipping |
| `jenny` | Friendly first-time user perspective | Onboarding and discoverability testing |

### Engineering Agents
| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `code-quality-pragmatist` | Code review focused on pragmatic quality | PR-level reviews, refactoring decisions |
| `task-completion-validator` | Verifies all subtasks of a complex task are done | End of multi-step task execution |
| `ui-comprehensive-tester` | Tests ALL screens after ANY change | Post-implementation verification |
| `accesslint:reviewer` | WCAG accessibility compliance | Color changes, new interactive elements |
| `documentation-expert` | Docs, changelogs, README updates | When docs need updating |

### Utility Agents
| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `Explore` | Broad codebase exploration and understanding | Onboarding, understanding unfamiliar areas |
| `Plan` | Task decomposition and planning | Complex multi-file changes |
| `general-purpose` | Catch-all for tasks that don't fit a specialist | Ad hoc requests |

---

## 5. Quality Gates

Every change must pass through applicable gates before being presented to the user.

### Gate 1: Spec Gate
- Does this change align with the design metaphor ("Bollywood poster in Rajasthan palace")?
- Does it use the correct tokens from the color system?
- Does it follow the typography rules (Playfair for display, DM Sans for body)?
- Does it respect the ornament system (real graphics, not CSS hacks)?
- **Verdict**: `SPEC_PASS` or `SPEC_FAIL: [reason]`

### Gate 2: Implementation Gate
- TypeScript compiles with zero errors (`npm run typecheck`)
- No `any` types unless explicitly justified with a `// SAFETY:` comment
- All new functions have JSDoc or inline comments explaining intent
- No dead code, no commented-out blocks, no TODO without a linked issue
- **Verdict**: `IMPL_PASS` or `IMPL_FAIL: [reason]`

### Gate 3: Visual Gate
- Run `seedhaplot-visual-qa` agent on affected screens
- Score must be >= 7.0 / 10.0 to pass
- Scoring rubric: color correctness (2pts), typography (2pts), spacing/alignment (2pts), ornament quality (2pts), overall feel against Bollywood poster target (2pts)
- If score < 7.0, iterate before presenting. Do not show the user a 6.
- **Verdict**: `VISUAL_PASS [score]` or `VISUAL_FAIL [score]: [feedback]`

### Gate 4: Integration Gate
Run all four checks. All must pass.
```bash
npm run typecheck    # Zero errors
npm run test         # All tests pass
npm run build        # Clean production build
npm run lint         # Zero warnings (errors are blockers)
```
- Lighthouse PWA audit score >= 90 on mobile
- **Verdict**: `INTEGRATION_PASS` or `INTEGRATION_FAIL: [which check failed]`

### Escalation Rules
- If any gate fails twice on the same issue, stop and report to the user with the failure details.
- Never silently downgrade a gate (e.g., "it's close enough to 7.0"). Either it passes or it doesn't.
- Gate results are logged in `.project-state.md` under the current session.

### Anti-patterns in Gating
- Skipping Visual Gate because "it's just a small CSS change" — small CSS changes break designs
- Running Integration Gate only at the end of a session — run it after every meaningful commit
- Marking SPEC_PASS without actually checking the design spec — read the spec every time

---

## 6. Playbooks

### `/ui-playbook` — UI Implementation Pipeline
1. Read the design spec section for the target component
2. Check `inspiration/` for visual reference
3. Implement using tokens from `style.css` (never hardcode colors)
4. Run `seedhaplot-visual-qa` on the result
5. Run `ui-comprehensive-tester` on ALL 10 screens (not just the changed one)
6. Pass Visual Gate (>= 7.0) and Integration Gate
7. Update `.project-state.md`

### `/fix-playbook` — Bug Fix Pipeline
1. Reproduce the bug (describe steps, expected vs actual)
2. Grep all consumers of the affected code (`grep -r "functionName" src/`)
3. Fix the root cause, not the symptom
4. Write or update a test covering the fix
5. Run `ui-comprehensive-tester` on all screens
6. Pass Integration Gate
7. Update `.project-state.md`

### `/review-playbook` — Code Review Pipeline
1. Run `code-quality-pragmatist` on the diff
2. Run `accesslint:reviewer` on any UI changes
3. Run `karen` for UX pain points
4. Run `jenny` for first-time user perspective
5. Compile verdicts into a review summary with PASS/FAIL per gate
6. If any FAIL, list specific remediation steps

### `/ship-playbook` — Pre-Ship Checklist
1. Run ALL four quality gates on the entire app
2. Run `seedhaplot-player-simulator` for a full play-through (BW easy, TW hard, party mode)
3. Run `seedhaplot-panel` for multi-perspective review
4. Verify PWA manifest, service worker, offline mode
5. Check `cards.json` for duplicates (run `node scripts/audit-cards.js`)
6. Build production bundle, check bundle size (< 200KB gzipped JS)
7. Update version in `package.json`
8. Write changelog entry
9. Update `.project-state.md` with ship date and version

### `/plan-playbook` — Task Planning Pipeline
1. Read `.project-state.md` for current context
2. Decompose the request into atomic tasks (max 5-6 per agent)
3. Identify which agents handle which tasks (domain separation)
4. Identify dependencies between tasks (what blocks what)
5. Output a numbered plan with agent assignments
6. Wait for user approval before executing

### `/card-quality` — Card Content Quality Pipeline
1. Run `node scripts/audit-cards.js` to check for duplicates, missing fields, format issues
2. Verify difficulty distribution (target: 40% easy, 35% medium, 25% hard)
3. Verify industry distribution matches the game's BW/TW balance
4. Check plot descriptions for humor quality (no lazy descriptions, no spoilers)
5. Verify movie names, years, and cast hints are accurate
6. Run `seedhaplot-player-simulator` on new cards specifically

### `/click-test-playbook` — Interaction Testing Pipeline
1. Map all interactive elements on the target screen
2. Test each tap/click target (minimum 44x44px touch targets)
3. Test card flip animation (0.4s, overshoot curve, no jank)
4. Test screen transitions (no flash, no layout shift)
5. Test edge cases: rapid taps, back button, orientation change
6. Test on mobile viewport (375px width minimum)
7. Report any interaction that feels sluggish (> 100ms response)

### `/context-bridge` — Session Handoff Pipeline
1. Read `.project-state.md` completely
2. Read last 10 git commits (`git log --oneline -10`)
3. Read this `CLAUDE.md` top-to-bottom
4. Identify any in-progress work (branches, uncommitted changes)
5. Summarize: what was done, what's next, what's blocked
6. Output a ready-to-go context summary for the new session

---

## 7. Tool Routing Table

| Task Type | Playbook | Primary Agent(s) | Skills/MCPs |
|-----------|----------|-------------------|-------------|
| New UI component | `/ui-playbook` | `designer`, `seedhaplot-visual-qa` | 21st Magic for component inspiration |
| UI redesign | `/ui-playbook` | `creative-designer`, `designer`, `seedhaplot-panel` | 21st Magic, AccessLint |
| Bug fix | `/fix-playbook` | `code-quality-pragmatist` | Sequential Thinking |
| Card flip issue | `/fix-playbook` + `/click-test-playbook` | `seedhaplot-player-simulator` | — |
| Add new cards | `/card-quality` | `seedhaplot-player-simulator` | — |
| Bulk card generation | `/card-quality` | `general-purpose` | `node scripts/generate.js` |
| Code review | `/review-playbook` | `code-quality-pragmatist`, `accesslint:reviewer` | — |
| Pre-ship audit | `/ship-playbook` | `seedhaplot-panel`, `task-completion-validator` | PostHog, Lighthouse |
| Design exploration | `/plan-playbook` | `creative-designer` | 21st Magic, Memory |
| Performance issue | `/fix-playbook` | `code-quality-pragmatist` | Sequential Thinking |
| Accessibility fix | `/fix-playbook` | `accesslint:reviewer` | AccessLint MCP |
| Animation tuning | `/ui-playbook` + `/click-test-playbook` | `seedhaplot-visual-qa` | — |
| Game FSM change | `/fix-playbook` | `seedhaplot-player-simulator`, `code-quality-pragmatist` | Sequential Thinking |
| Analytics event | `/fix-playbook` | `general-purpose` | PostHog MCP |
| PWA / offline | `/ship-playbook` | `ui-comprehensive-tester` | — |
| Typography change | `/ui-playbook` | `designer`, `seedhaplot-visual-qa` | AccessLint |
| Color system change | `/ui-playbook` | `designer`, `accesslint:reviewer` | AccessLint MCP |
| Session planning | `/plan-playbook` | `Plan` | Sequential Thinking, Memory |
| Onboarding to project | `/context-bridge` | `Explore` | Memory |
| Documentation | — | `documentation-expert` | — |
| User feedback triage | `/plan-playbook` | `karen`, `jenny` | PostHog MCP |

---

## 8. MCPs (Model Context Protocol Servers)

| MCP | Purpose | Key Tools |
|-----|---------|-----------|
| **PostHog** | Analytics, feature flags, user behavior | `query-run`, `insight-create-from-query`, `feature-flag-get-all`, `create-feature-flag` |
| **AccessLint** | WCAG color contrast checking | `analyze_color_pair`, `calculate_contrast_ratio`, `suggest_accessible_color` |
| **21st Magic** | Component design inspiration and generation | `21st_magic_component_builder`, `21st_magic_component_inspiration`, `21st_magic_component_refiner`, `logo_search` |
| **Memory** | Persistent knowledge graph across sessions | `create_entities`, `add_observations`, `search_nodes`, `read_graph` |
| **Sequential Thinking** | Step-by-step reasoning for complex debugging | `sequentialthinking` |
| **Any-Chat** | Cross-model consultation (OpenAI, etc.) | `chat-with-openai` |

### MCP Usage Rules
- Always check PostHog before making UX changes — look at actual user behavior first.
- Use AccessLint MCP for every color pairing change, not just "it looks fine."
- Memory MCP: store design decisions, rejected approaches, and session summaries. Query it at session start.
- Sequential Thinking: use for any debugging that takes more than 2 attempts to solve.

---

## 9. After Every Agent Run

This is mandatory. No exceptions.

1. **Update state** — Write what changed to `.project-state.md` (what was done, what gate results were, any new blockers).
2. **Run gates** — At minimum, run Integration Gate (`typecheck` + `build`). If UI changed, run Visual Gate too.
3. **Test dependents** — Grep for consumers of any changed module. Verify each consumer still works. Test ALL 10 screens if any component changed:
   - `HomeScreen` — landing, mode selection
   - `PlayerSetup` — name entry, player count
   - `GameScreen` — card display, flip, scoring
   - `Card` — front/back rendering, glow
   - `TurnInterstitial` — turn change animation
   - `ResultsScreen` — final scores, replay
   - `FeedbackSheet` — post-game feedback form
   - `SuggestSheet` — movie suggestion form
   - `Toast` — notification popups
   - `App` — top-level routing, FSM state transitions

---

## 10. Compaction Protocol

When context reaches ~60% capacity (you feel the squeeze), run compaction:

### Truths Inventory (Preserve These)
1. **Architecture truths** — FSM states (`home | setup | playing | flipped | scoring | turnChange | continue | results`), component tree, storage adapter pattern, event bus pub/sub
2. **Design truths** — all color tokens, typography rules, card specs (360px, 0.4s flip, overshoot), ornament rules, "Bollywood poster in Rajasthan palace" metaphor
3. **Quality truths** — four gates and their thresholds, Visual Gate >= 7.0, test all 10 screens always
4. **Content truths** — card format (`id, ind, diff, era, y, n, f, c`), point map (easy=1, medium=2, hard=3), difficulty distribution targets
5. **Process truths** — STOP & THINK protocol, playbook pipelines, agent roster, MCP availability

### Preservation Instruction
When compacting, write a `## Compaction Summary` section in `.project-state.md` containing:
- Current task and progress
- Key decisions made this session (with rationale)
- Blockers and open questions
- Files modified this session
- Gate results from this session

### Verify After Compaction
- Can you still name all 7 color tokens and their hex values?
- Can you still list the 8 GameState FSM states?
- Can you still describe the card flip spec (duration, easing, glow)?
- Do you know which playbook to use for the current task?

### What NOT to Preserve
- Raw file contents you've already processed (re-read if needed)
- Intermediate debugging output
- Rejected design alternatives (unless the user specifically asked to remember them)
- Verbose agent output (preserve only verdicts and scores)

### Subagent Context Management
When spawning subagents, give them:
- The relevant section of this CLAUDE.md (not the whole file)
- The current task description
- The relevant design tokens
- The quality gate they must pass
Do NOT give subagents the full compaction history or session transcript.

### Aristotelian Check
After compaction, ask: "If I were starting fresh with only what I preserved, could I continue this session without asking the user to repeat anything?" If no, you dropped something important.

---

## 11. Anti-patterns

### Process Anti-patterns
- **Skipping STOP & THINK** — always run the protocol, even for "quick" tasks
- **Asking permission for every small decision** — if the user said "go build," then go build
- **Presenting work before running gates** — never show the user something that hasn't passed
- **Working on multiple unrelated tasks simultaneously** — finish one, gate it, then start the next
- **Ignoring `.project-state.md`** — if you don't read state, you'll redo work or break completed features
- **Amending commits instead of creating new ones** — always create new commits unless explicitly asked to amend

### Design Anti-patterns
- **Pure white or pure black** — use `--cream` and `--ink` instead
- **Hardcoded colors** — always use CSS custom properties from `style.css`
- **CSS-only ornaments** — box-shadows and gradients pretending to be decorative patterns
- **Sterile minimalism** — this is a Bollywood party game, not a banking app
- **Mixing BW/TW color families** — Bollywood = flame/red family, Tollywood = emerald/green family, never cross
- **Gold for navigation** — gold is for celebration (scores, streaks, wins) only
- **Playfair below 24px** — display font is for display sizes only
- **Ignoring mobile-first** — every component must work at 320px viewport width first

### Testing Anti-patterns
- **Testing only the changed screen** — always test all 10 screens after any change
- **Skipping animation testing** — card flip, transitions, and micro-interactions must be verified
- **"It works on desktop"** — mobile is the primary target; test at 375px width
- **Not testing rapid input** — users at parties tap fast and tap wrong; handle it
- **Assuming card data is clean** — always run audit-cards.js after card changes

### Code Anti-patterns
- **Using `any` type** — use proper TypeScript types; if you must use `any`, add a `// SAFETY:` comment
- **Direct DOM manipulation** — use React state and refs, not `document.querySelector`
- **Inline styles for design tokens** — always reference CSS custom properties
- **Fat components** — if a component exceeds 150 lines, extract logic into hooks or utilities
- **Mutating game state directly** — all state changes go through the FSM (`gameFSM.ts`)

### Content Anti-patterns
- **Spoilers in plot descriptions** — the terrible plot should not reveal the movie
- **Lazy difficulty ratings** — easy = everyone knows it, medium = movie buffs know it, hard = deep cuts
- **Duplicate cards** — run dedup check before committing card changes
- **English-only humor** — mix in Hindi/Telugu transliterations where natural (but keep primary language English)

---

## 12. Tech Stack + Architecture

### Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| UI | React | 18.2 |
| Build | Vite | 5.x |
| Language | TypeScript | 5.3 |
| Animation | Framer Motion | 12.x |
| Backend | Supabase | (fire-and-forget writes) |
| PWA | vite-plugin-pwa | 0.20 |
| Testing | Vitest + Testing Library | 4.x + 16.x |
| Linting | ESLint + Prettier | 8.x + 3.x |
| Analytics | PostHog | (via CDN + MCP) |
| Hosting | Netlify | (see `netlify.toml`) |

### Source Structure
```
src/
  core/
    types.ts          — Card, Player, GameSession, GameState, POINT_MAP
    gameFSM.ts        — finite state machine driving game flow
    deckBuilder.ts    — shuffle, filter, build decks from cards.json
    contentLoader.ts  — fetch and parse card packs
    scorer.ts         — points, streaks, lives, verdicts
    eventBus.ts       — pub/sub for analytics and cross-cutting concerns
  hooks/
    gameInstance.ts   — singleton game instance
    useGameState.ts   — React hook bridging FSM state to UI
    useGameActions.ts — React hook exposing game actions (flip, score, next)
    useAbandonDetection.ts — detects tab close / app background
  components/
    App.tsx           — root component, FSM state router
    HomeScreen.tsx    — landing page, mode selection
    PlayerSetup.tsx   — player name entry
    GameScreen.tsx    — main game loop (card + controls)
    Card.tsx          — flip card with front/back faces
    TurnInterstitial.tsx — turn change overlay
    ResultsScreen.tsx — final scores and replay
    FeedbackSheet.tsx — post-game feedback bottom sheet
    SuggestSheet.tsx  — movie suggestion bottom sheet
    Toast.tsx         — notification toasts
  storage/
    interface.ts      — StorageAdapter abstract interface
    localStorage.ts   — localStorage implementation
    supabase.ts       — Supabase fire-and-forget adapter
  analytics/
    posthog.ts        — PostHog event tracking as eventBus subscriber
  style.css           — all design tokens, global styles, component styles
  main.tsx            — React entry point
```

### Key Architecture Decisions
1. **FSM-driven game flow** — `gameFSM.ts` is the single source of truth for game state. Components read state via `useGameState`, dispatch actions via `useGameActions`. Never bypass the FSM.
2. **Event bus for side effects** — analytics, storage writes, and future integrations subscribe to the event bus. Components never call analytics directly.
3. **Storage adapter pattern** — `interface.ts` defines the contract. `localStorage.ts` for offline, `supabase.ts` for cloud persistence. Swap without touching game logic.
4. **Cards as static JSON** — `cards.json` is the single card database. Generated via `scripts/generate.js`. No runtime card fetching (PWA-first).
5. **Fire-and-forget writes** — Supabase writes are non-blocking. Game never waits on network. Offline-first always.

### Don't Touch List
These files/decisions are settled. Do not change without explicit user approval:
- `src/core/gameFSM.ts` state names and transitions — the FSM is tested and stable
- `src/core/types.ts` Card interface shape — card generation scripts depend on it
- Card flip timing (`0.4s` overshoot) — validated by user testing
- Red/green glow card design — validated by user testing
- `vite.config.ts` PWA configuration — service worker caching strategy is tuned
- `scripts/generate.js` — card generation pipeline, changes require full card audit

---

## 13. Keep Inventory Updated

After every session, run a quick inventory audit:

```bash
# Count components, hooks, core modules
echo "Components: $(ls src/components/*.tsx | wc -l)"
echo "Hooks: $(ls src/hooks/*.ts | wc -l)"
echo "Core: $(ls src/core/*.ts | wc -l)"
echo "Cards: $(node -e \"const c=require('./cards.json'); console.log(c.length + ' cards')\")"
echo "Tests: $(find tests -name '*.test.*' | wc -l)"
echo "Prototypes: $(ls prototype-*.html | wc -l)"
```

Record the counts in `.project-state.md` under `## Inventory`.

**Last audited**: Not yet — run audit on next session start.

---

## 14. Canonical Spec Index

Every substantive question about this product should land in one of these five docs. If a question doesn't fit, add a section to the closest one rather than creating a new doc.

| Spec | Scope | Read when |
|---|---|---|
| `docs/product-spec.md` | Vision, audience, JTBD, roadmap, business model | You're asking what / for whom / why / when |
| `docs/design-spec.md` | Visual tokens, typography, components, animation vocabulary, a11y | You're touching pixels, motion, or copy layout |
| `docs/system-architecture-spec.md` | Stack, FSM, event bus, storage, PWA, deployment | You're adding or changing architecture |
| `docs/engineering-spec.md` | Conventions, testing, gates, PR workflow, anti-patterns | You're writing code for any reason |
| `docs/applied-scientist-spec.md` | Analytics schema, metrics, experiments, content quality loops | You're reading or acting on product data |

Cross-links inside each doc point at the others. If you find a contradiction, the newer doc wins — but flag it in `.project-state.md` so it gets reconciled.

---

*This file is ~480 lines. If you are reading this and it feels like a lot, that is correct. This is the accumulated wisdom of building a Bollywood party game with Claude Code. Every line earned its place by preventing a mistake.*
