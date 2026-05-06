# Instagram Design Requirements — `@baddesiplots`

> **Brief for the designer (Claude design, agent, or freelance).** Read this top-to-bottom before opening Figma. Cross-reference `docs/design-spec.md`, `inspiration/`, `cards.json`, and `docs/instagram-marketing-plan.md`.

---

## 0. North star

The Instagram feed and profile of `@baddesiplots` should look like a **Bollywood poster in a Rajasthan palace** — rich, ornate, theatrical — but read clearly on a phone in 1.5 seconds. Maximalist aesthetic, minimalist UX. Every post is a thumb-stopping moment.

Not negotiable:
- Dark warm bg (`--bg #1A0F0A`), cream text, no pure white or pure black
- BW = orange/red glow family (`--card-bw #E85D3A`), TW = emerald glow family (`--card-tw #3EA87A`), NEVER mixed
- Gold (`--gold #F2A72E`) reserved for celebration moments — scores, streaks, reveals
- Display: Playfair Display. Body: DM Sans. Display only ≥ 24px.
- Real ornament SVGs/textures (jharokha arch, mehendi, worn paper). CSS-only ornaments banned.

If a deliverable violates one of these, it doesn't ship.

---

## 1. Audience + use context

- **Where:** Instagram feed (3-tile per row grid), Reels feed, Stories, Profile page
- **Device:** Phone, 1.5-second scroll attention, often in dim/sunlit environments
- **Who:** 18–35 desi (India + diaspora), Bollywood/Tollywood fans, party-game lovers
- **Behavior:** Saves > shares > comments > likes. Tap into profile → tap link in bio → land on `baddesiplots.com`.

Optimization order: **(1) thumb stop on the hook, (2) save-worthy on the carousel, (3) tap-through on the bio.**

---

## 2. Source-of-truth tokens (use exactly)

```css
--bg: #1A0F0A          /* dark warm — primary canvas */
--card-bw: #E85D3A     /* Bollywood flame */
--card-tw: #3EA87A     /* Tollywood emerald */
--gold: #F2A72E        /* celebration only */
--cream: #F5E8D4       /* primary text */
--ink: #1A0F0A         /* text on light surfaces */
--glow-bw: rgba(232,93,58,0.35)
--glow-tw: rgba(62,168,122,0.35)
--flame-bright: #FF7A4F
--saffron: #E89A2E
--emerald-bright: #4FC798
--mauve: #6B4F6B
```

Glow opacity by difficulty: easy 0.20, medium 0.35, hard 0.50.

Type:
- Display: **Playfair Display**, weights 500/600/700, italic OK for plot text
- Body / UI: **DM Sans**, weights 400/500/700
- Sizes (post canvas): xs 12 / sm 14 / base 16 / lg 20 / xl 24 / 2xl 32 / 3xl 48 / 4xl 64 / 5xl 96
- Letter-spacing: −0.02em display, 0 body, +0.4em microcopy caps

---

## 3. Deliverables (the actual asks)

The designer produces **all of the following** as a Figma file plus exported PNG samples. Acceptance criteria are in §11.

### A. Profile assets (one-time)

| # | Asset | Spec | Notes |
|---|---|---|---|
| A1 | Profile photo | 1080×1080 PNG + SVG source | Logo on `--bg`, jharokha-arch border in gold, no rasterization |
| A2 | Story highlights covers (set of 6) | 1080×1080 each, transparent or `--bg` | Categories: Plays · Reveals · Cards · How to Play · Submissions · Behind. Each cover uses a small ornament + white-glyph icon |
| A3 | Bio copy | 150 chars max, voice-aligned | Replace this saas-y placeholder: `"guess the movie from a terrible plot / 🔥 bollywood + 🌿 tollywood · 350+ cards / free, no signup, plays in browser / ↓ baddesiplots.com"`. Voice should match the cards — dry, cinematic, slightly unhinged. See §6 for voice cues. |
| A4 | Profile link strategy | Choose one | Option 1: direct UTM-tagged `baddesiplots.com?utm_source=ig&utm_medium=bio`. Option 2: `/play` micro-landing with Play / Suggest a Plot / Submit Feedback CTAs. Recommend Option 2 by week 4. |

### B. Static post templates (reusable)

For each template, deliver: master Figma component, BW variant, TW variant, sample with a real card from `cards.json`, and edge-case test (longest plot text, shortest plot text, special chars).

**Template A — "The Card" (single, the workhorse, ~40% of feed)**

- Canvas: 1080 × 1350 (4:5 IG portrait optimal)
- Layout: jharokha-arch frame (gold, 2px stroke) at 60px inset; crown ornament top-center; difficulty dots top-right; industry badge top-center under crown; era pill below industry badge; card text centered (Playfair italic, 56px display); glow halo behind card; CTA strip bottom ("guess in comments 👇 reveal tomorrow"); watermark bottom (`baddesiplots.com`, DM Sans 13px, 40% cream)
- Worn paper texture overlay at 8% opacity
- BW variant: orange glow + flame ornaments
- TW variant: emerald glow + emerald ornaments

**Template B — "Carousel of 5" (~20% of feed, the saver)**

- 6 slides, each 1080×1350
- Slide 1 (cover): "5 plots. how many can you guess?" Playfair display, 84px, accent word in `--card-bw`. Subtitle DM Sans 24px. Swipe arrow DM Sans caps + arrow glyph
- Slides 2–5: Template A reduced (no glow halo, smaller CTA, no watermark)
- Slide 6 (outro): "drop your score 👇" + URL band button in gold

**Template C — "Reveal" (~15% of feed, the punchline)**

- 2 slides, 1080×1350
- Slide 1: card front (Template A reduced)
- Slide 2: movie name in Playfair 96px gold, year in DM Sans caps 28px, fact in Playfair italic 26px paper-dim, max-width 720px, ornament corner accents
- Posted ~24h after the matching A/B post

**Template D — "Vote / Opinion" (~10%, engagement bait)**

- 1 or 2 slides, 1080×1350
- Format: "BW or TW?" → two cards side-by-side OR "easy or hard?" comparison
- Use both glows (this is the only template where BW + TW co-exist)

**Template E — "Meta quote" (~5%, lateral)**

- 1080 × 1350 single image
- Just a phrase from the card voice ("the movie that ruined your last family road trip") in Playfair display 96px, no card art, ornament-heavy frame
- Functions as a feed palette cleanser between card-heavy days

### C. Reel system (~20% of feed, the discovery engine)

| # | Asset | Spec |
|---|---|---|
| C1 | Reel cover frame | 9:16 (1080×1920), but design crops to 1080×1350 center for grid view — both views must read |
| C2 | Motion vocabulary | Card-flip (0.4s, cubic-bezier overshoot — same as app), text-in (slide + fade, 0.3s), narrator-beat punch frames, reveal slam (0.15s), kinetic caption stack (DM Sans, capped lines, max 6 words on screen) |
| C3 | Sonic identity | Pick 1 signature SFX (drum hit, harmonium sting, shehnai blast, or thali clang) that becomes the reveal punctuation. Document in spec. |
| C4 | Caption overlay system | DM Sans bold caps, white on cream-tinted band, 14% paper opacity bg, max 80% screen width, never bottom 20% (avoid IG UI bar overlap) |
| C5 | Reel template variants | Provide 5 motion templates: dramatic narration / 5-card flipper / reaction split / decoder challenge / family WhatsApp parody (per `instagram-marketing-plan.md` §6) |

### D. Grid composition rules

| # | Rule | Spec |
|---|---|---|
| D1 | 9-tile layout | Mock 3 weeks of grid. BW/TW alternation rule: never 3 same-color tiles in a horizontal or vertical row |
| D2 | Color rhythm | Per-week: 4 BW · 3 TW · 1 reveal · 1 reel. Weekly drift toward 50/50 BW/TW long-term |
| D3 | Cover-slide hierarchy for carousels | The cover slide MUST work as a standalone tile (it's what shows in grid). It must invite a swipe but also stand alone if no swipe |
| D4 | Pinned posts (top of profile) | Pick 3 evergreen "best ofs" — Template A flagship cards. They never change. |

### E. Story system

| # | Asset | Spec |
|---|---|---|
| E1 | Daily story template | Card image + headline + tap-prompt arrow, 1080×1920 |
| E2 | Poll story | "BW or TW today?" — IG poll sticker overlaid on token-themed bg |
| E3 | Quiz story | Card prompt + IG quiz sticker with movie name as answer |
| E4 | Reveal story | Animated reveal — front → back, paired with the previous day's story prompt |
| E5 | Repost story | Black bg, repost frame for tagged stories with "thanks for playing!" microcopy |
| E6 | Story-highlight cover designs | (See A2) — the cover designs the user sees pinned at the top of the profile |
| E7 | Link-sticker treatment | Above the link sticker: a Playfair italic prompt ("play the full game ↓") in cream on a small ornament bar |

### F. Profile link landing (optional v1.1, recommended by week 4)

| # | Asset | Spec |
|---|---|---|
| F1 | `/play` micro-landing | 360px-wide mobile-first single-page. Play button (large gold), Suggest a Plot, Submit Feedback. Same brand tokens. |

### G. Voice / microcopy bank

Designer collaborates with a copywriter (or Claude voice agent) to produce:

| # | Asset | Spec |
|---|---|---|
| G1 | New bio | 4 candidate bios (replace the placeholder), each ≤ 150 chars, voice-matched to cards. Pick 1 final. |
| G2 | CTA copy bank | 10 variants of "guess in comments / play now / save this / tap link" matched to post types |
| G3 | Comment-reply voice bank | 10 reply scripts (correct guess, wrong guess, "where to play", spam, troll). All in card voice — dry, theatrical, slightly unhinged |
| G4 | Hashtag bundles | Already drafted in `instagram-marketing-plan.md` §8 — designer reviews and adjusts to fit the visual templates |

### H. Inspiration audit + IG-specific moodboard

| # | Asset | Spec |
|---|---|---|
| H1 | Audit existing `inspiration/` (31 images) | Categorize each: keep / replace / not-IG-relevant |
| H2 | Build IG-specific moodboard (12 images) | 4 reference posts from comparable accounts (desi meme, party game, film/movie meme), 4 reference reels, 4 typography/ornament references |

### I. Accessibility checks

| # | Check | Threshold |
|---|---|---|
| I1 | WCAG AA contrast | ≥ 7:1 for cream on `--bg` (already exceeds). Re-verify all overlay text. |
| I2 | Reel text size at grid view | All Reel hook text must be legible at 270px-wide grid thumbnail (~3x downscale). Test by exporting and viewing at 25% scale. |
| I3 | Tap targets | Story link sticker, swipe-up zones, profile link area all ≥ 44pt clickable |
| I4 | Hindi/Telugu transliteration | When a card uses transliterated text (eg. "DDLJ"-style abbreviations or Hindi words in roman script), use Playfair regular (not italic), letter-spacing −0.01em, fallback DM Sans if Playfair lacks the glyph |

---

## 4. Inspiration to honor

Cross-reference (designer must look at all of these before drawing):

- `inspiration/` folder — 31 reference images defining the visual target. Audit them per §H1
- `docs/design-spec.md` — full token + component spec (source of truth)
- `cards.json` — pull 10 real cards across BW/TW × easy/medium/hard for samples
- `docs/card-voice-rubric.md` — voice register the visuals must reinforce (dry, cinematic, slightly unhinged — see §6)
- Real-world references (designer's own search): Bollywood poster art (Penguin Random House India poster archive), 1970s-90s film magazine layouts, Rajasthani jharokha photography, mehendi pattern libraries

---

## 5. What NOT to do

Pulled from `CLAUDE.md` §11. The designer must read the full anti-patterns list. Highlights:

- ❌ Pure white or pure black — use cream and ink
- ❌ Hardcoded colors — always reference tokens
- ❌ CSS-only ornaments (gradients pretending to be patterns)
- ❌ Sterile minimalism — this is a Bollywood party game, not a banking app
- ❌ Mixing BW and TW glow families in the same single-card post (Template D is the only exception)
- ❌ Gold for navigation — gold is celebration only
- ❌ Playfair below 24px
- ❌ Generic stock photo "Indian-themed" art that wasn't actually researched
- ❌ Saffron-only "yay India" palette (we are not the Indian flag, we are a haveli)
- ❌ Designs that only work on desktop — phone-first or it doesn't ship

---

## 6. Voice register the visuals must reinforce

The card voice (per `docs/card-voice-rubric.md`) is **dry, cinematic, slightly unhinged.** Three illustrative card lines:

1. *"Boy meets girl. Father says no. They go to Europe anyway. Entire Punjab gives permission eventually."* (DDLJ)
2. *"Foundling raised by a waterfall tribe discovers he might be royalty. Climbs the waterfall to confirm. Correct."* (Baahubali)
3. *"Two freedom fighters meet, become best friends, and discover they are on opposite sides. They dance about it."* (RRR)

Visual cues that carry this voice:
- Italics for plot text (tilted theatre curtain)
- Ornament density that says "we made this on purpose, every petal placed"
- Asymmetric compositions when called for (no boring centered grids on every post)
- Gold flourishes that punctuate (like the orchestral hit on a Bollywood scene change)

Anti-cue: the saas-product bio I wrote — "guess the movie from a terrible plot / free, no signup, plays in browser." That's a feature list. The voice should be: *"a desi party game where the plots are wrong on purpose. somehow this works."*

---

## 7. Process

The designer:

1. **Day 1:** Read this brief, `docs/design-spec.md`, `instagram-marketing-plan.md`. Audit `inspiration/`. Pull 10 real cards. Sketch 2 directions for Template A (low-fi, paper or Figma).
2. **Day 2:** User picks one direction. Designer refines Template A to ship-ready. Visual Gate ≥ 7.5/10 (per CLAUDE.md §5).
3. **Day 3:** Templates B, C, D, E. Profile pfp + 6 highlight covers. New bio (4 candidates).
4. **Day 4:** Reel cover + motion vocabulary spec doc. 5 reel template variants.
5. **Day 5:** Story templates. Grid composition mock (3 weeks). IG-specific moodboard.
6. **Day 6:** Accessibility audit. Edge-case test screenshots. Voice/microcopy bank.
7. **Day 7:** Final delivery — Figma file + PNG exports + a 5-minute Loom walkthrough.

---

## 8. Deliverables index

The designer hands back:

```
deliverables/
  figma/
    baddesiplots-ig-v1.fig         (master file with all components)
  exports/
    profile/
      pfp-1080.png
      highlight-covers-{plays,reveals,cards,howto,submissions,behind}.png
    posts/
      template-a-bw-sample.png
      template-a-tw-sample.png
      template-b-carousel-1080x1350-{1..6}.png
      template-c-reveal-{front,back}.png
      template-d-vote.png
      template-e-quote.png
    reels/
      reel-cover-1080x1920.png
      reel-cover-grid-crop-1080x1350.png
      motion-vocab-spec.md
    stories/
      story-{daily,poll,quiz,reveal,repost}.png
      story-link-sticker-treatment.png
    grid-mocks/
      grid-week-1.png
      grid-week-2.png
      grid-week-3.png
  voice/
    bio-candidates.md          (4 options)
    cta-copy-bank.md           (10 variants)
    comment-reply-bank.md      (10 scripts)
  inspiration-audit.md         (keep/replace/discard for the 31 existing images)
  ig-moodboard.md              (12 new IG-specific references with rationale)
  accessibility-audit.md       (WCAG AA pass/fail per asset)
  loom-walkthrough.mp4         (5 min, final review)
```

---

## 9. Tech notes for handoff to engineering

When this design becomes a Figma → code pipeline (later, post-validation):

- Templates should be reproducible from a JSON spec — given a card object from `cards.json`, the design renders deterministically. Designer prepares variables-driven Figma components (Card.text, Card.industry, Card.difficulty, Card.era).
- Reel motion vocabulary should be re-implementable in CapCut, Adobe Premiere, OR Framer Motion. Document timing curves.
- All ornaments delivered as SVG, < 10KB each, optimized via SVGOMG. Inline-paste-able into HTML.

---

## 10. Constraints summary (the gates)

The designer's work must pass all four:

1. **Spec Gate** — does it use the tokens from `style.css` and follow §2 of this doc? Yes/no.
2. **Voice Gate** — does the visual + microcopy match the dry/cinematic/slightly-unhinged register from §6? Score ≥ 8/10.
3. **Visual Gate** — Bollywood-poster-in-Rajasthan-palace target, scored on color (2pts), typography (2pts), spacing/alignment (2pts), ornament quality (2pts), overall feel (2pts). Score ≥ 7.5/10.
4. **Accessibility Gate** — WCAG AA contrast, ≥ 44pt tap targets, Reel text legible at 270px grid thumbnail.

Any gate failure twice on the same issue → escalate to the user (per CLAUDE.md §5 escalation rules).

---

## 11. Acceptance criteria

User will accept the work when:

- All 9 deliverable buckets in §3 are present and named per §8
- Each template has a real-card sample + 2 edge-case variants (longest text, shortest text)
- 3-week grid mock looks intentional (not chaotic, but not boring) when viewed as a 3×9 image
- Bio doesn't sound like a SaaS landing page (current bio fails this)
- Reel cover reads at both 1080×1920 (full Reel view) and 270px (grid thumbnail)
- Visual Gate score ≥ 7.5/10 from the user
- 5-minute Loom walkthrough explains every choice with rationale (not "I thought it looked good")

---

## 12. Open questions for the user (designer flags before starting)

1. **Account name display:** Currently "Bad Desi Plots" on IG. Keep or shorten to "Bad Plots"? (Designer recommends keeping full name for SEO/discovery.)
2. **Pinned-post strategy:** Top 3 pins on profile — pick which 3 cards become evergreen flagships?
3. **Founder unmask:** Will the brand ever go un-anonymous (per `instagram-marketing-plan.md` §13)? If yes by month 3, designer pre-builds a "people behind this" story template now to save rework.
4. **Cross-platform handoff:** Threads + TikTok use different aspect ratios. Should this brief expand to cover those, or stay IG-only for v1?
5. **Logo evolution:** Current `assets/logo.svg` from the app — does it need any tweaks to work at IG-grid scale? (Designer audits and proposes.)

---

## 13. References (open these first)

In order:

1. `docs/design-spec.md` — full visual spec
2. `docs/instagram-marketing-plan.md` — content strategy this aesthetic supports
3. `docs/card-voice-rubric.md` — voice register
4. `inspiration/` — 31 visual refs to audit
5. `cards.json` — pull 10 real cards for samples
6. `src/style.css` `:root` block — live tokens
7. `CLAUDE.md` §3 (Project Identity) and §11 (Anti-patterns)

---

*This brief is opinionated by design. If the designer thinks a constraint is wrong, they flag it before starting — don't silently break it. Compromises happen at §10 (gates) and §12 (open questions), not in delivery.*
