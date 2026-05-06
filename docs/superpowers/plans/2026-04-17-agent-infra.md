# Seedha Plot Agent Infra Fix — Implementation Plan

> **For agentic workers:** Inline execution via `superpowers:executing-plans`. Steps use `- [ ]` tracking.

**Goal:** Make seedhaplot-visual-qa, seedhaplot-player-simulator, seedhaplot-panel dispatchable; ship a curated skill index; install two harness hooks that enforce the gates we've been violating.

**Root cause:** Three agent files at `~/.claude/agents/seedhaplot-*.md` were written without YAML frontmatter, so Claude Code's loader skips them. CLAUDE.md references them as if they exist. The whole session drifted because the real agents were invisible.

**Tech approach:** Minimum-invasive — prepend frontmatter to 3 existing files (don't rewrite bodies), write one project-local index, add two hooks via `update-config` skill.

---

## Task 1: Add frontmatter to 3 seedhaplot agents

**Files:**
- Modify: `~/.claude/agents/seedhaplot-visual-qa.md` (top of file)
- Modify: `~/.claude/agents/seedhaplot-player-simulator.md` (top of file)
- Modify: `~/.claude/agents/seedhaplot-panel.md` (top of file)

- [ ] **Step 1: Prepend frontmatter to seedhaplot-visual-qa.md**

Insert at line 1, before the existing `# seedhaplot-visual-qa` heading:

```yaml
---
name: seedhaplot-visual-qa
description: Visual and UX critic for Seedha Plot. Evaluates pixels and interactions — screenshots states via dev server, compares what the user sees vs what the code does. Catches dead buttons, invisible state changes, broken promises. Scores against the 7-dimension desi maximalist rubric. Updates .project-state.md after every review.
model: opus
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - WebSearch
  - WebFetch
---

```

- [ ] **Step 2: Prepend frontmatter to seedhaplot-player-simulator.md**

Insert at line 1, before the existing `# Seedha Plot Player Simulator` heading:

```yaml
---
name: seedhaplot-player-simulator
description: Simulates 50 diverse desi player personas playing Seedha Plot. Reads actual game code, card data, and UI — never invents features. Reports first-5-seconds reactions, quit points, share triggers, and per-persona issues. Six modes — Solo Sweep, Party Simulation, First-Time Funnel, Endless Grind, Content Audit, Stress Test.
model: opus
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - WebSearch
  - WebFetch
---

```

- [ ] **Step 3: Prepend frontmatter to seedhaplot-panel.md**

Insert at line 1, before the existing `# Seedha Plot — Expert Review Panel` heading:

```yaml
---
name: seedhaplot-panel
description: Expert review panel orchestrator for Seedha Plot. Dispatches 7 reviewers in parallel (Priya PM, Arjun Arch, Dev the Dev, Shreya Stats, The 50, Gamedev Gaurav, Gen Z Collective), deduplicates by severity, writes a single prioritized P0/P1/P2 report to .project-state.md. Use for pre-ship audits, major redesigns, or explicit 12-agent reviews.
model: opus
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - WebSearch
  - WebFetch
---

```

- [ ] **Step 4: Verify discovery**

Start a fresh session or look at the subagent_types list. The three agents should now appear.

---

## Task 2: Write curated SKILLS-INDEX.md

**Files:**
- Create: `/Users/srinityaduppanapudisatya/Desktop/seedhaplot/.claude/SKILLS-INDEX.md`

- [ ] **Step 1: Write the index**

Structure: section per project phase (design, port, content, QA, ship, growth, infra) — each lists the 3-6 best skills/agents for that phase with one-line "reach for this when". Cover four axes explicitly: efficiency, personas, context, writing. Include MCPs.

---

## Task 3: Install two harness hooks

**Files:**
- Modify: `/Users/srinityaduppanapudisatya/Desktop/seedhaplot/.claude/settings.json`
- Create: `/Users/srinityaduppanapudisatya/Desktop/seedhaplot/.claude/hooks/guard-dev-server.sh`
- Create: `/Users/srinityaduppanapudisatya/Desktop/seedhaplot/.claude/hooks/session-log.sh`

- [ ] **Step 1: Invoke `update-config` skill**

The skill knows the correct PreToolUse / PostToolUse hook structure. Use it to add:

- Hook A (PreToolUse on Bash): if the command matches `npm (run )?(build|test|lint|vitest)` AND `lsof -ti:5173` returns a PID, block with exit 2 and print "Dev server is running on 5173. Kill it first or use a scoped test command." Don't block if the user passed `SEEDHAPLOT_FORCE=1`.
- Hook B (PostToolUse on Bash|Edit|Write): append a single line `[ISO timestamp] tool=<tool> <first 80 chars>` to `.session-log.md`. Truncate the file at 500 lines on append.

- [ ] **Step 2: Write both shell scripts referenced by the hooks**

- [ ] **Step 3: Smoke test — trigger each hook and confirm behavior**

Run a harmless bash while dev server is live → should be blocked. Run an edit → should append to `.session-log.md`.

---

## Self-review

- Spec coverage: ✓ agents, ✓ index, ✓ hooks
- No placeholders: ✓ frontmatter blocks are fully specified
- Types: ✓ hook matchers use documented tool names (Bash / Edit / Write)
