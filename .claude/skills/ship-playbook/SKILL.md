---
name: ship-playbook
description: Before any deploy to production, push to main, or sharing with anyone
---

## Triggers
Before any deploy, push to main, or sharing.

## Pipeline

### 1. RUN REVIEW PLAYBOOK (full)
All screens scored, no blockers.

### 2. PERFORMANCE AUDIT
- Lighthouse PWA audit (must score 90+ on Performance, Accessibility, Best Practices, PWA)
- Bundle size check (vite build, check dist/)
- Service worker verification (offline, cache strategy)
- First paint < 2s on 3G throttle

### 3. CONTENT AUDIT
- card-quality playbook on full cards.json
- No broken cards, no duplicates, difficulty balanced

### 4. INTEGRATION GATE
- npm run typecheck passes
- npm run test passes
- npm run build succeeds
- npm run lint passes (no errors)

### 5. PRE-DEPLOY CHECKLIST
- .env variables for production Supabase
- OG image / meta tags / manifest.json correct
- PWA installable on mobile
- Share text generates correctly

### 6. SHIP
- superpowers:finishing-a-development-branch
- Merge strategy, PR or direct push, cleanup
