---
name: ui-playbook
description: Any visual change — new screen, restyle, animation, layout, typography, color, asset
---

## Triggers
Any visual change to the app — new screens, component restyling, animation tweaks, layout shifts, typography changes, color changes, new assets.

## Pipeline

### 1. BRAINSTORM (mandatory, even for "small" changes)
- Invoke superpowers:brainstorming
- Use creative-ux-designer skill (5-layer audit: usability → interaction → cognitive load → feel → systemic)
- Use ui-ux-pro-max skill for pattern reference
- Output: mockup HTML or description of change

### 2. MOCKUP (mandatory for new screens, optional for tweaks)
- creative-designer agent builds standalone HTML preview
- Self-critique gate — 5 questions before showing user:
  1. Would I screenshot this?
  2. Does ONE thing dominate?
  3. Does it feel like a Bollywood poster in a palace, or a Bootstrap template?
  4. Are the cards the hero?
  5. Would a drunk person at a party figure this out in 2 seconds?
- If ANY answer is "no" → redesign, don't show
- User approves mockup before any code

### 3. IMPLEMENT
- frontend-design skill (production-grade, no generic AI aesthetic)
- composition-patterns skill (compound components, flexible APIs)
- micro-interactions skill (hover, loading, transitions, feedback)
- mobile-first-layout skill (phone-at-party is primary device)
- TDD where testable (superpowers:test-driven-development)

### 4. VISUAL GATE (blocking)
- seedhaplot-visual-qa agent scores changed screen(s)
- Score must be >= 7.0 to pass
- If score dropped from previous → REGRESSION, must fix
- Scores written to .project-state.md with trend

### 5. ACCESSIBILITY GATE
- accesslint:reviewer agent (full WCAG audit)
- accesslint:contrast-checker (color pairs against aubergine bg)
- accesslint:use-of-color (not relying on color alone)
- aria-implementation skill (keyboard nav, focus management)
- All AA violations are blocking

### 6. CLICK TEST (mandatory)
- click-test-playbook on affected flow
- Screenshots before + after
- Every interactive element clicked and verified

## Anti-patterns
- Skipping brainstorm for "just a color change"
- Self-reviewing your own UI (use seedhaplot-visual-qa)
- Implementing before mockup approval
- Testing on desktop only (this is a phone game)
