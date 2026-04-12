---
name: plan-playbook
description: Multi-step implementation work — new feature, architecture change, migration, anything > 3 files
---

## Triggers
Multi-step work: new feature, architecture change, migration, anything touching > 3 files.

## Pipeline

### 1. PLAN
- superpowers:writing-plans (creates implementation plan doc)
- User approves plan

### 2. EXECUTE
- superpowers:subagent-driven-development (sequential handoffs) — recommended
- OR superpowers:dispatching-parallel-agents (if tasks independent)
- Review checkpoint after each task
- context-bridge skill if 2+ agents need shared state

### 3. GATE
- After all tasks: run review-playbook
- After all tasks: run click-test-playbook on affected flows
