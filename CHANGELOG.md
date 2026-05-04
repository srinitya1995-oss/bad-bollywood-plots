# Changelog

All notable changes to Bad Desi Plots are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project loosely follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Version bumps in `package.json` are deferred until the user decides on a release tag.

## [Unreleased]

### Added
- `partyRoundCap()` and `filteredPool()` helpers in `src/hooks/gameInstance.ts`. The Settings panel (sound, difficulty filter, round length) now actually drives the game loop. Previously the UI was wired to nothing.
- Single-tier party mode: when `difficultyFilter` is set to one tier, `gameInstance` skips the 1 easy / 1 medium / 1 hard calibration and seeds 3 cards from the chosen tier.
- Two new tests in `tests/hooks/gameInstance-award.test.ts` covering the settings-wiring path. Suite is now 186 / 186.
- Hard editorial rule: no title-leak in plot text. Formalized in `docs/content-editorial-spec.md` §11.

### Changed
- 14 cards rewritten to remove the movie title (or its lead-character-name equivalent) from the plot text: Rockstar, Khaleja, 3 Idiots, Bombay, Jersey, Family Star, Pad Man, OMG, Rowdy Inspector, HIT 2, Godavari, Chandni Bar, Son of Satyamurthy, Happy Wedding.
- Three fact corrections shipped with the card pass: Khaleja taxi-driver role corrected, Bombay AR Rahman attribution removed, Family Star architect detail dropped.
- Adaptive picker noise band widened from `Math.random() * 150` to `Math.random() * 300` in `src/core/adaptive.ts`. Lets harder cards surface at low estimated ability and kills the "all the cards feel familiar" complaint.
- Card text-fit floor lowered from 16px to 14px in `src/hooks/useCardTextFit.ts`. Hook now returns `{ fontSize, compact }`; `Card.tsx` drops italic Fraunces to upright when fitted size is within 2px of the floor (legibility on long plots).
- PWA manifest in `vite.config.ts` is now "Bad Desi Plots" / "Bad Plots". Brought all script system prompts and the admin prompt in line with the same brand.
- Brand sweep: `index.html`, `src/components/HomeScreen.tsx` tagline, scorer verdicts, and header comments all read "Bad Desi Plots."
- Open Graph image (`public/og-image.png`) regenerated as BAD DESI PLOTS / baddesiplots.com.
- Mobile flex chain in `src/style.css`: added `#root { display: flex; flex-direction: column; flex: 1; min-height: 0 }`. Without this rule, `.v8-game-card-area` collapses to 0px on iOS Safari.

### Fixed
- Rules-of-Hooks violation in `src/components/TurnInterstitial.tsx`. The keyboard `useEffect` was placed after an early return; hoisted above so it runs unconditionally.
- Settings UI is no longer dead. Difficulty filter and round length now flow through `setSettings()` into the game loop.

## [2.1.0] - 2026-04-18

### Brand
- Renamed to **Bad Desi Plots** across hero, TopBand, `<title>`, `og:site_name`.

### Game fixes
- Streak points now match between stats and leaderboard (scorer.totalPts reconciled).
- Pts float shows base + streak bonus pill on 3+ streak; cleared on card change (no cross-card bleed).
- Same-cards-every-round bug fixed: calibration is 1 easy / 1 medium / 1 hard; seen list auto-clears at 70% pool exhaustion.
- In-game menu offers "Switch to Pass-and-Play" / "Switch to Solo" mid-round.
- TopBand title is now a button with home glyph on active rounds; confirms then exits. Husband-proof exit.
- Solo now routes through PlayerSetup; empty names fall back to desi placeholders (Chintu / Pinky / Bunty).
- Reader included in picker for Pass-and-Play.
- Solo card: collapsed NOPE + "skip this card" to NOPE only.
- Results: solo leaderboard row removed when only one player; mast title ellipsis-clamps; rank column tightened.
- CARD N/M label sized up, desktop breakpoint added.

### Submissions wiring (CRITICAL)
- Feedback / Suggest / Report sheets now write to the correct prod columns (`message`, `movie_title`, `reason` enum). Prior versions silently 400'd.

### Content + accuracy infra
- Canonical humor rubric: `docs/card-voice-rubric.md` (6 registers, 5 failure modes, aunty test).
- 100+ movie seed list for 1000-card expansion: `docs/card-seed-list.csv`.
- Fact-check pipeline scaffold: `scripts/fact-check-v2-poc.js` (Wikipedia cross-ref, claim extraction).
- First-pass audit of 30 cards: `docs/fact-check-report.json`.

### Backend hardening
- Rate-limit migration: 10 inserts / session / hour on feedback, suggestions, reports (`supabase/migrations/20260418_add_rate_limits.sql`).
- `robots.txt` disallows `/admin.html`; `netlify.toml` adds X-Robots-Tag + no-store for same.

### Tests
- 185 / 185 tests pass.
- Typecheck clean.
- Bundle 75KB gzipped (target < 200KB).
