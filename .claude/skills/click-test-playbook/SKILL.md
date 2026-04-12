---
name: click-test-playbook
description: MANDATORY after ANY UI change or bug fix — real user path testing via Playwright
---

## Triggers
MANDATORY after ANY UI change or bug fix. No exceptions.

## Pipeline

### 1. START
- npm run dev (Vite on localhost:5173)
- Wait for ready (curl localhost:5173)

### 2. REAL USER PATHS (Playwright or ui-comprehensive-tester agent)

**Path A — Solo Bollywood Party:**
Home → tap Bollywood → game starts → see card front → tap card → flip animation → card back → tap "Got it" → score increments → next card slides in → play 12 cards → results screen → correct count matches → verdict text → tap "Play Again" → home. Screenshot every step.

**Path B — Solo Tollywood Party:**
Same as A but Tollywood → emerald cards.

**Path C — Endless Mode:**
Home → toggle Endless → tap mode → lives show (3 dots) → get one wrong → 2 dots → get 3 wrong → game over → results with score. Screenshot every step.

**Path D — Multiplayer:**
Home → mode → add players sheet → add 2 → start → turn interstitial → card → flip → score → interstitial → next player → results leaderboard. Screenshot every step.

**Path E — Sheets & Navigation:**
Suggest sheet opens/closes. Feedback sheet opens/closes with tags. Community board tabs switch. Screenshot every step.

### 3. EDGE CASES
- Rapid tap card 5x → doesn't break
- Tap "Got it" before flip → nothing happens (or graceful)
- Rotate phone → layout holds
- Back button → doesn't crash

### 4. VERDICT
- Look at EVERY screenshot
- Ask: "What would someone at a party with 2 drinks think is wrong?"
- Any dead button, broken animation, confusing state = FAIL
- Only THEN claim it works

## CRITICAL RULE
Console logs and test output are NOT testing. If you didn't click it and screenshot it, you didn't test it.
