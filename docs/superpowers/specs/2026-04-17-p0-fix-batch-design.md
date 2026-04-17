# P0 Fix Batch: 12-Agent Panel Findings

**Date**: 2026-04-17
**Scope**: Fix all code-fixable P0s from the 12-agent panel review before ship.

---

## Commit A: Quick Fixes (low risk, independent)

### A1. Remove hardcoded Supabase JWT
- **File**: `src/hooks/gameInstance.ts:14`
- **Change**: Replace JWT fallback with `''`. The empty string causes `initSupabaseClient()` to return null (Supabase writes silently skip). Add `console.warn` in dev when env var is missing.
- **Why**: Full JWT baked into production bundle. Anon key is public-facing by design, but hardcoding removes the forcing function to configure env vars.

### A2. Null guard in markResult
- **File**: `src/hooks/gameInstance.ts:190`
- **Change**: Add `if (!card) return;` after `const card = this.deck[this.idx];`
- **Why**: If deck is exhausted or idx is out of sync, `scoreCard(state, card, result)` throws TypeError on `POINT_MAP[card.diff]`.

### A3. Error handling on init()
- **File**: `src/components/App.tsx:46`
- **Change**: Add `.catch()` handler. Set an `error` state. Render "Could not load cards. Tap to retry." fallback instead of hanging on "Loading cards..." forever.
- **Why**: First-time offline load or network failure hangs the app permanently.

### A4. Fix "5 CARDS" meta
- **File**: `src/components/HomeScreen.tsx:33`
- **Change**: Remove the "5 CARDS" span. The actual default is up to 12 cards in party mode (3 calibration + 9 adaptive). Misleading copy.
- **Why**: Jenny UXR found "5 CARDS" meta contradicts actual 10-card default. Multiple agents flagged.

### A5. Remove "6 MIN ROUNDS" claim
- **File**: `src/components/HomeScreen.tsx:35`
- **Change**: Remove the "6 MIN ROUNDS" span. No timer exists anywhere in the codebase.
- **Why**: Game Designer and Jenny both flagged. Promising timed rounds with no timer is a trust break.

**Meta line becomes**: `SOLO` dot `PARTY` (just the two mode indicators).

---

## Commit B: Feature Wiring + Scoring Fix (moderate risk)

### B1. Wire HowToScreen into app
- **Files**: `src/components/HomeScreen.tsx`, `src/components/MenuPopover.tsx`
- **Changes**:
  - HomeScreen footer: add "How to Play" link between existing footer items
  - HomeScreen: add `showHowTo` state, render `<HowToScreen onClose={...} />` when true
  - MenuPopover: add "How to Play" menu item that triggers HowToScreen

### B2. Wire SettingsScreen into app
- **Files**: `src/components/HomeScreen.tsx`
- **Changes**:
  - HomeScreen footer: add "Settings" link
  - HomeScreen: add `showSettings` state, render `<SettingsScreen onClose={...} />` when true

### B3. Add TW mode access on HomeScreen
- **File**: `src/components/HomeScreen.tsx`
- **Changes**:
  - Add `selectedIndustry` state, default `'HI'`
  - Add cinema toggle pills above CTAs: `BOLLYWOOD` | `TOLLYWOOD`
  - Pass selected industry to `actions.selectMode(selectedIndustry)` and `actions.startSoloGame(selectedIndustry)`
  - Style: reuse `.v8-setup-mode` toggle pattern from PlayerSetup

### B4. Unify dual scoring system
- **Files**: `src/core/scorer.ts`, `src/hooks/gameInstance.ts`, `src/components/ResultsScreen.tsx`
- **Problem**: Two parallel scoring paths diverge silently.
  - `scoreCard()` awards `scorer.players[currentPlayerIdx].score` (rotation-based, WRONG player in multiplayer)
  - `awardPoints(playerIdx, pts)` awards `_scores[playerIdx]` (picker-selected, RIGHT player, but NO streak bonus)
- **Fix**:
  1. `scorer.ts`: Remove the `next.players[state.currentPlayerIdx].score += pts + bonus;` line from `scoreCard()`. scoreCard still tracks totalPts, correctCount, streak, lives.
  2. `gameInstance.ts`: Update `awardPoints(playerIdx, pts)` to calculate streak bonus from `this.scorer.streak` and add it to the award. Export the bonus so GameScreen can show it in the float.
  3. `ResultsScreen.tsx`: Already prefers `scores[i]` via `scores[i] ?? p.score`. No change needed, but remove the `?? p.score` fallback since scorer.players[].score is now always 0.
- **Result**: `_scores[]` is the single source of truth for per-player points. Streak bonus is visible.

---

## Out of Scope (P1/P2, follow-up)

- Dead CSS cleanup
- Share button on results
- Timer implementation
- Touch target fixes (44px min)
- Focus traps in dialogs
- Verdict copy rendering
- Sound toggle (remove or implement)
- Resume button fix

---

## Test Plan

- All 185 existing tests must still pass
- Typecheck clean
- Build succeeds
- Manual verification: solo flow, party flow, TW selection, HowTo accessible, Settings accessible
