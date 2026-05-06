# Seedha Plot. Skills & Agents Index

> Curated map of which skill / agent / MCP to reach for, organized by project phase and by axis. Read before starting any task. If what you need isn't here, add it.

---

## Quick lookup. by axis

### Efficiency
| Reach for | When |
|---|---|
| `superpowers:dispatching-parallel-agents` | 2+ independent subtasks. don't serialize |
| `superpowers:subagent-driven-development` | Plan exists, execute task-by-task with fresh subagents |
| `superpowers:using-git-worktrees` | Feature work that could corrupt current tree |
| `iterative-retrieval` | Subagent context is getting bloated |
| `fewer-permission-prompts` | Prompt nags are slowing you down |
| `webapp-testing` | Kill ad-hoc puppeteer. use Playwright skill instead |
| `cost-aware-llm-pipeline` | Budgeting LLM calls in `scripts/generate.js` |

### Personas (invoke as agents)
| Agent | Use for |
|---|---|
| `Jenny` | First-time-user confusion check |
| `karen` | Harsh reality check before ship |
| `seedhaplot-visual-qa` | Screenshot-based design audit (7-dim rubric) |
| `seedhaplot-player-simulator` | 50-persona playthrough (6 modes) |
| `seedhaplot-panel` | Pre-ship multi-agent review |
| `seedhaplot-card-auditor` | House-voice / guessability audit on cards |
| `seedhaplot-fact-checker` | Cross-ref card facts against Wikipedia |
| `code-quality-pragmatist` | Pragmatic PR review |
| `task-completion-validator` | Verify "done" claims |
| `superpowers:code-reviewer` | Thorough post-step review |
| `ui-comprehensive-tester` | Cross-device UI testing (fallback when visual-qa busy) |
| `accesslint:reviewer` | WCAG audit |
| `documentation-expert` | README / doc updates |
| `Explore` | Broad codebase exploration |
| `Plan` | Task decomposition |

### Personas (invoke as skills. the session adopts the lens)
| Skill | Lens |
|---|---|
| `business-consultant` | Market sizing, GTM, monetization |
| `prd-generator` | PM intake. messy idea → PRD |
| `user-story-writer` | Sprint-ready INVEST stories |
| `senior-fullstack`, `senior-backend`, `senior-qa` | Engineering specialists |
| `ai-agents-architect` | Multi-agent flows / AI features |
| `senior-prompt-engineer` | Prompt design for `scripts/generate.js` |
| `customer-support` | Player-support tone |

### Context management
| Skill / file | Purpose |
|---|---|
| `superpowers:writing-plans` | Durable handoff. saves to `docs/superpowers/plans/` |
| `superpowers:executing-plans` | Batch execution with checkpoints |
| `context-bridge` (project-local) | Shared file for multi-agent coordination |
| `superpowers:brainstorming` | MANDATORY before any creative work |
| `doc-coauthoring` | Structured docs workflow |
| `iterative-retrieval` | Subagent context refinement |
| `.project-state.md` | Cross-session state (read on session start, update per checkpoint) |
| `.session-log.md` | Rolling log appended by session-log hook |
| `MEMORY.md` (auto-memory) | Cross-session personal memories |
| `skill-stocktake` | Audit which skills you're actually using |

### Writing. copy & marketing
| Skill | Use |
|---|---|
| `copywriting` | Landing page, results screen punchlines, CTAs |
| `avoid-ai-writing` | Audit copy for AI-isms before ship |
| `storybrand-messaging` | Brand narrative. hero = player |
| `made-to-stick` | SUCCESs checklist for cards + landing |
| `contagious` | STEPPS word-of-mouth. critical for a party game |
| `influence-psychology` | Cialdini's 6 on CTAs |
| `one-page-marketing` | Full funnel plan |
| `scorecard-marketing` | Quiz-funnel pattern (game IS one) |
| `hundred-million-offers` | If we monetize later |

### Writing. content ops
| Skill | Use |
|---|---|
| `seo-content-writer` | Blog posts for SEO |
| `meta-tags-optimizer` | OG tags, Twitter cards |
| `schema-markup-generator` | JSON-LD rich results |
| `technical-seo-checker` | Core Web Vitals audit |
| `on-page-seo-auditor` | HTML audit |
| `content-refresher` | Refresh old posts |
| `geo-content-optimizer` | AI citations (ChatGPT/Perplexity) |
| `internal-linking-optimizer` | Site architecture |

### Writing. release & comms
| Skill | Use |
|---|---|
| `release-notes-pro` | Changelog page copy |
| `changelog-automation` + `changelog-generator` | Auto-gen from commits |
| `launch-strategy` | Reddit + wider launch |
| `email-sequence` | Player nurture |
| `internal-comms` | Build-in-public updates |

### Writing. docs & prompts
| Skill | Use |
|---|---|
| `doc-coauthoring` | PRDs, specs, decision docs |
| `prompt-engineering` + `senior-prompt-engineer` | generate.js prompts |
| `superpowers:writing-skills` | Authoring new skills |
| `skill-development` + `skill-creator` | Modify / measure skills |

### Writing. code
| Skill | Use |
|---|---|
| `clean-code`, `coding-standards` | Baseline hygiene |
| `refactoring-patterns` | Named transformations |
| `composition-patterns` | React composition (gameInstance God Object) |
| `refactoring-ui` | Visual hierarchy fixes |
| `emil-design-eng` | Animation polish |
| `react-best-practices` | Rendering / bundle rules |
| `tailwind-patterns` | CSS v4 patterns (if migrated) |
| `software-design-philosophy` | Module design, information hiding |

---

## By project phase

### 1. Design & prototyping
- `superpowers:brainstorming` (gate before any UI concept)
- `creative-ux-designer` skill + `designer` agent (general-purpose design partner)
- `pebl-designer` agent (mockup-first HTML → self-check → React pattern. still the best template)
- `frontend-design`, `refactoring-ui`, `ui-refactor`, `top-design`
- `microinteractions`, `emil-design-eng`, `design-everyday-things`

### 2. v8 React port
- `react-best-practices`, `composition-patterns`, `tailwind-patterns`
- `webapp-testing` for verification between commits
- `superpowers:writing-plans` for the port sequence
- `quality-gates` to hit the four gates in CLAUDE.md §5

### 3. Card content
- `seedhaplot-card-auditor` agent (house-voice + guessability)
- `seedhaplot-fact-checker` agent (Wikipedia cross-ref)
- `card-quality` project-local skill
- `copywriting` + `avoid-ai-writing`
- `prompt-engineering` for `scripts/generate.js`

### 4. Visual / UX QA
- `seedhaplot-visual-qa` (primary)
- `ui-comprehensive-tester` (fallback)
- `webapp-testing` skill (the Playwright toolkit)
- `click-test-playbook` project-local
- `accesslint:reviewer`

### 5. Pre-ship
- `seedhaplot-panel` (12-agent panel)
- `karen` + `Jenny` for adversarial / naive lenses
- `seedhaplot-player-simulator` (50 personas, 6 modes)
- `ship-playbook` project-local
- `quality-gates` binary gates

### 6. Launch & growth
- `launch-strategy`. Reddit + wider
- `viral-generator-builder`. shareable results
- `contagious`. STEPPS
- `hooked-ux`. Hook Model for retention
- `scorecard-marketing`. quiz-funnel framing
- `onboarding-cro`. aha moment in first 30s
- `one-page-marketing`. full funnel

### 7. Post-launch analytics
- PostHog MCP. `query-run`, `feature-flag-*`, `survey-*`, `experiment-*`, `cohorts-*`, `error-tracking-issues-*`, `annotation-create`
- `analytics-tracking` skill. event taxonomy audit
- `improve-retention`. B=MAP
- `churn-prevention`

### 8. Infra / harness
- `update-config`. settings.json hooks
- `fewer-permission-prompts`. scan transcripts, allowlist
- `keybindings-help`. customize keys

---

## MCPs. how to actually use them on seedhaplot

### PostHog (LIVE)
| Tool | Use |
|---|---|
| `query-run` | HogQL funnel analysis over real player events |
| `feature-flag-get-all` / `create-feature-flag` / `update-feature-flag` | `endless_mode_enabled`, `solo_mode_enabled`, `settings_screen_enabled`, `report_flow_v2` |
| `survey-create` / `survey-stats` | In-app feedback (replace hand-rolled FeedbackSheet later) |
| `experiment-*` | A/B tests. card order, scoring weights, UI variants |
| `cohorts-create` / `cohorts-list` | Returning vs first-time segments |
| `error-tracking-issues-list` | Runtime player errors |
| `insight-create` / `insights-list` | Dashboards |
| `annotation-create` | Mark deploys on dashboards |
| `event-definitions-list` | Audit current event taxonomy |

### Vercel (LIVE but they deploy to Netlify. skip)

### Gmail / Calendar / Drive (LIVE, not relevant)

### Disconnected this session (reconnect when needed)
- `magic` (21st Dev). `21st_magic_component_builder` for generating v8 React components from spec
- `accesslint`. `analyze_color_pair`, `calculate_contrast_ratio` for tomato-on-cream etc.
- `memory`. knowledge graph (alt to MEMORY.md)
- `sequential-thinking`. complex debug reasoning
- `any-chat`. cross-LLM consultation

---

## Native tools I should actually use (underused)

- `TaskCreate` / `TaskUpdate`. track multi-step work, not just claim it
- `Monitor`. watch dev server / build logs for errors while testing (streaming)
- `WebFetch` / `WebSearch`. fact-check card data, research references
- `EnterWorktree` / `ExitWorktree`. isolated worktrees for risky refactors
- `AskUserQuestion`. structured Q&A (vs ad-hoc "which do you want")
- `CronCreate` / `schedule` skill. scheduled reviews (weekly visual-QA sweep)

---

## Golden rules baked into this index

1. **Screenshot before claim.** `seedhaplot-visual-qa` or `webapp-testing` run BEFORE any "looks good" statement.
2. **Never run npm build | test | lint while dev server is live.** The guard-dev-server.sh hook will block it.
3. **Use TaskCreate for ≥3 steps.** No more silent multi-step work.
4. **Verify before completion.** `superpowers:verification-before-completion` is the gate on "done" claims.
5. **No prod push without explicit per-action approval.** See `feedback_seedhaplot_no_prod_push.md`.
6. **Context reset → read this file first.**

---

*Last curated: 2026-04-17. If you added a skill or MCP this session and it belongs here, edit this file.*
