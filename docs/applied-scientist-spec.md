# Applied Scientist Spec — Bad Desi Plots

> Last updated: 2026-04-20. Canonical data + experiments reference. Companion
> docs: `product-spec.md`, `design-spec.md`, `system-architecture-spec.md`,
> `engineering-spec.md`.

---

## 1. What applied science means for this product

Bad Desi Plots is a trivia game, not an ML product. But several product
decisions are data-shaped and benefit from disciplined measurement and
experimentation:

1. **Card difficulty is a distribution, not a single number.** "Easy" means 80%+
   of party-mode players score the card; "hard" means fewer than 30% do. We
   need enough play data to set those thresholds and re-label cards that drift.
2. **Voice quality is subjective, but the laugh is measurable.** Flip time,
   flagrant mis-guesses, and post-game feedback thumbs tell us which cards land.
3. **Retention is everything.** A party game lives or dies on whether the group
   plays again next gathering. D7 and D30 return rates matter more than DAU.
4. **Adaptive selection can get smarter.** Right now `adaptive.ts` only dedupes
   within a session. We can do better — personalized deck, era balance,
   difficulty balance across session, surprise factor.

The scope of applied-science work on this product is **measurement, experiment
design, and content quality loops**, not deploying ML to production.

## 2. Analytics stack

### Client-side
- PostHog (project key via `VITE_POSTHOG_KEY`)
- Direct event capture, no server proxy
- User identification: anonymous distinct ID per device, no login
- Session recording: disabled (privacy + bundle size)

### Server-side
- None. Events go client → PostHog directly.

### MCPs available to the analyst
- PostHog MCP (`mcp__claude_ai_PostHog__*`) — query events, run funnels, create insights, manage feature flags, run experiments
- See `CLAUDE.md` §8 for the full MCP table

## 3. Event schema

All events emitted via `src/analytics/posthog.ts`, which subscribes to the core
event bus. Component code does not call PostHog directly.

### Game lifecycle
```
game_start                     { mode: 'party' | 'solo', industry: 'HI' | 'TE' | 'MIXED', players: number, device: 'mobile' | 'desktop' }
card_shown                     { card_id, industry, difficulty, era, year, idx }
card_flipped                   { card_id, time_since_shown_ms }
card_scored                    { card_id, player_idx, base_pts, bonus, streak, time_to_score_ms }
card_missed                    { card_id, time_since_flipped_ms }
card_reported                  { card_id, reason? }
round_end                      { reason: 'complete' | 'abandon', cards_played, duration_ms, scores }
```

### UI events
```
setup_mode_switch              { mode: 'party' | 'solo' }
mode_picked                    { industry, mode }
results_cta                    { cta: 'play_again' | 'home' | 'share' }
feedback_submitted             { thumbs: 1 | -1, has_note: bool }
suggestion_submitted           { industry, has_year: bool }
```

### Rules for adding new events
1. Event name is snake_case, verb-noun order (`card_scored`, not `scored_card`)
2. Payload properties are snake_case
3. Never include PII (names, emails, IP) in event payload
4. Event goes through the bus, not direct from component
5. Test the event fires in dev via PostHog debug toolbar before shipping

## 4. Headline metrics

| Metric | Definition | Target (v2.1) | Current baseline |
|---|---|---|---|
| Activation | % of new visitors completing ≥1 full round | 55% | TBD (need post-launch data) |
| D1 retention | % returning within 24h of first round | 20% | TBD |
| D7 retention | % returning within 7d of first round | 35% | TBD |
| D30 retention | % returning within 30d | 20% | TBD |
| Session length | Median cards per session | 10 | TBD |
| Party mix | % of sessions with ≥2 players | 60% | TBD |
| Replay rate | % of rounds where PLAY AGAIN is tapped | 45% | TBD |
| Share rate | % of rounds where shareable card is used | 15% | N/A until v2.3 |
| Feedback thumbs-up rate | Positive / total feedback submissions | 80% | TBD |

Targets set based on analogous party trivia apps and the author's intuition.
Recalibrate after 4 weeks of post-launch data.

## 5. Card quality metrics

Cards are content; treat them like an inventory.

### Per-card metrics (rolling 30-day window)
- `shown_count` — how many times the card was dealt
- `correct_rate` — `card_scored` / `shown_count`
- `median_flip_time_ms` — median time between shown and flipped
- `miss_rate` — `card_missed` / `shown_count`
- `report_rate` — `card_reported` / `shown_count`
- `feedback_thumbs_down_attribution` — when a user submits thumbs-down feedback and the round included this card, attribute fractionally

### Signals
- `correct_rate` outside its declared difficulty band → relabel (easy should be 70–90%, medium 40–70%, hard 20–40%)
- `miss_rate > 10%` → the card is unguessable or culturally obscure; consider removing or rewriting
- `report_rate > 2%` → flag for human review; likely wrong fact or confusing plot
- `median_flip_time_ms > 30s` → plot might be too cryptic; consider simplification

### Dashboard
- PostHog dashboard "Card Inventory Health" with one row per card, sortable by every metric
- Updated nightly via PostHog scheduled query

## 6. Experiment pipeline

### When to experiment
- **Changing copy** (verdict lines, interstitial kicker, card voice) — A/B via PostHog feature flags
- **Changing mechanics** (streak thresholds, lives count, round length) — A/B with careful power analysis; mechanics changes affect the core loop
- **Changing visual design** (celebration animation intensity, results layout) — usually ship behind a flag, run 1-week A/B, check replay rate

### When NOT to experiment
- Bug fixes. Just ship them.
- Voice rubric violations. Hold the line; don't experiment on quality.
- Accessibility regressions. Fix, don't test.

### Experiment structure
1. **Hypothesis** — explicit, one sentence: "Adding a 10-dot celebration burst on Results will increase replay rate by ≥5pp."
2. **Primary metric** — one metric, decided upfront.
3. **Secondary metrics** — 3–5 guardrails (session length, feedback thumbs, crash rate).
4. **Power calc** — minimum detectable effect, expected sample size, duration. Typical: 2-week minimum, 1000+ rounds per arm.
5. **Variants** — usually 2 (control + treatment). More only when justified.
6. **Rollout** — PostHog feature flag, staged ramp (10% → 50% → 100%).
7. **Stop rule** — ship if primary hit, iterate if not.
8. **Writeup** — post-experiment doc in `docs/experiments/`, archived regardless of outcome.

### Queued experiments
- **E01: Celebration burst impact** — does the v2.1 Results celebration lift replay rate vs the pre-v2.1 no-burst variant? Needs the flag in place + 2 weeks of data.
- **E02: Solo endless vs 10-card round** — does a finite solo round (10 cards) beat endless-lives for session completion?
- **E03: Verdict copy A/B** — does the Hindi-film-dialogue style verdict ("Mogambo khush hua") outperform generic English verdicts?
- **E04: Results share CTA placement** — when share ships in v2.3, test share-as-primary vs Play-Again-as-primary.

## 7. Adaptive deck (current + future)

### Current
`src/core/adaptive.ts` tracks played card IDs in the current session and filters them out of the next deal. Simple, deterministic, no ML.

**Picker noise band (2026-04-30):** the rating-noise term is `Math.random() * 300` (was `* 150`). Doubling the band lets harder cards surface even at low estimated ability, which kills the "all the cards feel familiar" complaint reported in solo. Anything that revisits the picker should preserve a noise band of ~300 unless data justifies a change; rating-noise is the only knob currently surfacing surprise into the deal.

### Planned improvements
1. **Cross-session dedup (opt-in)** — remember last N played per device so a returning user doesn't see the same cards for a week
2. **Difficulty balance within session** — never serve 3 hard cards in a row; smooth across easy/medium/hard
3. **Era balance within session** — at least one pre-2000 card per 6 to keep the multi-generational party dynamic
4. **Surprise seed** — intentionally surface a card that's been under-shown recently, to keep the deck feeling "alive"
5. **Industry mixing** — in mixed mode, balance BW and TW 50/50 ± 10%

None of these require ML. Deterministic scoring with thresholds and randomness-within-constraints is enough.

## 8. Personalization

Out of scope for v2.x. Tracked here so the option isn't lost.

### Where it could help
- Known-rusty era: if a user consistently misses 2010s TW cards, surface fewer until they improve
- Streak momentum: after a hot streak, serve one hard card to reward
- Returning-user onboarding: the first card on a return visit should be from a recent era the user did well on last time

### Why we're not doing it
- Requires per-device persistence beyond current anonymous model
- Requires opt-in, which adds a consent screen (adds setup friction)
- ROI is unclear vs just improving card quality

### Revisit trigger
If post-launch data shows retention stalling at D7 < 25%, personalization becomes worth testing.

## 9. Content generation pipeline

### Current (v2.1.0)
- Cards are generated in batches of 100–200 by an LLM agent (`scripts/generate.js`) with:
  - Prompt grounded in the voice rubric (`docs/card-voice-rubric.md`)
  - Per-card inline Wikipedia verification (curl + parse)
  - Output saved as JSON to `docs/phase1-new-cards-*.json`
- Voice audit: `seedhaplot-card-auditor` agent runs the voice rubric on each card, flags ≥15% fail rate for rewrite
- Fact-check audit: `seedhaplot-fact-checker` agent cross-references each card against Wikipedia, flags wrong years / cities / plots
- Merge rule: both audits must pass (< 5% voice fails, 0 fact fails) before cards merge to `cards.json`

### Known issues (v2.1 → v2.2 learnings)
- LLM often inflates difficulty on mass-masala 2000s TW templates; requires stricter anchor-specific prompts
- Inline Wikipedia verify can pass but LLM still fabricates minor details; secondary fact-check pass is mandatory
- 100-card batch size is the safe ceiling; bigger batches hit context limits and drift

### v2.2 scaling plan
- 5 rounds × 200 cards = 1000 new cards target
- Each round: generate → voice audit → fact-check → apply fixes → merge
- Parallel dispatch of voice + fact agents cuts round time from ~4h to ~2h
- Cards remain hand-crafted; no auto-merge without human sign-off

## 10. Data privacy

See also `system-architecture-spec.md` §11.

### What we collect
- PostHog: anonymous event stream, no PII
- Supabase: user-submitted feedback text, movie suggestions, card reports. No names, no emails, no IPs stored (anon key doesn't expose request metadata to clients).

### What we don't collect
- Real names (player names are local-only, never sent to any server)
- Email / phone
- Location beyond timezone inferred from browser locale
- Cross-site tracking

### Opt-out
- User can disable analytics via browser DNT header (PostHog respects this by config)
- No cookie banner required under current data collection
- If GDPR compliance ever becomes required (EU audience scales), we add a consent flow + delete-all-data endpoint

### Data retention
- PostHog: 7-year default retention (configurable; we keep the default)
- Supabase: indefinite for now. Set a 2-year retention policy on feedback tables once storage costs warrant it.

## 11. Fraud / abuse surface

Minimal, because there's nothing to game. But:
- **Feedback spam** — rate-limit submissions per device (client-side throttle, 1 per 30s); Supabase anon policy caps at 100 inserts per IP per hour
- **Suggestion spam** — same throttle
- **Report spam** — same throttle
- **Analytics event spoofing** — PostHog anon key can be abused; ignore outliers in dashboards via PostHog's rate-limit settings
- **Content injection** — user-submitted feedback text is stored verbatim; never rendered in the app UI; escaped in admin views

No auth = no account takeover risk. This is a design choice.

## 12. What breaks the data

Known gotchas that corrupt analytics if not handled:

- **Development events in prod dashboards** — always filter by `distinct_id` prefix or use a separate PostHog project for dev. Events emitted from `localhost` should not pollute prod metrics.
- **Double-firing** — React 18 StrictMode double-invokes effects in dev. Verify no event fires twice on production build.
- **PWA install duplicates** — a user on iOS Safari who installs the PWA gets a new distinct ID. D1 retention calculations should dedupe on cohorted cohort_id stored in localStorage.
- **Ad-block false zeros** — users with strict ad-blockers silently drop PostHog requests. If metrics look suspiciously low, check PostHog's "events dropped" count.

## 13. Tooling + dashboards

### PostHog dashboards to maintain
1. **Daily heartbeat** — DAU, sessions, rounds, feedback count
2. **Funnel — first visit to first completed round** — catch activation drop-offs
3. **Retention — D1 / D7 / D30** — cohorted by first-visit week
4. **Card inventory health** — the per-card metrics table from §5
5. **Experiment results** — one row per active experiment with variants + primary metric

### Query patterns (PostHog HogQL)
- "Cards with correct_rate outside their difficulty band"
- "Sessions with anomalously short duration (< 30s)" — bounce signal
- "Feedback thumbs ratio by week"
- "Share rate by results verdict" (once v2.3 ships)

Store common queries in `docs/analytics-queries.md` (not yet created, add when we have 5+ reusable queries).

## 14. Open applied-science questions

- What's the right duration for a solo round? Current endless-with-lives might not be the best loop.
- Does adding a decade hint on hard cards (e.g., "2010s Tollywood") improve correct rate without killing the challenge?
- Do streak bonuses actually increase replay rate, or just satisfy the person currently on a streak?
- Is there a teachable "style" each user develops (always guesses 90s Bollywood; always misses Telugu)? If so, is surfacing it interesting or creepy?
- If we add a daily card, does it pull returning users independent of the party dynamic?

These are hypothesis candidates for the experiment queue.
