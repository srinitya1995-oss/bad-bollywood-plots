# Bad Desi Plots — Flow Spec for Design (2026-04-23)

> Source of truth for visual redesign. Enumerates every screen, state, affordance, and edge case **as the code actually behaves today**, so design work does not invent mechanics that do not exist.
>
> Companion specs (read for context, not for visual tokens): `product-spec.md`, `system-architecture-spec.md`, `engineering-spec.md`, `applied-scientist-spec.md`, `voice-fingerprint.md`.

## 0. Orientation

- Product: React 18 + Vite + TypeScript PWA. Mobile-first. Target viewport 375px wide. Works up to desktop.
- Live at: `https://baddesiplots.com` (served by Vercel). Legacy `badbollywoodplots.com` 301s to the new apex.
- Two industries only: `HI` (Hindi, displayed as BOLLYWOOD) and `TE` (Telugu, displayed as TOLLYWOOD). `TA` and `ML` exist in the type system but are `comingSoon: true`.
- Two play modes: **Pass & Play** (2-8 named humans on one phone) and **Solo** (one player, endless).
- No accounts. No login. Anonymous `sessionId` in localStorage. Everything is fire-and-forget to Supabase.

## 1. Game state machine (canonical)

Source: `src/core/gameFSM.ts`. Eight states, these transitions and no others:

```
home        -> setup | playing | turnChange
setup       -> playing | turnChange | home
playing     -> flipped | home | results
flipped     -> scoring | results | home
scoring     -> playing | turnChange | continue | results | home
turnChange  -> playing | results | home
continue    -> playing | results | home
results     -> home | playing
```

The React shell in `src/components/App.tsx` switches which component renders based on state:

| FSM state | Component rendered |
|---|---|
| `home` | `<HomeScreen />` |
| `setup` | `<HomeScreen />` + `<PlayerSetup />` (overlay) |
| `playing` / `flipped` / `scoring` | `<GameScreen />` |
| `turnChange` / `continue` | `<TurnInterstitial />` |
| `results` | `<ResultsScreen />` |

Global chrome rendered alongside every state except home+setup: `<TopBand />`. Global chrome always rendered: `<BgLayer />`, `<Toast />`.

## 2. Loading state (before FSM is ready)

Before `gameInstance.init()` resolves, the root renders a placeholder that visually matches the Home hero:
- Kicker text: `THE DESI PARTY GAME`
- Title stack: `BAD / DESI / PLOTS` (DESI in accent color)
- Status line: `LOADING CARDS...`
- If init fails: status flips to `COULDN'T LOAD. TAP TO RETRY.` in tomato, plus a gold-bright `RETRY` pill that calls `window.location.reload()`.

Design implication: keep the loading hero visually close to the final home hero so there is no jump when cards finish loading.

## 3. Home screen (state: `home`)

File: `src/components/HomeScreen.tsx`. Root class: `.v8-home`.

Structure (top to bottom):

1. **Hero block** (`.v8-home-hero`)
   - Kicker: `THE DESI PARTY GAME` (Bebas, small, tomato)
   - Title: `BAD / DESI / PLOTS` on three lines. The `DESI` line gets an accent color.
   - Tag line: "We describe Bollywood movies badly. You guess which film it is."
   - Sub line: "Simple, chaotic, and best played with chai and friends."
   - Meta row: `SOLO · PARTY · NO SETUP` (dots between).

2. **Cinema toggle label** (`.v8-home-cinema-label`): `PICK YOUR CINEMA` (Bebas, tiny, letter-spaced).

3. **Cinema toggle** (`.v8-home-cinema`, `role="radiogroup"`)
   - Two buttons: `BOLLYWOOD` (selects `cinema = 'HI'`) and `TOLLYWOOD` (selects `cinema = 'TE'`).
   - Exactly one is active. Default `'HI'`. State is local to HomeScreen.
   - Clicking either fires `posthog.capture('cinema_pick', { cinema })`.

4. **CTAs** (`.v8-home-ctas`), top to bottom:
   - **Resume pill** (`.v8-home-resume`), conditionally rendered only when `useResumeSession().canResume === true`. Label: `Resume last game`. Clicking calls `track.resumeUsed()` then `window.location.reload()` to pick up the suspended game.
   - **Pass & Play button** (`.v8-home-btn--primary`). Label: `PASS & PLAY`. Calls `actions.selectMode(cinema)` which transitions FSM `home -> setup`.
   - **Solo button** (`.v8-home-btn--secondary`). Label: `SOLO`. Calls `actions.startSoloGame(cinema)` which skips setup and goes straight to `home -> turnChange`.

5. **Footer** (`.v8-home-footer`): four link-buttons, dot-separated.
   - `How to Play` -> opens `<HowToScreen />` overlay
   - `Suggest a Movie` -> opens `<SuggestSheet />` overlay
   - `Feedback` -> opens `<FeedbackSheet />` overlay
   - `Settings` -> opens `<SettingsScreen />` overlay

**Home edge cases:**
- `canResume` is computed from stored `gameInstance` state. Only shows the Resume pill if there is a real suspended round.
- There is no difficulty picker on Home. Difficulty filter lives inside Settings.
- There is no mode switcher on Home beyond the two big buttons. Mode choice is locked in at the point of clicking.

## 4. Player setup overlay (state: `setup`)

File: `src/components/PlayerSetup.tsx`. Renders as an overlay on top of Home. Root class: `.v8-setup-overlay` and `.v8-setup-panel`.

Elements:

1. **Mast**: title `WHO'S PLAYING?` (party) or `SOLO MODE` (solo). Sub line `MIN 2 · MAX 8` or `JUST YOU`.
2. **Close button** `×` (top right). Calls `onClose()` and transitions FSM `setup -> home`.
3. **Mode toggle** (`.v8-setup-mode`): `PASS & PLAY` (sub: "One Phone, Party") vs `SOLO` (sub: "Just Me, Chill"). Switching mode wipes the player list and re-seeds.
4. **Line-up label**: `THE LINE-UP`.
5. **Player list** (`.v8-setup-players`): one row per player.
   - Party mode: default 2 rows, expandable to 8.
   - Each row: drag-grip (if party + >1), colored number badge (alternates color per index), text input, remove `×` (party only, only if >MIN).
   - Input placeholder: `Player 1`, `Player 2`, etc. Max length 24 chars.
   - Drag-and-drop reordering is wired and functional in party mode.
6. **Add player button** (`+ ADD PLAYER`), shown only when party mode and `players.length < 8`.
7. **Duplicate warning banner** (`.v8-setup-warning`): appears if two party players share the same effective name (case-insensitive, empty treated as `Player N`). Blocks start.
8. **Bottom CTA row** (`.v8-setup-cta`):
   - `BACK` (left): calls `onClose()`, transitions FSM `setup -> home`.
   - `LET'S GO` (right): disabled if `!canStart` (party with <MIN players or hasDuplicates). On click, empty names are replaced with desi fallbacks (`Chintu`, `Pinky`, `Bunty`, `Guddu`, `Sonu`, `Monu`, `Rinku`, `Bubbly`), then `actions.startGame(filled)` transitions `setup -> turnChange`.

**Setup edge cases:**
- Switching from party -> solo collapses the list to 1 row. Going back to party re-seeds 2 rows.
- Empty names are never rejected; they get replaced with fallbacks at start time.
- Drag grip is only draggable in party + >1 row. Solo never has grips.

## 5. Turn interstitial (states: `turnChange`, `continue`)

File: `src/components/TurnInterstitial.tsx`. Root class: `.v8-inter`.

This screen handles four distinct content modes using one component:

### 5A. First card, solo, first time (`state=turnChange`, `idx=0`, `!lastResult`, solo)
- `SOLO MODE` kicker
- `READY?` name line
- Stat: "Guess in your head. Tap the card to flip."
- Tap hint: `TAP ANYWHERE TO CONTINUE`

### 5B. First card, party, first time (`state=turnChange`, `idx=0`, `!lastResult`, party)
- `YOU'RE UP FIRST` pass-line
- Next player name (uppercase)
- Stat: "Read the plot out loud. Others guess."
- Tap hint: `TAP ANYWHERE TO CONTINUE`

### 5C. Mid-game turn change, solo
Auto-progresses via `useEffect`. User never actually sees this in solo. Component returns `null`.

### 5D. Mid-game turn change, party
- Feedback pill at top: either `<PLAYER>` got it `+N PTS` (tomato/gold) or `NOBODY GOT IT` (ink).
- Optional report-last-plot pill just under feedback (`⚑ REPORT LAST PLOT`) — currently not wired from App.tsx so rarely visible in practice.
- `HAND THE PHONE TO` pass-line
- Next player name (uppercase)
- Tap hint

### 5E. Continue screen (`state=continue`)
Appears when a round hits its end-condition (e.g. 12-card party round over) but the player could extend:
- Kicker: `INTERVAL`
- Big number: `<totalPts> PTS`
- Stat: `<correctCount> of <idx> correct`
- Two buttons (NOT tap-anywhere):
  - `KEEP GOING` (primary)
  - `SEE RESULTS` (secondary, calls `endGame('completed')`)

**Interstitial interactions:**
- Tap anywhere on the background (except inside the `.v8-inter-actions` container) calls `handleTap()`.
  - In `turnChange` -> `actions.ready()` which transitions to `playing`.
  - In `continue` -> `actions.continueGame()` which also transitions to `playing`.
- Keyboard: Enter or Space also triggers `handleTap()`.

## 6. Game screen (states: `playing`, `flipped`, `scoring`)

File: `src/components/GameScreen.tsx`. Root class: `.v8-game-screen`.

Elements:

1. **Progress line** (`.v8-game-progress`):
   - Endless mode (solo): `CARD 5` (current card number, no denominator).
   - Party mode: `CARD 5 / 12` where 12 is the settings `roundLen` (default 10, user-selectable 5/8/10/12).

2. **Card stage** (`.v8-game-card-area`) containing `<Card />`.

3. **Points float** (`.v8-pts-float`): appears briefly after a correct guess.
   - Base points chip: `+<N> PTS`
   - Bonus chip (only if streak >= 3): `🔥 +<N> STREAK`
   - Fades out after 1400ms.

4. **Menu popover** (`<MenuPopover />`): opens from the `•••` button in the TopBand. Items:
   - `How to Play` — opens `<HowToScreen />`
   - `Switch to Pass & Play` or `Switch to Solo` — aborts the round and re-enters setup for the opposite mode. Sub-copy: "Abandons this round"
   - `End round` (danger color) — opens `<EndRoundSheet />`. Sub-copy: "See final scores"
   - `Back home` — calls `exitGame()`, which transitions to home without showing results. Sub-copy: "Abandon round"
   - Closes on outside click or Escape.

5. **End round sheet** (`<EndRoundSheet />`): confirms "END THIS ROUND?" with `KEEP PLAYING` and `END ROUND` buttons. `END ROUND` calls `endGame('abandon')` -> `results`.

6. **Report sheet** (`<ReportSheet />`): opens from the `⚑ REPORT` link on the card back. Details in §9.

### 6A. The Card component (`.v8-card-stage`)

File: `src/components/Card.tsx`. Has two faces with a 3D flip.

**Front face** (`.v8-card-front`):
- Mast row: `The Plot` title (Fraunces) + progress label `No. 003` (zero-padded card number).
- Meta row:
  - Industry chip: `HINDI` or `TELUGU` (Bebas, colored by industry).
  - Difficulty + points: `EASY · 1 PTS` (green dot), `MEDIUM · 2 PTS` (amber dot), `HARD · 3 PTS` (tomato dot).
- Plot body: the `card.c` string in Fraunces italic. Uses `useCardTextFit` hook to auto-shrink between 16-27px so any card length fits the fixed frame.
- Foot:
  - If party: `READ BY: <READER NAME>` (cream pill).
  - Always: `TAP TO REVEAL`.
- Clickable anywhere. Keyboard: Enter or Space.

**Back face** (`.v8-card-back--bw` or `--tw`):
- Report link (top-right corner): `⚑ REPORT`. Stops click propagation, opens ReportSheet with the current card id.
- Inner block:
  - Burst decoration (`.v8-back-burst`, aria-hidden)
  - Kicker: `THE ANSWER`
  - Title: movie name `card.n` (Anton, large)
  - Year: `card.y`
  - Optional fact: `card.f` (if present)
- Picker (`.v8-picker`):
  - Solo: one label `DID YOU GET IT?` + two chips: `I GOT IT! 🔥` and `NOPE 😔`.
  - Party: no label; one chip per player EXCEPT the reader (reader is excluded), plus a `NOBODY` chip, plus a smaller `skip this card` text link below.
- Foot: `WORTH +N` (where N is the point value for the card difficulty).

**Card mechanics rules (enforced in code, do NOT redesign away):**
- Fixed-shape card, auto-fit text (never grow the card, shrink the font).
- Back-side picker excludes the reader in party mode. Reader is judge, never guesser.
- Flip timing is locked to 0.62s cubic-bezier overshoot. Do not change.
- Index-keyed scoring (names can duplicate at the player level via drag reorder, but scoring is by index). Two players named "Rahul" do not split points.
- Point map is fixed: easy=1, medium=2, hard=3. Streak bonus: +1 at streak 3, +2 at 5, +3 at 7.

## 7. Results screen (state: `results`)

File: `src/components/ResultsScreen.tsx`. Root class: `.v8-results`.

Elements (top to bottom inside `.v8-results-panel`):

1. **Header**: `FINAL VERDICT` (Anton, paper color on stage background).

2. **Mast** (`.v8-results-mast`, tomato background, paper text):
   - Title: verdict title (dynamic desi verdict string from scorer) or fallback `Final Verdict`.
   - Sub: `<idx> Plots Played` (e.g. `12 Plots Played`).

3. **Verdict paragraph** (`.v8-results-verdict`): one-line verdict copy based on performance.

4. **Party winner block** OR **Solo block**:
   - **Party winner** (if `players.length > 1`):
     - 10-dot confetti burst (`.v8-results-burst`)
     - `★ Top Guesser ★` crown line
     - Winner name (Anton, large)
     - Role line: `MOVIE BUFF`
   - **Solo** (else):
     - Same 10-dot burst
     - Solo name
     - Two stat blocks side-by-side:
       - `<correctCount>/<idx>` + `Correct`
       - `<totalPts>` + `Points`

5. **Leaderboard** (`.v8-results-board`), party only:
   - Label: `The Line-Up`
   - One row per player, sorted by score desc: rank number, name, `<pts> pts`.
   - Leader gets gold left-border + tinted background.

6. **Random Bollywood quote** (`.v8-results-quote`): a rotating line from a 13-item list (e.g. `"Picture abhi baaki hai mere dost"`, `"Mogambo khush hua"`). Fraunces italic.

7. **CTA row** (`.v8-results-ctas`):
   - `PLAY AGAIN` (primary, tomato drop shadow, gold border): calls `actions.replay()`.
   - `HOME` (secondary, ink drop shadow): calls `actions.exitGame()`.

8. **Spread-the-word share band** (`.v8-results-share`) — NEW today, local only, not yet deployed:
   - Dashed top rule.
   - Small bars + label: `Spread the Word` (Bebas tomato).
   - Subhead (Fraunces italic): "Send to the friend who starts the movie argument."
   - 6 circular buttons in a row, each 44x44px, paper background with ink border and 3px ink drop shadow, gold-bright on hover:
     1. WhatsApp `https://wa.me/?text=<share>`
     2. X (Twitter) `https://twitter.com/intent/tweet?text=...&url=...`
     3. Reddit `https://www.reddit.com/submit?title=...&url=...`
     4. Facebook `https://www.facebook.com/sharer/sharer.php?u=...`
     5. Email `mailto:?subject=...&body=...`
     6. Copy link (writes to clipboard, toast "Copied. Now paste it somewhere loud.")
   - Each button fires `posthog.capture('results_share', { channel })`.

## 8. Sheets and modal overlays

All sheets share the base class `.sheet-overlay` and a grey outside-click dismiss. They animate up from the bottom on mobile, center on desktop. All use `role="dialog" aria-modal="true"`.

### 8A. Feedback sheet (`<FeedbackSheet />`)
Entered from: Home footer `Feedback` link.
- Title: `Share your thoughts`
- Sub: `Tap all that apply`
- 6 toggleable tags (`.v8-feedback-tag`):
  - 🔥 Love it
  - 🛠 Needs work
  - 🃏 Want more cards
  - 🎉 Great for parties
  - 👀 UI issue
  - 🐛 Found a bug
- Textarea: `Anything else you want to tell us?`
- Primary: `Send feedback` (validates at least one tag OR non-empty text)
- Secondary: `Maybe later`
- On submit: writes to local cache, writes to Supabase `feedback` table (message column is a bracketed tag-prefix + freeform text), fires `feedback_sent` event, toast `Thanks for the feedback!`.

### 8B. Suggest sheet (`<SuggestSheet />`)
Entered from: Home footer `Suggest a Movie` link.
- Title: `SUGGEST A MOVIE`
- Sub: `We will write a terrible plot description for it`
- Text input: movie name (placeholder `e.g. Sholay, Lagaan, Om Shanti Om...`). Max 200 chars.
- Select dropdown: Hindi / Telugu / Tamil / Malayalam / Other.
- Hint paragraph: "We read every suggestion. If we add it, you will be in the credits."
- Primary: `Send Suggestion` (validates name + industry selected).
- Secondary: `Maybe later`.
- On submit: local cache + Supabase `suggestions` table + `suggest_sent` event + toast `Thanks! We'll check it out.`.

### 8C. Report sheet (`<ReportSheet />`)
Entered from: `⚑ REPORT` link on card back during game.
- Title: `REPORT THIS PLOT`
- Sub: `What is wrong with this card?`
- 7 single-select tags (only one reason at a time):
  - Wrong or inaccurate
  - Typo
  - Spoiler
  - Offensive
  - Too easy
  - Too hard
  - Other
- Textarea: `Any additional details?` (max 500 chars, optional)
- Primary: `Submit Report` (validates that a reason is selected).
- Secondary: `Cancel`.
- On submit: local event log + Supabase `reports` table + `report_sent` event + toast `Thanks, we will take a look.`.

### 8D. End round sheet (`<EndRoundSheet />`)
Entered from: `End round` item in game menu.
- Title: `END THIS ROUND?`
- Sub: "Final scores will be shown with whoever is leading right now."
- Primary: `KEEP PLAYING` (dismisses sheet, returns to game).
- Secondary: `END ROUND` (calls `endGame('abandon')`, FSM -> `results`).
- Outside-click dismisses (treated as Keep Playing).

### 8E. How-to screen (`<HowToScreen />`)
Entered from: Home footer OR game menu.
- Title: `HOW TO PLAY` with sub `2 MIN READ`
- 4 numbered rules:
  1. Read the bad plot — "Tap the card to reveal a terribly summarized movie. Read it out loud to the group."
  2. Guess the movie — "Everyone else guesses which movie it is. First correct answer wins the points."
  3. Award the guesser — "Tap the guesser's name to give them points. Easy = 1, Medium = 2, Hard = 3."
  4. Pass the phone — "Hand the phone to the next reader. They flip, you guess. Keep going until the round ends."
- Score key row: `EASY 1 PT` / `MEDIUM 2 PTS` / `HARD 3 PTS`
- Primary: `GOT IT`

### 8F. Settings screen (`<SettingsScreen />`)
Entered from: Home footer.
- Title: `SETTINGS` with sub `YOUR PREFERENCES`
- Three rows:
  - **Difficulty Filter**: 4-button segment `All / Easy / Medium / Hard`. Filters which cards are dealt.
  - **Round Length**: 4-button segment `5 / 8 / 10 / 12`. Party mode only; solo is endless regardless.
  - **Sound**: toggle switch (functional in UI; sound hooks themselves are stubbed — no sound files ship yet).
- Primary: `DONE`. Writes to gameInstance settings + fires `settings_changed` events for anything that changed.

## 9. Global chrome

### 9A. TopBand (`.v8-topband`)
Rendered for every state EXCEPT `home` and `setup`.
- Left: `Bad Desi Plots` wordmark (the `Desi` in accent color). In any active round state (`playing`/`flipped`/`scoring`/`turnChange`/`continue`), a tiny home glyph `⌂` precedes the wordmark, AND the whole thing becomes a button that opens a browser `confirm()` "Leave this round and go home?". OK calls `exitGame()`.
- Right: optional leader name + points (only shown when caller passes props; currently the App does NOT pass props, so the right side is empty during gameplay). Menu button `•••` opens the MenuPopover.

### 9B. BgLayer
Static background art layer. Always present. Dims/saturation-adjusts under Results so the panel reads.

### 9C. Toast
Bottom-center toast. Single-line status messages. Shows for 2600ms. Driven by `toast(msg)` call anywhere. `role="status" aria-live="polite"`.

## 10. Game mechanics — the stuff the design MUST respect

- **8 FSM states exactly**. See §1. Do not add new states in redesign.
- **Card flip is the input**. Tap front = flip. Tap-back picker = score. No long-press gestures. No swipes.
- **Reader exclusion in party mode**. The reader cannot be an option in the picker. Ever.
- **Index-keyed scoring**. Two players with the same name score independently. Duplicate names trigger a setup warning but are allowed if the user edits one.
- **Point map**: easy=1, medium=2, hard=3. Streak bonuses: +1 at 3, +2 at 5, +3 at 7. Points float shows base + bonus for 1400ms.
- **Round lengths**: party defaults 10, user-selectable 5/8/10/12. Solo is endless (no denominator shown).
- **No in-app adaptive difficulty surface**. Internally there's an ELO-ish `adaptive.ability` used for verdict tier generation on solo, but it is NOT shown during play.
- **No leaderboard beyond the current party's line-up**. There is no global/social leaderboard.
- **No save + resume across sessions except via `useResumeSession`** which only resurfaces a single suspended round.

## 11. Analytics events (for reference, do not invent)

Emitted somewhere in the game today:
- `round_start`, `card_view`, `card_flip`, `card_result`, `award`, `nobody_scored`, `turn_change`, `deck_exhausted`, `game_end_raw`, `round_end`
- `state_transition` (every FSM move)
- `cinema_pick`, `setup_mode_switch`
- `footer_open`, `menu_item_click`
- `results_cta` (play_again / home), `results_share` (with channel prop, NEW today)
- `feedback_sent`, `suggest_sent`, `report_sent`, `resume_used`, `settings_changed`

Feature flags (PostHog): `solo_mode_enabled`, `settings_screen_enabled`, `report_flow_v2`. Any redesign that hides one of these surfaces must keep the flag override path intact.

## 12. What does NOT exist — do not invent these in redesign

- No user accounts, login, email capture, social sign-in.
- No friend graph, follows, DMs, chat.
- No daily challenge, daily streak counter, daily card (planned for v3, not built).
- No persona / archetype system (planned for v3).
- No notification system (web push or native).
- No timer on cards. Guessing time is untimed.
- No typed-guess input. Guessing is verbal; reader taps who got it.
- No wagering, power-ups, hints, pause-skip-tokens.
- No avatars beyond the color-dot number badge in setup.
- No cosmetics, skins, themes, dark mode toggle.
- No categories beyond industry (no genre / decade filters surfaced — decade/industry live in card data but do not appear as a filter).
- No sound files ship today. The Settings toggle exists; it controls nothing yet.
- No ornamental SVG assets ship today. Any "pattern", "arch", "paisley" must be a real sourced SVG/PNG, not CSS box-shadow trickery. Decorative CSS ornaments are explicitly banned by project rules.
- No em dashes in ANY UI copy. Project-wide rule.
- No Hindi or Telugu words in UI chrome (cards are card content, chrome is app text).

## 13. Redesign scope guardrails (for Claude Design)

- Visual system may change freely: colors, type, decoration, animation, spacing, hierarchy, layout, ornament sourcing, motion language, empty/loading states.
- Mechanics may NOT change without explicit owner approval: FSM states, scoring, point map, card mechanics, reader exclusion, endless vs fixed-round, mode structure, the report/suggest/feedback affordances existing at all.
- Copy may change freely except for locked strings: the home hero title `BAD / DESI / PLOTS`, the three difficulty labels (Easy / Medium / Hard), the point values (1/2/3). All other copy is negotiable but must pass the voice fingerprint in `docs/voice-fingerprint.md` (drily amused grandma + chaotic sibling; no em dashes; no Hindi words in clues; etc).
- Accessibility floors: every button is keyboard-focusable. Every modal uses `role="dialog" aria-modal="true"`. Every radiogroup uses `role="radiogroup"`. Every toggle switch uses `role="switch" aria-checked`. Minimum hit target 44x44px. Color contrast minimum 4.5:1 for body text, 3:1 for large.
- Mobile-first 375px wide. Must work down to 320px. Desktop breakpoints are gravy, not mandatory.

## 14. Current visual direction (v8 editorial)

If useful context for what to evolve from or react against:
- Palette: `--paper` warm cream, `--v8-ink` deep brown-black, `--tomato` flame red, `--gold-bright` saffron, `--emerald` green accent.
- Type: Anton (display), Bebas Neue (labels/meta), Fraunces (body/italic asides), DM Sans (utility UI).
- Motion: 3D flip 0.62s cubic-bezier overshoot, fade-up on screen enter, confetti burst on results.
- Ornament approach: chunky ink borders, rubber-stamp drop shadows, rotated badges. Real graphics preferred over CSS fakes.

Claude Design can pivot the entire look IF the mechanics above are preserved verbatim.

End of spec.
