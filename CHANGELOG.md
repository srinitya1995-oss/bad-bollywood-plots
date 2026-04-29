# Changelog

## 2.1.0 — 2026-04-18

### Brand
- Renamed to **Bad Desi Plots** across hero, TopBand, `<title>`, `og:site_name`.

### Game fixes
- Streak points now match between stats and leaderboard (scorer.totalPts reconciled).
- Pts float shows base + streak bonus pill on 3+ streak; cleared on card change (no cross-card bleed).
- Same-cards-every-round bug fixed: calibration now 1 easy / 1 medium / 1 hard; seen list auto-clears at 70% pool exhaustion.
- In-game menu offers "Switch to Pass-and-Play" / "Switch to Solo" mid-round.
- TopBand title is now a button with home glyph on active rounds; confirms then exits. Husband-proof exit.
- Solo now routes through PlayerSetup; empty names fall back to desi placeholders (Chintu / Pinky / Bunty...).
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
- Bundle 75KB gzipped (target <200KB).
