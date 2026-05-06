# Seedha Plot Agent Infra v2 — Fix Plan

> Follow-up to `2026-04-17-agent-infra.md`. That plan shipped but self-critique surfaced six real gaps. This plan addresses the five that matter.

**Goal:** Close the gaps from v1 that would cause wrong QA scores, continued screenshot-skipping, and broken guardrails.

**Verified premises (done before planning):**
1. `docs/superpowers/specs/2026-03-26-bad-plots-v2-design.md` exists. My earlier critique was wrong. No fix needed.
2. `src/style.css` tokens are `--paper --ink --tomato --gold --emerald --stage`. The visual-qa rubric still says "aubergine background, crimson/emerald cards". Drift confirmed.
3. `.claude/settings.json` `PreToolUse[0]` uses `"type": "intercept"`. Schema permits only `command | prompt | agent | http`. Confirmed broken.

**Tech approach:** Surgical edits. No rewrites. Each task isolated and revertable.

---

## Phase 1 — Must fix before next playthrough QA

### Task 1: Update visual-qa palette references to v8

**Files:**
- Modify: `~/.claude/agents/seedhaplot-visual-qa.md`

**Why:** Agent scores against a palette that no longer exists in code. Every review will be wrong.

- [ ] **Step 1: Replace aubergine/crimson/emerald language with v8 tokens**

Old strings to find and replace:
- "Crimson/emerald is magnetic" → "Tomato/emerald is magnetic"
- "Saturated color pops off aubergine" → "Saturated color pops off paper"
- "Aubergine flat. Gold overused." → "Paper flat. Gold overused."
- "Crimson/emerald vibrant against aubergine" → "Tomato/emerald vibrant against paper"
- "crimson card" → "tomato card"
- Any other "aubergine" → "paper" (background) or "ink" (dark)

- [ ] **Step 2: Add v8 palette reference block**

Insert after the "Your Standard" section, before "The Desi Maximalist Rubric":

```markdown
## v8 Palette Reference (canonical)

From `src/style.css`:
- `--paper #F6EBD1` — primary card / panel surface
- `--ink #1A0F0A` — primary text, borders, chunky shadows
- `--tomato #C8321C` — BW cards, masthead band, accent
- `--emerald #3EA87A` — TW cards
- `--gold #F2A72E`, `--gold-bright #F5C457` — highlights, scores
- `--stage #14100a` — full-screen bg
- `--cream #F5E8D4` — legacy alias for paper

If a screenshot uses muddy or desaturated versions of these, score down. If it uses tokens not in this list (neon purple, plain red, any grey), flag as palette drift.
```

- [ ] **Step 3: Verify**

`grep -iE "aubergine|crimson (card|is|/)" ~/.claude/agents/seedhaplot-visual-qa.md` returns zero matches.

---

### Task 2: Install screenshot-first gate

**Files:**
- Create: `/Users/srinityaduppanapudisatya/Desktop/seedhaplot/.claude/hooks/screenshot-gate.sh`
- Modify: `/Users/srinityaduppanapudisatya/Desktop/seedhaplot/.claude/settings.json` (add PreToolUse on Task)

**Why:** Today's failure was me dispatching agents and making "looks good" claims without ever screenshotting the React app. The rule belongs in a hook, not in prose.

**Behavior:**
- Fires on `PreToolUse` matcher `Task` (agent dispatch) and on `Stop` (final response guard)
- Checks if any file under `screenshots/qa/$(date +%Y-%m-%d)/` was modified in the last 20 minutes
- If NO recent screenshot AND the about-to-dispatch prompt mentions `QA|visual|playthrough|design|UI|screen` (case-insensitive), block with exit 2 and explain
- Bypass: set `SEEDHAPLOT_NO_SCREENSHOT=1` env or include `no-screenshot-needed` in prompt

- [ ] **Step 1: Write the shell script**

```bash
#!/usr/bin/env bash
# Block agent dispatch if we're doing UI/QA work without a fresh screenshot.
set -u
TODAY="/Users/srinityaduppanapudisatya/Desktop/seedhaplot/screenshots/qa/$(date +%Y-%m-%d)"
payload="$(cat || true)"
prompt="$(printf '%s' "$payload" | jq -r '.tool_input.prompt // .tool_input.description // ""' | head -c 2000)"

# Not a UI/QA-relevant task? Skip.
if ! printf '%s' "$prompt" | grep -qiE 'qa|visual|playthrough|design|ui|screen|flip|card|render|layout'; then
  exit 0
fi

# Explicit bypass markers.
if printf '%s' "$prompt" | grep -q 'no-screenshot-needed'; then exit 0; fi
if [ "${SEEDHAPLOT_NO_SCREENSHOT:-}" = "1" ]; then exit 0; fi

# Is there a screenshot from the last 20 minutes anywhere under screenshots/qa/today/?
if [ -d "$TODAY" ] && find "$TODAY" -type f -mmin -20 | grep -q .; then
  exit 0
fi

printf '%s\n' \
  "Blocked: UI/QA task dispatched with no screenshot in ${TODAY} from the last 20 minutes." \
  "Fix: take a screenshot first (puppeteer, webapp-testing skill, or pebl-visual-qa pattern)." \
  "Bypass: include 'no-screenshot-needed' in the prompt, or set SEEDHAPLOT_NO_SCREENSHOT=1." >&2
exit 2
```

- [ ] **Step 2: Pipe-test 3 cases**

```bash
chmod +x ~/Desktop/seedhaplot/.claude/hooks/screenshot-gate.sh
# Case A: non-UI task, should pass
echo '{"tool_name":"Task","tool_input":{"prompt":"run the build"}}' | ~/Desktop/seedhaplot/.claude/hooks/screenshot-gate.sh; echo "A exit=$? (expect 0)"
# Case B: UI task with no screenshots, should block
echo '{"tool_name":"Task","tool_input":{"prompt":"do a playthrough QA of the card screen"}}' | ~/Desktop/seedhaplot/.claude/hooks/screenshot-gate.sh; echo "B exit=$? (expect 2)"
# Case C: UI task with bypass, should pass
echo '{"tool_name":"Task","tool_input":{"prompt":"visual audit — no-screenshot-needed"}}' | ~/Desktop/seedhaplot/.claude/hooks/screenshot-gate.sh; echo "C exit=$? (expect 0)"
```

- [ ] **Step 3: Wire into settings.json**

Add to `.hooks.PreToolUse`:
```json
{
  "matcher": "Task",
  "hooks": [
    { "type": "command", "command": "/Users/srinityaduppanapudisatya/Desktop/seedhaplot/.claude/hooks/screenshot-gate.sh", "timeout": 5 }
  ]
}
```

- [ ] **Step 4: Validate JSON + schema**

```bash
jq -e '.hooks.PreToolUse[] | select(.matcher == "Task") | .hooks[0].command' ~/Desktop/seedhaplot/.claude/settings.json
```

---

## Phase 2 — Cleanup (low risk, high tidiness)

### Task 3: Fix the broken `intercept` hook

**Files:**
- Modify: `/Users/srinityaduppanapudisatya/Desktop/seedhaplot/.claude/settings.json`

**Why:** `"type": "intercept"` is not in the schema. The PreToolUse Edit|Write reminder is silently no-op. Either delete it or replace with a valid type.

- [ ] **Step 1: Decide keep-or-cut**

Keep as a `command` hook that echoes to stderr but exits 0 (non-blocking reminder). Replace:

```json
{ "type": "intercept", "command": "echo '...'", "timeout": 5000 }
```
with:
```json
{ "type": "command", "command": "echo 'REMINDER: Did you invoke a playbook or superpowers skill before writing code?' >&2", "timeout": 5 }
```

- [ ] **Step 2: Validate**

```bash
jq '.hooks.PreToolUse[] | select(.matcher == "Edit|Write") | .hooks[0].type' ~/Desktop/seedhaplot/.claude/settings.json
# expect: "command"
```

---

### Task 4: Reconcile panel body (7 members) with 12-agent roster

**Files:**
- Modify: `~/.claude/agents/seedhaplot-panel.md`

**Why:** Memory `reference_seedhaplot_12agent_panel.md` lists 12 slots. Agent body only orchestrates 7 internal reviewers. Gap: the roster includes `Dr. Raghav (Sr. Applied Scientist — adaptive, psychometrics)` as slot 8, never added to the body. Five other slots (business-consultant, Jenny, player-simulator, accesslint:reviewer, karen) are correctly mapped to external agents/skills the panel already delegates to.

- [ ] **Step 1: Add Dr. Raghav section to the agent body**

Insert after `## Panel Member 7: The Gen Z Collective (Desi Artist Panel)`:

```markdown
## Panel Member 8: Dr. Raghav (Applied Scientist)

### Identity
You are Dr. Raghav, a senior applied scientist working on adaptive systems and psychometrics. You evaluate whether the difficulty-calibration and scoring model actually measures player skill rather than luck.

### What You Care About
- Item Response Theory fit of the `difficulty` field vs actual correctness rates
- Whether the scoring formula rewards the right things
- Card-level discrimination (does a "hard" card actually separate skilled from unskilled players?)
- Streak-bonus math: is +N fair or swingy?
- Adaptive difficulty calibration window (how many cards before the model trusts its estimate?)

### What You Review
- `src/core/scorer.ts`
- `src/core/deckBuilder.ts` (adaptive selection logic)
- `cards.json` (difficulty distribution)
- Any existing adaptive / party-mode logic

### Output to `/tmp/seedhaplot-panel-dr-raghav.md`
- Difficulty calibration score 1-10
- Top 3 scoring-model issues
- Recommended IRT/psychometric improvements
- Verdict: trustworthy measurement or noise?
```

- [ ] **Step 2: Add Dr. Raghav to the dispatch list (Step 2 of Execution Protocol)**

Change "Dispatch All 7 Agents in Parallel" to "Dispatch All 8 Agents in Parallel". Add row to the Quick Panel Mode table for "Scoring/adaptive change → Dr. Raghav + Gamedev Gaurav".

---

### Task 5: Session-log reader via SessionStart hook

**Files:**
- Modify: `/Users/srinityaduppanapudisatya/Desktop/seedhaplot/.claude/settings.json`

**Why:** A log without a reader is noise. Every session should dump the last 20 log lines so the new session knows what was verified.

- [ ] **Step 1: Append to existing SessionStart command**

Current SessionStart prints first 40 lines of `.project-state.md`. Extend it to also print last 20 lines of `.session-log.md`:

```json
{
  "type": "command",
  "command": "cd /Users/srinityaduppanapudisatya/Desktop/seedhaplot && { echo '--- .project-state.md (top 40) ---'; head -40 .project-state.md 2>/dev/null; echo ''; echo '--- .session-log.md (last 20) ---'; tail -20 .session-log.md 2>/dev/null || echo '(no prior session log)'; }",
  "timeout": 3
}
```

- [ ] **Step 2: Validate JSON**

```bash
jq . ~/Desktop/seedhaplot/.claude/settings.json >/dev/null && echo VALID
```

---

## Phase 3 — Nice to have (punt if time-constrained)

### Task 6: Widen the dev-server guard

**Files:**
- Modify: `/Users/srinityaduppanapudisatya/Desktop/seedhaplot/.claude/hooks/guard-dev-server.sh`

**Why:** Current regex matches only `npm (run )?(build|test|lint|vitest)`. Doesn't catch `npx vitest`, `yarn`, `pnpm`. Port check only hits 5173, not fallback 5174/5175.

- [ ] **Step 1: Widen regex**

Replace:
```
npm([[:space:]]+run)?[[:space:]]+(build|test|lint|vitest)
```
with:
```
(npm([[:space:]]+run)?|npx|yarn|pnpm|bunx)[[:space:]]+(build|test|lint|vitest|tsc|eslint)
```

- [ ] **Step 2: Check fallback ports**

Replace `lsof -nP -iTCP:5173 -sTCP:LISTEN` with a loop:
```bash
for port in 5173 5174 5175; do
  if lsof -nP -iTCP:$port -sTCP:LISTEN >/dev/null 2>&1; then
    ACTIVE_PORT=$port; break
  fi
done
[ -z "${ACTIVE_PORT:-}" ] && exit 0
```

Update the block message to reference `$ACTIVE_PORT`.

- [ ] **Step 3: Pipe-test 2 cases**

```bash
# A: npx vitest while dev running, should block
echo '{"tool_name":"Bash","tool_input":{"command":"npx vitest run"}}' | ~/Desktop/seedhaplot/.claude/hooks/guard-dev-server.sh; echo "A exit=$? (expect 2)"
# B: innocuous command, should pass
echo '{"tool_name":"Bash","tool_input":{"command":"git status"}}' | ~/Desktop/seedhaplot/.claude/hooks/guard-dev-server.sh; echo "B exit=$? (expect 0)"
```

---

## Self-review

- **Spec coverage:** ✓ all 5 real gaps from the critique have tasks. Wrong-7th "missing spec file" dropped because I verified it exists.
- **No placeholders:** ✓ every step has real strings/paths/commands.
- **Type consistency:** ✓ hook types match schema (`command`), script paths match project root.
- **Order justified:** Phase 1 unblocks the next playthrough QA. Phase 2 is housekeeping that won't hurt if skipped today. Phase 3 is speculative.

## Execution handoff

Two options:
- **Inline** (recommended here) — I execute in this session using `superpowers:executing-plans`, batch with checkpoints at Phase 1 / 2 / 3 boundaries.
- **Subagent-driven** — fresh subagent per task. Overkill for edits this small, but available.

Your call. If no answer, I execute Phase 1 inline and pause before Phase 2.
