# Seedha Loop Protocol — Design Spec

**Date:** 2026-04-12
**Status:** Approved
**Purpose:** The definitive build→test→review→fix loop protocol for Seedha Plot development. Enforces process discipline, visual verification, panel reviews, Claude Code skill usage, memory management, and system architecture compliance.

---

## 1. Why This Exists

Session 2026-04-11/12 produced 92 commits and 10 "loops" but failed at:
- **Process discipline** — CLAUDE.md STOP & THINK was written but never followed after loop 1
- **Visual blindness** — Zero Playwright screenshots taken. All "quality" was hallucinated from reading code.
- **Panel theater** — Agents dispatched individually instead of using the orchestrated `seedhaplot-panel` system
- **Skill neglect** — 100+ skills available, zero invoked after initial brainstorming
- **Memory gaps** — `.project-state.md` updated inconsistently, compaction protocol ignored
- **Architecture violation** — CLAUDE.md, playbooks, and agents were built as a system but executed as ad-hoc improvisation

This protocol makes every step mandatory and ties it to a specific skill, agent, or tool invocation. No improvising.

---

## 2. Tier Classification

First action of every loop. Determines which phases run at full depth.

| Tier | Trigger | Example |
|------|---------|---------|
| **Quick** | 1-2 files, no UI, no game logic | Typo, config change, env var |
| **Standard** | Touches UI or game logic | Animation tweak, scoring change, component restyle |
| **Major** | Redesign, new system, new feature, pre-ship | HomeScreen redesign, adaptive engine, new language pack, deployment |

---

## 3. The 8 Phases

### Phase 1: READ (all tiers)

| Action | Tool |
|--------|------|
| Read state | `Read: .project-state.md` |
| Read rules | `Read: CLAUDE.md` (relevant section) |
| Check memory | `Read: ~/.claude/projects/.../memory/MEMORY.md` → follow links |
| Check last session | `Read: project_seedhaplot_session_*.md` (latest) |

No skills invoked. Pure reading. **Mandatory every loop — the failure this session was skipping this after loop 1.**

### Phase 2: THINK (all tiers)

Follow CLAUDE.md Section 2 — STOP & THINK protocol:

1. **Scan inventory** — skills, agents, MCPs available
2. **Assess quality bar** — design-critical? Engage visual gate.
3. **Assess model fit** — Opus for taste/architecture, Sonnet for mechanical, Haiku for trivial
4. **Assess efficiency** — parallelize? Batch with other work?
5. **Output toolchain plan** — "Tier [X]. Using [skill]. Agents: [list]. Model: [choice]."
6. **Wait for approval** — if destructive. Skip if autonomous mode.

**Skills to consider:**
- `Skill: game-changing-features` — if exploring what to build
- `Skill: market-research` — if comparing competitors
- `Skill: business-consultant` — if making scope/pricing decisions

### Phase 3: BUILD (all tiers — invoke the ACTUAL skill)

**UI changes:**
- `Skill: ui-playbook` (mandatory entry point)
- `Skill: superpowers:brainstorming` → before any new design
- `Skill: creative-ux-designer` → 5-layer audit (usability → interaction → cognitive load → feel → systemic)
- `Skill: ui-ux-pro-max` → pattern library, 161 palettes, 57 font pairings, 99 UX guidelines
- `Skill: micro-interactions` → hover, loading, transitions, feedback
- `Skill: mobile-first-layout` → responsive at 375px
- `Skill: frontend-design` → production-grade, no AI aesthetic
- `Skill: composition-patterns` → React compound components, flexible APIs
- `Skill: react-best-practices` → 40+ performance rules
- `Skill: web-design-guidelines` → Web Interface Guidelines compliance
- `Skill: tailwind-patterns` → CSS architecture

**Bug fixes:**
- `Skill: fix-playbook` (mandatory entry point)
- `Skill: superpowers:systematic-debugging` → 4-phase root cause
- `Skill: superpowers:test-driven-development` → failing test first
- `Skill: error-handling-patterns` → resilient error handling
- `Skill: coding-standards` → naming, readability, immutability

**New features:**
- `Skill: plan-playbook` (mandatory entry point)
- `Skill: superpowers:writing-plans` → implementation plan
- `Skill: superpowers:subagent-driven-development` → execute with reviews
- `Skill: superpowers:dispatching-parallel-agents` → if independent tasks

**Card content:**
- `Skill: card-quality` (mandatory entry point)
- `Skill: copywriting` → clue writing quality
- `Skill: prompt-engineering` → card generation prompts

**Game logic:**
- `Skill: superpowers:test-driven-development` → TDD
- `Skill: ab-test-setup` → if setting up experiments

**Sub-gates within Phase 3:**

| Gate | How | When |
|------|-----|------|
| Spec Gate | Fresh `general-purpose` agent: "Restate what you're building. Does this match the spec?" | Before writing code |
| Implementation Gate | Fresh `general-purpose` agent: "Read the code. Does it match the spec? Extra or missing?" | After writing code |

**Phase 3 output manifest (MANDATORY):**
```
CHANGED: [file list]
AFFECTED SCREENS: [screen list]
SCREENSHOT NEEDED: [screen IDs from the 16-state inventory]
```

### Phase 4: VERIFY VISUALLY (Standard + Major)

| Action | Tool |
|--------|------|
| Start server | `Bash: npx vite --port 5173` |
| Take screenshots | `Bash: python3 scripts/visual-test.py` |
| View screenshots | `Read: screenshots/[name].png` — Read tool renders images inline |
| Mobile check | Screenshots at 375px viewport |
| Desktop check | Screenshots at 1280px viewport |
| Animation check | Before/after states (pre-flip, post-flip, correct flash, wrong shake) |

**Skills:**
- `Skill: webapp-testing` → Playwright patterns
- `Skill: click-test-playbook` → all 5 user paths
- `Skill: senior-qa` → test strategy, what to check

**Playwright script** lives at `scripts/visual-test.py` (committed, not ad-hoc /tmp).

**Screenshots saved to** `screenshots/` directory.

**Quick tier:** typecheck + tests only (no screenshots for config-only changes).

### Phase 5: QUALITY GATES (tier-dependent)

| Gate | Quick | Standard | Major | Tool |
|------|-------|----------|-------|------|
| Typecheck | ✅ | ✅ | ✅ | `Bash: npx tsc --noEmit` |
| Tests | ✅ | ✅ | ✅ | `Bash: npx vitest run` |
| Build | ✅ | ✅ | ✅ | `Bash: npx vite build` |
| ESLint | ✅ | ✅ | ✅ | `Bash: npx eslint src/` |
| Playwright screenshots | ❌ | ✅ | ✅ | Phase 4 output |
| Visual QA scoring | ❌ | ✅ (affected) | ✅ (all 16) | `Agent: seedhaplot-visual-qa` |
| Visual score >= 7.0 | ❌ | ✅ | ✅ | Blocking gate |
| Accessibility | ❌ | If UI changed | ✅ | `Agent: accesslint:reviewer` + `Skill: accesslint:contrast-checker` + `Skill: aria-implementation` |
| Karen reality check | ✅ | ✅ | ✅ | `Agent: karen` |

**Skills:**
- `Skill: quality-gates` (superpowers) → structured PASS/FAIL verdicts with escalation
- `Skill: superpowers:verification-before-completion` → prove it works before claiming done
- `Skill: code-review-checklist` → comprehensive review checklist
- `Skill: accesslint:use-of-color` → not relying on color alone
- `Skill: accesslint:link-purpose` → link text clarity

**If any gate FAILS:** back to Phase 3. Fix. Re-run Phase 4 + 5. Do NOT proceed to Phase 6.

### Phase 6: PANEL REVIEW (tier-dependent)

| Tier | How |
|------|-----|
| **Quick** | `Agent: karen` + 1-2 relevant agents from the 8 |
| **Standard** | Quick panel: 2-3 relevant agents with shared context |
| **Major** | `Agent: seedhaplot-panel` — full 8-agent orchestration |

**The 8 panel members:**

| # | Agent | Lens |
|---|-------|------|
| 1 | Priya PM | Product, funnels, virality, north star |
| 2 | Arjun Arch | Architecture, scalability, error boundaries |
| 3 | Dev the Dev | Code quality, TypeScript, React, testing |
| 4 | Shreya Stats | Analytics, PostHog, experiments, funnels |
| 5 | The 50 | 50-persona player simulation |
| 6 | Gamedev Gaurav | Game feel, difficulty, juice, party dynamics |
| 7 | Gen Z Collective | Visual design, cultural authenticity, shareability |
| 8 | Dr. Raghav | Adaptive algorithm, psychometrics, emotional arc, fairness |

**Quick panel routing:**

| Change Type | Agents |
|-------------|--------|
| UI/visual | Gen Z Collective + Gamedev Gaurav + visual-qa |
| Bug fix | Dev the Dev + The 50 + karen |
| Game logic | Gamedev Gaurav + Dr. Raghav + The 50 |
| Content/cards | The 50 + Gamedev Gaurav + Dr. Raghav |
| Performance | Arjun Arch + Dev the Dev |
| Analytics | Shreya Stats + Dev the Dev |
| Pre-ship | ALL 8 — full panel, no exceptions |

**Major panel protocol (seedhaplot-panel agent handles this):**
1. Create `/tmp/seedhaplot-context-bridge.md` with state + screenshots + changes
2. Dispatch all 8 agents in parallel
3. Collect results
4. Deduplicate: 3+ agents = P0, 2 = P1, 1 = P2
5. Write unified report to `.project-state.md`
6. Create task list from P0 issues

**Skills:**
- `Skill: context-bridge` → shared state for parallel agents
- `Skill: analytics-tracking` → PostHog validation (Shreya Stats)
- `Skill: analytics-product` → funnels, cohorts (Shreya Stats)

### Phase 7: SCIENCE GATE (Standard + Major, when game logic touched)

**Owned by: Dr. Raghav (Sr. Principal Scientist)**

| Check | Method | When |
|-------|--------|------|
| Adaptive convergence | Simulate 100 playthroughs — does ability stabilize by card 10-12? | adaptive.ts touched |
| Content calibration | Cross-reference difficulty labels against actual player data. Are easy cards easy? | Cards added/modified |
| Emotional arc | Player simulator "Solo sweep" — plot emotional trajectory across 10 personas | Game flow changed |
| Explainability | "Would a 22-year-old at a party understand 'Movie Buff · Top 58%'?" | Scoring display changed |
| Fairness | Does the system disadvantage 90s-only watchers? 2020s-only watchers? | Difficulty ratings changed |
| Statistical validity | Are 12 cards enough for reliable ability estimation? What's the confidence interval? | Adaptive parameters changed |

**Skills:**
- `Skill: ab-test-setup` → experiment design
- `Skill: senior-qa` → test methodology for simulation

**Science gate only triggers when:** adaptive engine, scoring, card data, or game flow is modified. Not on CSS changes.

### Phase 8: WRITE STATE (all tiers)

| Action | Tool |
|--------|------|
| Update scores | `Edit: .project-state.md` — visual QA scores with trends |
| Update issues | `Edit: .project-state.md` — P0/P1/P2 from panel |
| Log decisions | `Edit: .project-state.md` — decisions log |
| Update memory | `Write: memory/` — if cross-session decisions |
| Compaction | If context > 60%: truths inventory → compact → verify |
| Commit | `Bash: git add + git commit` |
| Changelog | `Skill: changelog-generator` — at Major tier |
| Loop log | Output: "Loop [N]. Tier: [X]. Visual QA: [score]. Panel: [verdict]. P0: [count]." |

**Skills:**
- `Skill: changelog-generator` → auto changelog
- `Skill: release-notes-pro` → user-facing notes (at ship)
- `Skill: superpowers:finishing-a-development-branch` → at session end

---

## 4. Context Contracts

Every phase transition has a defined input/output contract.

### Phase 1→2: READ→THINK
- **Produces:** State summary, memory context, branch status
- **Passes via:** Conversation context
- **Risk mitigation:** Write 5-line scratchpad summary before Phase 2

### Phase 2→3: THINK→BUILD
- **Produces:** Tier, playbook, agents, model, plan statement
- **Passes via:** Conversation + `Skill: context-bridge` for subagents
- **Risk mitigation:** Context bridge file for any subagent dispatch

### Phase 3→4: BUILD→VERIFY
- **Produces:** Changed files, affected screens manifest, test results, gate verdicts
- **Passes via:** Manifest output from Phase 3 (tells Phase 4 what to screenshot)
- **Risk mitigation:** Playbook skills output the manifest. No manifest = Phase 4 screenshots everything.

### Phase 4→5: VERIFY→GATES
- **Produces:** Screenshot file paths, visual observations
- **Passes via:** Files on disk (screenshots/) + conversation notes
- **Risk mitigation:** seedhaplot-visual-qa dispatched with explicit paths + notes

### Phase 5→6: GATES→PANEL
- **Produces:** All gate verdicts, visual QA scores (7 dimensions), blocking issues
- **Passes via:** `Skill: context-bridge` → writes everything to `/tmp/seedhaplot-context-bridge.md`
- **Risk mitigation:** Panel agents are parallel — dedup happens after ALL return

### Phase 6→7: PANEL→SCIENCE
- **Produces:** Panel report (P0/P1/P2), Dr. Raghav's initial findings
- **Passes via:** Conversation + Dr. Raghav's output
- **Risk mitigation:** At Major tier, Dr. Raghav runs twice (panel + deep)

### Phase 7→8: SCIENCE→WRITE
- **Produces:** Science verdict
- **Passes via:** Conversation context
- **Risk mitigation:** Phase 8 aggregates ALL phases before writing

### Loop N→N+1: Cross-loop
- **Produces:** Updated `.project-state.md`, memory files, git commits
- **Passes via:** FILES on disk, not conversation
- **Risk mitigation:** Aristotelian check: "Could Loop N+1 continue without asking anything?"

---

## 5. Exit Criteria

### Per-Loop Exit (proceed to next loop)

ALL must be true:
- [ ] Phase 5 gates: ALL PASS
- [ ] Visual QA: >= 7.0 overall, no dimension below 5.0
- [ ] Panel: zero P0 issues
- [ ] Science: PASS (if applicable)
- [ ] State file updated with scores + trends

If ANY fails → fix → re-run from Phase 3.

### Session Exit (stop looping entirely)

ALL must be true:
- [ ] Visual QA >= 7.0 on ALL 16 screen states
- [ ] Zero P0 issues across full 8-agent panel
- [ ] Zero agent-fixable P1 issues
- [ ] Player simulator: >= 40/50 complete the game
- [ ] Player simulator: >= 25/50 would share
- [ ] Desi Artist Panel: >= 7/10 average
- [ ] Dr. Raghav: adaptive algorithm PASS
- [ ] Integration gate: typecheck + tests + build + lint ALL green
- [ ] Click-test: all 5 user paths verified with screenshots
- [ ] Only human-blocked items remain

### Quality Regression Rule

If any visual QA score DROPS between loops → **regression blocker**. Cannot exit loop until score restored or exceeded.

---

## 6. Card Generation System

### Language Expansion

| Current | New Label | Code | Cards at Launch |
|---------|-----------|------|-----------------|
| Bollywood (BW) | Hindi Films | HI | 74 (existing) |
| Tollywood (TW) | Telugu Films | TE | 75 (existing) |
| — (new) | Tamil Films | TA | 30 (agent-generated) |
| — (new) | Malayalam Films | ML | 30 (agent-generated) |

### Card Generation Agent

**Skills per generation batch:**
- `Skill: card-quality` → structural validation, dedup, difficulty distribution
- `Skill: copywriting` → clue writing quality
- `Skill: prompt-engineering` → generation prompt optimization
- `Skill: creative-ux-designer` → voice consistency (sardonic ~40%)

**Generation workflow per language:**
1. Generate 30 cards (10 easy, 10 medium, 10 hard)
2. `Skill: card-quality` → validate structure, dedup
3. `Agent: seedhaplot-player-simulator` "Content audit" mode → Content Critics review clues
4. `Agent: Dr. Raghav` → validate difficulty labels against adaptive ratings
5. Fix flagged cards
6. Merge into packs
7. Repeat until target reached

### Content quality validation (player simulator + Content Critics):

Every generated card must pass:
- **Plot accuracy:** Does the clue describe THIS movie specifically, not 10 similar ones?
- **Humor quality:** Does the terrible plot description actually make you laugh? Would you read it aloud at a party?
- **Unique detail:** Does the clue contain at least one fact/scene only THIS film has?
- **Fun fact accuracy:** Is the "Did you know" factually true? Year correct? Cast correct?
- **Spoiler check:** Does the clue give away the ending or a key twist?
- **Difficulty honesty:** Would the TARGET audience (not film experts) actually find "easy" easy?
- **Voice consistency:** Is ~40% sardonic, not 80%? Are sentence patterns varied?
- **Cultural sensitivity:** No insensitive jokes about real people, tragedies, or religions.

Content Critics (Archetype 5 in player simulator) review EVERY card individually and flag failures.

### Difficulty calibration rules:
- **Easy:** Everyone who watches that language's films knows this. DDLJ/Baahubali-level obvious.
- **Medium:** Regular watchers know it. 30+ films in that language.
- **Hard:** Deep cuts. Film buffs only. Era/genre specific.
- **Target distribution:** 40% easy, 35% medium, 25% hard.

### Code changes needed:
- `types.ts`: `Industry` type → `'HI' | 'TE' | 'TA' | 'ML'`
- HomeScreen: 4 cinema panels (2x2 grid or scrollable row)
- Card packs: `public/content/packs/ta.json`, `ml.json`
- Manifest: add Tamil + Malayalam
- ContentLoader: load 4 packs
- Coming-soon UI for languages with < 30 cards

---

## 7. Future Skills (Launch & Growth)

Not part of the loop protocol but available when ready:

| Phase | Skills |
|-------|--------|
| Launch planning | `launch-strategy`, `growth-engine`, `prd-generator` |
| Viral mechanics | `viral-generator-builder`, `referral-program` |
| User activation | `onboarding-cro`, `paywall-upgrade-cro` |
| App store | `app-store-optimization`, `react-native-skills` |
| Mobile design | `mobile-design-philosophy`, `mobile-first-layout` |
| SEO/marketing | `meta-tags-optimizer`, `seo-content-writer`, `geo-content-optimizer` |
| Analytics | `analytics-tracking`, `analytics-product`, `posthog-automation` |
| Business | `business-consultant`, `pricing-strategy`, `market-research` |
