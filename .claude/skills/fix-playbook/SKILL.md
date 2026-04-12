---
name: fix-playbook
description: Any bug fix, test failure, unexpected behavior, console error, user complaint
---

## Triggers
Bug report, test failure, unexpected behavior, console error, user complaint.

## Pipeline

### 1. DIAGNOSE
- superpowers:systematic-debugging (4-phase: observe → hypothesize → test → conclude)
- sequential-thinking MCP for complex multi-step reasoning
- Read error logs, reproduce the bug, identify root cause
- Output: root cause statement + proposed fix

### 2. IMPLEMENT
- TDD: write failing test FIRST that reproduces the bug
- Fix the code
- Test passes
- Check for side effects: grep all consumers of changed code, verify each

### 3. REALITY CHECK (mandatory)
- karen agent: "Did you actually fix this or just suppress the error?"
- karen checks: does the test actually test the bug? Is the fix minimal? Did you introduce new issues?

### 4. VERIFY
- superpowers:verification-before-completion
- Run full test suite (npm run test)
- Run typecheck (npm run typecheck)
- If UI was affected → click-test-playbook
- If card data was affected → card-quality playbook

### 5. REGRESSION CHECK
- Test ALL dependent features, not just the one you fixed
- Grep consumers of changed functions/components
- Verify each consumer still works

## Anti-patterns
- Fixing symptoms instead of root cause
- Skipping the failing test (you'll re-introduce the bug later)
- Only testing the happy path after a fix
- Claiming fixed without running karen
