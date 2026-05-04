# Engineering Spec — Bad Desi Plots

> Last updated: 2026-04-20. Canonical engineering playbook. Companion docs:
> `product-spec.md`, `design-spec.md`, `system-architecture-spec.md`,
> `applied-scientist-spec.md`.

---

## 1. Who this is for

Anyone writing code for Bad Desi Plots — the author, contributors, Claude Code
sessions, future agents. Read this end-to-end before opening a PR.

## 2. Stack at a glance

See `system-architecture-spec.md` §2 for the full table. Summary:

- React 18.2, Vite 5.x, TypeScript 5.3
- Vitest 4.x for unit + component tests
- ESLint 8.x + Prettier 3.x
- Framer Motion 12.x (used sparingly; prefer CSS keyframes)
- Supabase + PostHog (client-side, fire-and-forget)
- PWA via `vite-plugin-pwa` 0.20
- Vercel for hosting + preview URLs (legacy `netlify.toml` still in tree, inactive)

## 3. Source conventions

### TypeScript
- Strict mode is on. Do not relax it.
- No `any` without a `// SAFETY:` comment explaining why and what invariants protect the cast.
- Prefer discriminated unions to boolean flags. Example: `type CardState = { kind: 'front' } | { kind: 'flipped'; scoredFor: PlayerIdx | null }`.
- Exported functions get JSDoc if the name alone doesn't make the behavior obvious.
- Interfaces for object shapes, `type` for unions and primitives.

### React
- Function components only. No class components.
- Hooks at the top, early returns for guard clauses, JSX last.
- Components over 150 lines get extracted — UI to sub-components, logic to custom hooks, state to `src/hooks/`.
- No direct DOM manipulation (`document.querySelector` etc). Use refs or state.
- Event handlers are `useCallback`-wrapped when passed as props to children.

### State
- FSM state (`src/core/gameFSM.ts`) is the single source of truth for game flow.
- Components read via `useGameState`, dispatch via `useGameActions`. Never bypass.
- Local component state (`useState`) is fine for UI-only concerns (modal open, input focus).
- No Redux, no Zustand, no context for game state. The FSM + event bus is the pattern.

### CSS
- All design tokens in `src/style.css` `:root`. Never hardcode a hex in a component.
- BEM-ish naming with a namespace prefix per surface (`v8-card-`, `v8-results-`, `v8-home-`). Prevents collisions and makes greps easy.
- Keyframes live next to the selectors that use them, not in a central animation file.
- Every animation block has a `@media (prefers-reduced-motion: reduce)` sibling. No exceptions.
- No Tailwind, no CSS-in-JS. Plain CSS with custom properties is the pattern.

### Files
- One component per file. File name matches the default export.
- Filename case: PascalCase for components, camelCase for hooks / utilities / core modules.
- No `index.ts` barrel files except at the top of `src/` if ever needed — they hurt tree-shaking and navigation.

## 4. Testing strategy

### Current state (2026-04-30)
- 186 tests across 16 files. All pass.
- Coverage: core modules 90%+ (FSM, scorer, deckBuilder, adaptive), components covered at behavior level (not DOM snapshots).
- Settings wiring (`gameInstance.setSettings()` → `partyRoundCap()` / `filteredPool()`) is covered by `tests/hooks/gameInstance-award.test.ts` (+2 cases added 2026-04-30). Treat the Settings UI as live: changes to difficulty filter or round length actually affect the loop; do not regress these without updating the tests.

### Test types
- **Core unit tests** (`tests/core/`) — FSM transitions, scoring math, shuffle determinism (with seeded RNG), adaptive-no-repeat, event bus pub/sub.
- **Component tests** (`tests/components/`) — render + user-event assertions. Testing Library queries by role / label, not by class name.
- **No E2E suite** (yet). The end-to-end story is covered by Vercel preview + manual mobile test. If bugs repeatedly slip through this, add Playwright.

### Writing tests
- One logical assertion per test. If a test has two `expect` blocks asserting unrelated things, split it.
- Test names describe behavior, not implementation: `emits card:scored with base+bonus when streak >= 3`, not `test awardPoints() function`.
- Mock minimally. Real FSM, real scorer, real deck. Mock only network and time.
- Every bug fix lands with a regression test. If a bug couldn't have a test, explain in the PR why.

### Running
```bash
npm test               # watch mode for dev
npm test -- --run      # one-shot, CI-style
npm test path/to/file  # single file
```

## 5. Quality gates

Four gates, all must pass before `ship/* → main`.

### Gate 1: Spec gate
- Change aligns with design spec (colors, typography, ornament rules)
- Uses tokens from `style.css`, not hardcoded values
- Matches the "Bollywood poster in Rajasthan palace" metaphor
- **Verdict:** `SPEC_PASS` or `SPEC_FAIL: [reason]`

### Gate 2: Implementation gate
```bash
npm run typecheck   # zero errors
npm run lint        # zero warnings
```
- No `any` without `// SAFETY:` comment
- No commented-out blocks, no dangling TODOs without a linked issue
- New functions have intent comments if the name doesn't carry it
- **Verdict:** `IMPL_PASS` or `IMPL_FAIL: [what failed]`

### Gate 3: Visual gate
- Run `seedhaplot-visual-qa` agent on affected screens
- Score ≥ 7.0 / 10.0 required (see `design-spec.md` §11 for rubric)
- Screenshot evidence attached to the PR
- **Verdict:** `VISUAL_PASS [score]` or `VISUAL_FAIL [score]: [feedback]`

### Gate 4: Integration gate
```bash
npm run typecheck   # zero errors
npm run test        # 186/186 pass (or more)
npm run build       # clean production build
```
- Bundle < 250KB gzipped JS, < 25KB gzipped CSS
- Vercel preview builds cleanly
- Lighthouse PWA score ≥ 90 on mobile (see `/ship-playbook` check)
- **Verdict:** `INTEGRATION_PASS` or `INTEGRATION_FAIL: [which check]`

### Escalation
If a gate fails twice on the same issue, stop and surface the failure details to
the user. Never silently downgrade a gate. No "it's close enough to 7.0."

## 6. PR workflow

### Branching
- `main` — prod, protected. No direct commits. Requires explicit user approval to merge.
- `ship/vX.Y.Z` — release candidates. Auto-deploys to Vercel preview.
- Feature / fix branches — prefix `feat/`, `fix/`, `chore/`, `docs/`. Merge into `ship/*`, not `main`.

### Commit messages
Follow the existing pattern:
- `feat: v2.1.0 — Bad Desi Plots rebrand, fact-verified deck, rate-limit gate`
- `fix: pts-float visible on mobile + solo name + Results celebration`
- `chore: state log — 2026-04-20 mobile preview fixes session`
- `docs: add v2 architecture design spec`

Body explains the why, not the what (the diff shows the what). Include:
- Root cause (for fixes)
- Gate results (for features)
- Validation (for UX changes)

Always end with a Claude co-author line when authored with Claude Code.

### Before opening a PR
1. Gates 1–4 all pass locally
2. `.project-state.md` updated (mandatory per CLAUDE.md §9)
3. Screenshots attached for any UI change
4. Changelog entry added (if user-visible)
5. Test the Vercel preview on an actual mobile device

### Never
- `git commit --no-verify`
- `git push --force` to main or ship/* (only feature branches, and only if no one else is pulling)
- Commit `.env`, `node_modules/`, `dist/`, `*.log`, or any secrets
- Amend commits that have already been pushed

## 7. Playbooks (use these, don't freelance)

Full definitions in `CLAUDE.md` §6. Summary:

| Playbook | When to use |
|---|---|
| `/ui-playbook` | New UI component or UI redesign |
| `/fix-playbook` | Bug fix of any kind |
| `/review-playbook` | Code review before merging |
| `/ship-playbook` | Pre-ship audit, all four gates on the whole app |
| `/plan-playbook` | Task decomposition and planning |
| `/card-quality` | Card content quality check |
| `/click-test-playbook` | Interaction + animation testing |
| `/context-bridge` | Session handoff / resuming cold |

## 8. Anti-patterns

From `CLAUDE.md` §11 and accumulated session learnings.

### Process
- Skipping STOP & THINK (even for "quick" tasks)
- Presenting work before running gates
- Working on multiple unrelated tasks in the same branch
- Ignoring `.project-state.md` — you'll redo work or break completed features
- Amending published commits instead of creating new ones

### Design
- Pure white (`#fff`) or pure black (`#000`) — use `--cream` and `--ink`
- Hardcoded hex values in components — reference tokens
- CSS-only ornaments (box-shadow paisleys) — ship real SVG or nothing
- Mixing BW and TW color families within a card
- Gold used for navigation (it's for celebration only)
- Playfair below 24px

### Testing
- Testing only the screen you changed. Test all 10 screens after any shared change.
- Skipping animation timing tests — card flip, transitions, micro-interactions must be verified
- "Works on desktop" — mobile at 375px is the primary target
- Assuming card data is clean — always run `scripts/audit-cards.js` after card changes

### Code
- `any` without a `// SAFETY:` comment
- Direct DOM manipulation
- Inline style objects for design-token values (use the CSS custom property)
- Fat components (> 150 lines) — extract logic into hooks
- Mutating game state directly — all changes go through the FSM

### Content
- Spoilers in plot descriptions
- Lazy difficulty ratings — easy = every desi knows it, hard = genuine deep cut
- Duplicate cards (by id or by name+year)
- Pure English humor — mix in Hindi / Telugu transliterations where natural

## 9. Working with Claude Code

This project is built with Claude Code. `CLAUDE.md` is the session primer — read
it top-to-bottom at the start of every session.

### Agent routing
See `CLAUDE.md` §7 "Tool Routing Table." Key ones:
- UI change → `designer` + `seedhaplot-visual-qa`
- Bug fix → `code-quality-pragmatist` + (if mobile) `ui-comprehensive-tester`
- Card quality → `seedhaplot-player-simulator`
- Pre-ship → `seedhaplot-panel`
- Fact check → `seedhaplot-fact-checker`

### Memory
Project-specific memories live in `~/.claude/projects/.../memory/`. The MEMORY.md index is loaded at session start. Update memories when user gives feedback or when a session produces a load-bearing decision. See `project_seedhaplot_*.md` files for session history.

### Full-autonomy mode
When the user says "go build" or "full autonomy" — skip the wait-for-approval step in STOP & THINK (§2.6 of CLAUDE.md). Run the whole pipeline autonomously, report assumptions at the end.

## 10. Environment

### Local setup
```bash
git clone https://github.com/srinitya1995-oss/bad-bollywood-plots.git
cd bad-bollywood-plots
npm install
cp .env.example .env     # fill in PostHog + Supabase keys
npm run dev              # vite dev server at http://localhost:5173
npm run build            # production build to dist/
npm run preview          # preview built bundle at http://localhost:4173
```

### Env vars
- `VITE_POSTHOG_KEY` — PostHog project key
- `VITE_POSTHOG_HOST` — defaults to `https://us.posthog.com`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Required tools
- Node 20+
- npm 10+
- A modern browser for dev (Chrome recommended; also test on Safari regularly)
- Optional: Puppeteer for visual QA screenshots (`/tmp/shotter/` convention)

## 11. Contributor checklist

Before opening a PR, verify:

- [ ] Typecheck clean (`npm run typecheck`)
- [ ] Tests pass (`npm test -- --run`)
- [ ] Build clean (`npm run build`)
- [ ] Bundle under budget (see `system-architecture-spec.md` §12)
- [ ] Visual QA ≥ 7.0 on affected screens (if UI change)
- [ ] All 10 screens still render (run `ui-comprehensive-tester` if shared change)
- [ ] Animations have reduced-motion fallback
- [ ] New interactive elements are keyboard-reachable
- [ ] Color pairings pass AccessLint contrast check
- [ ] Touch targets ≥ 44×44px
- [ ] `.project-state.md` updated
- [ ] Changelog entry added (if user-visible)
- [ ] Vercel preview tested on a physical phone
- [ ] No console errors or warnings in the preview

## 12. Architectural debt

Tracked so it doesn't get lost. See also `system-architecture-spec.md` §13.

- `useAbandonDetection.ts` is heuristic. iOS Safari swipe-to-close misses.
- `eventBus.ts` has string event names, not typed unions.
- `gameInstance.ts` is a singleton; concurrent games / spectator would need redesign.
- `useCardTextFit.ts` should be replaceable with CSS container queries once Safari is reliable.
- Fonts load from Google Fonts CDN — a future pass should self-host.

## 13. On destructive actions

Never silently destructive. Follow `CLAUDE.md` §2 STOP & THINK for:
- Deleting files or directories
- Dropping a Supabase table or column
- Force-pushing
- Rewriting shared git history

All of these require explicit user approval, even in full-autonomy mode.

## 14. On learning from past thrashes

Past sessions that went sideways are memorialized in `~/.claude/projects/.../memory/project_seedhaplot_session_*.md`. Read these when a similar problem surfaces. Patterns that have cost cycles:

- 2026-04-14 thrash: root-caused to "presenting mockups without screenshotting them first." Now a hard rule: `feedback_screenshot_before_ship.md`.
- 2026-04-11 misalignment: 92 commits without following `CLAUDE.md` / playbooks / panel. Now a hard rule: `feedback_follow_the_protocol.md`.
- 2026-04-20 mobile bug miss: pts-float invisible under reduced-motion, not caught in visual QA because QA was desktop-only. Now: visual QA must include a mobile + reduced-motion viewport.
