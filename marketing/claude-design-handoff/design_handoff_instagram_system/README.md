# Handoff: @baddesiplots — Instagram Visual System

> 👉 **Picking this up in Claude Code? Read [`CLAUDE_CODE_SETUP.md`](./CLAUDE_CODE_SETUP.md) first** — it covers what tools/MCPs you need (spoiler: almost nothing) and the suggested first prompt.

## Overview

This is the **Instagram social system** for *Bad Desi Plots* — a desi party game where the plots are wrong on purpose. The job here is *not* to ship the app; it's to ship the **visual identity that lives on Instagram**: a profile mock, five static post templates, and the generation rules for filling them.

The system is deliberately **tabloid magazine, not minimal tech-startup**. Think 90s/00s Indian movie magazines (Stardust, Filmfare, Cineblitz): masthead bars, issue numbers, big condensed display type, magazine grids, tight rules, paper grain. No emoji, no gradients, no soft shadows.

## About the Design Files

The files in this bundle are **design references created in HTML/JSX** — prototypes showing intended look at 1:1 fidelity. They are **not production code to ship as-is**.

The task is to recreate these designs in whatever pipeline the team uses to actually post to Instagram. That could be:
- A static React/Next.js page that's screenshotted to PNG (current dev path).
- Figma/Canva templates rebuilt by hand from these refs.
- A Python/Pillow or Node/Sharp generator that reads `cards.json` and outputs PNGs.

Pick the path that fits the team's workflow. The HTML refs lock the visual spec; the implementation is open.

## Fidelity

**High-fidelity.** Every color, font, size, spacing, and rule weight in this spec is final. The HTML refs are pixel-accurate at the source canvas size (1080×1350 portrait). Match them.

## Source canvas & export

| Format | Source size | Export |
|---|---|---|
| Single post (A, C front/back, D, E) | **1080 × 1350** | PNG, sRGB |
| Carousel (B) | **1080 × 1350 per slide × 6 slides** | 6 PNGs, posted as a single carousel |
| Profile avatar | **320 × 320** | square PNG (renders in 110×110 circle) |
| Highlight covers | **1080 × 1080** | PNG, square |

All posts are **portrait 4:5** (1080×1350) — the maximum vertical Instagram allows on a feed post. Do not use 1:1 square or 9:16 reel.

## The five post templates

Each post type has a target frequency in the feed mix and a job to do.

### Template A · The Card *(~40% of feed — the workhorse)*

**Job:** show one card. Reader sees plot, captioned with "guess in comments, reveal tomorrow".

**Layout (top to bottom):**
1. **Masthead bar** — `ISSUE №xx · DATE · SECTION · ₹0 · @BADDESIPLOTS`. Top + bottom 2px ink rules. Mono 24px, display 32px center.
2. **Section banner** — full-bleed strip, magenta bg, cream text. Big display 54px ("BAD DESCRIPTION №023"), mustard mono sub right.
3. **Industry / era / difficulty strip** — full-bleed ink bar, cream text. e.g. `BW · 90s` left, `DIFFICULTY · EASY` right (mustard).
4. **Body** — bone (`#EFE6CC`) panel, 70px×80px padding, framed with 3px ink left/right borders. Crimson Pro italic 64–80px, line-height 1.12, the plot copy. **No quote marks.** Size scales: ≤110ch → 80px, ≤160ch → 72px, else 64px.
5. **Editor's mark** — small mono row above footer: card number left, year + film name right.
6. **Footer CTA** — full-bleed ink strip. Display 54px left ("GUESS IT.") mustard mono right ("REVEAL · TOMORROW · 18 APR").
7. **Watermark line** — outside the frame: `@BADDESIPLOTS · BADDESIPLOTS.COM` left, `CARD №023 OF 350` right.

**File:** `ig/templates-a-b.jsx` → `TemplateA({ card })`.

---

### Template B · The Carousel *(~20% — the saver)*

**Job:** weekly issue. 4 plots in one swipeable artifact people screenshot and save.

**6 slides, in order:**
1. **Cover** — `BAD DESI PLOTS / ISSUE №03`. Big "HOW MANY CAN YOU GUESS?" headline with misregistered pink offset on "HOW MANY". TOC strip below ("INSIDE · four plots, ranked by cruelty"). Pink CTA strip footer.
2–5. **Plot slides 1–4** — running head ("BAD DESI PLOTS · ISSUE №03 · ● BW"), plot N of 04 kicker, big drop-cap (`I.`/`II.`/`III.`/`IV.` in display 320px, magenta), plot copy in Crimson italic, footer with film name (revealed only on outro slide; here it shows "GUESS IT."). Slide indicator dots top-right.
6. **Outro / tally** — navy bg, cream text. "FINAL TALLY" headline, "HOW'D YOU DO?" misregistered, score bands (0/4 → 4/4) with descriptive labels, magenta CTA strip.

**File:** `ig/templates-a-b.jsx` → `TemplateB({ cards, weekNo })`.

---

### Template C · The Reveal Pair *(~15% — the punchline)*

**Job:** posted ~24h after the matching A-card. Two slides side-by-side: front + back.

- **Slide 1 (front)** — paper bg. "THE REVEAL" masthead. Big "ANSWERED" stamp banner. The original plot quoted small. Below: "TURN OVER →" CTA in ink footer.
- **Slide 2 (back)** — navy bg, cream text. **The film title** in 280px display with misregistered mustard offset. Year + ind tags. "FROM THE ARCHIVE" mono kicker. Trivia (`card.f`) in Crimson italic.

**File:** `ig/templates-c-d-e.jsx` → `TemplateC({ card })`.

---

### Template D · The Vote *(~10% — engagement bait)*

**Job:** post BW vs TW for one beat. Comment A or B.

**Single slide:**
- Masthead: section "THE BALLOT".
- Big `BW vs TW` lockup, display 200px, ink bg cream text.
- Two cards side-by-side. **D is the only template where BW and TW glow co-exist.** Each card is a small framed mini-A: industry tab top (pink for BW, emerald for TW), plot in serif italic 32px, difficulty footer.
- Ink CTA footer: "VOTE A OR B → COMMENTS".

**File:** `ig/templates-c-d-e.jsx` → `TemplateD({ bwCard, twCard })`.

---

### Template E · The Meta Quote *(~5% — palette cleanser)*

**Job:** breaks up the dark feed. No card art. Voice-only. Aphoristic, deck-tone.

- Cream paper bg. "MARGINALIA" masthead.
- Massive Playfair italic pull quote (Drama font), 96–120px depending on length. Pink magenta underline on a key word.
- Attribution row: small magenta bar + "FROM THE DECK · CARD №047" in mono.
- Bottom rule + footer.

**File:** `ig/templates-c-d-e.jsx` → `TemplateE({ quote, attribution })`.

---

## Profile (@baddesiplots)

- **Handle:** `@baddesiplots`
- **Display name:** `Bad Desi Plots`
- **Avatar:** mustard square with a single black 'B' set in Oswald 700, ink-shadow offset 4px right / 4px down. Renders inside IG's 110px circle on profile, 32px on feed posts.
- **Bio (recommended — option C):**
  > every plot is technically correct
  > and emotionally devastating.
  > free · in browser · save your favorites ↓
- **Link:** `baddesiplots.com`
- **Highlights (6):** type-stamped square covers — `HOW`, `RULES`, `BW`, `TW`, `BEST`, `FAQ`. (Cover SVGs not finalized; placeholders in `ig/profile-mock.jsx`.)
- **Grid:** 27 tiles, 3 weeks. Alternation rule — never 3 same-color tiles in a row. Mix is roughly: 11 A-cards, 1 B-cover, 4 C-fronts, 2 D-votes, 2 E-quotes, 7 thumbnail crops.

---

## Design tokens

### Color

| Token | Hex | Use |
|---|---|---|
| `ink` | `#0E1326` | All ink — borders, type, fills. Off-black navy. |
| `paper` | `#F4ECD6` | Default bg. Warm cream. |
| `paperDeep` | `#E8DDB8` | Toned cream for layering. |
| `bone` | `#EFE6CC` | Body panels inside paper bg. |
| `pink` | `#FF2E63` | BW accent, primary brand color. |
| `pinkDeep` | `#C71F4A` | Pink shadow / pressed. |
| `emerald` | `#1E8C5E` | TW accent. |
| `emeraldDeep` | `#136B45` | Emerald shadow. |
| `navy` | `#0A1A3A` | Cover slide bg, deep alt to ink. |
| `mustard` | `#E8B82A` | Mustard (NOT yellow). Avatar bg, sub-accents. |

**Critical rule:** BW posts use pink. TW posts use emerald. Templates A, C, E never mix them. Template D is the only place pink and emerald co-exist.

### Type

All from Google Fonts. Loaded via:

```html
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400;1,600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
```

| Role | Family | Weights / styles | Use |
|---|---|---|---|
| Display | **Oswald** | 700 | Mastheads, banners, headlines, logo. Condensed bold sans. Newsstand voice. |
| Editorial | **Crimson Pro** | 400 italic, 600 italic | Plot body copy. Warm and personal. **No quote marks around plots.** |
| Workhorse | **IBM Plex Sans** | 400/500/600/700 | Labels, captions, page chrome. |
| Drama | **Playfair Display** | 700 italic, 900 italic | Pull-quote (Template E) only. |
| Mono | **IBM Plex Mono** | 500/600 | Issue numbers, dates, page folios, accents. |

### Spacing & sizes

- **Page margins:** 48px top/right/bottom, 56px left (or 48/56/56/56).
- **Body panel padding:** 70px vertical, 80px horizontal.
- **Footer/banner padding:** 18–22px vertical, 28px horizontal.
- **Rule weights:** 1px (hairline borders), 2px (mast top/bottom), 3px (body panel side rails), 4–6px (slam dividers).

### Patterns

- **Paper grain** — two stacked radial-gradient dots, very subtle:
  ```css
  background-image:
    radial-gradient(rgba(14,19,38,0.05) 0.8px, transparent 0.8px),
    radial-gradient(rgba(255,46,99,0.022) 0.6px, transparent 0.6px);
  background-size: 3px 3px, 7px 7px;
  background-position: 0 0, 1px 2px;
  ```
- **Misregistration text** — duplicate the word, offset 4–8px in pink/mustard behind the main color. Use **once per slide max**. (`MisRegText` component.)
- **Halftone block** — SVG dot field that fades top→bottom. Used as decorative block, never as background. (`HalftoneBlock` component.)

---

## Card data shape

Each card is one row of the deck. The IG generator only needs these fields:

```ts
type Card = {
  id: string;          // 'bw01', 'tw_rrr'
  ind: 'BW' | 'TW';    // industry → drives accent color
  diff: 'easy' | 'medium' | 'hard';
  era: '70s' | '90s' | '2000s' | '2010s' | '2020s';
  y: string;           // year, '1995'
  n: string;           // film name, the answer
  c: string;           // the deliberately bad plot — body copy
  f: string;           // trivia / fact, used in Template C back
};
```

A 10-card balanced sample is in `cards-data.js`. Production deck is 350 cards — same shape.

---

## Interactions & behavior

These are static images. No interactivity, no animations. Don't try to make them animate.

The only "interactivity" is **the caption + comments** the social manager writes around the post. Caption tone:

> boy meets girl. father says no. they go to Europe anyway. guess in comments. reveal tomorrow. 🔥

(Lower-case, deadpan, no salesmanship. The post is the asset.)

---

## State management

None. These are images.

For the *generator* layer, persist in `localStorage` (or a JSON file) which cards have been used in which weekly issue, so the same card isn't re-posted within a 4-week window.

---

## Assets

- **Fonts:** Google Fonts (Oswald, Crimson Pro, IBM Plex Sans, IBM Plex Mono, Playfair Display). Self-host for production reliability.
- **Images:** none — type carries the load entirely. Do **not** generate AI imagery to fill the templates.
- **Highlight covers:** to be designed; placeholders use type-stamped initials.

---

## Files in this bundle

| File | What it is |
|---|---|
| `README.md` | This document. Self-sufficient spec. |
| `design-reference.html` | The full design canvas. Open in any browser to see all 5 templates, profile mock, in-feed views, and tweaks. |
| `ig/post-templates.jsx` | Shared primitives: `TC` color tokens, `FONT` type tokens, `Masthead`, `SectionBanner`, `Folio`, `PostFrame`, `MisRegText`, `HalftoneBlock`, `paperGrain`. |
| `ig/templates-a-b.jsx` | `TemplateA` (Card) and `TemplateB` (Carousel, 6 slides). |
| `ig/templates-c-d-e.jsx` | `TemplateC` (Reveal pair), `TemplateD` (Vote), `TemplateE` (Meta quote). |
| `ig/profile-mock.jsx` | `IGProfile` — full profile screen with bio, highlights, grid. |
| `ig/phone-views.jsx` | `IGPhoneProfile`, `IGPhoneFeed`, `IGFeedPost` — IG chrome wrappers showing posts in their native context. |
| `ig/cards-data.js` | 10-card balanced sample, the data shape the templates expect. |

To run the reference locally: open `design-reference.html` in a browser. No build step.

---

## What's out of scope (do not invent)

- Reels, Stories, ad units, Shop tags.
- Animated post variants.
- AI-generated film stills or character art.
- Any logo other than typesetting "BAD DESI PLOTS" / "B".
- Brighter / softer / pastel variants. The system is **loud on purpose**.

If something the brief requires isn't covered here, ask the design team — don't extrapolate.
