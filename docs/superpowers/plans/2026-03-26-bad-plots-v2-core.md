# Bad Plots v2 Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Bad Bollywood Plots as a visually bold, accessible, streamlined party game with progression-based difficulty and an endless solo mode.

**Architecture:** Vanilla HTML/CSS/JS — no framework. Split current monolith `index.html` (1409 lines) into separate files: `index.html` (shell + HTML), `style.css` (all styles), `app.js` (game logic), `cards.json` (card data). New ornamental SVG assets. Service worker updated for new file list.

**Tech Stack:** HTML5, CSS3, vanilla JS (ES modules), SVG, localStorage for persistence

**Spec:** `docs/superpowers/specs/2026-03-26-bad-plots-v2-design.md`

---

## File Structure

```
seedhaplot/
  index.html          ← HTML shell, semantic markup, screen structure
  style.css           ← complete stylesheet (new design system)
  app.js              ← game logic, state, analytics, all JS
  cards.json          ← card data array (extracted + cleaned)
  manifest.json       ← updated name/colors
  sw.js               ← updated cache file list
  assets/
    logo.svg          ← full wordmark logo
    logo-favicon.svg  ← "BP" monogram for favicon
    ornament.svg      ← jali border pattern (used via CSS)
    icon-192.png      ← updated PWA icon
    icon-512.png      ← updated PWA icon
  scripts/            ← existing, unchanged
  docs/               ← existing, unchanged
```

---

## Task 1: Extract Card Data to `cards.json` and Fix Broken Cards

**Files:**
- Create: `cards.json`
- Modify: `index.html:884-1041` (remove inline CARDS array)

This is the foundation — clean data before anything else.

- [ ] **Step 1: Extract CARDS array from index.html to cards.json**

Copy lines 884-1041 from `index.html` into a proper JSON file. Convert from JS object syntax (single quotes, no trailing commas) to valid JSON (double quotes).

```json
[
  {
    "id": "bw01",
    "ind": "BW",
    "diff": "easy",
    "era": "90s",
    "y": "1995",
    "n": "Dilwale Dulhania Le Jayenge",
    "f": "Ran continuously at Maratha Mandir for over 25 years. The train that never left.",
    "c": "\"Boy meets girl. Father says no. They go to Europe anyway. Entire Punjab gives permission eventually.\""
  }
]
```

Note: The clue field `c` contains escaped inner quotes — preserve them as-is in JSON with proper escaping.

- [ ] **Step 2: Delete the 1 card that's a self-declared duplicate**

Remove `bw52` (Barfi! duplicate — fun fact literally says "This card is a duplicate").

- [ ] **Step 3: Replace 3 placeholder Tollywood cards with their suggested replacements**

Replace these cards (keep the same IDs):

`tw54` — Replace with Brindavanam (2010):
```json
{
  "id": "tw54",
  "ind": "TW",
  "diff": "medium",
  "era": "2010s",
  "y": "2010",
  "n": "Brindavanam",
  "f": "NTR Jr and Kajal Aggarwal. Trivikram's dialogue made every line quotable. The hero pretends to be a boyfriend and the pretence becomes real.",
  "c": "\"Man agrees to pretend to be someone's boyfriend to fend off a villain. Meets the real family. Starts feeling things he was not contracted for.\""
}
```

`tw55` — Replace with Rang De (2021):
```json
{
  "id": "tw55",
  "ind": "TW",
  "diff": "medium",
  "era": "2020s",
  "y": "2021",
  "n": "Rang De",
  "f": "Nithiin and Keerthy Suresh. The childhood-enemies-to-lovers arc runs on pure physical comedy.",
  "c": "\"Girl has hated a specific boy since childhood. He moves next door as an adult. She still hates him. He finds this encouraging.\""
}
```

`tw75` — Replace with Nenu Local (2017):
```json
{
  "id": "tw75",
  "ind": "TW",
  "diff": "hard",
  "era": "2010s",
  "y": "2017",
  "n": "Nenu Local",
  "f": "Nani starrer. The auto-driver character became one of his most loved roles. Trinadha Rao Nakkina directed.",
  "c": "\"Auto driver falls for a girl whose father runs the local college. Father disapproves with his entire body. The auto becomes a getaway vehicle.\""
}
```

- [ ] **Step 4: Replace 3 duplicate Bollywood hard cards with new films**

`bw72` (was duplicate Paan Singh Tomar) — Replace with Ugly (if not already, or another):
```json
{
  "id": "bw72",
  "ind": "BW",
  "diff": "hard",
  "era": "2010s",
  "y": "2015",
  "n": "Talvar",
  "f": "Meghna Gulzar directed. Based on the Aarushi Talwar case. Irrfan Khan plays the CBI investigator. Three versions of the truth, none satisfying.",
  "c": "\"A girl is found dead. Three agencies investigate. Each arrives at a different truth. The parents are convicted on the least convincing one.\""
}
```

`bw74` (was duplicate Kapoor & Sons) — Replace:
```json
{
  "id": "bw74",
  "ind": "BW",
  "diff": "hard",
  "era": "2020s",
  "y": "2022",
  "n": "Gehraiyaaan",
  "f": "Shakun Batra. Deepika Padukone. The anxiety is physical. The apartment is the most expensive character in the film.",
  "c": "\"Woman in a relationship starts another relationship. Both men are connected. The web tightens until someone drowns. Possibly literally.\""
}
```

`bw75` (was duplicate Masaan) — Replace:
```json
{
  "id": "bw75",
  "ind": "BW",
  "diff": "hard",
  "era": "2010s",
  "y": "2019",
  "n": "Sonchiriya",
  "f": "Abhishek Chaubey directed. Sushant Singh Rajput. Shot in the Chambal ravines with real dacoits as extras.",
  "c": "\"Dacoits in the Chambal ravines protect a girl the police also want. Honour is debated by men with rifles. The landscape does not care.\""
}
```

- [ ] **Step 5: Replace tw72 (Maestro, near-clone of Andhadhun)**

```json
{
  "id": "tw72",
  "ind": "TW",
  "diff": "hard",
  "era": "2020s",
  "y": "2022",
  "n": "Bimbisara",
  "f": "Kalyan Ram's career-best. The ancient king in a modern hospital was played entirely straight. No winking at the audience.",
  "c": "\"Ancient king is transported to the present day. Discovers hospitals, democracy, and that his dynasty ended badly. Tries to go back and fix it.\""
}
```

- [ ] **Step 6: Validate the final cards.json**

Run a quick validation to ensure:
- 149 cards total (150 minus deleted bw52)
- No duplicate IDs
- No duplicate movie names
- All fields present and non-empty
- Valid JSON

```bash
node -e "
const cards = JSON.parse(require('fs').readFileSync('cards.json','utf8'));
console.log('Total:', cards.length);
const ids = cards.map(c=>c.id);
const dupes = ids.filter((id,i) => ids.indexOf(id) !== i);
console.log('Duplicate IDs:', dupes.length ? dupes : 'none');
const names = cards.map(c=>c.n.toLowerCase());
const dupeNames = names.filter((n,i) => names.indexOf(n) !== i);
console.log('Duplicate names:', dupeNames.length ? dupeNames : 'none');
const missing = cards.filter(c => !c.id||!c.ind||!c.diff||!c.era||!c.y||!c.n||!c.f||!c.c);
console.log('Missing fields:', missing.length ? missing.map(c=>c.id) : 'none');
"
```

Expected: 149 cards, no duplicates, no missing fields.

- [ ] **Step 7: Commit**

```bash
git add cards.json
git commit -m "feat: extract card data to cards.json, fix 8 broken cards"
```

---

## Task 2: Create HTML Shell with Semantic Markup

**Files:**
- Rewrite: `index.html` (replace entire content)

Strip `index.html` down to a semantic HTML shell. No inline CSS or JS — just structure, linked to external files.

- [ ] **Step 1: Write the new index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#1a0a2e">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Bad Plots">
  <meta name="description" content="Terrible plots. Real movies. Guess Bollywood and Tollywood films from hilariously bad descriptions.">
  <link rel="manifest" href="manifest.json">
  <link rel="icon" href="assets/logo-favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <title>Bad Plots: The Desi Party Game</title>
</head>
<body>

<!-- Ornamental border pattern definition -->
<svg style="display:none" aria-hidden="true">
  <symbol id="ornament-frame" viewBox="0 0 400 400">
    <!-- Jali-inspired geometric border pattern - defined in Task 5 -->
  </symbol>
</svg>

<!-- Screen reader announcements -->
<div id="sr-announce" class="sr-only" aria-live="polite" aria-atomic="true"></div>

<!-- Toast -->
<div id="toast" class="toast" role="status" aria-live="polite"></div>

<!-- ═══ HOME ═══ -->
<main id="home" class="screen active" aria-label="Home">
  <header class="home-header">
    <img src="assets/logo.svg" alt="Bad Plots" class="home-logo" width="240" height="80">
    <p class="home-tagline">Terrible plots. Real movies.</p>
  </header>

  <nav class="home-modes" aria-label="Game modes">
    <button class="mode-btn mode-btn-bw" data-mode="BW">
      <span class="mode-name">Bollywood</span>
      <span class="mode-sub">Hindi films</span>
    </button>
    <button class="mode-btn mode-btn-tw" data-mode="TW">
      <span class="mode-name">Tollywood</span>
      <span class="mode-sub">Telugu films</span>
    </button>
  </nav>

  <div class="home-toggle">
    <button class="toggle-btn active" data-gamemode="party" aria-pressed="true">Party</button>
    <button class="toggle-btn" data-gamemode="endless" aria-pressed="false">Endless</button>
  </div>

  <footer class="home-footer">
    <button class="link-btn" id="suggest-btn">Suggest a movie</button>
    <span class="footer-divider" aria-hidden="true">&middot;</span>
    <button class="link-btn" id="feedback-btn">Feedback</button>
    <span class="footer-divider" aria-hidden="true">&middot;</span>
    <a href="https://www.linkedin.com/in/srinityaduppanapudisatya/" target="_blank" rel="noopener" class="footer-credit">@Srinitya</a>
  </footer>
</main>

<!-- ═══ PLAYER SETUP (bottom sheet, not a screen) ═══ -->
<div class="sheet-overlay" id="players-overlay" role="dialog" aria-modal="true" aria-labelledby="players-title">
  <div class="sheet">
    <div class="sheet-handle" aria-hidden="true"></div>
    <h2 class="sheet-title" id="players-title">Who's playing?</h2>
    <p class="sheet-sub">Add players or just tap Start for solo</p>
    <div id="player-list" class="player-list"></div>
    <button class="add-player-btn" id="add-player-btn">+ Add player</button>
    <button class="btn-primary" id="start-game-btn">Start game</button>
  </div>
</div>

<!-- ═══ GAME ═══ -->
<main id="game" class="screen" aria-label="Game">
  <header class="game-bar">
    <button class="game-exit-btn" id="game-exit">
      <span aria-hidden="true">&larr;</span> Exit
    </button>
    <div class="game-info" id="game-info">
      <span class="game-prog" id="g-prog">1 / 12</span>
    </div>
    <div class="game-score" id="g-pts">0 pts</div>
  </header>
  <div class="prog-track" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" id="g-bar-track">
    <div class="prog-fill" id="g-bar"></div>
  </div>

  <!-- Lives (endless mode only) -->
  <div class="game-lives" id="game-lives" style="display:none" aria-label="Lives remaining">
    <span class="life active" aria-label="Life 1"></span>
    <span class="life active" aria-label="Life 2"></span>
    <span class="life active" aria-label="Life 3"></span>
  </div>

  <!-- Player tabs (multiplayer only) -->
  <div class="player-tabs" id="player-tabs" role="tablist" aria-label="Players" style="display:none"></div>

  <!-- Pass-the-phone interstitial -->
  <div class="turn-interstitial" id="turn-interstitial" style="display:none">
    <h2 class="turn-name" id="turn-name">Player 1</h2>
    <p class="turn-sub">Your turn</p>
    <button class="btn-primary" id="turn-ready-btn">Ready</button>
  </div>

  <!-- Card stage -->
  <div class="card-stage" id="card-stage">
    <div class="card-wrap" id="card-wrap">
      <div class="card-inner" id="card-inner">
        <!-- Front face -->
        <div class="card-face card-front" id="card-front">
          <div class="card-frame" aria-hidden="true"></div>
          <div class="card-content">
            <div class="card-meta">
              <span class="card-ind" id="cf-ind">Bollywood</span>
              <span class="card-era" id="cf-era">90s</span>
            </div>
            <p class="card-clue" id="cf-clue"></p>
            <span class="card-tap">Tap to reveal answer</span>
          </div>
        </div>
        <!-- Back face -->
        <div class="card-face card-back" id="card-back">
          <div class="card-frame card-frame-back" aria-hidden="true"></div>
          <div class="card-content">
            <span class="card-ind-back" id="cb-ind">Bollywood</span>
            <h3 class="card-answer" id="cb-answer"></h3>
            <span class="card-year" id="cb-year"></span>
            <hr class="card-divider" aria-hidden="true">
            <p class="card-fact-label">Did you know</p>
            <p class="card-fact" id="cb-fact"></p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Score zone -->
  <div class="score-zone" id="score-zone" style="display:none">
    <div class="score-btns">
      <button class="score-btn btn-got" id="btn-got">Got it</button>
      <button class="score-btn btn-miss" id="btn-miss">Missed</button>
    </div>
    <button class="btn-skip" id="btn-skip">Skip</button>
  </div>
</main>

<!-- ═══ RESULTS ═══ -->
<main id="results" class="screen" aria-label="Results">
  <header class="res-top">
    <p class="res-eyebrow">Game over</p>
    <h1 class="res-title" id="r-title">Not bad.</h1>
    <p class="res-sub" id="r-sub"></p>
    <div class="res-stats">
      <div class="res-stat">
        <span class="res-stat-n" id="r-correct">0</span>
        <span class="res-stat-l">Correct</span>
      </div>
      <div class="res-stat">
        <span class="res-stat-n" id="r-played">0</span>
        <span class="res-stat-l">Played</span>
      </div>
      <div class="res-stat">
        <span class="res-stat-n" id="r-pts">0</span>
        <span class="res-stat-l">Points</span>
      </div>
    </div>
  </header>
  <div class="res-body">
    <blockquote class="res-verdict">
      <p class="res-verdict-text" id="r-verdict"></p>
    </blockquote>
    <div class="leaderboard" id="leaderboard" style="display:none">
      <h2 class="lb-title">Leaderboard</h2>
      <div id="lb-rows"></div>
    </div>
    <div class="res-actions">
      <button class="btn-primary" id="btn-replay">Play again</button>
      <button class="btn-secondary" id="btn-share">Share score</button>
      <button class="link-btn" id="btn-feedback-end">How was that?</button>
    </div>
  </div>
</main>

<!-- ═══ FEEDBACK SHEET ═══ -->
<div class="sheet-overlay" id="fb-overlay" role="dialog" aria-modal="true" aria-labelledby="fb-title">
  <div class="sheet">
    <div class="sheet-handle" aria-hidden="true"></div>
    <h2 class="sheet-title" id="fb-title">Share your feedback</h2>
    <p class="sheet-sub" id="fb-sub">Tell us what's working and what's not</p>
    <div class="fb-tags" id="fb-tags">
      <button class="fb-tag" data-v="love_it" aria-pressed="false">Love it</button>
      <button class="fb-tag" data-v="needs_work" aria-pressed="false">Needs work</button>
      <button class="fb-tag" data-v="want_more_cards" aria-pressed="false">Want more cards</button>
      <button class="fb-tag" data-v="great_for_parties" aria-pressed="false">Great for parties</button>
      <button class="fb-tag" data-v="ui_issue" aria-pressed="false">UI issue</button>
      <button class="fb-tag" data-v="bug" aria-pressed="false">Found a bug</button>
    </div>
    <label for="fb-text" class="sr-only">Additional feedback</label>
    <textarea class="fb-textarea" id="fb-text" placeholder="Anything else? (optional)"></textarea>
    <button class="btn-primary" id="fb-submit">Submit feedback</button>
    <button class="btn-skip" id="fb-skip">Cancel</button>
  </div>
</div>

<!-- ═══ SUGGEST SHEET ═══ -->
<div class="sheet-overlay" id="suggest-overlay" role="dialog" aria-modal="true" aria-labelledby="suggest-title">
  <div class="sheet">
    <div class="sheet-handle" aria-hidden="true"></div>
    <h2 class="sheet-title" id="suggest-title">Suggest a movie</h2>
    <p class="sheet-sub">We'll write a terrible plot description for it</p>
    <label for="suggest-movie" class="sr-only">Movie name</label>
    <input class="form-input" id="suggest-movie" placeholder="Movie name" type="text" aria-label="Movie name">
    <label for="suggest-industry" class="sr-only">Industry</label>
    <select class="form-input" id="suggest-industry" aria-label="Industry">
      <option value="" disabled selected>Bollywood / Tollywood / Other</option>
      <option value="Bollywood">Bollywood</option>
      <option value="Tollywood">Tollywood</option>
      <option value="Other">Other</option>
    </select>
    <p class="form-hint">We read every suggestion. If we add it, you'll be in the credits.</p>
    <button class="btn-primary" id="suggest-submit">Submit suggestion</button>
    <button class="btn-skip" id="suggest-cancel">Maybe later</button>
  </div>
</div>

<script type="module" src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify the HTML is valid**

Open in browser — should show unstyled but structurally correct content. All text visible, all buttons clickable (no functionality yet).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: rewrite index.html as semantic HTML shell"
```

---

## Task 3: Create Design System CSS (`style.css`)

**Files:**
- Create: `style.css`

Build the complete stylesheet implementing the Masala Mix visual design.

- [ ] **Step 1: Write CSS reset, custom properties, and utilities**

```css
/* ── RESET ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; overflow: hidden; }
body {
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  color: var(--cream);
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
}

/* ── DESIGN TOKENS ── */
:root {
  /* Backgrounds */
  --bg: #1a0a2e;
  /* Cards */
  --card-bw: #c0392b;
  --card-tw: #1a7a4c;
  --glow-bw: rgba(192, 57, 43, 0.3);
  --glow-tw: rgba(26, 122, 76, 0.3);
  /* Text */
  --cream: #f2ede4;
  --ink: #120808;
  --gold: #d4a843;
  /* UI */
  --border: rgba(255, 255, 255, 0.12);
  --border-focus: rgba(255, 255, 255, 0.24);
  /* Scoring */
  --green: #16a34a;
  --green-bg: rgba(22, 163, 74, 0.12);
  --red: #ef4444;
  --red-bg: rgba(239, 68, 68, 0.12);
  /* Radius */
  --r: 12px;
  --r-sm: 8px;
  --r-lg: 16px;
  /* Type scale */
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 20px;
  --text-xl: 24px;
  --text-2xl: 32px;
  --text-3xl: 48px;
}

/* ── UTILITIES ── */
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}

/* ── FOCUS ── */
:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
}
:focus:not(:focus-visible) { outline: none; }
```

- [ ] **Step 2: Write screen system and shared component styles**

```css
/* ── SCREENS ── */
.screen { display: none; flex-direction: column; height: 100vh; overflow-y: auto; overflow-x: hidden; }
.screen.active { display: flex; }

/* ── BUTTONS ── */
.btn-primary {
  width: 100%; background: var(--gold); color: var(--ink); border: none;
  border-radius: var(--r-sm); padding: 0.9rem;
  font-family: 'DM Sans', sans-serif; font-size: var(--text-base); font-weight: 700;
  cursor: pointer; transition: opacity 0.15s; min-height: 48px;
}
.btn-primary:hover { opacity: 0.9; }
.btn-primary:active { transform: scale(0.98); }

.btn-secondary {
  width: 100%; background: transparent; color: var(--cream);
  border: 1px solid var(--border); border-radius: var(--r-sm); padding: 0.85rem;
  font-family: 'DM Sans', sans-serif; font-size: var(--text-sm); font-weight: 600;
  cursor: pointer; transition: border-color 0.15s; min-height: 48px;
}
.btn-secondary:hover { border-color: var(--border-focus); }

.link-btn {
  background: none; border: none; color: rgba(242, 237, 228, 0.6);
  font-family: 'DM Sans', sans-serif; font-size: var(--text-sm);
  cursor: pointer; padding: 4px; transition: color 0.15s; min-height: 44px;
  display: inline-flex; align-items: center;
}
.link-btn:hover { color: var(--cream); }

.btn-skip {
  background: none; border: none; color: rgba(242, 237, 228, 0.6);
  font-family: 'DM Sans', sans-serif; font-size: var(--text-sm);
  cursor: pointer; padding: 8px; min-height: 44px; width: 100%; text-align: center;
}

/* ── TOAST ── */
.toast {
  position: fixed; bottom: calc(1.5rem + env(safe-area-inset-bottom));
  left: 50%; transform: translateX(-50%) translateY(80px);
  background: rgba(255,255,255,0.1); backdrop-filter: blur(8px);
  border: 1px solid var(--border); border-radius: var(--r-sm);
  padding: 0.6rem 1.2rem; font-size: var(--text-sm); color: var(--cream);
  transition: transform 0.28s ease; z-index: 9000; white-space: nowrap; pointer-events: none;
}
.toast.show { transform: translateX(-50%) translateY(0); }

/* ── SHEET (bottom sheet / dialog) ── */
.sheet-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100;
  display: flex; align-items: flex-end; justify-content: center;
  opacity: 0; pointer-events: none; transition: opacity 0.22s;
}
.sheet-overlay.open { opacity: 1; pointer-events: all; }
.sheet {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--r-lg) var(--r-lg) 0 0;
  padding: 0 1.25rem max(env(safe-area-inset-bottom), 1.5rem);
  width: 100%; max-width: 500px;
  transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
}
.sheet-overlay.open .sheet { transform: translateY(0); }
.sheet-handle { width: 36px; height: 3px; border-radius: 2px; background: var(--border-focus); margin: 12px auto 1rem; }
.sheet-title { font-family: 'Playfair Display', serif; font-size: var(--text-lg); font-weight: 700; margin-bottom: 4px; }
.sheet-sub { font-size: var(--text-sm); color: rgba(242,237,228,0.6); margin-bottom: 1rem; }

/* ── FORMS ── */
.form-input {
  width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border);
  border-radius: var(--r-sm); padding: 0.7rem 0.85rem;
  color: var(--cream); font-family: 'DM Sans', sans-serif; font-size: var(--text-sm);
  margin-bottom: 0.6rem; min-height: 44px;
}
.form-input:focus { border-color: var(--gold); }
.form-input::placeholder { color: rgba(242,237,228,0.4); }
.form-hint { font-size: var(--text-xs); color: rgba(242,237,228,0.6); margin-bottom: 0.85rem; line-height: 1.5; }

/* ── FEEDBACK TAGS ── */
.fb-tags { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 0.85rem; }
.fb-tag {
  padding: 0.6rem 0.5rem; border-radius: var(--r-sm);
  border: 1px solid var(--border); background: rgba(255,255,255,0.04);
  color: rgba(242,237,228,0.6); font-family: 'DM Sans', sans-serif;
  font-size: var(--text-xs); cursor: pointer; text-align: center;
  transition: all 0.15s; min-height: 44px; display: flex; align-items: center; justify-content: center;
}
.fb-tag:hover { border-color: var(--border-focus); color: var(--cream); }
.fb-tag[aria-pressed="true"] { border-color: var(--gold); color: var(--gold); background: rgba(212,168,67,0.1); }
.fb-textarea {
  width: 100%; background: rgba(255,255,255,0.06); border: 1px solid var(--border);
  border-radius: var(--r-sm); padding: 0.65rem 0.85rem;
  color: var(--cream); font-family: 'DM Sans', sans-serif; font-size: var(--text-sm);
  resize: none; height: 64px; margin-bottom: 0.75rem;
}
.fb-textarea:focus { border-color: var(--gold); }
.fb-textarea::placeholder { color: rgba(242,237,228,0.4); }
```

- [ ] **Step 3: Write home screen styles**

```css
/* ── HOME ── */
#home { padding: 0; justify-content: center; align-items: center; gap: 2rem; }
.home-header { text-align: center; padding: max(env(safe-area-inset-top), 2rem) 1.25rem 0; }
.home-logo { width: clamp(180px, 50vw, 260px); height: auto; margin-bottom: 0.5rem; }
.home-tagline {
  font-family: 'DM Sans', sans-serif; font-size: var(--text-sm); font-weight: 500;
  color: rgba(242,237,228,0.6); letter-spacing: 0.05em;
}

.home-modes { display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 340px; padding: 0 1.25rem; }
.mode-btn {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 1.2rem; border-radius: var(--r); border: none;
  cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
  min-height: 48px;
}
.mode-btn:active { transform: scale(0.97); }
.mode-btn-bw {
  background: var(--card-bw); color: var(--cream);
  box-shadow: 0 6px 24px var(--glow-bw);
}
.mode-btn-bw:hover { box-shadow: 0 8px 32px var(--glow-bw); }
.mode-btn-tw {
  background: var(--card-tw); color: var(--cream);
  box-shadow: 0 6px 24px var(--glow-tw);
}
.mode-btn-tw:hover { box-shadow: 0 8px 32px var(--glow-tw); }
.mode-name { font-family: 'Playfair Display', serif; font-size: var(--text-lg); font-weight: 900; }
.mode-sub { font-size: var(--text-sm); opacity: 0.8; }

.home-toggle { display: flex; gap: 0; max-width: 200px; }
.toggle-btn {
  flex: 1; padding: 0.5rem 1rem; border: 1px solid var(--border);
  background: transparent; color: rgba(242,237,228,0.6);
  font-family: 'DM Sans', sans-serif; font-size: var(--text-sm); font-weight: 600;
  cursor: pointer; transition: all 0.15s; min-height: 44px;
}
.toggle-btn:first-child { border-radius: var(--r-sm) 0 0 var(--r-sm); }
.toggle-btn:last-child { border-radius: 0 var(--r-sm) var(--r-sm) 0; border-left: none; }
.toggle-btn.active { background: var(--gold); color: var(--ink); border-color: var(--gold); }

.home-footer {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 1rem 1.25rem max(env(safe-area-inset-bottom), 1rem);
}
.footer-divider { color: rgba(242,237,228,0.2); }
.footer-credit { color: var(--gold); text-decoration: underline; text-underline-offset: 2px; font-size: var(--text-sm); }
```

- [ ] **Step 4: Write game screen styles**

```css
/* ── GAME BAR ── */
.game-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: max(env(safe-area-inset-top), 10px) 1rem 10px;
  position: relative; z-index: 10; flex-shrink: 0;
}
.game-exit-btn {
  background: none; border: none; color: rgba(242,237,228,0.6);
  font-family: 'DM Sans', sans-serif; font-size: var(--text-sm); cursor: pointer;
  min-height: 44px; min-width: 44px; display: flex; align-items: center;
}
.game-prog { font-size: var(--text-sm); color: rgba(242,237,228,0.6); font-weight: 600; }
.game-score {
  background: rgba(255,255,255,0.08); border: 1px solid var(--border);
  border-radius: 20px; padding: 4px 12px;
  font-size: var(--text-sm); font-weight: 700; color: var(--gold);
}

/* ── PROGRESS BAR ── */
.prog-track { height: 3px; background: rgba(255,255,255,0.06); flex-shrink: 0; }
.prog-fill { height: 100%; background: var(--gold); transition: width 0.5s ease; border-radius: 0 2px 2px 0; }

/* ── LIVES (endless) ── */
.game-lives { display: flex; justify-content: center; gap: 6px; padding: 8px 0; flex-shrink: 0; }
.life {
  width: 10px; height: 10px; border-radius: 50%;
  background: rgba(255,255,255,0.15); transition: background 0.3s;
}
.life.active { background: var(--red); }

/* ── PLAYER TABS ── */
.player-tabs {
  display: flex; gap: 0; border-bottom: 1px solid var(--border);
  overflow-x: auto; flex-shrink: 0; scrollbar-width: none;
}
.player-tabs::-webkit-scrollbar { display: none; }
.ptab {
  flex-shrink: 0; padding: 8px 14px;
  font-size: var(--text-xs); font-weight: 700;
  color: rgba(242,237,228,0.5); border-bottom: 2px solid transparent;
  cursor: default; transition: all 0.15s; white-space: nowrap;
}
.ptab[aria-selected="true"] { color: var(--cream); border-bottom-color: var(--gold); }
.ptab-score {
  display: inline-block; margin-left: 5px;
  background: rgba(212,168,67,0.12); border-radius: 10px;
  padding: 1px 6px; font-size: var(--text-xs); color: var(--gold);
}

/* ── TURN INTERSTITIAL ── */
.turn-interstitial {
  position: absolute; inset: 0; z-index: 20;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: var(--bg); gap: 0.5rem; padding: 2rem;
}
.turn-name {
  font-family: 'Playfair Display', serif; font-size: var(--text-2xl); font-weight: 900;
  color: var(--gold);
}
.turn-sub { font-size: var(--text-base); color: rgba(242,237,228,0.6); margin-bottom: 1rem; }

/* ── CARD ── */
.card-stage {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 1rem; overflow: hidden; position: relative;
}
.card-wrap {
  width: 100%; max-width: 360px;
  height: clamp(320px, 55vh, 440px);
  perspective: 1200px; cursor: pointer;
  /* Card entrance/exit animation */
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.card-wrap.exit-left { transform: translateX(-120%) rotate(-5deg); opacity: 0; }
.card-wrap.enter-right { transform: translateX(120%) rotate(5deg); opacity: 0; }

.card-inner {
  width: 100%; height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.card-wrap.flipped .card-inner { transform: rotateY(180deg); }
.card-wrap:active .card-inner { transform: scale(0.96); }
.card-wrap.flipped:active .card-inner { transform: rotateY(180deg) scale(0.96); }

.card-face {
  position: absolute; inset: 0; border-radius: var(--r-lg);
  backface-visibility: hidden; -webkit-backface-visibility: hidden;
  display: flex; flex-direction: column; overflow: hidden;
}

/* ── CARD FRONT ── */
.card-front {
  background: var(--card-bw); color: var(--cream);
  box-shadow: 0 8px 40px var(--glow-bw);
}
.card-front.tw { background: var(--card-tw); box-shadow: 0 8px 40px var(--glow-tw); }

.card-frame {
  position: absolute; inset: 0; border-radius: var(--r-lg);
  border: 3px solid rgba(242,237,228,0.25);
  /* Inner ornamental border */
  box-shadow: inset 0 0 0 8px rgba(242,237,228,0.06);
  pointer-events: none;
}

.card-content {
  padding: 2rem 1.5rem 1.5rem; flex: 1;
  display: flex; flex-direction: column; position: relative; z-index: 1;
}
.card-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.card-ind {
  font-size: var(--text-xs); font-weight: 700;
  padding: 3px 10px; border-radius: 4px;
  background: rgba(255,255,255,0.15); text-transform: uppercase; letter-spacing: 0.05em;
}
.card-era { font-size: var(--text-xs); color: rgba(242,237,228,0.7); }
.card-clue {
  font-family: 'Playfair Display', serif; font-style: italic;
  font-size: var(--text-xl); line-height: 1.5;
  color: var(--cream); flex: 1; display: flex; align-items: center;
}
.card-tap {
  font-size: var(--text-sm); color: rgba(242,237,228,0.7);
  text-align: center; margin-top: auto; padding-top: 0.75rem;
  border-top: 1px solid rgba(242,237,228,0.12);
}

/* ── CARD BACK ── */
.card-back {
  transform: rotateY(180deg); background: var(--cream); color: var(--ink);
  box-shadow: 0 8px 40px var(--glow-bw);
}
.card-back.tw { box-shadow: 0 8px 40px var(--glow-tw); }
.card-frame-back { border-color: rgba(18,8,8,0.15); box-shadow: inset 0 0 0 8px rgba(18,8,8,0.04); }
.card-ind-back {
  font-size: var(--text-xs); font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.05em; margin-bottom: 4px;
}
.card-ind-back.bw { color: var(--card-bw); }
.card-ind-back.tw { color: var(--card-tw); }
.card-answer {
  font-family: 'Playfair Display', serif; font-size: var(--text-lg);
  font-weight: 900; color: var(--ink); line-height: 1.15; margin-bottom: 4px;
}
.card-year { font-size: var(--text-sm); color: rgba(18,8,8,0.55); margin-bottom: 0.75rem; }
.card-divider { border: none; height: 1px; background: rgba(18,8,8,0.1); margin-bottom: 0.75rem; }
.card-fact-label {
  font-size: var(--text-xs); font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--card-bw); margin-bottom: 4px;
}
.card-fact { font-size: var(--text-sm); line-height: 1.6; color: rgba(18,8,8,0.75); }

/* ── SCORE ZONE ── */
.score-zone { width: 100%; max-width: 360px; padding: 0.5rem 0 max(env(safe-area-inset-bottom), 0.5rem); }
.score-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 6px; }
.score-btn {
  padding: 0.85rem; border-radius: var(--r-sm); border: 1px solid var(--border);
  font-family: 'DM Sans', sans-serif; font-size: var(--text-base); font-weight: 700;
  cursor: pointer; transition: all 0.15s; text-align: center; min-height: 48px;
}
.score-btn:active { transform: scale(0.97); }
.btn-got { background: var(--green-bg); border-color: rgba(22,163,74,0.3); color: var(--green); }
.btn-got:hover { background: rgba(22,163,74,0.2); }
.btn-miss { background: var(--red-bg); border-color: rgba(239,68,68,0.25); color: var(--red); }
.btn-miss:hover { background: rgba(239,68,68,0.2); }
```

- [ ] **Step 5: Write results screen styles**

```css
/* ── RESULTS ── */
#results { justify-content: flex-start; padding: 0; }
.res-top {
  padding: max(env(safe-area-inset-top), 1.5rem) 1.25rem 1.5rem;
  background: rgba(255,255,255,0.04); border-bottom: 1px solid var(--border); flex-shrink: 0;
  text-align: center;
}
.res-eyebrow {
  font-size: var(--text-xs); font-weight: 700;
  letter-spacing: 0.15em; text-transform: uppercase;
  color: var(--gold); margin-bottom: 0.4rem;
}
.res-title {
  font-family: 'Playfair Display', serif; font-size: var(--text-3xl);
  font-weight: 900; line-height: 1.05; margin-bottom: 0.3rem;
}
.res-sub { font-size: var(--text-sm); color: rgba(242,237,228,0.6); margin-bottom: 1rem; }
.res-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.res-stat {
  background: rgba(255,255,255,0.04); border: 1px solid var(--border);
  border-radius: var(--r-sm); padding: 0.75rem 0.5rem; text-align: center;
}
.res-stat-n {
  font-family: 'Playfair Display', serif; font-size: var(--text-xl);
  font-weight: 700; color: var(--gold); display: block;
}
.res-stat-l {
  font-size: var(--text-xs); font-weight: 600;
  color: rgba(242,237,228,0.6); display: block; margin-top: 2px;
}

.res-body { padding: 1.25rem; flex: 1; overflow-y: auto; }
.res-verdict { border-left: 3px solid var(--gold); padding: 0.75rem 0.85rem; margin-bottom: 1.25rem; }
.res-verdict-text {
  font-family: 'Playfair Display', serif; font-style: italic;
  font-size: var(--text-sm); color: rgba(242,237,228,0.7); line-height: 1.6;
}

.leaderboard { margin-bottom: 1.25rem; }
.lb-title {
  font-size: var(--text-xs); font-weight: 700;
  letter-spacing: 0.15em; text-transform: uppercase;
  color: rgba(242,237,228,0.6); margin-bottom: 0.6rem;
}
.lb-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0; border-bottom: 1px solid var(--border);
}
.lb-rank { font-size: var(--text-sm); font-weight: 700; color: rgba(242,237,228,0.5); width: 24px; flex-shrink: 0; }
.lb-rank.gold { color: var(--gold); }
.lb-name { font-size: var(--text-sm); font-weight: 500; flex: 1; padding: 0 8px; }
.lb-pts { font-size: var(--text-sm); font-weight: 700; color: var(--gold); }

.res-actions { display: flex; flex-direction: column; gap: 8px; }

/* ── PLAYER SETUP (in sheet) ── */
.player-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 1rem; }
.player-row { display: flex; align-items: center; gap: 8px; }
.player-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: var(--text-sm); font-weight: 700; flex-shrink: 0;
}
.player-input {
  flex: 1; background: rgba(255,255,255,0.06); border: 1px solid var(--border);
  border-radius: var(--r-sm); padding: 0.6rem 0.85rem;
  color: var(--cream); font-family: 'DM Sans', sans-serif; font-size: var(--text-sm);
  min-height: 44px;
}
.player-input:focus { border-color: var(--gold); }
.player-input::placeholder { color: rgba(242,237,228,0.4); }
.player-remove {
  background: none; border: none; color: rgba(242,237,228,0.4);
  cursor: pointer; font-size: 18px; min-width: 44px; min-height: 44px;
  display: flex; align-items: center; justify-content: center;
}
.add-player-btn {
  width: 100%; background: none; border: 1px dashed var(--border);
  border-radius: var(--r); padding: 0.7rem;
  color: rgba(242,237,228,0.5); font-family: 'DM Sans', sans-serif;
  font-size: var(--text-sm); cursor: pointer; transition: all 0.15s; min-height: 44px;
}
.add-player-btn:hover { border-color: var(--border-focus); color: var(--cream); }
```

- [ ] **Step 6: Write card transition animation CSS**

```css
/* ── CARD ANIMATIONS ── */
@keyframes cardEnter {
  from { transform: translateX(100%) rotate(3deg); opacity: 0; }
  to { transform: translateX(0) rotate(0); opacity: 1; }
}
@keyframes cardExit {
  from { transform: translateX(0) rotate(0); opacity: 1; }
  to { transform: translateX(-100%) rotate(-3deg); opacity: 0; }
}
.card-wrap.entering { animation: cardEnter 0.3s ease forwards; }
.card-wrap.exiting { animation: cardExit 0.3s ease forwards; pointer-events: none; }

/* Score flash on correct */
@keyframes scoreFlash {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); color: var(--green); }
  100% { transform: scale(1); }
}
.game-score.flash { animation: scoreFlash 0.4s ease; }
```

- [ ] **Step 7: Verify styles load correctly**

Open `index.html` in browser. The page should render with the aubergine background, styled buttons, and correct typography. No content yet (cards loaded by JS).

- [ ] **Step 8: Commit**

```bash
git add style.css
git commit -m "feat: add complete v2 design system stylesheet"
```

---

## Task 4: Create Logo SVG Assets

**Files:**
- Create: `assets/logo.svg`
- Create: `assets/logo-favicon.svg`
- Create: `assets/` directory

- [ ] **Step 1: Create assets directory**

```bash
mkdir -p assets
```

- [ ] **Step 2: Create the full wordmark logo**

Create `assets/logo.svg` — "BAD PLOTS" in heavy serif with a small ornamental rangoli dot cluster framing it. The wordmark should be legible from 180px to 260px wide.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" fill="none">
  <!-- Ornamental dots - left cluster -->
  <circle cx="20" cy="50" r="2.5" fill="#d4a843"/>
  <circle cx="12" cy="42" r="1.5" fill="#d4a843" opacity="0.6"/>
  <circle cx="12" cy="58" r="1.5" fill="#d4a843" opacity="0.6"/>
  <circle cx="6" cy="50" r="1" fill="#d4a843" opacity="0.3"/>
  <!-- Wordmark -->
  <text x="160" y="42" text-anchor="middle"
    font-family="'Playfair Display', Georgia, serif" font-weight="900"
    font-size="36" fill="#f2ede4" letter-spacing="4">BAD</text>
  <text x="160" y="80" text-anchor="middle"
    font-family="'Playfair Display', Georgia, serif" font-weight="900"
    font-size="44" fill="#d4a843" font-style="italic" letter-spacing="3">Plots</text>
  <!-- Ornamental dots - right cluster -->
  <circle cx="300" cy="50" r="2.5" fill="#d4a843"/>
  <circle cx="308" cy="42" r="1.5" fill="#d4a843" opacity="0.6"/>
  <circle cx="308" cy="58" r="1.5" fill="#d4a843" opacity="0.6"/>
  <circle cx="314" cy="50" r="1" fill="#d4a843" opacity="0.3"/>
  <!-- Thin decorative line under "BAD" -->
  <line x1="110" y1="48" x2="210" y2="48" stroke="#d4a843" stroke-width="0.5" opacity="0.4"/>
</svg>
```

- [ ] **Step 3: Create the favicon monogram**

Create `assets/logo-favicon.svg` — "BP" monogram for use as favicon and small icon.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="6" fill="#1a0a2e"/>
  <text x="16" y="22" text-anchor="middle"
    font-family="'Playfair Display', Georgia, serif" font-weight="900"
    font-size="16" fill="#d4a843">BP</text>
  <circle cx="4" cy="16" r="1.5" fill="#d4a843" opacity="0.4"/>
  <circle cx="28" cy="16" r="1.5" fill="#d4a843" opacity="0.4"/>
</svg>
```

- [ ] **Step 4: Commit**

```bash
git add assets/
git commit -m "feat: add logo SVG wordmark and favicon monogram"
```

---

## Task 5: Write Game Logic (`app.js`)

**Files:**
- Create: `app.js`

This is the largest task — all game state, screen management, card logic, analytics, and event binding.

- [ ] **Step 1: Write module structure with card loading and state**

```javascript
// ── app.js ── Bad Plots v2

// ── STATE ──
let CARDS = [];
let mode = 'BW';
let gameMode = 'party'; // 'party' | 'endless'
let deck = [];
let idx = 0;
let totalPts = 0;
let isFlipped = false;
let cardStartTime = 0;
let cardFlipTime = 0;
let players = [];
let currentPlayerIdx = 0;
let lives = 3;
let streak = 0;
let highScore = parseInt(localStorage.getItem('sp_highscore') || '0', 10);

const SESSION_ID = 'sp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const SESSION_START = Date.now();

// ── CARD LOADING ──
async function loadCards() {
  const res = await fetch('cards.json');
  CARDS = await res.json();
}

// ── ANALYTICS ──
const POSTHOG_KEY = 'phc_im021jzJ6Lx5QSvJdSSeVb23IROC0Kpbrs75X2NOzTd';

function initAnalytics() {
  const s = document.createElement('script');
  s.src = 'https://us-assets.i.posthog.com/static/array.js';
  s.onload = () => {
    if (window.posthog) {
      posthog.init(POSTHOG_KEY, {
        api_host: 'https://us.i.posthog.com',
        loaded: (ph) => {
          ph.capture('app_load', { session: SESSION_ID, ts: 0, referrer: document.referrer });
        }
      });
    }
  };
  document.head.appendChild(s);
}

function track(event, props = {}) {
  const payload = { event, session: SESSION_ID, ts: Date.now() - SESSION_START, ...props };
  if (window.posthog) posthog.capture(event, payload);
  const local = JSON.parse(localStorage.getItem('sp_events') || '[]');
  local.push(payload);
  localStorage.setItem('sp_events', JSON.stringify(local.slice(-500)));
}

// ── SCREEN READER ANNOUNCEMENTS ──
function announce(msg) {
  const el = document.getElementById('sr-announce');
  el.textContent = '';
  requestAnimationFrame(() => { el.textContent = msg; });
}
```

- [ ] **Step 2: Write screen management and navigation**

```javascript
// ── SCREENS ──
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  target.classList.add('active');
  window.scrollTo(0, 0);
  // Focus management
  const focusTarget = target.querySelector('h1, h2, .home-logo, button');
  if (focusTarget) {
    focusTarget.setAttribute('tabindex', '-1');
    focusTarget.focus({ preventScroll: true });
  }
}

// ── TOAST ──
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2600);
}

// ── SHEETS ──
function openSheet(id) {
  const overlay = document.getElementById(id);
  overlay.classList.add('open');
  // Focus first interactive element
  const first = overlay.querySelector('button, input, textarea, select');
  if (first) setTimeout(() => first.focus(), 300);
}

function closeSheet(id) {
  document.getElementById(id).classList.remove('open');
}
```

- [ ] **Step 3: Write deck building, shuffle, and session dedup**

```javascript
// ── SHUFFLE ──
function shuffle(arr) {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// ── SESSION DEDUP ──
function getSeenCards() {
  return JSON.parse(localStorage.getItem('sp_seen') || '[]');
}

function markCardsSeen(cardIds) {
  const seen = getSeenCards();
  seen.push(...cardIds);
  localStorage.setItem('sp_seen', JSON.stringify([...new Set(seen)]));
}

function filterSeen(cards) {
  const seen = getSeenCards();
  const filtered = cards.filter(c => !seen.includes(c.id));
  if (filtered.length < 12) {
    // Pool exhausted — reset
    localStorage.removeItem('sp_seen');
    return cards;
  }
  return filtered;
}

// ── DECK BUILDING ──
function buildPartyDeck(ind) {
  const pool = filterSeen(CARDS.filter(c => c.ind === ind));
  const easy = shuffle(pool.filter(c => c.diff === 'easy')).slice(0, 4);
  const med = shuffle(pool.filter(c => c.diff === 'medium')).slice(0, 4);
  const hard = shuffle(pool.filter(c => c.diff === 'hard')).slice(0, 4);
  return [...easy, ...med, ...hard];
}

function buildEndlessDeck(ind) {
  return shuffle(filterSeen(CARDS.filter(c => c.ind === ind)));
}
```

- [ ] **Step 4: Write player management**

```javascript
// ── PLAYERS ──
const PLAYER_COLORS = [
  { bg: 'rgba(212,168,67,0.15)', text: '#d4a843' },
  { bg: 'rgba(192,57,43,0.15)', text: '#e74c3c' },
  { bg: 'rgba(26,122,76,0.15)', text: '#2ecc71' },
  { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' },
];

function addPlayer() {
  if (players.length >= 4) { toast('Max 4 players'); return; }
  players.push({ name: '', score: 0, id: Date.now() });
  renderPlayerList();
}

function removePlayer(i) {
  players.splice(i, 1);
  renderPlayerList();
}

function renderPlayerList() {
  const el = document.getElementById('player-list');
  const btn = document.getElementById('add-player-btn');
  el.innerHTML = players.map((p, i) => {
    const c = PLAYER_COLORS[i % PLAYER_COLORS.length];
    return `<div class="player-row">
      <div class="player-avatar" style="background:${c.bg};color:${c.text}">${p.name ? p.name.charAt(0).toUpperCase() : (i + 1)}</div>
      <input class="player-input" placeholder="Player ${i + 1}" value="${p.name}"
        aria-label="Player ${i + 1} name"
        oninput="players[${i}].name=this.value;this.previousElementSibling.textContent=this.value?this.value.charAt(0).toUpperCase():(${i}+1)">
      <button class="player-remove" onclick="removePlayer(${i})" aria-label="Remove player ${i + 1}">&times;</button>
    </div>`;
  }).join('');
  btn.style.display = players.length >= 4 ? 'none' : 'block';
}

function renderGameTabs() {
  const tabs = document.getElementById('player-tabs');
  if (players.length <= 1) { tabs.style.display = 'none'; return; }
  tabs.style.display = 'flex';
  tabs.innerHTML = players.map((p, i) => `
    <div class="ptab" role="tab" aria-selected="${i === currentPlayerIdx}" id="ptab-${i}">
      ${p.name}<span class="ptab-score">${p.score}</span>
    </div>`).join('');
}

function updateTabs() {
  players.forEach((p, i) => {
    const t = document.getElementById(`ptab-${i}`);
    if (!t) return;
    t.setAttribute('aria-selected', i === currentPlayerIdx);
    t.innerHTML = `${p.name}<span class="ptab-score">${p.score}</span>`;
  });
}
```

- [ ] **Step 5: Write game start and mode selection**

```javascript
// ── MODE SELECTION ──
function selectMode(m) {
  mode = m;
  track('mode_selected', { mode: m, gameMode });

  if (gameMode === 'party' && players.length === 0) {
    // Show player setup sheet for party mode
    openSheet('players-overlay');
  } else {
    startGame();
  }
}

// ── START GAME ──
function startGame() {
  closeSheet('players-overlay');

  // Fill unnamed players
  players = players.map((p, i) => ({ ...p, name: p.name || `Player ${i + 1}`, score: 0 }));
  if (players.length === 0) players = [{ name: 'Solo', score: 0, id: Date.now() }];
  currentPlayerIdx = 0;

  // Build deck
  if (gameMode === 'party') {
    deck = buildPartyDeck(mode);
  } else {
    deck = buildEndlessDeck(mode);
    lives = 3;
    streak = 0;
    renderLives();
  }

  if (!deck.length) { toast('No cards found!'); return; }

  idx = 0;
  totalPts = 0;
  isFlipped = false;

  // Show/hide mode-specific UI
  document.getElementById('game-lives').style.display = gameMode === 'endless' ? 'flex' : 'none';
  document.getElementById('g-bar-track').style.display = gameMode === 'party' ? 'block' : 'none';

  track('game_start', { mode, gameMode, players: players.length, cards: deck.length });
  renderGameTabs();
  show('game');
  loadCard();
}

function renderLives() {
  const livesEl = document.querySelectorAll('.life');
  livesEl.forEach((el, i) => {
    el.classList.toggle('active', i < lives);
  });
}
```

- [ ] **Step 6: Write card loading with transitions**

```javascript
// ── LOAD CARD ──
function loadCard() {
  if (gameMode === 'party' && idx >= deck.length) { endGame(); return; }
  if (gameMode === 'endless' && lives <= 0) { endGame(); return; }
  if (gameMode === 'endless' && idx >= deck.length) {
    // Reshuffle for endless
    deck = buildEndlessDeck(mode);
    idx = 0;
    if (!deck.length) { endGame(); return; }
  }

  const c = deck[idx];
  isFlipped = false;
  cardStartTime = Date.now();

  const wrap = document.getElementById('card-wrap');
  const scoreZone = document.getElementById('score-zone');
  scoreZone.style.display = 'none';

  // Card exit animation
  wrap.classList.add('exiting');

  setTimeout(() => {
    // Reset flip
    wrap.classList.remove('flipped', 'exiting');

    // Update progress
    if (gameMode === 'party') {
      const pct = Math.round((idx / deck.length) * 100);
      document.getElementById('g-bar').style.width = pct + '%';
      document.getElementById('g-bar-track').setAttribute('aria-valuenow', pct);
      document.getElementById('g-prog').textContent = (idx + 1) + ' / ' + deck.length;
    } else {
      document.getElementById('g-prog').textContent = 'Card ' + (idx + 1);
    }
    document.getElementById('g-pts').textContent = totalPts + ' pts';

    // Set card content
    const isBW = c.ind === 'BW';
    const front = document.getElementById('card-front');
    front.classList.toggle('tw', !isBW);

    document.getElementById('cf-ind').textContent = isBW ? 'Bollywood' : 'Tollywood';
    document.getElementById('cf-era').textContent = c.era + ' · ' + c.diff.charAt(0).toUpperCase() + c.diff.slice(1);
    document.getElementById('cf-clue').textContent = c.c;

    // Back
    const back = document.getElementById('card-back');
    back.classList.toggle('tw', !isBW);
    const indBack = document.getElementById('cb-ind');
    indBack.textContent = (isBW ? 'Bollywood' : 'Tollywood') + ' · ' + c.diff;
    indBack.classList.toggle('bw', isBW);
    indBack.classList.toggle('tw', !isBW);
    document.getElementById('cb-answer').textContent = c.n;
    document.getElementById('cb-year').textContent = c.y;
    document.getElementById('cb-fact').textContent = c.f;

    // Card enter animation
    wrap.classList.add('entering');
    setTimeout(() => wrap.classList.remove('entering'), 300);

    // Announce for screen readers
    announce(`Card ${idx + 1}. ${isBW ? 'Bollywood' : 'Tollywood'}, ${c.diff}. ${c.c}`);

    track('card_view', { card: c.id, name: c.n, idx, player: players[currentPlayerIdx]?.name });
  }, idx === 0 ? 0 : 300); // Skip exit animation on first card
}
```

- [ ] **Step 7: Write card flip and scoring**

```javascript
// ── FLIP ──
function flipCard() {
  if (isFlipped) return;
  isFlipped = true;
  cardFlipTime = Date.now();
  const wrap = document.getElementById('card-wrap');
  wrap.classList.add('flipped');
  setTimeout(() => {
    document.getElementById('score-zone').style.display = 'block';
  }, 320);
  announce(`Answer: ${deck[idx].n}, ${deck[idx].y}. ${deck[idx].f}`);
  track('card_flip', { card: deck[idx]?.id, latencyMs: Date.now() - cardStartTime });
}

// ── MARK CARD ──
function markCard(got) {
  const c = deck[idx];
  const pts = { easy: 1, medium: 2, hard: 3 }[c.diff] || 1;
  const decideMs = Date.now() - cardFlipTime;

  if (got === true) {
    totalPts += pts;
    players[currentPlayerIdx].score += pts;
    streak++;
    // Score flash animation
    const scoreEl = document.getElementById('g-pts');
    scoreEl.textContent = totalPts + ' pts';
    scoreEl.classList.remove('flash');
    void scoreEl.offsetWidth; // force reflow
    scoreEl.classList.add('flash');
    updateTabs();
  } else if (got === false) {
    streak = 0;
    if (gameMode === 'endless') {
      lives--;
      renderLives();
    }
  }
  // got === null is skip

  track('card_result', {
    card: c.id, name: c.n, diff: c.diff,
    result: got === true ? 'got' : got === false ? 'miss' : 'skip',
    pts: got ? pts : 0, player: players[currentPlayerIdx]?.name, decideMs
  });

  // Rotate player in multiplayer
  if (players.length > 1) {
    const prevPlayer = currentPlayerIdx;
    currentPlayerIdx = (currentPlayerIdx + 1) % players.length;
    updateTabs();

    // Show turn interstitial
    const interstitial = document.getElementById('turn-interstitial');
    document.getElementById('turn-name').textContent = players[currentPlayerIdx].name;
    interstitial.style.display = 'flex';
    document.getElementById('turn-ready-btn').onclick = () => {
      interstitial.style.display = 'none';
      idx++;
      loadCard();
    };
    return;
  }

  idx++;
  loadCard();
}
```

- [ ] **Step 8: Write end game, results, share, and replay**

```javascript
// ── END GAME ──
function endGame() {
  // Mark cards as seen
  markCardsSeen(deck.slice(0, idx).map(c => c.id));

  const total = gameMode === 'party' ? deck.length : idx;
  const got = players.reduce((s, p) => s + p.score, 0);
  const pct = total > 0 ? got / total : 0;

  let title, sub, verdict;
  if (pct === 1) { title = 'Perfect score.'; sub = `${total}/${total} — we are concerned.`; verdict = '"You have seen too many movies. Seek help."'; }
  else if (pct >= 0.75) { title = 'Solid. Very solid.'; sub = `${got}/${total} — your family would be proud.`; verdict = '"You clearly had a very specific childhood. Respect."'; }
  else if (pct >= 0.5) { title = 'Not bad at all.'; sub = `${got}/${total} — above average desi trivia brain.`; verdict = '"You know enough to participate in the argument. Chalo theek hai."'; }
  else if (pct >= 0.3) { title = 'Seen some. Missed some.'; sub = `${got}/${total} — your movie knowledge has gaps.`; verdict = '"Ek baar baith ke Pokiri dekh. Bas itna."'; }
  else { title = 'Yaar.'; sub = `${got}/${total} — are you even desi?`; verdict = '"Your parents are disappointed. Watch more movies. Immediately."'; }

  // High score check (endless mode)
  if (gameMode === 'endless' && totalPts > highScore) {
    highScore = totalPts;
    localStorage.setItem('sp_highscore', String(highScore));
    title = 'New High Score!';
  }

  document.getElementById('r-title').textContent = title;
  document.getElementById('r-sub').textContent = sub;
  document.getElementById('r-verdict').textContent = verdict;
  document.getElementById('r-correct').textContent = got;
  document.getElementById('r-played').textContent = total;
  document.getElementById('r-pts').textContent = totalPts;

  // Leaderboard (multiplayer)
  const lb = document.getElementById('leaderboard');
  if (players.length > 1) {
    lb.style.display = 'block';
    const sorted = [...players].sort((a, b) => b.score - a.score);
    document.getElementById('lb-rows').innerHTML = sorted.map((p, i) => `
      <div class="lb-row">
        <div class="lb-rank${i === 0 ? ' gold' : ''}">${i === 0 ? '\u2605' : (i + 1)}</div>
        <div class="lb-name">${p.name}</div>
        <div class="lb-pts">${p.score} pts</div>
      </div>`).join('');
  } else { lb.style.display = 'none'; }

  track('game_end', { correct: got, total, pts: totalPts, mode, gameMode, players: players.length });
  show('results');
}

// ── REPLAY ──
function replayGame() {
  players = players.map(p => ({ ...p, score: 0 }));
  startGame();
}

// ── SHARE ──
function doShare() {
  const got = players.reduce((s, p) => s + p.score, 0);
  const txt = `I scored ${totalPts} pts on Bad Plots!\n${got}/${deck.length} correct.\nTerrible plots. Real movies.\nbadbollywoodplots.com`;
  if (navigator.share) navigator.share({ title: 'Bad Plots', text: txt });
  else navigator.clipboard?.writeText(txt).then(() => toast('Copied to clipboard!'));
  track('share', { pts: totalPts });
}
```

- [ ] **Step 9: Write feedback and suggestion handlers**

```javascript
// ── FEEDBACK ──
function toggleTag(el) {
  const pressed = el.getAttribute('aria-pressed') === 'true';
  el.setAttribute('aria-pressed', !pressed);
}

function submitFeedback() {
  const tags = [...document.querySelectorAll('.fb-tag[aria-pressed="true"]')].map(t => t.dataset.v);
  const text = document.getElementById('fb-text').value.trim();
  const data = { tags, text, type: 'general', session_id: SESSION_ID };
  const local = JSON.parse(localStorage.getItem('sp_feedback') || '[]');
  local.push({ ...data, ts: new Date().toISOString() });
  localStorage.setItem('sp_feedback', JSON.stringify(local));
  track('feedback_submitted', { type: 'general', tags, hasText: !!text, text: text || null });
  toast('Feedback saved. Shukriya!');
  closeSheet('fb-overlay');
  // Reset tags
  document.querySelectorAll('.fb-tag').forEach(t => t.setAttribute('aria-pressed', 'false'));
  document.getElementById('fb-text').value = '';
}

// ── SUGGEST ──
function submitSuggestion() {
  const movie = document.getElementById('suggest-movie').value.trim();
  const industry = document.getElementById('suggest-industry').value.trim();
  if (!movie) { toast('Please enter a movie name'); return; }
  const data = { movie, industry, session_id: SESSION_ID };
  const local = JSON.parse(localStorage.getItem('sp_suggestions') || '[]');
  local.push({ ...data, ts: new Date().toISOString() });
  localStorage.setItem('sp_suggestions', JSON.stringify(local));
  track('suggestion_submitted', { movie, industry });
  toast("Added to the list! We'll write a terrible description.");
  closeSheet('suggest-overlay');
  document.getElementById('suggest-movie').value = '';
  document.getElementById('suggest-industry').value = '';
}
```

- [ ] **Step 10: Write initialization and event binding**

```javascript
// ── EVENT BINDING ──
function bindEvents() {
  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => selectMode(btn.dataset.mode));
  });

  // Game mode toggle
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      gameMode = btn.dataset.gamemode;
    });
  });

  // Player setup
  document.getElementById('add-player-btn').addEventListener('click', addPlayer);
  document.getElementById('start-game-btn').addEventListener('click', startGame);

  // Game controls
  document.getElementById('card-wrap').addEventListener('click', flipCard);
  document.getElementById('card-wrap').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipCard(); }
  });
  document.getElementById('card-wrap').setAttribute('role', 'button');
  document.getElementById('card-wrap').setAttribute('tabindex', '0');
  document.getElementById('card-wrap').setAttribute('aria-label', 'Flip card to reveal answer');

  document.getElementById('btn-got').addEventListener('click', () => markCard(true));
  document.getElementById('btn-miss').addEventListener('click', () => markCard(false));
  document.getElementById('btn-skip').addEventListener('click', () => markCard(null));

  // Game exit
  document.getElementById('game-exit').addEventListener('click', () => {
    if (confirm('Exit game?')) {
      track('game_exit', { cardsPlayed: idx, totalCards: deck.length, pts: totalPts, mode, gameMode });
      show('home');
    }
  });

  // Results
  document.getElementById('btn-replay').addEventListener('click', replayGame);
  document.getElementById('btn-share').addEventListener('click', doShare);
  document.getElementById('btn-feedback-end').addEventListener('click', () => openSheet('fb-overlay'));

  // Feedback
  document.getElementById('fb-submit').addEventListener('click', submitFeedback);
  document.getElementById('fb-skip').addEventListener('click', () => closeSheet('fb-overlay'));
  document.querySelectorAll('.fb-tag').forEach(tag => {
    tag.addEventListener('click', () => toggleTag(tag));
  });

  // Suggest
  document.getElementById('suggest-btn').addEventListener('click', () => openSheet('suggest-overlay'));
  document.getElementById('suggest-submit').addEventListener('click', submitSuggestion);
  document.getElementById('suggest-cancel').addEventListener('click', () => closeSheet('suggest-overlay'));
  document.getElementById('feedback-btn').addEventListener('click', () => openSheet('fb-overlay'));

  // Sheet overlay close on backdrop click
  document.querySelectorAll('.sheet-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSheet(overlay.id);
    });
  });

  // Escape key to close sheets
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.sheet-overlay.open').forEach(o => closeSheet(o.id));
    }
  });
}

// ── INIT ──
async function init() {
  await loadCards();
  bindEvents();
  initAnalytics();
  // Register SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

// Make functions available globally for inline handlers in player list
window.players = players;
window.removePlayer = removePlayer;

init();
```

- [ ] **Step 11: Verify the game works end-to-end**

Open in browser. Test:
1. Home screen loads with logo and mode buttons
2. Tap Bollywood → player setup sheet appears → tap Start → game begins
3. Card displays clue at 24px italic
4. Tap card → flips → score buttons appear
5. Tap "Got it" → card slides out, new card slides in
6. After 12 cards → results screen with verdict
7. Toggle to Endless → tap mode → game starts with lives
8. Miss 3 → game ends

- [ ] **Step 12: Commit**

```bash
git add app.js
git commit -m "feat: add complete v2 game logic with party/endless modes"
```

---

## Task 6: Update Service Worker and Manifest

**Files:**
- Modify: `sw.js`
- Modify: `manifest.json`

- [ ] **Step 1: Update sw.js with new file list and cache-busting**

```javascript
const CACHE_NAME = 'badplots-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/cards.json',
  '/manifest.json',
  '/assets/logo.svg',
  '/assets/logo-favicon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
```

- [ ] **Step 2: Update manifest.json**

```json
{
  "name": "Bad Plots: The Desi Party Game",
  "short_name": "Bad Plots",
  "description": "Terrible plots. Real movies. Guess Bollywood & Tollywood films from hilariously bad descriptions.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a0a2e",
  "theme_color": "#1a0a2e",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "assets/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "assets/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- [ ] **Step 3: Commit**

```bash
git add sw.js manifest.json
git commit -m "feat: update service worker and manifest for v2"
```

---

## Task 7: Integration Test and Final Polish

**Files:**
- All files from Tasks 1-6

- [ ] **Step 1: Full manual test — Party mode solo**

Open `http://localhost:8080` in browser.

1. Home screen: logo visible, Bollywood/Tollywood buttons styled with correct colors and glow
2. Tap Bollywood → player sheet → Start → game starts
3. Card shows clue at 24px italic serif on crimson background with colored glow
4. Tap card → flip animation (0.4s) → answer on cream background
5. Score buttons visible, 16px, proper colors
6. Tap "Got it" → score flashes → card slides out, new slides in
7. After 12 cards → results screen with big title, verdict, stats
8. "Play again" works

- [ ] **Step 2: Full manual test — Endless mode solo**

1. Toggle to Endless on home
2. Tap Tollywood → game starts with 3 lives visible
3. Play cards — miss 3 → game ends
4. Verify high score saved

- [ ] **Step 3: Full manual test — Multiplayer**

1. Toggle back to Party
2. Tap Bollywood → add 2 players → Start
3. Verify player tabs, turn interstitial between turns
4. Complete game → leaderboard on results

- [ ] **Step 4: Keyboard navigation test**

Tab through entire app. Verify:
- All buttons focusable with visible gold outline
- Card flippable with Enter/Space
- Sheets closeable with Escape
- Focus moves to new screen on navigation

- [ ] **Step 5: Fix any issues found during testing**

Address problems discovered in steps 1-4.

- [ ] **Step 6: Remove old files.zip (contains old version)**

```bash
rm files.zip
```

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: Bad Plots v2 — complete visual redesign and UX overhaul"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Extract + fix card data | `cards.json` |
| 2 | Semantic HTML shell | `index.html` |
| 3 | Design system CSS | `style.css` |
| 4 | Logo SVG assets | `assets/logo.svg`, `assets/logo-favicon.svg` |
| 5 | Game logic | `app.js` |
| 6 | Service worker + manifest | `sw.js`, `manifest.json` |
| 7 | Integration test + polish | All files |
