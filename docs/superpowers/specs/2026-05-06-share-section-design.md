# Share Section on Results — Design Spec

**Date:** 2026-05-06
**Target version:** 3.0.0
**Status:** Approved (brainstorm phase complete)

---

## 1. Why

`ResultsScreen.tsx` ends with PLAY AGAIN and HOME. There is no way for a player at a party to surface the result back to a group chat or feed. `getShareText()` exists in `gameInstance.ts:305` for solo mode but is not wired to any UI. Multiplayer share text does not exist. No UTM attribution on any URL.

This blocks two known follow-ups:
- v3.0.0 release cut (held back until share lands)
- UTM medium attribution fix (moot until per-channel mediums exist)

## 2. Scope

In:
- 4-channel explicit share row on Results (WhatsApp, X, Reddit, Copy)
- Multiplayer share text variant (top-3 leaderboard)
- UTM scheme: `utm_source=share`, `utm_medium={channel}`, `utm_campaign=results_{mode}`
- One PostHog event per click: `share_click` with `{ channel, mode }`
- Tests for URL builder + text formatters + component clicks

Out (deferred):
- Image share / OG screenshot card
- Native `navigator.share()` sheet (the explicit row covers it)
- Per-channel copy variants (single text per mode)
- Confirm-on-paste analytics (`share_copied`) — click intent is the funnel signal

## 3. UI

### Placement
On `ResultsScreen.tsx`, insert `<ShareSection />` between the quote (current line 118) and the CTAs (current line 120). Panel order top-to-bottom:

```
header → mast → verdict → winner|solo → board → quote → SHARE → ctas
```

### Layout
```
                    ─── Share the damage ───

           [WhatsApp]   [ X ]   [Reddit]   [Copy]
              icon      icon     icon       icon
```

- One section header (`<div class="v8-results-share__label">`) — copy "Share the damage"
- Horizontal row of 4 buttons, ~70×70 tap area each, icon stacked over a small label
- Channel brand colors on the icon background:
  - WhatsApp `#25D366`
  - X `#000`
  - Reddit `#FF4500`
  - Copy `--cream` background, `--ink` icon
- Brand colors are the explicit exception to the "no hardcoded colors" rule in `CLAUDE.md` §3, justified by channel recognition. All other styling uses tokens.
- Tap target ≥ 44px (CLAUDE.md anti-pattern compliance)
- On 375px viewport: 4×70 + gaps fits with margin

### Per-channel action on tap
| Channel | Action |
|---|---|
| WhatsApp | `window.open('https://wa.me/?text=' + encodeURIComponent(shareText), '_blank')` |
| X | `window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText), '_blank')` |
| Reddit | `window.open('https://reddit.com/submit?title=' + enc(firstLine) + '&url=' + enc(shareUrl), '_blank')` |
| Copy | `navigator.clipboard.writeText(shareText)` then existing `<Toast />` "Copied" |

Reddit takes `title` + `url` as separate params (not a free body), so it gets `firstLine` only as title and the canonical UTM url separately. The multi-line body is silently dropped on Reddit. Acceptable trade.

## 4. Share text

### URL with UTM (single builder)
```ts
function buildShareUrl(
  channel: 'whatsapp' | 'x' | 'reddit' | 'copy',
  mode: 'solo' | 'party'
): string
// → https://baddesiplots.com/?utm_source=share&utm_medium={channel}&utm_campaign=results_{mode}
```

### Solo text
Existing format from `gameInstance.ts:305`, with bare URL replaced by `buildShareUrl(channel, 'solo')`:
```
🔥 Movie Buff (1300 rating)
12/15 Hindi movies · Top 25%

Terrible plots. Real movies.
Think you can beat that?
{shareUrl}
```

### Party text (new)
```
1. Priya 24 · 2. Raj 18 · 3. Anu 12

Bad Desi Plots. Terrible plots, real movies.
{shareUrl}
```

Top-3 only. 2-player game lists both. 4+ silently truncates to top 3 (winner brag is the point; full leaderboard would balloon length and break Reddit title limit). Per CLAUDE.md em-dash ban, the second line uses a period and comma, not an em dash.

### First-line extraction (for Reddit title)
- Solo: line 1 = `🔥 Movie Buff (1300 rating)`
- Party: line 1 = `1. Priya 24 · 2. Raj 18 · 3. Anu 12`

Both fit comfortably under Reddit's 300-character title cap.

## 5. Files

### New
- `src/utils/share.ts` — `buildShareUrl()`, `getShareTextSolo()`, `getShareTextParty()`. Pure functions, no React, no `gameInstance` import.
- `src/components/ShareSection.tsx` — 4-button row. Reads game state via `useGameState`, derives `mode` from `players.length`, calls into `share.ts`.
- `tests/utils/share.test.ts` — UTM builder + text formatters
- `tests/components/ShareSection.test.tsx` — render + click → PostHog event with right props

### Modified
- `src/components/ResultsScreen.tsx` — import + render `<ShareSection />` between quote and CTAs
- `src/hooks/gameInstance.ts` — keep public `getShareText()` API, internally delegate to `share.ts` based on `players.length` so any external callers still work
- `src/style.css` — new `.v8-results-share` block (label + button row + channel-specific button modifiers)

### Untouched
- `gameFSM.ts` — no FSM change; share is a pure side panel on `results` state
- `eventBus.ts` — share is a fire-and-forget UI event, doesn't go through bus

## 6. Analytics

Single event:
```ts
posthog.capture('share_click', { channel, mode })
// channel ∈ 'whatsapp' | 'x' | 'reddit' | 'copy'
// mode ∈ 'solo' | 'party'
```

Fires *before* `window.open` / `writeText`. No success-confirmation event for Copy — click intent is the funnel signal. PostHog campaign attribution arrives independently via the UTM-tagged URL when the share recipient clicks through.

## 7. Tests

| Suite | Cases |
|---|---|
| `share.test.ts` — `buildShareUrl` | 8 combos (4 channels × 2 modes) parameterized |
| `share.test.ts` — `getShareTextSolo` | format snapshot, URL has correct UTM |
| `share.test.ts` — `getShareTextParty` | 2-player, 3-player, 5-player (truncation), URL UTM |
| `ShareSection.test.tsx` | 4 buttons render; each click fires `share_click` with correct props; Copy click writes to clipboard + shows toast |

Target: ~8 new test cases across 2 new files (existing 186 → ~194). All four CLAUDE.md gates must pass: typecheck, test, build, lint.

## 8. Risks + mitigations

- **WhatsApp web behavior on desktop**: `wa.me/?text=` opens web.whatsapp.com on desktop without a phone number. Some users not logged in see a QR code page. Acceptable — it's the standard share intent URL and copy fallback button is right next to it.
- **Reddit body truncation**: as noted, multi-line body is dropped. First-line title carries the brag.
- **PostHog blocked by ad-blocker**: `posthog?.capture` already uses optional chaining, will no-op gracefully.
- **Brand-color drift**: keep channel hex values inline in `share.ts` (constants), not in `style.css` tokens. Channel brand colors are not part of the design system.

## 9. Acceptance

- [ ] 4-button share row renders on Results between quote and CTAs
- [ ] Solo and Party variants emit correct share text and URL with UTM
- [ ] Each channel button opens the right intent URL or copies clipboard
- [ ] `share_click` event fires with correct `{ channel, mode }`
- [ ] All 4 gates pass (typecheck, test, build, lint)
- [ ] `seedhaplot-visual-qa` ≥ 7.0 on the new Results layout
- [ ] Tested on 375px viewport mobile + 1024px desktop

## 10. After ship

- v3.0.0 cut: bump `package.json` 2.1.0 → 3.0.0, CHANGELOG entry, push to `main` (auto-deploys via Vercel)
- Verify UTM landing on `baddesiplots.com` via PostHog `$pageview` events with `utm_medium` property
- Add a 7-day post-ship metric check: share-click rate per mode, channel split
