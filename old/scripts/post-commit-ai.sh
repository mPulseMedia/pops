#!/bin/sh
set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
LOG_FILE="$REPO_ROOT/saved/commit-log.txt"
WEBHOOK_URL="${AI_WEBHOOK_URL:-}"

COMMIT_SHA="$(git rev-parse HEAD)"
COMMIT_MSG="$(git log -1 --pretty=%B)"
TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

mkdir -p "$REPO_ROOT/saved"

cat >> "$LOG_FILE" <<EOF
[$TIMESTAMP] $COMMIT_SHA
$COMMIT_MSG

EOF

if [ -n "$WEBHOOK_URL" ]; then
  curl -sS -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{\"commit\":\"$COMMIT_SHA\",\"message\":\"$COMMIT_MSG\",\"timestamp\":\"$TIMESTAMP\"}" \
    >/dev/null || true
fi
