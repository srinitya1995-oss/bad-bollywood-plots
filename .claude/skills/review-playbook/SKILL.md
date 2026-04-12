---
name: review-playbook
description: Validate current state of all screens — start of session, before ship, after batch changes
---

## Triggers
Start of session, before ship, after a batch of changes, user asks "what's the state?"

## Pipeline

### 1. VISUAL SWEEP
- seedhaplot-visual-qa agent in "full sweep" mode
- Screenshot ALL 16 screen states:
  1. Home (default)
  2. Home (returning)
  3. Game — BW card front
  4. Game — card back
  5. Game — TW card front
  6. Game — scoring buttons
  7. Game — card transition
  8. Endless — lives display
  9. Multiplayer — turn interstitial
  10. Results (solo)
  11. Results (multiplayer)
  12. Results (endless, new high score)
  13. Feedback sheet
  14. Suggest sheet
  15. Community board — scores
  16. Community board — suggestions
- Score each against desi maximalist rubric
- Any screen below 5.0 is BLOCKING

### 2. REALITY CHECK
- karen agent: compare claimed state vs actual state
- Check .project-state.md accuracy — are scores real? Are "completed" items done?

### 3. CODE QUALITY
- code-quality-pragmatist agent: scan for over-engineering, dead code, unnecessary abstractions

### 4. UPDATE STATE
- Write all scores to .project-state.md with trends
- Flag regressions (score drops)
- Update open issues list
- Prioritize P0/P1/P2
