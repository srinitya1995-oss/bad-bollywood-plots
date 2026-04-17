#!/usr/bin/env bash
# PreToolUse hook on Edit|Write. Block if the new content contains em-dashes.
# User's standing rule: never write em-dashes. Use periods, colons, commas.
# Bypass: include "EMDASH-OK" literal anywhere in the content.

set -u
payload="$(cat || true)"

# Extract new_string / content / updates depending on tool
body="$(printf '%s' "$payload" | jq -r '
  .tool_input.new_string //
  .tool_input.content //
  (.tool_input.edits // [] | map(.new_string) | join("\n")) //
  ""
')"

if [ -z "$body" ]; then exit 0; fi

# Bypass marker
if printf '%s' "$body" | grep -q 'EMDASH-OK'; then exit 0; fi

# Check for em-dash character. Using unicode escape.
if printf '%s' "$body" | grep -q $'\xe2\x80\x94'; then
  printf '%s\n' \
    "Blocked: content contains em-dashes. User rule: never use em-dashes. Use periods, colons, or commas." \
    "Bypass: include 'EMDASH-OK' in the content if intentional (e.g. pasting upstream). Otherwise rewrite." >&2
  exit 2
fi

exit 0
