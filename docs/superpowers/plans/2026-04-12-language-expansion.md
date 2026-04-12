# Language Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand from 2 languages (Bollywood/Tollywood) to 4 (Hindi/Telugu/Tamil/Malayalam) with proper labels, coming-soon UI for new languages, and data-driven architecture for future additions.

**Architecture:** Relabel Industry type from jargon codes (BW/TW) to language codes (HI/TE/TA/ML). Update manifest, packs, UI, and all consumers. Tamil + Malayalam launch as "coming soon" placeholders until card generation fills them.

**Tech Stack:** TypeScript types, React components, JSON content packs, CSS.

---

## File Structure

| File | Change | Responsibility |
|------|--------|----------------|
| `src/core/types.ts` | Modify | Industry type: `'HI' \| 'TE' \| 'TA' \| 'ML'`, add INDUSTRY_META config |
| `src/core/contentLoader.ts` | Modify | Load 4 packs, handle missing/empty gracefully |
| `src/components/HomeScreen.tsx` | Modify | 4 cinema panels in 2x2 grid, coming-soon state |
| `src/style.css` | Modify | 2x2 grid layout, Tamil/Malayalam colors, coming-soon styles |
| `src/hooks/gameInstance.ts` | Modify | Update BW→HI, TW→TE references |
| `src/components/Card.tsx` | Modify | Update industry label logic |
| `src/components/GameScreen.tsx` | Modify | Update industry references |
| `public/content/manifest.json` | Modify | Add Tamil + Malayalam packs |
| `public/content/packs/bw.json` | Rename→`hi.json` | Update `id` and `industry` fields |
| `public/content/packs/tw.json` | Rename→`te.json` | Update `id` and `industry` fields |
| `public/content/packs/ta.json` | Create | Empty starter pack (cards added later) |
| `public/content/packs/ml.json` | Create | Empty starter pack (cards added later) |
| `tests/core/contentLoader.test.ts` | Modify | Test 4-pack loading, empty pack handling |

---

### Task 1: Update Industry Type and Add Metadata

**Files:**
- Modify: `src/core/types.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/core/types.test.ts
import { describe, it, expect } from 'vitest';
import { INDUSTRY_META } from '../../src/core/types';

describe('INDUSTRY_META', () => {
  it('has entries for all 4 languages', () => {
    expect(Object.keys(INDUSTRY_META)).toEqual(['HI', 'TE', 'TA', 'ML']);
  });

  it('each entry has label, lang, and color', () => {
    for (const meta of Object.values(INDUSTRY_META)) {
      expect(meta).toHaveProperty('label');
      expect(meta).toHaveProperty('lang');
      expect(meta).toHaveProperty('color');
    }
  });

  it('Hindi is labeled correctly', () => {
    expect(INDUSTRY_META.HI.label).toBe('Hindi Films');
    expect(INDUSTRY_META.HI.lang).toBe('Hindi');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/core/types.test.ts -v`
Expected: FAIL — `INDUSTRY_META` not exported

- [ ] **Step 3: Update types.ts**

```typescript
export type Industry = 'HI' | 'TE' | 'TA' | 'ML';

export interface IndustryMeta {
  label: string;     // "Hindi Films"
  lang: string;      // "Hindi"
  color: string;     // CSS variable name: "--card-hi"
  packId: string;    // "hi" — matches pack filename
  comingSoon: boolean;
}

export const INDUSTRY_META: Record<Industry, IndustryMeta> = {
  HI: { label: 'Hindi Films', lang: 'Hindi', color: '--card-hi', packId: 'hi', comingSoon: false },
  TE: { label: 'Telugu Films', lang: 'Telugu', color: '--card-te', packId: 'te', comingSoon: false },
  TA: { label: 'Tamil Films', lang: 'Tamil', color: '--card-ta', packId: 'ta', comingSoon: true },
  ML: { label: 'Malayalam Films', lang: 'Malayalam', color: '--card-ml', packId: 'ml', comingSoon: true },
};
```

Keep `POINT_MAP`, `Card`, `Player`, `GameSession`, etc unchanged.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/core/types.test.ts -v`
Expected: PASS

- [ ] **Step 5: Run full typecheck**

Run: `npx tsc --noEmit`
Expected: ERRORS — other files still reference 'BW' | 'TW'. That's expected, we fix those next.

- [ ] **Step 6: Commit**

```bash
git add src/core/types.ts tests/core/types.test.ts
git commit -m "feat: expand Industry type to 4 languages (HI/TE/TA/ML) with metadata"
```

---

### Task 2: Rename Pack Files and Update Manifest

**Files:**
- Rename: `public/content/packs/bw.json` → `public/content/packs/hi.json`
- Rename: `public/content/packs/tw.json` → `public/content/packs/te.json`
- Create: `public/content/packs/ta.json`
- Create: `public/content/packs/ml.json`
- Modify: `public/content/manifest.json`

- [ ] **Step 1: Rename existing packs**

```bash
cd public/content/packs
mv bw.json hi.json
mv tw.json te.json
```

- [ ] **Step 2: Update hi.json internal fields**

Change the `id` and `industry` fields inside hi.json:

```bash
# In hi.json, update the top-level fields:
# "id": "bw" → "id": "hi"
# And every card's "ind": "BW" → "ind": "HI"
```

Use sed or a script:
```bash
sed -i '' 's/"id": "bw"/"id": "hi"/g' hi.json
sed -i '' 's/"ind": "BW"/"ind": "HI"/g' hi.json
```

- [ ] **Step 3: Update te.json internal fields**

```bash
sed -i '' 's/"id": "tw"/"id": "te"/g' te.json
sed -i '' 's/"ind": "TW"/"ind": "TE"/g' te.json
```

- [ ] **Step 4: Create empty Tamil pack**

```json
{
  "id": "ta",
  "name": "Tamil Films",
  "industry": "TA",
  "cards": []
}
```

Save to `public/content/packs/ta.json`.

- [ ] **Step 5: Create empty Malayalam pack**

```json
{
  "id": "ml",
  "name": "Malayalam Films",
  "industry": "ML",
  "cards": []
}
```

Save to `public/content/packs/ml.json`.

- [ ] **Step 6: Update manifest**

```json
{
  "packs": [
    { "id": "hi", "file": "packs/hi.json", "enabled": true },
    { "id": "te", "file": "packs/te.json", "enabled": true },
    { "id": "ta", "file": "packs/ta.json", "enabled": true },
    { "id": "ml", "file": "packs/ml.json", "enabled": true }
  ]
}
```

- [ ] **Step 7: Commit**

```bash
git add public/content/
git commit -m "feat: rename packs BW→HI, TW→TE, add empty Tamil + Malayalam packs"
```

---

### Task 3: Update All BW/TW References in Source Code

**Files:**
- Modify: `src/hooks/gameInstance.ts`
- Modify: `src/components/HomeScreen.tsx`
- Modify: `src/components/Card.tsx`
- Modify: `src/components/GameScreen.tsx`
- Modify: `src/components/ResultsScreen.tsx`
- Modify: `src/analytics/posthog.ts`
- Modify: `src/storage/localStorage.ts`

- [ ] **Step 1: Find all BW/TW references**

```bash
grep -rn "'BW'\|'TW'\|\"BW\"\|\"TW\"" src/
```

- [ ] **Step 2: Update gameInstance.ts**

Every `'BW'` → `'HI'`, every `'TW'` → `'TE'`. The `startSoloGame(industry)` and `selectMode(industry)` signatures stay the same — they accept `Industry` type which is now `'HI' | 'TE' | 'TA' | 'ML'`.

Update the share text:
```typescript
const ind = this.industry === 'HI' ? 'Hindi' : this.industry === 'TE' ? 'Telugu' : this.industry === 'TA' ? 'Tamil' : 'Malayalam';
```

- [ ] **Step 3: Update HomeScreen.tsx**

Replace the 2 cinema panels with 4, using `INDUSTRY_META`:

```typescript
import { INDUSTRY_META, type Industry } from '../core/types';

// In the cinema section:
<div className="home-cinema">
  {(Object.entries(INDUSTRY_META) as [Industry, typeof INDUSTRY_META[Industry]][]).map(([code, meta]) => (
    <button
      key={code}
      className={`cinema-panel cinema-panel--${meta.packId}${meta.comingSoon ? ' coming-soon' : ''}`}
      onClick={() => meta.comingSoon ? setShowSuggest(true) : handleCinemaClick(code)}
      aria-label={meta.comingSoon ? `${meta.label} — coming soon, suggest movies` : `Play ${meta.label}`}
    >
      <div className="cinema-panel__texture" aria-hidden="true" />
      <div className="cinema-panel__content">
        <span className="cinema-panel__industry">{meta.lang}</span>
        <span className="cinema-panel__lang">{meta.label}</span>
        {meta.comingSoon && <span className="cinema-panel__soon">Coming soon!</span>}
      </div>
    </button>
  ))}
</div>
```

- [ ] **Step 4: Update Card.tsx**

Replace `card.ind === 'BW'` checks with INDUSTRY_META lookup:

```typescript
import { INDUSTRY_META } from '../core/types';

const meta = INDUSTRY_META[card.ind];
const indLabel = meta.lang;
// For CSS classes, use meta.packId: 'hi', 'te', 'ta', 'ml'
```

- [ ] **Step 5: Update remaining files**

GameScreen.tsx, ResultsScreen.tsx — replace any `'BW'` / `'TW'` string literals with the new codes.

- [ ] **Step 6: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: PASS — all `Industry` references now use the new type.

- [ ] **Step 7: Run tests**

```bash
npx vitest run
```

Expected: Some tests may fail if they reference 'BW'/'TW' — fix them.

- [ ] **Step 8: Commit**

```bash
git add src/ tests/
git commit -m "refactor: relabel BW→HI, TW→TE across all source files"
```

---

### Task 4: Add CSS for 4-Language Grid + Coming Soon

**Files:**
- Modify: `src/style.css`

- [ ] **Step 1: Add color tokens for Tamil + Malayalam**

In the `:root` block:
```css
--card-ta: #C4A235;   /* warm saffron-gold for Tamil */
--card-ml: #2E86AB;   /* deep blue for Malayalam */
--glow-ta: rgba(196, 162, 53, 0.35);
--glow-ml: rgba(46, 134, 171, 0.35);
```

- [ ] **Step 2: Update cinema panel grid to 2x2**

```css
.home-cinema {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 20px;
  margin-bottom: 20px;
}
```

- [ ] **Step 3: Add Tamil + Malayalam panel styles**

```css
.cinema-panel--ta {
  background: #4A3A10;
  border-left: 4px solid var(--card-ta);
}
.cinema-panel--ta:hover {
  box-shadow: -4px 0 20px var(--glow-ta), 0 4px 16px rgba(0,0,0,0.3);
}
.cinema-panel--ml {
  background: #0F2E3D;
  border-left: 4px solid var(--card-ml);
}
.cinema-panel--ml:hover {
  box-shadow: -4px 0 20px var(--glow-ml), 0 4px 16px rgba(0,0,0,0.3);
}
```

- [ ] **Step 4: Add coming-soon styles**

```css
.cinema-panel.coming-soon {
  opacity: 0.7;
  position: relative;
}
.cinema-panel.coming-soon::after {
  content: '';
  position: absolute; inset: 0;
  background: repeating-linear-gradient(
    -45deg, transparent, transparent 8px,
    rgba(245, 232, 212, 0.03) 8px, rgba(245, 232, 212, 0.03) 16px
  );
  border-radius: inherit;
  pointer-events: none;
}
.cinema-panel__soon {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gold);
  opacity: 0.8;
  margin-top: 4px;
}
```

- [ ] **Step 5: Add card color styles for Tamil + Malayalam**

```css
.card-front.ta {
  background: var(--card-ta);
  box-shadow: 0 4px 16px var(--glow-ta), 0 12px 48px rgba(196, 162, 53, 0.2);
}
.card-front.ml {
  background: var(--card-ml);
  box-shadow: 0 4px 16px var(--glow-ml), 0 12px 48px rgba(46, 134, 171, 0.2);
}
.card-back.ta {
  box-shadow: 0 4px 16px rgba(196, 162, 53, 0.2), 0 12px 48px rgba(196, 162, 53, 0.15);
}
.card-back.ml {
  box-shadow: 0 4px 16px rgba(46, 134, 171, 0.2), 0 12px 48px rgba(46, 134, 171, 0.15);
}
```

- [ ] **Step 6: Commit**

```bash
git add src/style.css
git commit -m "feat: add Tamil/Malayalam colors, 2x2 cinema grid, coming-soon styles"
```

---

### Task 5: Handle Empty Packs Gracefully in ContentLoader

**Files:**
- Modify: `src/core/contentLoader.ts`
- Modify: `tests/core/contentLoader.test.ts`

- [ ] **Step 1: Write failing test for empty pack**

```typescript
it('loads packs with zero cards without error', async () => {
  const fetcher = async (url: string) => {
    if (url.includes('manifest')) return { packs: [
      { id: 'ta', file: 'packs/ta.json', enabled: true }
    ]};
    return { id: 'ta', name: 'Tamil Films', industry: 'TA', cards: [] };
  };
  const loader = new ContentLoader(fetcher);
  const cards = await loader.loadAllEnabled();
  expect(cards).toHaveLength(0);
});
```

- [ ] **Step 2: Run test — should already pass** (the current code handles empty cards arrays)

- [ ] **Step 3: Add getAvailableIndustries helper**

```typescript
static getAvailableIndustries(cards: Card[]): Industry[] {
  return [...new Set(cards.map(c => c.ind))];
}
```

This lets HomeScreen know which languages actually have cards (vs coming-soon).

- [ ] **Step 4: Write test for getAvailableIndustries**

```typescript
it('returns unique industries from card pool', () => {
  const cards = [
    { id: 'hi1', ind: 'HI' } as Card,
    { id: 'hi2', ind: 'HI' } as Card,
    { id: 'te1', ind: 'TE' } as Card,
  ];
  expect(ContentLoader.getAvailableIndustries(cards)).toEqual(['HI', 'TE']);
});
```

- [ ] **Step 5: Run tests**

```bash
npx vitest run tests/core/contentLoader.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/core/contentLoader.ts tests/core/contentLoader.test.ts
git commit -m "feat: handle empty packs + add getAvailableIndustries helper"
```

---

### Task 6: Update Existing Tests for New Industry Codes

**Files:**
- Modify: `tests/core/gameFSM.test.ts`
- Modify: `tests/core/deckBuilder.test.ts`
- Modify: `tests/core/scorer.test.ts`
- Modify: `tests/core/adaptive.test.ts`
- Modify: `tests/storage/localStorage.test.ts`

- [ ] **Step 1: Find all 'BW'/'TW' in test files**

```bash
grep -rn "'BW'\|'TW'" tests/
```

- [ ] **Step 2: Replace all instances**

Every `'BW'` → `'HI'`, every `'TW'` → `'TE'` in test files.

- [ ] **Step 3: Run full test suite**

```bash
npx vitest run
```

Expected: ALL pass.

- [ ] **Step 4: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/
git commit -m "test: update all test files from BW/TW to HI/TE industry codes"
```

---

### Task 7: Integration Verification

**Files:** None — verification only.

- [ ] **Step 1: Full typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 2: Full test suite**

```bash
npx vitest run
```

- [ ] **Step 3: Production build**

```bash
npx vite build
```

- [ ] **Step 4: Verify packs load correctly**

Start dev server, check that `/content/manifest.json` returns 4 packs, and `/content/packs/hi.json` returns Hindi cards with `"ind": "HI"`.

- [ ] **Step 5: Commit any remaining fixes**

```bash
git add -A
git commit -m "chore: integration verification for 4-language expansion"
```
