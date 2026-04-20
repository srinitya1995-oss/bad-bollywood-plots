# Prod Readiness Audit - 2026-04-17

## Analytics (PostHog)

### Wired
- `round_start` (via bus game:started)
- `card_view` / `card_flip` / `card_result` / `state_transition` / `turn_change` / `deck_exhausted` (bus bridge)
- `game_end_raw` / `round_end` (bus game:ended)
- `feedback_sent` (FeedbackSheet submit) - added this session
- `suggest_sent` (SuggestSheet submit) - added this session
- `report_sent` (ReportSheet submit) - added this session
- `settings_changed` for sound/difficulty/roundLen - added this session
- `resume_used` (home Resume click) - added this session

### Not wired (P1, next pass)
- Home: cinema toggle (BW vs TW pick before CTA)
- Home: footer link opens (HowTo, Suggest, Feedback, Settings)
- PlayerSetup: mode switch (party vs solo)
- PlayerSetup: add/remove player, reorder
- GameScreen: menu open, End round tap, Back home tap
- Card: skip, got it, nope explicit clicks (currently only via bus score:updated)
- Results: Play Again vs Home choice

Quick wins for next pass: add `track.capture('cta_click', {cta, screen})` to these. Single event, low cardinality.

## Backend Health

### Supabase
- URL fallback: `https://wmfxkkgktmfsipiihsjq.supabase.co` (hardcoded). Anon key read from `VITE_SUPABASE_ANON_KEY`.
- Client loaded via CDN script in index.html.
- Adapter is fire-and-forget: writes always succeed from caller's perspective.
- Tables written to: `sessions`, `feedback`, `suggestions`, `events` (in feedback.ts adapter).
- **Gap**: no retry, no error logging. If a request 500s, silently dropped.
- **Gap**: no health check endpoint surfaced in app.

### PostHog
- Loaded async from `https://us.i.posthog.com`.
- Token from `VITE_POSTHOG_TOKEN`, project 356713.
- Flags defined: `solo_mode_enabled`, `settings_screen_enabled`, `report_flow_v2` with safe defaults.
- **Gap**: no boot-time assertion that posthog actually loaded. Silent fail.

### Error tracking
- None. No Sentry, no Rollbar, no window.onerror hook, no error boundary.
- **P0 gap**: add a React ErrorBoundary around App with a console-only fallback at minimum. Sentry on prod would be ideal.

### PWA
- `vite-plugin-pwa@0.20` is a dep, presumed configured in vite.config.
- **Gap**: manifest/icon audit not run this session.

## Monitoring

- No uptime monitoring.
- No alerting on PostHog event drops or Supabase insert failures.
- Recommend: a daily cron that queries PostHog `round_start` count and alerts if zero.

## Prioritization

**Before public launch:**
1. React ErrorBoundary (30 min)
2. Wire remaining footer/mode/menu click events (1 hr)
3. PWA manifest audit (30 min)
4. Uptime ping on the Netlify URL (external, 5 min)

**Nice to have:**
- Sentry integration
- PostHog auto-alerts on key events
- Supabase row-count dashboard
