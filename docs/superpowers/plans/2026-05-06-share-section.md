# Share Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 4-channel share row (WhatsApp · X · Reddit · Copy) to `ResultsScreen` with UTM-tagged URLs and PostHog click tracking.

**Architecture:** Pure-function share-text builders in `src/utils/share.ts` (no React, no game-instance import) consumed by a new `ShareSection.tsx` component on Results. `gameInstance.getShareText()` keeps its existing API by delegating to the same builders.

**Tech Stack:** React 18, TypeScript, Vitest, react-test-renderer, PostHog (via `window.posthog`).

**Spec:** `docs/superpowers/specs/2026-05-06-share-section-design.md`

**Files map:**
- Create `src/utils/share.ts` — pure builders + types
- Create `src/components/ShareSection.tsx` — 4-button UI
- Create `tests/utils/share.test.ts` — builder unit tests
- Create `tests/components/ShareSection.test.tsx` — component test
- Modify `src/hooks/gameInstance.ts:305-318` — delegate `getShareText()`
- Modify `src/components/ResultsScreen.tsx:118-119` — insert `<ShareSection />`
- Modify `src/style.css` — add `.v8-results-share` block

---

## Task 1: `buildShareUrl` — UTM URL builder

**Files:**
- Create: `src/utils/share.ts`
- Test: `tests/utils/share.test.ts`

- [ ] **Step 1.1: Write the failing test**

Create `tests/utils/share.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildShareUrl } from '../../src/utils/share';

describe('buildShareUrl', () => {
  it.each([
    ['whatsapp', 'solo'],
    ['whatsapp', 'party'],
    ['x',        'solo'],
    ['x',        'party'],
    ['reddit',   'solo'],
    ['reddit',   'party'],
    ['copy',     'solo'],
    ['copy',     'party'],
  ] as const)('emits utm params for %s + %s', (channel, mode) => {
    const url = buildShareUrl(channel, mode);
    expect(url).toBe(
      `https://baddesiplots.com/?utm_source=share&utm_medium=${channel}&utm_campaign=results_${mode}`
    );
  });
});
```

- [ ] **Step 1.2: Run test — verify it fails**

```bash
npm run test -- tests/utils/share.test.ts
```
Expected: FAIL — `Cannot find module '../../src/utils/share'`

- [ ] **Step 1.3: Implement `buildShareUrl`**

Create `src/utils/share.ts`:

```ts
export type ShareChannel = 'whatsapp' | 'x' | 'reddit' | 'copy';
export type ShareMode = 'solo' | 'party';

const BASE_URL = 'https://baddesiplots.com/';

export function buildShareUrl(channel: ShareChannel, mode: ShareMode): string {
  const params = new URLSearchParams({
    utm_source: 'share',
    utm_medium: channel,
    utm_campaign: `results_${mode}`,
  });
  return `${BASE_URL}?${params.toString()}`;
}
```

- [ ] **Step 1.4: Run test — verify it passes**

```bash
npm run test -- tests/utils/share.test.ts
```
Expected: PASS — 8 cases.

- [ ] **Step 1.5: Commit**

```bash
git add src/utils/share.ts tests/utils/share.test.ts
git commit -m "feat(share): buildShareUrl with utm scheme"
```

---

## Task 2: `getShareTextSolo` — solo share text

**Files:**
- Modify: `src/utils/share.ts` (append)
- Modify: `tests/utils/share.test.ts` (append)

- [ ] **Step 2.1: Add failing test**

Append to `tests/utils/share.test.ts`:

```ts
import { getShareTextSolo } from '../../src/utils/share';

describe('getShareTextSolo', () => {
  const baseInput = {
    tier: 'Movie Buff',
    rating: 1300,
    correctCount: 12,
    totalPlayed: 15,
    industryLabel: 'Hindi',
    percentile: 25,
    emoji: '\u{1F525}',
  };

  it('formats text with utm-tagged url for the given channel', () => {
    const text = getShareTextSolo(baseInput, 'whatsapp');
    expect(text).toBe(
      [
        '\u{1F525} Movie Buff (1300 rating)',
        '12/15 Hindi movies · Top 25%',
        '',
        'Terrible plots. Real movies.',
        'Think you can beat that?',
        'https://baddesiplots.com/?utm_source=share&utm_medium=whatsapp&utm_campaign=results_solo',
      ].join('\n')
    );
  });

  it('uses correct utm medium per channel', () => {
    const text = getShareTextSolo(baseInput, 'reddit');
    expect(text).toContain('utm_medium=reddit');
    expect(text).toContain('utm_campaign=results_solo');
  });
});
```

- [ ] **Step 2.2: Run test — verify it fails**

```bash
npm run test -- tests/utils/share.test.ts
```
Expected: FAIL — `getShareTextSolo is not a function`.

- [ ] **Step 2.3: Implement `getShareTextSolo`**

Append to `src/utils/share.ts`:

```ts
export interface SoloShareInput {
  tier: string;
  rating: number;
  correctCount: number;
  totalPlayed: number;
  industryLabel: string;
  percentile: number;
  emoji: string;
}

export function getShareTextSolo(input: SoloShareInput, channel: ShareChannel): string {
  const url = buildShareUrl(channel, 'solo');
  return [
    `${input.emoji} ${input.tier} (${input.rating} rating)`,
    `${input.correctCount}/${input.totalPlayed} ${input.industryLabel} movies · Top ${input.percentile}%`,
    '',
    'Terrible plots. Real movies.',
    'Think you can beat that?',
    url,
  ].join('\n');
}
```

- [ ] **Step 2.4: Run test — verify it passes**

```bash
npm run test -- tests/utils/share.test.ts
```
Expected: PASS — 10 cases (8 + 2).

- [ ] **Step 2.5: Commit**

```bash
git add src/utils/share.ts tests/utils/share.test.ts
git commit -m "feat(share): getShareTextSolo with utm-tagged url"
```

---

## Task 3: `getShareTextParty` — multiplayer top-3 leaderboard

**Files:**
- Modify: `src/utils/share.ts` (append)
- Modify: `tests/utils/share.test.ts` (append)

- [ ] **Step 3.1: Add failing tests (3 cases: 2-player, 3-player, 5-player truncation)**

Append to `tests/utils/share.test.ts`:

```ts
import { getShareTextParty } from '../../src/utils/share';

describe('getShareTextParty', () => {
  it('lists both names for 2-player game', () => {
    const text = getShareTextParty(
      [{ name: 'Priya', score: 24 }, { name: 'Raj', score: 18 }],
      'whatsapp',
    );
    expect(text).toBe(
      [
        '1. Priya 24 · 2. Raj 18',
        '',
        'Bad Desi Plots. Terrible plots, real movies.',
        'https://baddesiplots.com/?utm_source=share&utm_medium=whatsapp&utm_campaign=results_party',
      ].join('\n')
    );
  });

  it('lists top 3 for 3-player game', () => {
    const text = getShareTextParty(
      [
        { name: 'Priya', score: 24 },
        { name: 'Raj',   score: 18 },
        { name: 'Anu',   score: 12 },
      ],
      'copy',
    );
    expect(text.split('\n')[0]).toBe('1. Priya 24 · 2. Raj 18 · 3. Anu 12');
  });

  it('truncates to top 3 for 5-player game and sorts by score', () => {
    const text = getShareTextParty(
      [
        { name: 'Anu',   score: 5  },
        { name: 'Raj',   score: 18 },
        { name: 'Priya', score: 24 },
        { name: 'Kiran', score: 9  },
        { name: 'Vik',   score: 2  },
      ],
      'x',
    );
    expect(text.split('\n')[0]).toBe('1. Priya 24 · 2. Raj 18 · 3. Kiran 9');
    expect(text).toContain('utm_medium=x');
    expect(text).toContain('utm_campaign=results_party');
  });
});
```

- [ ] **Step 3.2: Run test — verify it fails**

```bash
npm run test -- tests/utils/share.test.ts
```
Expected: FAIL — `getShareTextParty is not a function`.

- [ ] **Step 3.3: Implement `getShareTextParty`**

Append to `src/utils/share.ts`:

```ts
export interface PartyPlayer {
  name: string;
  score: number;
}

export function getShareTextParty(players: PartyPlayer[], channel: ShareChannel): string {
  const top3 = [...players].sort((a, b) => b.score - a.score).slice(0, 3);
  const ranked = top3.map((p, i) => `${i + 1}. ${p.name} ${p.score}`).join(' · ');
  const url = buildShareUrl(channel, 'party');
  return [
    ranked,
    '',
    'Bad Desi Plots. Terrible plots, real movies.',
    url,
  ].join('\n');
}
```

- [ ] **Step 3.4: Run test — verify it passes**

```bash
npm run test -- tests/utils/share.test.ts
```
Expected: PASS — 13 cases (10 + 3).

- [ ] **Step 3.5: Commit**

```bash
git add src/utils/share.ts tests/utils/share.test.ts
git commit -m "feat(share): getShareTextParty with top-3 truncation"
```

---

## Task 4: Delegate `gameInstance.getShareText()`

**Files:**
- Modify: `src/hooks/gameInstance.ts:305-318`

The existing `getShareText()` is exposed via `useGameActions` for backward compat (currently no callers in the live UI but the API is public). It should delegate to `share.ts` so behavior stays consistent. We default to the `'copy'` channel since `getShareText()` has no channel parameter.

- [ ] **Step 4.1: Read the existing implementation**

```bash
sed -n '305,318p' src/hooks/gameInstance.ts
```

Expected output: the `getShareText()` method that builds solo text inline.

- [ ] **Step 4.2: Replace `getShareText()` with delegation**

In `src/hooks/gameInstance.ts`, replace the existing `getShareText()` method (currently at lines 305-318) with:

```ts
  getShareText(): string {
    if (this.scorer.players.length > 1) {
      return getShareTextParty(
        this.scorer.players.map((p, i) => ({
          name: p.name,
          score: this._scores[i] ?? 0,
        })),
        'copy',
      );
    }
    const ind = this.industry ? INDUSTRY_META[this.industry].lang : 'Cinema';
    const ability = this.adaptive.ability;
    const emoji = ability >= 1500 ? '\u{1F525}'
                : ability >= 1300 ? '\u{1F4AA}'
                : ability >= 1100 ? '\u{1F3AC}'
                : '\u{1F605}';
    return getShareTextSolo({
      tier: getAbilityTier(ability),
      rating: ability,
      correctCount: this.scorer.correctCount,
      totalPlayed: this.idx,
      industryLabel: ind,
      percentile: getAbilityPercentile(ability),
      emoji,
    }, 'copy');
  }
```

Add the import at the top of `gameInstance.ts` (alongside other utility imports — locate the existing import block and append):

```ts
import { getShareTextSolo, getShareTextParty } from '../utils/share';
```

- [ ] **Step 4.3: Run typecheck — verify clean**

```bash
npm run typecheck
```
Expected: no errors.

- [ ] **Step 4.4: Run all existing tests — verify nothing regressed**

```bash
npm run test
```
Expected: PASS — all 186 existing tests + 13 new = 199 total.

If any existing test snapshots `getShareText()`, the format is unchanged for solo (same emoji table, same line order, same tagline), so snapshots should still match. Multiplayer was previously not handled in `getShareText()` but no current test covers multiplayer share text, so no regression risk.

- [ ] **Step 4.5: Commit**

```bash
git add src/hooks/gameInstance.ts
git commit -m "refactor(share): delegate gameInstance.getShareText to utils/share"
```

---

## Task 5: `ShareSection` component

**Files:**
- Create: `src/components/ShareSection.tsx`
- Create: `tests/components/ShareSection.test.tsx`

This component reads game state via `useGameState`, derives `mode` from `players.length`, and renders 4 channel buttons. Each button click fires `share_click` then opens the channel intent URL or copies clipboard.

- [ ] **Step 5.1: Write the failing test**

Create `tests/components/ShareSection.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create, act } from 'react-test-renderer';
import { findByAriaLabel } from './test-utils';
import type { GamePayload } from '../../src/hooks/gameInstance';

const mockPayload: Partial<GamePayload> = {
  scorer: {
    players: [{ name: 'Priya', score: 0 }, { name: 'Raj', score: 0 }],
    correctCount: 8,
    totalPts: 18,
    streak: 0,
  } as never,
  scores: [24, 18],
  idx: 12,
  industry: 'BW',
  adaptive: { ability: 1300, history: [] } as never,
  abilityTier: 'Movie Buff',
  abilityPercentile: 25,
};

vi.mock('../../src/hooks/useGameState', () => ({
  useGameState: () => ({ state: 'results', payload: mockPayload }),
}));

const captureMock = vi.fn();
const writeTextMock = vi.fn().mockResolvedValue(undefined);
const openMock = vi.fn();

beforeEach(() => {
  captureMock.mockClear();
  writeTextMock.mockClear();
  openMock.mockClear();
  (window as never as { posthog: { capture: typeof captureMock } }).posthog = { capture: captureMock };
  Object.assign(navigator, { clipboard: { writeText: writeTextMock } });
  vi.spyOn(window, 'open').mockImplementation(openMock);
});

import { ShareSection } from '../../src/components/ShareSection';

describe('ShareSection', () => {
  it('renders four channel buttons', () => {
    const tree = create(<ShareSection />);
    expect(findByAriaLabel(tree.root, 'Share on WhatsApp')).toBeTruthy();
    expect(findByAriaLabel(tree.root, 'Share on X')).toBeTruthy();
    expect(findByAriaLabel(tree.root, 'Share on Reddit')).toBeTruthy();
    expect(findByAriaLabel(tree.root, 'Copy share text')).toBeTruthy();
  });

  it('fires share_click with channel + party mode on WhatsApp click', () => {
    const tree = create(<ShareSection />);
    const btn = findByAriaLabel(tree.root, 'Share on WhatsApp');
    act(() => { btn.props.onClick(); });
    expect(captureMock).toHaveBeenCalledWith('share_click', { channel: 'whatsapp', mode: 'party' });
    expect(openMock).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/?text='),
      '_blank',
    );
  });

  it('writes share text to clipboard on Copy click', () => {
    const tree = create(<ShareSection />);
    const btn = findByAriaLabel(tree.root, 'Copy share text');
    act(() => { btn.props.onClick(); });
    expect(captureMock).toHaveBeenCalledWith('share_click', { channel: 'copy', mode: 'party' });
    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('1. Priya 24'));
  });

  it('builds Reddit submit url with title + url params', () => {
    const tree = create(<ShareSection />);
    const btn = findByAriaLabel(tree.root, 'Share on Reddit');
    act(() => { btn.props.onClick(); });
    const calledUrl = openMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('https://reddit.com/submit?title=');
    expect(calledUrl).toContain('&url=');
    expect(calledUrl).toContain(encodeURIComponent('utm_medium=reddit'));
  });
});
```

- [ ] **Step 5.2: Run test — verify it fails**

```bash
npm run test -- tests/components/ShareSection.test.tsx
```
Expected: FAIL — `Cannot find module '../../src/components/ShareSection'`.

- [ ] **Step 5.3: Implement `ShareSection`**

Create `src/components/ShareSection.tsx`:

```tsx
import { useGameState } from '../hooks/useGameState';
import { getAbilityTier, getAbilityPercentile } from '../core/adaptive';
import { INDUSTRY_META } from '../core/types';
import {
  buildShareUrl,
  getShareTextSolo,
  getShareTextParty,
  type ShareChannel,
} from '../utils/share';
import { toast } from './Toast';

declare global {
  interface Window {
    posthog?: { capture: (event: string, props?: Record<string, unknown>) => void };
  }
}

const CHANNELS: { id: ShareChannel; label: string; aria: string }[] = [
  { id: 'whatsapp', label: 'WhatsApp', aria: 'Share on WhatsApp' },
  { id: 'x',        label: 'X',        aria: 'Share on X' },
  { id: 'reddit',   label: 'Reddit',   aria: 'Share on Reddit' },
  { id: 'copy',     label: 'Copy',     aria: 'Copy share text' },
];

export function ShareSection() {
  const { payload } = useGameState();
  const { scorer, idx, scores, adaptive, industry } = payload;
  const isParty = scorer.players.length > 1;
  const mode: 'solo' | 'party' = isParty ? 'party' : 'solo';

  function getText(channel: ShareChannel): string {
    if (isParty) {
      return getShareTextParty(
        scorer.players.map((p, i) => ({ name: p.name, score: scores[i] ?? 0 })),
        channel,
      );
    }
    const ind = industry ? INDUSTRY_META[industry].lang : 'Cinema';
    const ability = adaptive.ability;
    const emoji = ability >= 1500 ? '\u{1F525}'
                : ability >= 1300 ? '\u{1F4AA}'
                : ability >= 1100 ? '\u{1F3AC}'
                : '\u{1F605}';
    return getShareTextSolo({
      tier: getAbilityTier(ability),
      rating: ability,
      correctCount: scorer.correctCount,
      totalPlayed: idx,
      industryLabel: ind,
      percentile: getAbilityPercentile(ability),
      emoji,
    }, channel);
  }

  function handleClick(channel: ShareChannel) {
    window.posthog?.capture('share_click', { channel, mode });
    const text = getText(channel);
    if (channel === 'copy') {
      void navigator.clipboard.writeText(text);
      toast('Copied');
      return;
    }
    const enc = encodeURIComponent;
    const url =
      channel === 'whatsapp'
        ? `https://wa.me/?text=${enc(text)}`
      : channel === 'x'
        ? `https://twitter.com/intent/tweet?text=${enc(text)}`
        : `https://reddit.com/submit?title=${enc(text.split('\n')[0])}&url=${enc(buildShareUrl('reddit', mode))}`;
    window.open(url, '_blank');
  }

  return (
    <div className="v8-results-share">
      <div className="v8-results-share__label">Share the damage</div>
      <div className="v8-results-share__row">
        {CHANNELS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`v8-results-share__btn v8-results-share__btn--${c.id}`}
            aria-label={c.aria}
            onClick={() => handleClick(c.id)}
          >
            <span className="v8-results-share__icon" aria-hidden="true">
              {c.id === 'whatsapp' ? '\u{1F4AC}' : c.id === 'x' ? '\u{2715}' : c.id === 'reddit' ? '\u{1F4E2}' : '\u{1F4CB}'}
            </span>
            <span className="v8-results-share__name">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

(Inline emoji glyphs are the v1 icons. Tests only assert aria labels and behavior, not glyphs. If the Visual QA gate at Step 6.6 flags them as weak/off-brand, swap to inline brand SVGs in a separate follow-up commit — out of scope here to keep this plan shippable.)

- [ ] **Step 5.4: Run test — verify it passes**

```bash
npm run test -- tests/components/ShareSection.test.tsx
```
Expected: PASS — 4 cases.

- [ ] **Step 5.5: Run typecheck**

```bash
npm run typecheck
```
Expected: no errors.

- [ ] **Step 5.6: Commit**

```bash
git add src/components/ShareSection.tsx tests/components/ShareSection.test.tsx
git commit -m "feat(share): ShareSection component with 4-channel row"
```

---

## Task 6: Integrate into ResultsScreen + styles + final gates

**Files:**
- Modify: `src/components/ResultsScreen.tsx:118-119`
- Modify: `src/style.css`

- [ ] **Step 6.1: Insert `<ShareSection />` between quote and CTAs**

In `src/components/ResultsScreen.tsx`:

1. Add the import near the top (after the existing useGameState/useGameActions imports):

```tsx
import { ShareSection } from './ShareSection';
```

2. Insert `<ShareSection />` directly between the `<p className="v8-results-quote">` element (currently line 118) and the `<div className="v8-results-ctas">` (currently line 120). The new render block becomes:

```tsx
        <p className="v8-results-quote">{`"${quote}"`}</p>

        <ShareSection />

        <div className="v8-results-ctas">
```

- [ ] **Step 6.2: Run all tests + typecheck — verify ResultsScreen still works**

```bash
npm run typecheck && npm run test
```
Expected: PASS, no regressions.

- [ ] **Step 6.3: Add the style block**

Append to `src/style.css` (place near the end, after other `.v8-results-*` blocks; if you want to be exact, search for `.v8-results-ctas` and add this section immediately after that block ends):

```css
/* === v8 results: share row === */
.v8-results-share {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 8px;
  border-top: 1px solid color-mix(in srgb, var(--cream) 18%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--cream) 18%, transparent);
  margin: 8px 0;
}
.v8-results-share__label {
  font-family: 'DM Sans', sans-serif;
  font-size: var(--text-sm);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--cream) 70%, transparent);
}
.v8-results-share__row {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: nowrap;
}
.v8-results-share__btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 64px;
  min-height: 64px;
  border: 1px solid color-mix(in srgb, var(--cream) 16%, transparent);
  border-radius: 12px;
  background: transparent;
  color: var(--cream);
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: transform 0.12s ease, background 0.12s ease;
  -webkit-tap-highlight-color: transparent;
}
.v8-results-share__btn:hover,
.v8-results-share__btn:focus-visible {
  transform: translateY(-1px);
  background: color-mix(in srgb, var(--cream) 6%, transparent);
}
.v8-results-share__btn:active {
  transform: translateY(0);
}
.v8-results-share__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 16px;
  line-height: 1;
}
/* Channel-specific icon backgrounds (brand recognition exception per CLAUDE.md §3) */
.v8-results-share__btn--whatsapp .v8-results-share__icon { background: #25D366; color: #fff; }
.v8-results-share__btn--x        .v8-results-share__icon { background: #000;    color: #fff; }
.v8-results-share__btn--reddit   .v8-results-share__icon { background: #FF4500; color: #fff; }
.v8-results-share__btn--copy     .v8-results-share__icon { background: var(--cream); color: var(--ink); }

@media (max-width: 360px) {
  .v8-results-share__row { gap: 8px; }
  .v8-results-share__btn { width: 60px; }
}
```

- [ ] **Step 6.4: Run dev server + manual visual sanity check**

```bash
npm run dev
```

Open `http://localhost:5173`, play one quick solo game to reach Results, confirm:
- Share section renders between the desi quote and the PLAY AGAIN button
- 4 buttons in a row: WhatsApp · X · Reddit · Copy
- Each button has a colored icon circle with a label underneath
- Tap targets feel ≥ 44px on mobile (resize devtools to 375px)
- Click WhatsApp → opens new tab with `wa.me/?text=...`
- Click Copy → toast "Copied" appears

Stop the dev server (Ctrl-C) before continuing.

- [ ] **Step 6.5: Run all four CLAUDE.md gates**

```bash
npm run typecheck && npm run test && npm run build && npm run lint
```
Expected: all pass. Test count should be 203 (186 baseline + 13 in `tests/utils/share.test.ts` + 4 in `tests/components/ShareSection.test.tsx`).

- [ ] **Step 6.6: Run visual QA agent on Results screen**

Dispatch `seedhaplot-visual-qa` agent against the Results screen (solo + party). Score must be ≥ 7.0 per CLAUDE.md §5 Gate 3. If < 7.0, iterate on the style block before committing.

- [ ] **Step 6.7: Commit**

```bash
git add src/components/ResultsScreen.tsx src/style.css
git commit -m "feat(share): wire ShareSection into Results + v8 styles"
```

- [ ] **Step 6.8: Update `.project-state.md`**

Append a session entry to `.project-state.md` per CLAUDE.md §9. Note:
- Files added (`src/utils/share.ts`, `src/components/ShareSection.tsx`)
- Files modified (`gameInstance.ts`, `ResultsScreen.tsx`, `style.css`)
- Test count delta (186 → 199)
- Visual QA score
- Open follow-ups: v3.0.0 cut (package.json bump + CHANGELOG + push)

```bash
git add .project-state.md
git commit -m "docs(state): log share section landing"
```

---

## Done criteria

All boxes ticked. Working tree clean. `main` is now N commits ahead of `origin/main`. Ready for v3.0.0 release cut (separate task: bump `package.json` 2.1.0 → 3.0.0, add CHANGELOG entry, push to remote — needs explicit user approval before push per project rule).
