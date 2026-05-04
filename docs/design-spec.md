# Design Spec — Bad Desi Plots

> Last updated: 2026-04-20. Canonical visual + interaction spec for the v8
> design language. Companion docs: `product-spec.md`,
> `system-architecture-spec.md`, `engineering-spec.md`,
> `applied-scientist-spec.md`. Live tokens live in `src/style.css` `:root`.

---

## 1. Metaphor

**A Bollywood poster in a Rajasthan palace.** Rich, ornate, theatrical in the right places, but navigable. The app should feel like walking into a haveli decorated for a filmi mela — gold leaf, deep reds, jewel tones, theatrical type — with the interaction clarity of a modern card game.

## 2. Design philosophy: masala mix

- **Maximalist aesthetic.** Loud type, chunky ink borders, tomato shadows, gold leaf. No sterile minimalism.
- **Minimalist UX.** Zero learning curve, tap-to-play, no modal tutorial. One screen, one action, at any time.
- **Theatrical reveal.** Every card flip is a moment. The answer reveal is the drop. The Results screen is the encore.
- **Cultural authenticity over Indian theming.** Real desi typography, real filmi palette, real voice. If it doesn't look like it belongs on a Bollywood poster, it doesn't ship.

## 3. Design direction: v8 (locked)

User picked v8 over v7 (quiet editorial) on 2026-04-15 after side-by-side review. Superseded directions are archived in `prototypes/` and marked HISTORICAL.

### v8 visual signature
1. Tomato Anton masthead band at top of every interactive surface (home, setup, card front, results panel)
2. Cream paper background with 3px ink border and 6px offset ink drop shadow (poster on a wall)
3. Gold highlights for scores, streaks, and celebration moments
4. Chai-cheers photographic background + subtle bulb-glow overlay instead of fake SVG light garlands
5. Chunky filmi type hierarchy — Anton for headlines, Bebas Neue for meta, Fraunces for plot body, DM Sans for small UI

## 4. Color system

### 7 core tokens (see `src/style.css` `:root` for live values)

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#1A0F0A` | App background, deep warm brown-black |
| `--card-bw` / `--tomato` | `#E85D3A` | Bollywood card accent, wordmark, primary CTAs |
| `--card-tw` / `--emerald` | `#3EA87A` | Tollywood card accent, success states |
| `--gold` / `--gold-bright` | `#F2A72E` / brighter | Scores, streaks, celebration, stamp accents |
| `--cream` / `--paper` | `#F5E8D4` | Primary text on dark, panel background |
| `--ink` / `--v8-ink` | `#1A0F0A` | Text on light surfaces, borders, hard shadows |
| `--glow-bw` / `--glow-tw` | `rgba(232,93,58,0.35)` / `rgba(62,168,122,0.35)` | Card glow halos |

### Extended palette
`--flame-bright`, `--saffron`, `--emerald-bright`, `--mauve`, `--tomato-bright`, `--ink-muted`, `--paper-dim`. Defined in `src/style.css`. Use for accents only; never replace a core token.

### Color rules (non-negotiable)
- BW cards use the `--card-bw` / flame family. TW cards use the `--card-tw` / emerald family. Never mix within a card.
- Glow intensity scales with difficulty: easy = 0.2 opacity, medium = 0.35, hard = 0.5.
- Gold is reserved for scores, streaks, and celebration. Never use gold for navigation or body text.
- Default text pairing is `--cream` on `--bg`. Contrast ratio must be ≥ 7:1.
- Never ship `#fff` or `#000`. Use `--cream` and `--ink`.

## 5. Typography

| Family | Use | Sizes | Notes |
|---|---|---|---|
| Anton | Headlines, wordmark, score numbers, card back title | 28–58px | Condensed, uppercase feel. Never below 24px. |
| Bebas Neue | Labels, meta, kickers, chip text | 11–18px | Uppercase, wide letter-spacing (0.14–0.38em) |
| Fraunces | Plot body, verdict prose, cast lines | 14–22px with auto-fit clamp | Italic used sparingly for verdict |
| DM Sans | Small UI, buttons sub-label, form inputs | 12–16px | Default fallback body font |

### Rules
- Anton and Bebas Neue only uppercase. Never mixed case.
- Fraunces only in italic for verdict / quote surfaces. Not for plot body.
- Letter-spacing: `-0.02em` for Anton headlines; `0` for Fraunces body; `0.14–0.38em` for Bebas Neue labels.
- Line-height: `0.88–0.95` for Anton display, `1.5` for Fraunces body, `1.2` for Bebas Neue labels.
- Card plot auto-fits to a clamp (14–27px) via `src/hooks/useCardTextFit.ts` so card shape stays locked across varying plot lengths. Hook returns `{ fontSize, compact }`. When the fitted size lands within 2px of the 14px floor, the plot drops italic Fraunces and renders upright (legibility wins over flourish on long plots).

## 6. Component specs

### Home (HomeScreen.tsx)
- Tomato Anton "BAD DESI PLOTS" wordmark with 3-layer tomato text-shadow
- "OFFICIALLY BAD" stamp in gold-outlined Bebas Neue
- Two mode buttons: PASS & PLAY (tomato ink, primary) and SOLO (ink outline, secondary)
- Both buttons: chunky 3px border pill, 4-6px offset hard shadow, click-translate
- Foot: secondary links to How To Play, Suggest a Movie, Feedback

### Player Setup (PlayerSetup.tsx, v8-setup overlay)
- Tomato Anton mast "WHO'S PLAYING?" / "SOLO MODE"
- Mode toggle: PASS & PLAY vs SOLO (visual-only, functional)
- Numbered line-up with drag-reorder grip on multi-player rows
- Inline name input, 24-char max, with desi fallback names (Chintu, Pinky, Bunty, Guddu, Sonu, Monu, Rinku, Bubbly) for empty slots
- Duplicate-name warning: "TWO PLAYERS CAN'T SHARE A NAME"
- LET'S GO button primary, BACK button secondary
- Close button × in top-right

### Turn Interstitial (TurnInterstitial.tsx, v8-inter namespace)
- Full-viewport ink background
- Anton "HAND THE PHONE TO" kicker + massive Anton name with tomato-gold shadow stack
- "TAP ANYWHERE TO CONTINUE" foot pulse
- Appears between rounds in Pass & Play mode only

### Card (Card.tsx, v8-card namespace)
- Size: `min(360px, calc(100% - 40px))` wide × 460px tall (400px on `max-height: 700px`)
- Front face: tomato mast + industry chip (tomato BW / emerald TW) + difficulty indicator + Fraunces plot body + ink foot bar with reader name hint
- Back face: ink background + tomato burst radial + Bebas Neue kicker "THE ANSWER" + Anton movie title + gold-outlined year chip + Fraunces cast line + picker chips for scoring
- Flip: `rotateY(180deg)` over 0.62s with `cubic-bezier(0.5, 0.05, 0.2, 1.08)` — validated by user testing, do not change
- Entry: `v8CardSettle` keyframe, 0.85s with 0.1s delay, cubic-bezier(0.2, 0.9, 0.3, 1.1)
- Glow halo: `box-shadow` using `--glow-bw` or `--glow-tw`, pulses on hard cards

### Game screen (GameScreen.tsx)
- Top band with progress label (CARD N or CARD N / 12) in gold Bebas Neue
- Center card area, flex-centered
- Points float (+PTS) anchored viewport-top-right via `position: fixed` (NOT absolute — iOS Safari 3D stacking issue). Also gets opacity-only fallback under reduced-motion.
- Menu popover (MenuPopover.tsx) for end-round, mode-switch, how-to

### Results (ResultsScreen.tsx, v8-results namespace)
- Ink background, body gets mehendi-dimmed (`filter: brightness(0.4) saturate(0.75) blur(4px)` on bg img)
- Anton "FINAL VERDICT" header
- Cream paper panel with 3px ink border + 6px offset ink shadow
- Tomato mast with verdict title + "N Plots Played" sub
- Solo: big Anton player name with tomato shadow + scale-pulse entry, then stats (correct / points)
- Multi: "Top Guesser" crown + winner name + MOVIE BUFF title + leaderboard rows
- Celebration burst: 10 staggered dots (tomato / gold / emerald) radiating out via CSS `--dx/--dy` vars
- Verdict quote line in Fraunces italic
- Two CTAs: PLAY AGAIN (ink + gold primary) and HOME (paper + ink secondary)

### How To (HowToScreen.tsx)
- Four Anton-headed rules blocks
- Ink score key band at foot
- Dismissible overlay, reachable from home foot or in-game menu

### Feedback / Suggest / Report (bottom sheets)
- Paper panel slides up from bottom, 85% viewport height
- Tomato mast with close button
- Fraunces body copy for prompt
- DM Sans form inputs
- Chunky Anton CTA button at foot
- Fire-and-forget Supabase write on submit, then close

## 7. Animation vocabulary

| Name | Duration | Easing | Use |
|---|---|---|---|
| `v8CardSettle` | 0.85s | `cubic-bezier(0.2, 0.9, 0.3, 1.1)` | Card entry (fade + translateY + rotate) |
| Card flip | 0.62s | `cubic-bezier(0.5, 0.05, 0.2, 1.08)` | 3D rotateY flip |
| `v8BurstIn` | 0.6s (0.3s delay) | ease-out | Card back radial burst fade-in |
| `v8KickerIn` | 0.4s (0.35s delay) | ease-out | Card back kicker |
| `v8PtsFloat` | 1.2s | ease-out | +PTS tumble-in-and-up |
| `v8PtsFloatReduced` | 1.4s | ease-out | Reduced-motion fallback (opacity-only) |
| `v8ResultsPulse` | 0.75s (0.35–0.45s delay) | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Score / winner name scale-pulse |
| `v8ResultsNameIn` | 0.55s (0.18s delay) | `cubic-bezier(0.2, 0.9, 0.3, 1.2)` | Solo name entry |
| `v8ResultsDot` | 1.6s (0.3s delay) | `cubic-bezier(0.22, 0.9, 0.3, 1)` | Celebration confetti dots |
| `v8ResultsFadeIn` | 0.4s | ease-out | Reduced-motion fallback for Results anims |
| `v8InterPulse` | 1.8s | ease-in-out infinite | Tap-anywhere-to-continue pulse |
| `fadeUp` | 0.4s | ease-out | Generic header / panel fade-in |

### Motion rules
- Every animation must have a reduced-motion fallback. Either disable the motion and keep opacity (fading only), or leave the element visible at full opacity. Never hide an element that carries state.
- Card flip and pts-float timing are validated by user testing. Do not change without visual QA re-run.
- Animation durations sit between 0.4s and 1.6s. Shorter feels twitchy, longer feels sluggish.
- No animation blocks user input. All CTAs are tappable before their entry animation completes.

## 8. Ornament rules

- Use real SVG or image ornaments (jharokha arches, mehendi patterns, filmi poster borders)
- Keep ornament SVG files under 10KB. Inline critical ones, lazy-load the rest.
- Ornaments are decorative only — never interactive, never blocking content
- CSS-only ornaments pretending to be decorations (box-shadows, gradients rendered as paisleys) are banned. See `feedback_no_fake_ornaments.md` in project memory.
- Exception: CSS radial bursts used for celebration are OK because they're motion, not pretend-texture.

## 9. Accessibility

### Contrast
- All token pairings meet WCAG AAA (≥ 7:1) by default
- Verify any new pairing via AccessLint MCP (`analyze_color_pair`) before shipping

### Reduced motion
- Every animation block in `src/style.css` has a `@media (prefers-reduced-motion: reduce)` sibling block
- Under reduced-motion, use opacity-only fade keyframes. Never just `animation: none` (leaves opacity-0 elements invisible — this was the 2026-04-20 pts-float bug)

### Keyboard
- Every interactive element is reachable by tab
- Card flip: Enter or Space
- Picker chips and CTAs: Enter or Space
- Escape closes overlays (setup, feedback, how-to)

### Screen readers
- Card has `aria-label` describing front state ("[industry] [difficulty] card — tap to flip") or back state ("[movie] ([year]) [industry] [difficulty]")
- PTS float is `aria-live="polite"` so scores are announced
- All icons used as buttons have explicit `aria-label`

### Touch targets
- Minimum 44×44px per iOS / Android guidelines
- Picker chips, CTAs, card tap area all exceed this at default spacing

## 10. Responsive behavior

- Primary target: 375px width, 667–932px height (iPhone SE–15 Pro Max range)
- Grace desktop layout: centered card-width panels at up to 440px max-width
- No desktop-specific redesigns. The desktop is a zoomed-out mobile.
- Breakpoint for short screens (`max-height: 700px`): card height drops 460→400px, back title drops 58→46px
- Safe-area insets respected via `env(safe-area-inset-top / bottom)` on game and results containers
- Mobile flex chain (load-bearing): `html, body, #root` all `display: flex; flex-direction: column; flex: 1; min-height: 0`. Without the `#root` rule, `.v8-game-card-area` collapses to 0px on iOS Safari. Do not remove from `src/style.css`.

## 11. Visual gate (pre-merge)

Run `seedhaplot-visual-qa` agent on affected screens. Score rubric (2 pts each):
1. Color correctness (tokens match spec)
2. Typography (families, sizes, spacing match spec)
3. Spacing and alignment
4. Ornament quality (real graphics, no CSS fakes)
5. Overall feel against the Bollywood poster target

Minimum passing score: **7.0 / 10.0**. Below 7.0, iterate before presenting. Do not show the user a 6.

## 12. What was rejected

The following directions were tried and cut. Do not revisit without explicit user re-evaluation.

- **v4 tabletop** — felt like an Instagram carousel, not a card game
- **v5 cards overlay** — too minimal, no filmi energy
- **v6 quiet editorial** — user said "too magazine Sunday, too quiet for a party game"
- **v7 Fraunces-only** — same as v6, quiet killed the punchline
- **Italic Playfair reveal** — too magazine, swapped for bold Anton
- **Blue Caveat pen "meme" verdict** — "too much bro"
- **SVG fake light garland on top of chai-cheers bg** — fought with the real lights, dropped
- **Redundant "BAD DESI PLOTS" wordmark inside the play card** — read as clutter, removed
- **Pink/green card backs** — violated industry color rule
- **Dark BG landing** — cream paper + tomato masthead reads far better for party game

Archive of rejected prototypes: `prototypes/2026-04-{13,14,15}/`.

## 13. Open design questions

Tracked for future sessions:

- Should the home screen cycle through a few rotating "OFFICIALLY BAD" stamp positions to feel alive?
- Is there room for an "encore" moment after the Results celebration (e.g., the confetti settles into a Play Again arrow)?
- Should the How To Play screen use the actual card component to demonstrate, rather than four text blocks?
- On very-large desktop screens, is there a tasteful way to add sidebar context (stats, upcoming card count) without breaking the mobile-first identity?
