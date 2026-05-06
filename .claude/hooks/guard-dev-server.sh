#!/usr/bin/env bash
# PreToolUse guard — block npm build|test|lint|vitest while Vite dev is on :5173.
# Exit 2 blocks the tool call and surfaces stderr as the reason.
# Bypass: prefix the command with SEEDHAPLOT_FORCE=1.

set -euo pipefail

payload="$(cat || true)"
cmd="$(printf '%s' "$payload" | jq -r '.tool_input.command // ""')"

# Not a blocked command? Let it through.
if ! printf '%s' "$cmd" | grep -Eq '(^|[[:space:]]|&&|;|\|\|)npm([[:space:]]+run)?[[:space:]]+(build|test|lint|vitest)'; then
  exit 0
fi

# User opted out of the guard for this one call.
if printf '%s' "$cmd" | grep -q 'SEEDHAPLOT_FORCE=1'; then
  exit 0
fi

# Is the dev server running on 5173?
if ! lsof -nP -iTCP:5173 -sTCP:LISTEN >/dev/null 2>&1; then
  exit 0
fi

printf '%s\n' \
  "Blocked: vite dev is running on :5173. Running '$cmd' alongside it will starve the dev server." \
  "Fix: stop the dev server first, or rerun prefixed with SEEDHAPLOT_FORCE=1." >&2
exit 2
