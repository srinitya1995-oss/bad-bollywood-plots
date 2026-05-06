# Claude Code Setup

> Read this first if you're picking up the build in Claude Code.

## TL;DR — what's required

**Nothing.** This handoff is self-contained. Claude Code with default tooling (filesystem, terminal, web fetch) can ship the whole thing.

The brief is narrow: *render 1080×1350 PNGs from a card JSON, on a schedule.* Don't let it grow.

---

## What's in this bundle

The handoff has the full spec, the JSX components, color/type tokens, and reference PNGs. Claude Code can read those and either:

- **(a)** scaffold a Next.js (or plain Vite + React) page that renders the templates + screenshots them with Playwright, or
- **(b)** build a Python/Pillow (or Node/Sharp) generator that reads `cards.json` and outputs PNGs directly.

Both are valid. Pick the one that fits the team's existing stack. **No special MCPs or skills are required for either path.**

---

## Strongly recommended (will materially improve output)

### 1. Playwright MCP

For converting HTML templates → 1080×1350 PNGs in CI / on demand. Without this, you're hand-screenshotting in a browser. The standard pick is the official [Playwright MCP server](https://github.com/microsoft/playwright-mcp).

With it, *"regenerate this week's 7 posts from cards.json"* becomes one command.

If you go path (b) (Python/Pillow), you don't need this.

### 2. Filesystem MCP

Already built into Claude Code. Just **point CC at the `design_handoff_instagram_system/` folder** so it has the spec + JSX + reference PNGs as ground truth, not just the README.

### 3. A "designer" agent persona

Add a small markdown file at `.claude/agents/designer.md` in your repo. Twenty lines is enough. It should say:

- Match the reference PNGs in `screenshots/` pixel-by-pixel.
- Never change colors. Tokens in `README.md § Design tokens` are final.
- Never add gradients, soft shadows, or rounded corners that aren't in the spec.
- Never invent film stills, character art, or AI imagery. Type carries the load.
- Captions are **lower-case, deadpan**. No exclamation marks. No emoji except the occasional 🔥.
- BW = pink, TW = emerald. Template D is the **only** place they coexist.

This stops the "let me improve this" drift Claude Code is prone to on visual work — adding subtle gradients, "modernizing" the type, softening the corners.

---

## Nice to have, not necessary

### Image-diff tool

A CLI like [`pixelmatch`](https://github.com/mapbox/pixelmatch) so CC can verify its rendered output matches the reference PNGs in `screenshots/` and self-correct. Useful in a `post-render` hook.

### Instagram Graph API credentials

Only if you want CC to **post** the assets too, not just generate them. Otherwise just upload by hand — single posts and carousels can both be drag-dropped into the IG mobile app.

---

## What you do *not* need

- ❌ Custom MCP servers
- ❌ Custom skills or slash commands
- ❌ A repo template or starter
- ❌ Any backend, database, or auth layer
- ❌ A CMS — `cards.json` *is* the CMS
- ❌ Image generation models — type-only system, no AI imagery

---

## Suggested first prompt to Claude Code

> Read `design_handoff_instagram_system/README.md` and the JSX components in `ig/`. The reference PNGs in `screenshots/` are the visual ground truth — treat them as final.
>
> Build a small Next.js app (or Python/Pillow generator — propose one and explain why) that reads `cards.json` and renders Template A as a 1080×1350 PNG. Start with one card. We'll add the other templates and the carousel after that works end-to-end.
>
> Do not change the design. If something looks wrong, the spec wins, not your taste.

The last sentence is load-bearing.
