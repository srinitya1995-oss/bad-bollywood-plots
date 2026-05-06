# Feature Inventory + Regression Guard

**Goal:** Stop features disappearing between sessions (sound toggle, end-round menu, etc) without anyone noticing.

**Architecture:** One plain-text inventory file the whole team (and Claude) reads. A tiny grep-based check script validates the inventory against actual source. SessionStart hook prints the inventory so every new session knows the full surface area.

**Why not tests:** Snapshot tests break on legitimate refactors and need maintenance. A grep script against well-named DOM strings stays valid as long as the feature exists under that label. Lower friction.

---

## Task 1: Commit the sound toggle that's already in the working tree

**Files:**
- Modify: `src/components/SettingsScreen.tsx` (already dirty)
- Modify: `src/style.css` (already dirty)

- [ ] **Step 1: Stage + commit**

```bash
cd ~/Desktop/seedhaplot
git add src/components/SettingsScreen.tsx src/style.css
git commit -m "feat: restore sound toggle to Settings"
```

---

## Task 2: Create `.feature-inventory.md` at repo root

**Files:**
- Create: `/Users/srinityaduppanapudisatya/Desktop/seedhaplot/.feature-inventory.md`

Format: one section per screen, each entry has `feature` + `grep` pattern that validates presence in source.

- [ ] **Step 1: Write the inventory**

Full structured file with entries for Home, PlayerSetup, GameScreen, Card front, Card back, TurnInterstitial, ResultsScreen, HowToScreen, SettingsScreen, FeedbackSheet, SuggestSheet, ReportSheet, MenuPopover, TopBand.

Each entry: one-line description + a grep pattern (literal string from JSX/CSS) that should find ≥1 hit in `src/`.

---

## Task 3: Create `scripts/check-features.js`

**Files:**
- Create: `/Users/srinityaduppanapudisatya/Desktop/seedhaplot/scripts/check-features.js`

Parse `.feature-inventory.md`, extract `grep:` lines, run each against `src/`, print PASS/FAIL per feature, exit 1 if any missing.

- [ ] **Step 1: Write the script (no dependencies, just Node + child_process grep)**

- [ ] **Step 2: Add npm script**

In `package.json`, add `"check-features": "node scripts/check-features.js"`.

- [ ] **Step 3: Smoke test**

Run once, expect all PASS. Temporarily break one (rename `v8-settings-switch` → `x-settings-switch`), rerun, expect that one to FAIL. Revert.

---

## Task 4: Update SessionStart hook to print inventory

**Files:**
- Modify: `/Users/srinityaduppanapudisatya/Desktop/seedhaplot/.claude/settings.json`

- [ ] **Step 1: Extend SessionStart command**

Current: prints first 40 lines of `.project-state.md` and last 20 of `.session-log.md`. Add a section that cats the inventory summary so every new session sees the feature list.

```
echo '--- .feature-inventory.md (summary) ---'
grep -E '^## |^- \*\*' .feature-inventory.md | head -80
```

---

## Task 5: Commit infra as one chore commit

- [ ] **Step 1: Stage + commit**

```bash
git add .feature-inventory.md scripts/check-features.js package.json .claude/settings.json
git commit -m "chore: add feature inventory + regression check"
```
