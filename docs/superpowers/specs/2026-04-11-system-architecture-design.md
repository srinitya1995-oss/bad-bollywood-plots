# Seedha Plot — System Architecture & Infrastructure Design Spec

**Date:** 2026-04-11
**Status:** Approved
**Approach:** Full port of Pebl-era workflow infrastructure + code audit + redesign

---

## 1. Goals

1. **Developer Workflow** — Port Pebl's battle-tested CLAUDE.md, STOP & THINK, quality gates, playbooks, compaction protocol, and tool routing to Seedha Plot
2. **Visual QA** — Create a web-native visual QA agent with a desi maximalist rubric (7 dimensions, 16 screen states)
3. **Player Simulation** — 50-persona simulator agent across 5 archetypes (Film Buff, Party Starter, Reluctant Player, Competitive Grinder, Content Critic)
4. **Expert Panel** — 7-agent review committee (PM, Architect, Engineer, Data Scientist, Player Simulator, Game Designer, Desi Artist Panel)
5. **Code Audit** — Audit existing v2 React codebase, fix what's broken, rethink what's weak
6. **Continuous Loop** — Build → test → panel review → fix → repeat until only human-blocked items remain

## 2. Deliverables

### Infrastructure Files
- `CLAUDE.md` — 400+ line brain file (STOP & THINK, quality gates, playbooks, tool routing, project identity, compaction, anti-patterns, tech stack, architecture docs)
- `.project-state.md` — cross-session state file (scores, issues, decisions, card health, what's next)
- `.claude/settings.json` — hooks (pre-write validation, session start state check)

### Project-Local Skills (`.claude/skills/`)
- `ui-playbook/SKILL.md`
- `fix-playbook/SKILL.md`
- `review-playbook/SKILL.md`
- `ship-playbook/SKILL.md`
- `plan-playbook/SKILL.md`
- `card-quality/SKILL.md`
- `context-bridge/SKILL.md`
- `click-test-playbook/SKILL.md`

### Agents (`~/.claude/agents/`)
- `seedhaplot-visual-qa.md` — web-native visual QA with desi maximalist rubric
- `seedhaplot-player-simulator.md` — 50-persona player simulation
- `seedhaplot-panel.md` — 7-agent expert review panel orchestrator

### Panel Agent Definitions (embedded in panel orchestrator)
- Product Manager ("Priya PM")
- Architect ("Arjun Arch")
- Engineer ("Dev the Dev")
- Data Scientist ("Shreya Stats")
- Player Simulator ("The 50")
- Game Designer ("Gamedev Gaurav")
- Desi Artist Panel ("The Gen Z Collective" — 5 voices)

## 3. CLAUDE.md Structure

See brainstorming session for full content. Sections:

1. First Thing: Read State + Vision
2. STOP & THINK Protocol (mandatory before any task)
3. Project Identity (design system, color tokens, typography, ornaments, card design, logo)
4. Available Agents (seedhaplot-specific + global + built-in)
5. Quality Gates (4: Spec, Implementation, Visual, Integration)
6. Playbooks (8 skills mapped to pipelines)
7. Tool Routing Table (20+ task types → playbook + agents + skills)
8. MCPs (PostHog, AccessLint, 21st Magic, Memory, Sequential Thinking, Any-Chat)
9. After Every Agent Run (update state, run gates, test dependents)
10. Compaction Protocol (60% threshold, truths inventory, Aristotelian check)
11. Anti-patterns (process, design, testing, code, content)
12. Tech Stack + Architecture (React 18, Vite 5, TypeScript, Framer Motion, Supabase, PWA)

## 4. Visual QA Rubric

7 dimensions, weighted scoring:

| Dimension | Weight | What "10" looks like |
|---|---|---|
| Card Presence | 2x | Cards feel like physical objects floating on a stage. Magnetic crimson/emerald. |
| Cultural Authenticity | 2x | Bollywood poster in Rajasthan palace. Someone from Mumbai shares because it's "us." |
| Typography Hierarchy | 1x | Type alone tells you where to look. Playfair owns titles, DM Sans owns UI. |
| Color Energy | 1x | Every color intentional. Bollywood poster energy. Feel color before reading text. |
| Interaction Feel | 1.5x | Every interaction has weight. Flip makes you smile. Want to keep tapping for the feel. |
| Mobile-at-Party | 1.5x | Phone feels like a playing card. Pass-the-phone seamless. Drunk friend can play. |
| Composition | 1x | Every pixel placed. Poster composition. Could frame it. |

Pass: >= 7.0 overall, no dimension below 5.0.

## 5. Player Simulator Archetypes

50 personas across 5 archetypes (10 each):
1. Film Buff — playing to prove knowledge
2. Party Starter — host making everyone play
3. Reluctant Player — handed a phone, 3-second patience
4. Competitive Grinder — Endless mode, wants high score
5. Content Critic — judges every clue, will submit corrections

6 simulation modes: Solo sweep, Party simulation, First-time funnel, Endless grind, Content audit, Stress test.

## 6. Expert Panel

7 agents reviewing from different lenses:
1. PM — user flows, activation, retention, virality, north star metric
2. Architect — FSM correctness, bundle size, PWA, Supabase schema, error boundaries
3. Engineer — TypeScript strictness, React patterns, testability, accessibility
4. Data Scientist — event tracking, funnels, A/B capability, per-card performance
5. Player Simulator — 50 personas, party viability score
6. Game Designer — core loop, difficulty curve, juice, replayability, social dynamics
7. Desi Artist Panel — 5 Gen Z creatives (designer, illustrator, meme runner, poster artist, textile artist)

## 7. Build Loop

```
LOOP:
  1. Build (implement next priority from .project-state.md)
  2. Test (click-test-playbook + unit tests + typecheck)
  3. Panel Review (full 7-agent panel)
  4. STOP & THINK (assess gaps — missing skills? agents? MCPs?)
  5. Fix bugs from panel (fix-playbook for each)
  6. Test again
  7. Update .project-state.md
  8. REPEAT until only human-blocked items remain
```
