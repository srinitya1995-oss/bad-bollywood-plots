---
name: context-bridge
description: Shared context file for multi-agent coordination — use when dispatching 2+ agents
---

## Triggers
When dispatching 2+ agents that need to share findings.

## How It Works

1. Create `/tmp/seedhaplot-context-bridge.md` with:
   - Current goal / task description
   - Shared decisions made so far
   - File assignments (which agent owns which files — prevents conflicts)
   - Constraints and rules
   - Key findings from previous agents

2. Every dispatched agent:
   - Reads the context bridge at START of their task
   - Appends their findings at END of their task
   - Does NOT modify other agents' sections

3. Controller (main session):
   - Creates the bridge before dispatching
   - Collects and synthesizes findings after all agents complete
   - Cleans up the bridge file

## Template

```markdown
# Context Bridge — [Goal]
Created: [timestamp]

## Shared Decisions
- [decision 1]
- [decision 2]

## File Assignments
- Agent A owns: [files]
- Agent B owns: [files]

## Constraints
- [constraint 1]

## Findings
### Agent A
[to be filled by agent]

### Agent B
[to be filled by agent]
```

## Anti-patterns
- Dispatching 5+ agents on same bridge (too many cooks)
- Not assigning file ownership (merge conflicts)
- Agents modifying each other's findings
- Skipping the bridge for "simple" parallel work (simple work is where conflicts happen)
