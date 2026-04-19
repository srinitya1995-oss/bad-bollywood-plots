# Bad Desi Plots — Card Scale Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit the existing 149-card deck against the house voice rubric, rewrite any D/F cards, then scale the deck from 149 → 300 cards (150 BW + 150 TW), fully voice-audited and fact-checked.

**Architecture:** Two parallel workstreams.
1. **Audit workstream:** run `seedhaplot-card-auditor` + `seedhaplot-fact-checker` agents in parallel on existing 149 cards. Merge their findings. Rewrite cards that fail either gate.
2. **Generate workstream:** for each seed-CSV movie not already in the deck, generate a new card using the voice rubric, then run both auditors on the new batch. Merge validated new cards into `cards.json`.

Both workstreams run on the Claude Code subscription (zero metered API spend). The broken `scripts/audit-cards.js` is deleted — the agent replaces it.

**Tech Stack:** Node 20 scripts, no external API calls. Agents: `seedhaplot-card-auditor`, `seedhaplot-fact-checker`. Inputs: `cards.json`, `docs/card-seed-list.csv`, `docs/card-voice-rubric.md`.

---

## Scope boundary

This plan ships **300 total cards** (150 BW + 150 TW), all passing voice rubric + factual check. It does NOT scale to 1000 or 5000 — those are Phase 2 / 3 work, gated on retention signals from the 300-card release.

The prod push itself is gated only on the ship-readiness spot-check from today's session (Feedback/Suggest/Report writes on badbollywoodplots.com). This plan can land independently of that push — it touches `cards.json` and `docs/`, nothing in the runtime.

---

## File Structure

- **Modify:** `cards.json` (rewrites + appends)
- **Modify:** `docs/card-seed-list.csv` (mark movies as processed)
- **Delete:** `scripts/audit-cards.js` (broken + metered; replaced by agent)
- **Create:** `docs/phase1-audit-report.md` (summary output from audit workstream)
- **Create:** `docs/phase1-new-cards.json` (staging area for new cards before merge)
- **Create:** `scripts/merge-phase1-cards.js` (dedup + merge new cards into cards.json)

---

## Task 1: Remove broken audit script

**Files:**
- Delete: `scripts/audit-cards.js`

- [ ] **Step 1: Remove file**

```bash
rm scripts/audit-cards.js
```

- [ ] **Step 2: Remove from package.json scripts if present**

Check `package.json` for any `"audit-cards"` entry. If present, delete the line.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove broken audit-cards.js (replaced by seedhaplot-card-auditor agent)"
```

---

## Task 2: Audit existing 149 cards in parallel

**Files:**
- Read: `cards.json`
- Write: `/tmp/seedhaplot-audit-<timestamp>.json`
- Write: `/tmp/seedhaplot-factcheck-<timestamp>.json`

- [ ] **Step 1: Dispatch two agents in parallel**

Two Agent calls in the same message:

1. `seedhaplot-card-auditor` — audit all 149 cards against voice rubric. Output JSON + summary.
2. `seedhaplot-fact-checker` — cross-reference all 149 cards' plot summaries against Wikipedia for factual errors.

Both agents MUST return: grade (A/B/C/D/F) per card, with reason, and rewrite suggestion for C or below.

- [ ] **Step 2: Merge findings**

Produce `docs/phase1-audit-report.md` with:
- Voice rubric grades (A count, B count, C, D, F)
- Factual errors found (card id, movie, claim vs Wikipedia)
- Intersection: cards failing BOTH (priority rewrite)
- Union: all cards flagged for rewrite

- [ ] **Step 3: Commit audit report**

```bash
git add docs/phase1-audit-report.md
git commit -m "chore: audit existing deck (Phase 1 baseline)"
```

---

## Task 3: Rewrite all flagged cards

**Files:**
- Modify: `cards.json` (for each flagged card, replace `c` and potentially `f`)

- [ ] **Step 1: For each flagged card, apply rewrite**

Use the rewrite suggestion from Task 2 output. If the agent's rewrite is weak, reject it and ask the agent to retry with specific guidance (e.g., "pick register 4 Wrong emphasis").

Every rewrite MUST:
- Pick ONE of the 6 registers from `docs/card-voice-rubric.md`
- Include at least one specificity anchor
- Stay 60-160 chars
- No character/actor names, no dialogue

- [ ] **Step 2: Re-run voice auditor on rewritten cards only**

Dispatch `seedhaplot-card-auditor` with `--id <id1>,<id2>,...` scoped to rewritten cards. Require grade A or B. If C or below, retry rewrite once more, then escalate to user.

- [ ] **Step 3: Run typecheck + test**

```bash
npm run typecheck && npm run test
```

Expected: both pass. `cards.json` shape unchanged; only `c` and `f` strings changed.

- [ ] **Step 4: Commit rewrites**

```bash
git add cards.json
git commit -m "content: rewrite $N voice/fact-flagged cards (Phase 1 audit)"
```

Replace `$N` with actual count.

---

## Task 4: Generate new cards from seed CSV

**Files:**
- Read: `docs/card-seed-list.csv` (113 BW candidates, 0 TW)
- Write: `docs/phase1-new-cards.json` (staging)

- [ ] **Step 1: De-dupe seed CSV against cards.json**

Script: filter CSV rows where the movie title already exists in cards.json (match on lowercased, trimmed `n`). Output: remaining-candidates list.

- [ ] **Step 2: Pick target counts**

Phase 1 target: 300 total = 150 BW + 150 TW.
- Current: 74 BW, 75 TW.
- Need: +76 BW, +75 TW.

If remaining BW candidates < 76: flag in audit report, ask user to extend CSV.
If zero TW candidates: block on TW seed list expansion (separate user task).

- [ ] **Step 3: Generate cards in batches of 10**

For each candidate (up to the target count), write a card using the voice rubric:

```json
{
  "id": "bw<next-id>",
  "ind": "BW",
  "diff": "<easy|medium|hard>",
  "era": "<decade>",
  "y": "<year>",
  "n": "<movie name>",
  "f": "<one-line fun fact, 50-140 chars>",
  "c": "\"<deliberately bad plot, 60-160 chars, picks ONE register>\""
}
```

Write output to `docs/phase1-new-cards.json` as a JSON array.

Difficulty distribution target: 40% easy / 35% medium / 25% hard for new cards (matches overall deck target).

- [ ] **Step 4: Run card-auditor on new batch**

Require grade A or B on every new card. If any card grades C or below, rewrite that card up to 2 times. If still C or below, drop it from the batch and flag for user.

- [ ] **Step 5: Run fact-checker on new batch**

For every new card, cross-reference `f` (fun fact) and `c` (plot beats) against Wikipedia. Reject any card with unverifiable or wrong claims. Rewrite up to 2 times.

- [ ] **Step 6: Commit staging file**

```bash
git add docs/phase1-new-cards.json
git commit -m "content: stage $N new cards (voice+fact verified)"
```

---

## Task 5: Merge staged cards into cards.json

**Files:**
- Create: `scripts/merge-phase1-cards.js`
- Modify: `cards.json`

- [ ] **Step 1: Write merge script**

```js
#!/usr/bin/env node
import fs from 'node:fs';

const existing = JSON.parse(fs.readFileSync('cards.json', 'utf8'));
const staged = JSON.parse(fs.readFileSync('docs/phase1-new-cards.json', 'utf8'));

const existingIds = new Set(existing.map(c => c.id));
const existingNames = new Set(existing.map(c => c.n.toLowerCase().trim()));

const clean = [];
const dropped = [];
for (const c of staged) {
  if (existingIds.has(c.id)) { dropped.push({ reason: 'dup id', card: c }); continue; }
  if (existingNames.has(c.n.toLowerCase().trim())) { dropped.push({ reason: 'dup name', card: c }); continue; }
  clean.push(c);
}

const merged = [...existing, ...clean];
fs.writeFileSync('cards.json', JSON.stringify(merged, null, 2));

console.log(`Merged ${clean.length} new cards. Dropped ${dropped.length} duplicates.`);
console.log(`Total deck: ${merged.length}`);
if (dropped.length) console.log('Dropped:', JSON.stringify(dropped, null, 2));
```

- [ ] **Step 2: Run merge**

```bash
node scripts/merge-phase1-cards.js
```

Expected: "Merged N new cards. Total deck: 300" (approximate — may be slightly fewer if dupes dropped).

- [ ] **Step 3: Verify deck stats**

```bash
node -e "const c=require('./cards.json'); const bw=c.filter(x=>x.ind==='BW').length; const tw=c.filter(x=>x.ind==='TW').length; const easy=c.filter(x=>x.diff==='easy').length; const med=c.filter(x=>x.diff==='medium').length; const hard=c.filter(x=>x.diff==='hard').length; console.log({total:c.length, bw, tw, easy, med, hard});"
```

Expected: `total ≥ 290`, `bw ≥ 140`, `tw ≥ 140`, difficulty split within ±5% of 40/35/25.

- [ ] **Step 4: Dedup sanity check**

```bash
node -e "const c=require('./cards.json'); const names=c.map(x=>x.n.toLowerCase().trim()); const d=names.filter((n,i)=>names.indexOf(n)!==i); console.log('Dupes:', d.length); if(d.length) console.log(d);"
```

Expected: 0 dupes.

- [ ] **Step 5: Run tests + typecheck + build**

```bash
npm run typecheck && npm run test && npm run build
```

Expected: all pass. Bundle may grow ~50KB gzipped — still well under the 200KB budget.

- [ ] **Step 6: Commit merge**

```bash
git add cards.json scripts/merge-phase1-cards.js
git commit -m "content: scale deck 149 → 300 cards (Phase 1 complete)"
```

---

## Task 6: End-to-end verification

- [ ] **Step 1: Run e2e against local dev server**

```bash
npm run dev &
sleep 3
node scripts/e2e-playthrough.js
```

Expected: 27/27 pass. Kill dev server after.

- [ ] **Step 2: Play 3 rounds manually**

Solo BW, Solo TW, Party mode. Verify:
- No duplicate cards within a round
- Calibration still shows one card of each difficulty
- Fun facts render cleanly (no truncation weirdness)

- [ ] **Step 3: Bump version + changelog**

Edit `package.json`: `2.1.0` → `2.2.0`.
Add a CHANGELOG entry under a new `## 2.2.0` heading:
- Phase 1 card scale: 149 → 300 cards
- Full voice-rubric audit of existing deck
- N cards rewritten (fill in count from Task 3)
- New merge + audit pipeline

- [ ] **Step 4: Commit version bump**

```bash
git add package.json CHANGELOG.md
git commit -m "release: v2.2.0 — Phase 1 card scale (149 → 300)"
```

---

## Rollback

If any stage fails irrecoverably:

```bash
git reset --hard HEAD~<N>  # where N = commits made this plan
```

The plan touches `cards.json` (content) and `docs/` + `scripts/` (tooling). No runtime code changed. Zero risk to the FSM, card flip, scoring, or storage paths.

---

## Self-review (final check)

- Every task has specific file paths ✓
- No placeholder steps ✓
- Every code block is complete and runnable ✓
- Audit agents are explicit about grade thresholds (A or B required) ✓
- Rollback path is clear ✓
- Scope is fixed at 300 — no creep to 1000/5000 ✓
- No runtime code changed (safe to ship independently of today's prod push) ✓
