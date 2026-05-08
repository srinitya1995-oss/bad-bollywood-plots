#!/usr/bin/env bash
set -euo pipefail

# Layer 3 of 3: local pre-deploy guard.
# Aborts before a Vercel CLI deploy if the working directory is not actually
# the bad-bollywood-plots repo. Prevents the failure mode where someone runs
# `vercel --prod` from a directory with this project's .vercel/project.json
# but a different source tree.

EXPECTED_PROJECT_ID="prj_ALj8dUIilfcTUksn559FA97FLid7"
EXPECTED_PROJECT_NAME="bad-desi-plots"
EXPECTED_PACKAGE_NAME="seedhaplot"
EXPECTED_GIT_REMOTE="https://github.com/srinitya1995-oss/bad-bollywood-plots.git"

cd "$(dirname "$0")/.."

fail() {
  echo "" >&2
  echo "  pre-deploy check failed for: $EXPECTED_PROJECT_NAME" >&2
  echo "  reason: $1" >&2
  echo "" >&2
  echo "  if you meant to deploy a different project, cd to that repo first." >&2
  echo "  if this repo is genuinely the right one, fix the mismatch above." >&2
  echo "" >&2
  exit 1
}

[ -f .vercel/project.json ] || fail "no .vercel/project.json (run 'vercel link' first)"
actual_id=$(jq -r .projectId .vercel/project.json)
actual_name=$(jq -r .projectName .vercel/project.json)
[ "$actual_id" = "$EXPECTED_PROJECT_ID" ] || fail "linked Vercel project id is $actual_id, expected $EXPECTED_PROJECT_ID ($EXPECTED_PROJECT_NAME)"

[ -f package.json ] || fail "no package.json"
actual_pkg=$(jq -r '.name // ""' package.json)
[ "$actual_pkg" = "$EXPECTED_PACKAGE_NAME" ] || fail "package.json name is '$actual_pkg', expected '$EXPECTED_PACKAGE_NAME'"

actual_remote=$(git config --get remote.origin.url 2>/dev/null || echo "")
[ "$actual_remote" = "$EXPECTED_GIT_REMOTE" ] || fail "git origin is '$actual_remote', expected '$EXPECTED_GIT_REMOTE'"

echo "  pre-deploy check passed: $EXPECTED_PROJECT_NAME"
