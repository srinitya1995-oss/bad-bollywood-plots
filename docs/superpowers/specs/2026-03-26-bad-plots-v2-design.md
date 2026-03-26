# Bad Bollywood Plots v2 — Design Spec

**Approach:** Masala Mix — bright maximalist cards on a dark minimal stage
**Date:** 2026-03-26

---

## 1. Design Philosophy

Cards are the stars. Everything else serves them.

- **On the cards:** desi maximalist — bold color, ornamental borders, confident type
- **Around the cards:** minimal — dark stage, clean UI, nothing competing
- **Everywhere:** crisp, sharp, intentional. No gradients, no blur, no AI aesthetic

---

## 2. Visual Design

### Color System

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#1a0a2e` (deep aubergine) | Single app background — rich, not flat |
| `--card-bw` | `#c0392b` (warm crimson) | Bollywood card face |
| `--card-tw` | `#1a7a4c` (rich emerald) | Tollywood card face |
| `--gold` | `#d4a843` | Scores, highlights, logo accent — used sparingly |
| `--cream` | `#f2ede4` | Primary text on dark, card back background |
| `--ink` | `#120808` | Text on light surfaces |
| `--glow-bw` | `rgba(192, 57, 43, 0.3)` | Crimson glow shadow under BW cards |
| `--glow-tw` | `rgba(26, 122, 76, 0.3)` | Emerald glow shadow under TW cards |

**Rules:**
- ONE background color. No ink2/ink3/ink4 shades.
- No text below 0.6 opacity. If it's worth showing, show it.
- Gold is an accent, not a default. Most text is cream.
- Card colors are saturated enough to pop off the aubergine background.

### Typography

Two fonts only:
- **Playfair Display** (serif) — logo, clue text, headings, movie titles
- **DM Sans** (sans) — UI labels, buttons, body text

Type scale (every size used, no exceptions):

| Step | Size | Usage |
|---|---|---|
| xs | 12px | Tertiary labels (era, card metadata) |
| sm | 14px | Secondary text, captions |
| base | 16px | Body text, button labels |
| lg | 20px | Section headings, card back movie title |
| xl | 24px | Clue text on cards |
| 2xl | 32px | Screen titles |
| 3xl | 48px | Logo, results title |

**Rules:**
- Clue text is 24px Playfair Display italic. Non-negotiable — it's the core content.
- No 9px or 10px text anywhere.
- Minimum text size is 12px, and only for true metadata.
- Button text is 16px minimum.

### Cards

**Dimensions:** `max-width: 360px`, `height: clamp(320px, 55vh, 440px)`

**Front face:**
- Solid saturated background (crimson or emerald)
- Cream text, full opacity
- Ornamental jali-inspired border frame — 4-6px visible border with geometric desi pattern. Structural, not decorative. Applied via CSS border-image or SVG frame.
- Content hierarchy: Industry badge (top-left) → Era (top-right) → Clue text (centered, dominant) → "Tap to reveal" (bottom, 14px, 0.7 opacity minimum)
- No tiny corner SVG motifs. The frame IS the ornament.

**Back face:**
- Cream background (`--cream`)
- Movie title in `--ink` at 20px Playfair Display bold
- Year at 14px, 0.6 opacity minimum
- Fun fact at 14px, `--ink` at 0.75 opacity
- Same ornamental border frame, colored to match industry (crimson or emerald)

**Float effect:**
- Cards sit on a colored glow: `box-shadow: 0 8px 40px var(--glow-bw)` (or tw)
- The glow gives depth without black shadows on dark backgrounds
- Creates the "object floating on a stage" feeling

**Flip animation:**
- 0.4s (faster than current 0.65s) with a slight overshoot ease
- Scale bumps to 1.02 mid-flip for a satisfying "snap"
- On `:active` — scale to 0.96 (noticeable, not the current invisible 0.98)

**Card transitions:**
- Current card slides out left + fades
- New card slides in from right + fades in
- 0.3s transition, slight overlap for fluidity
- No more instant content-swap with `transition: none`

### Logo

"BAD PLOTS" in heavy Playfair Display (900 weight).

- Small ornamental bracket or rangoli dot cluster framing the wordmark
- Favicon/monogram version: "BP" with the ornament element
- Two color variants: gold on dark (in-app), dark on light (sharing/OG image)
- SVG, scalable from 16px favicon to full display
- Tagline below in DM Sans: "Terrible plots. Real movies."

### Ornament System

One reusable desi pattern — simplified jali or rangoli-inspired geometric border.

- Used as: card border frame, section dividers, logo framing
- Not used as: floating decorative elements, corner garnish, background texture
- The pattern is structural — it defines boundaries, not fills space
- Single SVG asset, applied via CSS `border-image` or as a component

---

## 3. UX Structure

### Screen Flow

```
Home → [tap mode] → Game → Results
         ↓                    ↓
   [add players?]      [Community Board]
   (bottom sheet)
```

**2 taps to play.** Home → tap Bollywood or Tollywood → game starts.

### Home Screen

- Logo (centered, prominent)
- Two big mode buttons: **Bollywood** (crimson) and **Tollywood** (emerald)
- Each button shows card count: "75 cards"
- **Endless toggle** — small switch or pill below the mode buttons: "Party · Endless"
- **Community Board** link at bottom
- **Suggest a movie** link at bottom
- Footer: credit, feedback link

No stats grid. No "75 / 2 / 3" marketing numbers. No section labels.

### Party Mode (default)

- **12 cards per round** (4 easy → 4 medium → 4 hard, shuffled within each tier)
- Progression is built into the deck construction, not dynamic mid-game
- If multiplayer: quick "Add players" bottom sheet appears before game starts (tap "+" to add, names optional, max 4). Skippable — just tap Start for solo.
- **Pass-the-phone interstitial** in multiplayer: full-screen "{Player Name}'s Turn" between cards when player changes. Prevents seeing the next clue before your turn.
- **No mid-game feedback.** Feedback prompt appears once on the results screen.

### Endless Mode (solo only)

- Cards keep coming. No cap.
- **Difficulty ramps:** starts with easy pool, after 5 correct in a row medium cards mix in, after 10 correct hard cards mix in.
- **Lives system:** 3 misses and you're out. Displayed as 3 dots/hearts in the game bar.
- Score accumulates. High score saved to localStorage + posted to community board.
- Session dedup: cards marked as "seen" in localStorage, not re-dealt until pool exhausted.

### Game Screen

- **Game bar:** Exit (left) · Card count or lives (center) · Score (right)
- **Progress:** thin gold bar under game bar (party mode) or lives indicator (endless)
- **Player tabs** (multiplayer only): below game bar
- **Card stage:** card centered, generous padding
- **Score zone:** two big buttons after flip — "Got it" (green) and "Missed" (red). 16px text, 48px+ height. Bold, unmissable.
- **Skip:** small text link below buttons

### Results Screen

- Big title: verdict text (keep the existing funny ones — "You have seen too many movies. Seek help.")
- Stats: correct / played / points
- Leaderboard (multiplayer)
- **High score badge** (endless mode): "New High Score!" if applicable
- Actions: Play Again (primary), Share Score, View Community Board
- **Feedback prompt:** "How was that?" — one optional tap, not a mandatory sheet

### Community Board

Accessible from home screen and results screen.

**Scoreboard tab:**
- Top 20 scores this week
- Name (or anonymous) + score + mode + date
- "Your best: X pts" at top if they have a score

**Suggestions tab:**
- Feed of community-submitted movies
- Each entry: movie name, submitter name, status (Suggested / Added to deck)
- Movies that become cards show a "Now playable!" badge
- Submit button at top

Data source: Supabase (already in .env.example) or PostHog events.

---

## 4. Content Fixes

### Broken Cards — Remove or Replace

| Card | Issue | Action |
|---|---|---|
| `bw52` | Duplicate of bw38 (Barfi!) — fun fact says so | Delete |
| `bw72` | Same movie as bw49 (Paan Singh Tomar) | Replace with new hard BW film |
| `bw74` | Same movie as bw46 (Kapoor & Sons) | Replace with new hard BW film |
| `bw75` | Same movie as bw42 (Masaan) | Replace with new hard BW film |
| `tw54` | Placeholder — fun fact says "replace with Brindavanam" | Replace with Brindavanam |
| `tw55` | Placeholder — fun fact says "replace with Rang De" | Replace with Rang De |
| `tw75` | Placeholder — fun fact says "replace with Nenu Local" | Replace with Nenu Local |
| `tw72` | Near-clone of bw34 (Andhadhun/Maestro) | Replace with different TW hard film |

### Clue Quality Rules (for rewrites + new cards)

1. **Every clue must have at least one detail unique to this film.** "Man falls for woman, family disapproves" is not a clue. "The bus scene" or "a goat farm" is.
2. **Vary the sentence pattern.** Not every clue should be "Short declarative. Sardonic observation. Punchline." Mix in longer sentences, different structures.
3. **Sardonic tag at the end in ~40% of clues, not 80%.** The voice is a seasoning, not the dish.
4. **Hard clues need MORE detail, not less.** Lesser-known films need more identifying information to be guessable.

### Priority Rewrites

Clues that are pure attitude with no identifying detail:
- `bw62` (Animal): "Man loves his father. Father does not notice. Man escalates." — needs specifics
- `bw63` (Padmaavat): too vague
- `bw44` (Dhoom 2): no mention of bikes, heists, or disguises
- `tw44` (Munna): describes 30+ Telugu films
- `tw48` (Babu Bangaram): generic rom-com description
- `tw50` (Mirapakay): generic

---

## 5. Technical Architecture

### File Structure (from current single file)

```
seedhaplot/
  index.html          ← shell + HTML structure only
  style.css           ← all styles
  app.js              ← game logic
  cards.json          ← card data (extracted from inline array)
  manifest.json       ← existing
  sw.js               ← updated cache list
  assets/
    logo.svg          ← new logo
    logo-favicon.svg  ← monogram version
    ornament.svg      ← reusable border pattern
  scripts/            ← existing generation tooling
```

### Session Dedup

```javascript
// On game end, save seen card IDs
const seen = JSON.parse(localStorage.getItem('sp_seen') || '[]');
seen.push(...deck.map(c => c.id));
localStorage.setItem('sp_seen', JSON.stringify([...new Set(seen)]));

// On deck build, filter out seen cards (reset when pool exhausted)
let pool = getFiltered(mode, diff).filter(c => !seen.includes(c.id));
if (pool.length < deckSize) { localStorage.removeItem('sp_seen'); pool = getFiltered(mode, diff); }
```

### Deck Construction (Party Mode)

```javascript
function buildPartyDeck(mode) {
  const cards = CARDS.filter(c => c.ind === mode);
  const easy = shuffle(cards.filter(c => c.diff === 'easy')).slice(0, 4);
  const med = shuffle(cards.filter(c => c.diff === 'medium')).slice(0, 4);
  const hard = shuffle(cards.filter(c => c.diff === 'hard')).slice(0, 4);
  return [...easy, ...med, ...hard]; // progression: easy → medium → hard
}
```

### Endless Mode Progression

```javascript
let streak = 0;
function getNextCard() {
  let pool;
  if (streak < 5) pool = cards.filter(c => c.diff === 'easy');
  else if (streak < 10) pool = cards.filter(c => c.diff !== 'hard');
  else pool = cards; // all difficulties
  // filter out seen cards, pick random
}
```

---

## 6. Accessibility

### Must-haves for v2

1. Remove `user-scalable=no` from viewport meta
2. Semantic HTML: `<main>`, `<h1>`-`<h3>`, `<nav>`, `<header>`, `<footer>`, `<button>` for all interactive elements
3. Focus management: `show()` moves focus to new screen's heading
4. Keyboard navigation: all interactive elements focusable, Enter/Space to activate
5. ARIA live region for game state announcements (card loaded, answer revealed, score change)
6. `role="dialog"` + focus trap + Escape key for all bottom sheets
7. `aria-pressed` on toggle buttons (feedback tags, endless toggle)
8. `.sr-only` utility class for screen-reader-only text
9. `aria-live="polite"` on toast element
10. All text meets WCAG AA contrast (4.5:1 normal, 3:1 large). No text below 0.6 opacity on dark backgrounds.
11. Touch targets: 44px minimum for all interactive elements
12. Visible focus indicators: 2px gold outline via `:focus-visible`

---

## 7. Out of Scope (for now)

- User accounts / authentication
- Voting on movie suggestions (phase C of community board)
- Sound effects and haptics (nice-to-have, not v2 blocker)
- Additional languages beyond Bollywood/Tollywood
- Native app wrapper
- Server-side rendering / framework migration
