# Seedha Plot System Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port Pebl-era workflow infrastructure to Seedha Plot, create visual QA + player simulator + panel agents, audit v2 code, then run build→test→panel loops until only human-blocked items remain.

**Architecture:** Infrastructure-first (CLAUDE.md, skills, agents, hooks, state file) → verify app runs → code audit → panel review → fix loop.

**Tech Stack:** React 18, Vite 5, TypeScript, Framer Motion 12, Supabase, PWA, Vitest, Playwright for click testing.

---

### Task 1: Create CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Write CLAUDE.md**

Create the full 400+ line CLAUDE.md with all sections from the spec:

```markdown
# Seedha Plot — Agent Instructions

## First Thing: Read State + Vision

Before doing ANYTHING, read these in order:

1. `.project-state.md` — current scores, open issues, last decisions
2. `docs/superpowers/specs/2026-03-26-bad-plots-v2-design.md` — the canonical design spec
3. `inspiration/` — LOOK AT EVERY IMAGE. Kalamkari, Mughal manuscripts, block printing, textile art.
4. `cards.json` — the actual content. 150 cards. This IS the product.

**If you skip the inspiration images, you will build the wrong thing.**

## STOP & THINK (MANDATORY)

Before beginning any task:

1. **Scan inventory** — review all skills, agents, MCPs below
2. **Assess quality bar** — would someone screenshot this? Would the founder show this at a party?
3. **Assess model fit** — Opus for taste/architecture/debugging, Sonnet for mechanical work, Haiku for one-liners
4. **Assess efficiency** — parallelize tool calls, don't re-read files, delegate to subagents
5. **Output toolchain plan** — which playbook, agents, skills, in what order
6. **Wait for approval** — do NOT write code until confirmed

## Project Identity

**Product:** Seedha Plot (Bad Bollywood Plots) — party trivia, guess movies from terrible plot descriptions.
**Audience:** Desi GenZ + millennials. House parties, solo play.
**Metaphor:** "A Bollywood poster in a Rajasthan palace."

**Design:** Masala Mix — desi maximalist cards on dark minimal stage.
- Cards are the stars. Everything else serves them.
- On cards: bold color, ornamental borders, confident type
- Around cards: dark aubergine stage, clean UI, nothing competing

**Colors:**
- --bg: #1a0a2e (deep aubergine)
- --card-bw: #c0392b (warm crimson)
- --card-tw: #1a7a4c (rich emerald)
- --gold: #d4a843 (scores, accents — sparingly)
- --cream: #f2ede4 (primary text, card back bg)
- --ink: #120808 (text on light surfaces)
- --glow-bw: rgba(192, 57, 43, 0.3)
- --glow-tw: rgba(26, 122, 76, 0.3)

**Rules:** ONE bg color. No text below 0.6 opacity. Gold is accent not default. Cards saturated enough to pop.

**Typography:** Playfair Display (serif, loud) + DM Sans (sans, quiet).
Scale: 12/14/16/20/24/32/48px. Clue text: 24px Playfair italic. Buttons: 16px min.

**Ornaments:** ONE reusable jali/rangoli pattern. Structural, not decorative. REAL art, not CSS.

**Card:** 360px max, clamp(320px,55vh,440px) height. Flip: 0.4s overshoot, 1.02 scale bump. Glow: 8px 40px colored shadow.

## Available Agents

**Seedha Plot-specific:**
- seedhaplot-visual-qa — screenshots, desi maximalist rubric, 4 review modes, score tracking
- seedhaplot-player-simulator — 50 personas, 5 archetypes, 6 simulation modes
- seedhaplot-panel — 7-agent expert review (PM, Arch, Eng, Data, Players, Game Design, Desi Art)

**Design:**
- creative-designer — mockups, SVGs, benchmark sites, self-critique gate
- designer — general purpose design, prototyping

**Quality:**
- karen — reality check on claimed completions
- jenny — spec compliance verification
- code-quality-pragmatist — over-engineering detection
- task-completion-validator — end-to-end verification

**Testing:**
- ui-comprehensive-tester — Puppeteer/Playwright click-through
- accesslint:reviewer — WCAG accessibility audit

**Infra:**
- documentation-expert — docs maintenance

**Built-in:**
- Explore, Plan, general-purpose

## Quality Gates (MANDATORY)

1. **Spec Gate** — before implementation. Restate spec, confirm understanding.
2. **Implementation Gate** — before commit. Fresh subagent checks spec vs output.
3. **Visual Gate** — before UI marked done. seedhaplot-visual-qa >= 7.0, no dimension below 5.0.
4. **Integration Gate** — before ship. typecheck + tests + build + lint + Lighthouse PWA >= 90.

**Verdict:** PASS | FAIL with BLOCKING/NON-BLOCKING items.
**Escalation:** 1st fail → fix → re-gate. 2nd fail → flag human. 3rd fail → cancel, revise spec.

## Playbooks

**/ui-playbook** — brainstorming → creative-designer mockup → approve → implement TDD → visual-qa >= 7.0 → accesslint → click-test

**/fix-playbook** — systematic-debugging → implement TDD → karen → verification-before-completion → click-test if UI

**/review-playbook** — visual-qa all screens → karen → code-quality-pragmatist → update .project-state.md

**/ship-playbook** — /review-playbook → Lighthouse PWA → card-quality → integration gate → finishing-branch

**/plan-playbook** — writing-plans → approve → subagent-driven-development

**/card-quality** — parse cards.json → structural → dedup → difficulty balance → clue quality → broken cards

**/click-test-playbook** — dev server → Playwright clicks all user paths → screenshot every step → verify every interaction → LOOK at screenshots

**/context-bridge** — shared context file for multi-agent coordination

## Tool Routing Table

| Task | Playbook | Agents | Skills |
|------|----------|--------|--------|
| UI change | /ui-playbook | creative-designer, visual-qa | brainstorming, ui-ux-pro-max, micro-interactions, frontend-design, mobile-first-layout |
| Bug fix | /fix-playbook | karen | systematic-debugging, error-handling-patterns |
| New feature | /plan-playbook | subagents | writing-plans, brainstorming |
| Design decision | /ui-playbook | creative-designer | brainstorming, creative-ux-designer, design-system-generator |
| Card content | /card-quality | — | card-quality |
| Animations | /ui-playbook | creative-designer | micro-interactions, authoring-motion |
| Accessibility | /ui-playbook | accesslint:reviewer | contrast-checker, use-of-color, aria-implementation |
| Components | /ui-playbook | — | composition-patterns, react-best-practices |
| Mobile | /ui-playbook | — | mobile-first-layout, mobile-design-philosophy |
| Inspiration | Direct MCP | — | 21st Magic MCP |
| Research | Brainstorm | — | design-research:* |
| Testing | /click-test | ui-comprehensive-tester | webapp-testing, verification |
| Supabase | /fix-playbook | — | database-design |
| Analytics | Direct MCP | — | PostHog MCP, ab-test-setup |
| Performance | /ship-playbook | — | react-best-practices, observability |
| PWA | /ship-playbook | — | technical-seo-checker |
| Copy | /ui-playbook | — | copywriting |
| Business | Brainstorm | — | business-consultant, pricing-strategy |
| Growth | Brainstorm | — | launch-strategy, viral-generator-builder |
| Multi-agent | context-bridge | — | dispatching-parallel-agents |

## MCPs
- PostHog (analytics, flags, experiments, dashboards)
- AccessLint (contrast, color, WCAG)
- 21st Magic (component inspiration, builder, refiner)
- Memory (cross-session knowledge graph)
- Sequential Thinking (structured reasoning)
- Any-Chat (second-opinion LLM)

## After Every Agent Run
1. Update .project-state.md — scores, issues, decisions
2. Run applicable gates
3. Test dependents — grep consumers, verify each

## Compaction Protocol

Compact at 60% context. Hard rule: compact before new task if past 60%.

Truths inventory: Decisions, Discoveries, Constraints, State, Dead ends.
Update .project-state.md BEFORE compacting.

Aristotelian check: "Could a new session pick up exactly where I left off?"

## Anti-patterns

### Process
- Ad-hoc agent dispatch without toolchain plan
- Self-review own UI (use visual-qa)
- Skip brainstorming for "simple" changes
- Claim done without karen/verification
- 10+ agents without coordination plan

### Design
- CSS-generated ornaments (source REAL art)
- Gradients, blur, AI aesthetic
- Small/understated cards (cards are HERO)
- Off-system colors
- Text below 12px or 0.6 opacity
- Overuse gold

### Testing
- Console logs as testing (CLICK THE REAL PATH)
- Skip visual inspection of screenshots
- Test only changed screen (test ALL affected)
- Test desktop only (PHONE game at PARTY)

### Code
- Over-engineer for hypotheticals
- Abstractions for one-time ops
- Error handling for impossible scenarios
- TODO without linked issue

### Content
- Clues describing 10+ films
- 80% sardonic (should be ~40%)
- Hard clues with LESS detail
- Known broken cards unfixed

## Tech Stack

React 18 + TypeScript + Vite 5 + Framer Motion 12 + Supabase + PWA
CSS (style.css) + Vitest + React Testing Library + ESLint + Prettier
Playfair Display + DM Sans (Google Fonts)
cards.json (150 cards via scripts/)

## Architecture

Core (pure TS) → Bridge (hooks) → UI (React components)
Core imports nothing from Bridge/UI. UI imports Bridge only via hooks.

## Don't Touch (fragile)
- src/core/gameFSM.ts — transition map is delicate
- src/core/scorer.ts — streak/lives edge cases
- Card dedup in deckBuilder.ts — hard-won fix

## Keep Inventory Updated
When creating new skills/agents/MCPs, update this file.
Last audited: 2026-04-11.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "feat: add CLAUDE.md with full Pebl-era workflow infrastructure"
```

---

### Task 2: Create .project-state.md

**Files:**
- Create: `.project-state.md`

- [ ] **Step 1: Write state file**

Full state file with: current status, what works, what doesn't, visual QA score table (all UNTESTED), open issues (P0/P1/P2), decisions log, card health, prototype history, what's next.

Content as designed in brainstorming Section 2 (DEEPEST).

- [ ] **Step 2: Commit**

```bash
git add .project-state.md
git commit -m "feat: add project state file for cross-session tracking"
```

---

### Task 3: Create Project-Local Skills

**Files:**
- Create: `.claude/skills/ui-playbook/SKILL.md`
- Create: `.claude/skills/fix-playbook/SKILL.md`
- Create: `.claude/skills/review-playbook/SKILL.md`
- Create: `.claude/skills/ship-playbook/SKILL.md`
- Create: `.claude/skills/plan-playbook/SKILL.md`
- Create: `.claude/skills/card-quality/SKILL.md`
- Create: `.claude/skills/context-bridge/SKILL.md`
- Create: `.claude/skills/click-test-playbook/SKILL.md`

- [ ] **Step 1: Write all 8 skill files**

Each skill follows the pipeline defined in brainstorming Section 3 (DEEPEST). Full triggers, pipeline steps, gates, anti-patterns.

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/
git commit -m "feat: add 8 project-local skills (playbooks)"
```

---

### Task 4: Create seedhaplot-visual-qa Agent

**Files:**
- Create: `~/.claude/agents/seedhaplot-visual-qa.md`

- [ ] **Step 1: Write agent definition**

Full agent with: role, rubric (7 dimensions with descriptors), weighted scoring formula, 16-screen inventory, 4 review modes, output format, edge cases, critical rules. Content as designed in brainstorming Section 4 (DEEPEST).

- [ ] **Step 2: Verify agent is accessible**

```bash
ls ~/.claude/agents/seedhaplot-visual-qa.md
```

---

### Task 5: Create seedhaplot-player-simulator Agent

**Files:**
- Create: `~/.claude/agents/seedhaplot-player-simulator.md`

- [ ] **Step 1: Write agent definition**

Full agent with: 50 persona table (5 archetypes x 10 variants), per-persona report format, 6 simulation modes, output format. Content as designed in brainstorming Section 5.

- [ ] **Step 2: Verify agent is accessible**

```bash
ls ~/.claude/agents/seedhaplot-player-simulator.md
```

---

### Task 6: Create seedhaplot-panel Agent

**Files:**
- Create: `~/.claude/agents/seedhaplot-panel.md`

- [ ] **Step 1: Write panel orchestrator**

Full agent with: 7 panel member definitions (PM, Architect, Engineer, Data Scientist, Player Simulator, Game Designer, Desi Artist Panel with 5 voices), execution protocol (context bridge → parallel dispatch → collect → deduplicate → prioritize), quick panel mode, output format. Content as designed in brainstorming Section 6.

- [ ] **Step 2: Verify agent is accessible**

```bash
ls ~/.claude/agents/seedhaplot-panel.md
```

---

### Task 7: Configure Hooks + Settings

**Files:**
- Create/Modify: `.claude/settings.json`

- [ ] **Step 1: Write settings with hooks**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "intercept",
            "command": "echo 'Verify: Did you invoke a playbook or superpowers skill before writing code?'",
            "timeout": 5000
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cat .project-state.md 2>/dev/null | head -30 || echo 'No state file found'",
            "timeout": 3000
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add .claude/settings.json
git commit -m "feat: add hooks for pre-write validation and session start"
```

---

### Task 8: Verify App Runs

**Files:**
- None created, verification only

- [ ] **Step 1: Install dependencies**

```bash
npm install
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: may have errors — document them.

- [ ] **Step 3: Run tests**

```bash
npm run test
```

Expected: may have no tests or failures — document them.

- [ ] **Step 4: Start dev server**

```bash
npm run dev
```

Expected: Vite starts on localhost:5173. Verify home screen renders.

- [ ] **Step 5: Document findings in .project-state.md**

Update state file with actual status: what renders, what's broken, error messages.

- [ ] **Step 6: Commit state update**

```bash
git add .project-state.md
git commit -m "docs: update state file with v2 verification results"
```

---

### Task 9: Run Code Audit (karen)

**Files:**
- Modify: `.project-state.md`

- [ ] **Step 1: Dispatch karen agent on all src/ files**

Karen reviews every file in src/ and reports:
- What's solid (keep)
- What's broken (fix)
- What's weak (rethink)
- What's missing (add)

- [ ] **Step 2: Update .project-state.md with audit results**

Add karen's findings to open issues, categorized P0/P1/P2.

- [ ] **Step 3: Commit**

```bash
git add .project-state.md
git commit -m "docs: add karen code audit results to state file"
```

---

### Task 10: Run First Panel Review

**Files:**
- Modify: `.project-state.md`

- [ ] **Step 1: Run full 7-agent panel**

Dispatch all 7 panel agents in parallel via context bridge:
1. PM reviews user flows and activation
2. Architect reviews code architecture
3. Engineer reviews code quality
4. Data Scientist reviews analytics setup
5. Player Simulator runs first-time funnel (50 personas)
6. Game Designer reviews game mechanics
7. Desi Artist Panel reviews visual design

- [ ] **Step 2: Compile panel report**

Deduplicate issues, prioritize P0/P1/P2, write to .project-state.md.

- [ ] **Step 3: Create fix task list from P0 issues**

Each P0 becomes a task for the next build cycle.

- [ ] **Step 4: Commit**

```bash
git add .project-state.md
git commit -m "docs: add first panel review results"
```

---

### Task 11: Fix Loop — Cycle 1

- [ ] **Step 1: Fix all P0 issues from panel review**

For each P0, use the appropriate playbook:
- UI issues → /ui-playbook
- Code issues → /fix-playbook
- Content issues → /card-quality
- Architecture issues → /plan-playbook

- [ ] **Step 2: Run click-test-playbook on all affected flows**

- [ ] **Step 3: Run integration gate**

```bash
npm run typecheck && npm run test && npm run build
```

- [ ] **Step 4: STOP & THINK — assess gaps**

Are there missing skills, agents, or MCPs that would help? If yes, create them.

- [ ] **Step 5: Update .project-state.md**

- [ ] **Step 6: Commit all fixes**

```bash
git add -A
git commit -m "fix: resolve P0 issues from panel review cycle 1"
```

---

### Task 12: Panel Review — Cycle 2

- [ ] **Step 1: Run full panel again**

Same 7 agents, fresh context, review current state.

- [ ] **Step 2: Compare against Cycle 1**

Did scores improve? New issues? Regressions?

- [ ] **Step 3: Create fix list from remaining P0 + new P1 issues**

- [ ] **Step 4: Commit panel results**

---

### Task 13: Fix Loop — Cycle 2

Same as Task 11 but for Cycle 2 issues.

---

### Task 14+: Repeat Until Done

Continue build → test → panel → fix cycles until:
- All P0 issues resolved
- All P1 issues resolved or documented as deferred
- Visual QA scores >= 7.0 on all screens
- Integration gate passes (typecheck + tests + build)
- Only human-blocked items remain (design assets, content decisions, deployment credentials)

Final state written to .project-state.md with clear "human-blocked" section.
