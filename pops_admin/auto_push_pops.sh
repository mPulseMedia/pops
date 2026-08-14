#!/bin/bash
# auto_push_pops.sh — commit and push pops when files settle
# triggered by launchd WatchPaths; debounces 15s before committing

REPO="$HOME/claude_cowork/pops"
LOG="/tmp/autopush_pops.log"
COMMIT_MSG_FILE="$REPO/pops_admin/commit_msg.txt"
SETTLE=15

if [[ ! -d "$REPO/.git" ]]; then
  echo "$(date): ERROR — repo not found at $REPO" >> "$LOG"
  exit 1
fi

cd "$REPO" || exit 1
rm -f "$REPO/.git/index.lock" "$REPO/.git/HEAD.lock"

STATUS1=$(git status --porcelain 2>/dev/null)
if [[ -z "$STATUS1" ]]; then
  UNPUSHED=$(git log origin/main..HEAD --oneline 2>/dev/null)
  if [[ -n "$UNPUSHED" ]]; then
    git push origin main >> "$LOG" 2>&1 \
      && echo "$(date): pushed OK" >> "$LOG" \
      || echo "$(date): push FAILED" >> "$LOG"
  fi
  exit 0
fi

sleep $SETTLE

STATUS2=$(git status --porcelain 2>/dev/null)
if [[ "$STATUS1" != "$STATUS2" ]]; then
  echo "$(date): still in flux — deferring" >> "$LOG"
  exit 0
fi

COMMIT_MSG="auto_commit"
if [[ -f "$COMMIT_MSG_FILE" ]]; then
  M=$(cat "$COMMIT_MSG_FILE" | tr -d '\n')
  if [[ -n "$M" ]]; then COMMIT_MSG="$M"; fi
fi

git add -A >> "$LOG" 2>&1
git commit -m "$COMMIT_MSG" >> "$LOG" 2>&1
git push origin main >> "$LOG" 2>&1 \
  && echo "$(date): committed + pushed ($COMMIT_MSG)" >> "$LOG" \
  || echo "$(date): push FAILED" >> "$LOG"
