# Content / Editorial Spec — Bad Desi Plots

> Last updated: 2026-04-20. Canonical editorial strategy for the card catalog.
> Sits above the tactical voice rubric (`docs/card-voice-rubric.md`). Companion
> docs: `product-spec.md`, `design-spec.md`, `system-architecture-spec.md`,
> `engineering-spec.md`, `applied-scientist-spec.md`, `growth-spec.md`,
> `legal-ip-spec.md`.

---

## 1. Scope

This spec answers the strategic content questions:
- What movies enter the catalog, in what order, at what density
- How we scale the catalog from 149 → 1000 → 5000+ without losing voice
- How we handle regional films beyond Bollywood + Tollywood
- How we evolve the voice + difficulty bands as the deck grows
- How community submissions feed back into the catalog
- When cards retire

For per-card voice rules, see `docs/card-voice-rubric.md`. That's the tactical gate; this is the editorial calendar.

## 2. Editorial identity

**Bad Desi Plots is an editorial product.** The catalog is curated with opinion, not aggregated. Every card is chosen because a real human thought it would land at a desi party.

Not a database. Not a trivia drip. A curated deck with a voice.

### Implications
- Every card is hand-approved, even when LLM-assisted to draft
- Coverage reflects what *our audience* cares about, not what's critically important
- Blockbuster mainstream takes priority over niche arthouse
- Memeable moments > cinematic achievement
- Recent releases get fast turnaround (within 3 months of theatrical)

## 3. Catalog state (v2.1.0 baseline)

| Segment | Count | Coverage |
|---|---|---|
| Bollywood (Hindi, HI) | ~85 | Mainstream 1975–2024, heavy 90s-2000s |
| Tollywood (Telugu, TE) | ~64 | Mostly 2000s–2020s, lighter pre-2000 |
| **Total** | **149** | Curated, fact-verified, voice-audited |

### Industry balance rule
- Target: 50% BW / 50% TW once each crosses 500 cards
- Current imbalance is OK; Telugu deck scaling is the v2.2 priority

## 4. Era distribution targets

Every 100-card batch should hit these bands (±5%). Keeps the catalog multi-generationally playable.

| Era | Share | Rationale |
|---|---|---|
| Pre-1990s | 10% | Mom + dad at Diwali game night need cards. Sholay, Mughal-e-Azam, DDLJ-era foundations. |
| 1990s | 20% | Peak nostalgia window, deep diaspora penetration |
| 2000s | 25% | Masala revival, SRK peak, Baahubali setup era |
| 2010s | 30% | Peak output, highest recognition |
| 2020s+ | 15% | Recency bias balanced against unfamiliarity |

Batches that drift outside bands on any row go back for re-balancing.

## 5. Difficulty distribution targets

| Difficulty | Correct rate (target) | Point value | Catalog share |
|---|---|---|---|
| Easy | 70–90% | 1 pt | 40% |
| Medium | 40–70% | 2 pts | 35% |
| Hard | 20–40% | 3 pts | 25% |

Difficulty is measured, not asserted. After 1000 plays per card, rebalance labels based on actual correct rate. See `applied-scientist-spec.md` §5 for signals.

### Difficulty anchors
- **Easy:** Every desi in the audience has heard of the movie. Mainstream blockbusters. DDLJ, Baahubali, 3 Idiots, Dil Chahta Hai.
- **Medium:** Frequent viewers know it. Cult classics, strong second-tier hits. Andaz Apna Apna, Okkadu, Eega.
- **Hard:** Deep cuts. Regional hits with limited pan-India reach, niche genres. Joji, Arjun Reddy, Makkhi, regional dialect comedies.

## 6. Coverage roadmap (what enters the catalog next)

### v2.2 (next batch, 1000 total target)
- BW: 500 total, add 415 more. Cover:
  - 10 masala films per decade, 1970s onward
  - Every SRK / Aamir / Salman / Akshay top-10
  - Top 30 critically-hailed films of 2010s (Piku, Queen, Masaan, etc)
  - Karan Johar + Rajkumar Hirani + Imtiaz Ali core catalog
- TW: 500 total, add 436 more. Cover:
  - Pan-Indian Telugu hits (Baahubali, RRR, Pushpa)
  - Every Mahesh / Pawan Kalyan / Jr NTR / Ram Charan major release
  - Classic Trivikram, Rajamouli, Sukumar, Koratala Siva filmography
  - 90s–2000s industrial masala canon (Pokiri, Magadheera, Okkadu)

### v2.3 and beyond
- **Kollywood (Tamil, TA)** — Rajinikanth, Kamal Haasan, Vijay, Karthi, Suriya. 300-card target.
- **Sandalwood (Kannada, KN)** — KGF, Kantara, Ugramm, Ulidavaru Kandante. 200-card target.
- **Mollywood (Malayalam, ML)** — The most critically fertile regional industry. Drishyam, Premam, Kumbalangi Nights, Joji. 300-card target.
- **Bengali (BN)** — Satyajit Ray essentials + recent mainstream. 100-card target.
- **Punjabi (PA)** — Diljit, Ammy Virk, Honsla Rakh, contemporary hits. 150-card target.

Expanding beyond HI / TE requires an `ind` field expansion in `src/core/types.ts` and a refresh of mode pickers in HomeScreen. Planned for v3.0.

### What we don't cover (yet)
- Bollywood films before 1950 (coverage mismatch with audience)
- Hollywood Indian-directed films (The Lunchbox crossovers, Namesake) — ambiguous fit
- Non-Indian films with desi themes (Slumdog, Life of Pi) — not our lane
- Non-film content (TV series, web series, ads) — future deck, v3+
- Adult / niche-genre films (horror B-movies, unreleased scripts)

## 7. Card lifecycle

Every card moves through these states:

```
PROPOSED → DRAFTED → VOICE_AUDIT → FACT_CHECK → MERGED → LIVE → RETIRED
                ↑                                      ↓
                └──── REWRITE ←── FAIL ←──────────────┘
```

### Proposed
Entry points: community suggestion, author's movie-of-the-week, LLM generation batch, curator backlog.

### Drafted
First pass via `scripts/generate.js` (LLM with voice-rubric-grounded prompt). Output: a plot clue, industry, era, difficulty label, cast hint.

### Voice audit
`seedhaplot-card-auditor` agent scores the clue against the voice rubric's 6 registers, 5 failure modes, specificity anchor, reduction dial, and the aloud test (simulated). Fail rate target: < 5% per batch (was 15% in Round 1, 3.5% in Round 2 after tighter prompts).

### Fact check
`seedhaplot-fact-checker` agent cross-references clue + movie name + year against Wikipedia. Flags wrong years, wrong city setting, wrong profession, wrong outcome. Zero fact fails allowed before merge.

### Merged
Card is written to `cards.json` with an `id`, `voice_register`, `anchor`, and `reduction_pct` field. Deck now includes it in selection.

### Live
Card is in rotation. PostHog tracks per-card metrics (see `applied-scientist-spec.md` §5).

### Retired
Card removed from rotation when any of:
- `correct_rate` outside its difficulty band for 60+ days with 500+ plays → either relabel (preferred) or retire
- `miss_rate > 10%` — unguessable, pull
- `report_rate > 2%` — flag for human review; likely wrong or confusing
- Movie becomes legally contentious (studio C&D, copyright challenge) — pull immediately (see `legal-ip-spec.md`)

Retired cards stay in `cards.json` with a `"retired": true` flag for history; deckBuilder excludes them from selection.

## 8. Voice evolution

The voice rubric (`card-voice-rubric.md`) is stable in v2.x. Changes to the rubric require:

1. Update the rubric file with a dated entry
2. Full-deck re-audit with `seedhaplot-card-auditor`
3. Rewrite cards that fail the new rubric
4. Flag any regressions in `.project-state.md`

**Never ship a voice change without re-auditing the full deck.** Voice drift across the catalog is the slow death of an editorial product.

### Known voice tensions
- **2000s TW mass-masala** — the LLM falls into template writing ("hero returns to village, fights factionist, falls in love with engineering student"). Requires stricter anchor specificity prompts per card.
- **Pre-1980s BW** — too few plays to audit yet; voice might need a separate register for melodramatic classics (Pakeezah, Mother India)
- **Recent releases** — timing pressure favors generic first-drafts; resist. Ship one week late rather than ship flat voice.

## 9. Localization (future)

### v2.x — English primary, transliteration mixed
Hindi / Telugu words transliterated in Roman script where natural ("Mogambo khush hua," "kitne aadmi the"). Never untransliterated Devanagari or Telugu script in the clues themselves (violates `feedback_seedhaplot_no_devanagari_on_cards.md`).

### v3.0 — UI localization
Add Hindi + Telugu UI toggle. Card clues stay English-primary with transliteration. Reasoning: the joke works best in Hinglish; pure Hindi or Telugu translation flattens the punchline.

Implementation: i18n layer via JSON locale files, swapped at runtime. Not a code-split per language (keeps the bundle lean).

### Localization scope
- Home, setup, game UI strings — localized
- Card clues — English-primary, transliteration preserved
- System-generated text (verdict lines, interstitial copy) — localized
- Error + toast messages — localized

## 10. Community submissions

Users can submit movie suggestions via the in-app Suggest sheet. Data lands in Supabase `suggestions` table.

### Processing cadence
- Weekly: author reviews the suggestions queue
- Duplicates: merged into suggestion count (popularity signal)
- Novel movies: added to curator backlog with a priority score (popularity × era fit)
- Out-of-scope movies (non-desi, adult, unreleased): marked declined with no user notification

### Quality hurdle
Community suggestions don't bypass the voice audit or fact check. Even a well-loved movie becomes a card only if the clue for it passes the rubric.

### Attribution
Suggesting users are not individually credited per-card (no accounts to link to). Top-5 most-suggested-within-month movies get an optional "suggested by you" line on the `/credits` page once per batch ship.

## 11. Fact accuracy as editorial position

Cards describe movies badly on purpose, but the facts embedded must be correct. A wrong city, wrong profession, or wrong outcome in a clue destroys trust — a user Googles the answer and finds the clue was lying.

### Facts in scope for verification
- Movie name (exact spelling)
- Release year (±1 year grace for regional re-release)
- Genre / setting
- Main character profession / occupation
- Geographic setting (city, region)
- Outcome / climax one-liner

### Facts out of scope (don't over-verify)
- Supporting character names
- Specific dialogue (verbatim dialogue is banned anyway — see voice rubric §Forbidden)
- Minor plot details that don't carry the clue's specificity anchor
- Box office numbers (unless explicitly used; almost never)

## 12. Timed / event-linked cards

### Daily card (v2.3 target)
One card per day, globally synced. Selection algorithm: random from live pool, excluding the last 30 days of daily cards. No release-date-aware seasonality in v2.3.

### Seasonal content (v2.4 candidate)
Some cards feel right on specific days:
- Diwali: films with Diwali scenes (K3G, Baghban, Home Delivery)
- Independence Day: patriotic films (Lagaan, Border, Rang De Basanti)
- Valentine's Day: romantic films (DDLJ, Veer-Zaara, Jab We Met)
- Holi: films with iconic Holi scenes (Silsila, Waqt, Yaadon Ki Baaraat)

Opt-in feature flag, not on by default. Surface as a "seasonal deck" home-screen pick rather than auto-inject.

### New-release window
When a major film (Rocky Aur Rani, Jawan, Animal, RRR 2) hits theaters, ship a card for it within 3 months. Requires:
- Movie is actually released (not just announced)
- Fact-check sources exist (Wikipedia article stabilized)
- Voice landed (at least 2 people laughed at the clue)

## 13. Known catalog gaps (v2.1 baseline)

Known holes from the 149-card deck. Prioritize filling these in v2.2.

### Bollywood
- Kishore Kumar-era comedies (Chalti Ka Naam Gaadi, Padosan) — missing
- Yash Chopra romances outside DDLJ (Lamhe, Veer-Zaara, Jab Tak Hai Jaan) — under-represented
- 2010s indie critical hits (Masaan, Court, The Lunchbox) — underweight
- 2000s masala comedies (Hera Pheri, Golmaal, No Entry) — 3 cards where 15 belong
- Kangana Ranaut filmography — single card
- Post-Pathaan SRK comeback arc (Pathaan, Jawan, Dunki) — 1 card where 3 belong

### Tollywood
- NTR Sr + ANR classics (1970s–80s) — 0 cards
- Chiranjeevi filmography — 2 cards; should be 15+
- Baahubali + RRR director Rajamouli pre-epic work (Simhadri, Magadheera, Eega) — under-covered
- Regional-dialect comedies (Ala Vaikunthapurramuloo, Bommarillu) — underweight
- Arjun Reddy / Kabir Singh angle (don't shy away from the controversy) — 1 card; should be in both BW and TW

## 14. Metrics-to-editorial mapping

| Signal | Editorial response |
|---|---|
| Card correct rate drops 20pp over 30 days | Relabel difficulty; likely drifted harder with deck growth |
| Specific era under-represented in plays | Promote era by biasing the daily card calendar |
| Card report rate > 2% | Pull card; root-cause fact check or voice issue |
| Feedback thumbs-down correlated to a card | Rewrite clue (even if it passed voice audit initially) |
| New movie trending in suggestions | Fast-track to curator backlog |
| Retention dropping while adding cards | Slow the pace; focus on re-auditing voice of existing cards |

## 15. Don't change without audit

- Voice rubric (`card-voice-rubric.md`) — requires full-deck re-audit
- Difficulty band definitions — requires full re-labeling pass
- Industry codes (`HI`, `TE`, future `TA`, `ML`, etc.) — requires `types.ts` migration
- Card `id` format (`bw001`, `tw247`) — requires `adaptive.ts` + storage migration

## 16. Open editorial questions

- Should the catalog ever include "non-film" content (songs, ads, web series) in v3, or does that dilute the identity?
- When the daily card arrives, should it be globally identical or region-aware (Telugu card for TW viewers)?
- Do we need an "over-18" filter once we cover films with mature content (Dev D, Paan Singh Tomar, Gangs of Wasseypur)?
- Should we publish a public "release notes per batch" explaining new cards? (Transparency vs spoiler tension.)
- Is 1000 cards actually too many? The sweet spot might be 500 well-curated cards vs 2000 spread thin. Revisit after v2.2 ships + 8 weeks of data.
