#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/home/mutungamiri/Projects/NexusZim2"
NPM="/home/mutungamiri/.nvm/versions/node/v22.22.0/bin/npm"
PORT=8080

cd "$PROJECT_DIR"

printf '\n'
printf '╔══════════════════════════════════════════════════╗\n'
printf '║              NexusZim Dev Server                 ║\n'
printf '╠══════════════════════════════════════════════════╣\n'
printf '║  Starting... please wait                         ║\n'
printf '╚══════════════════════════════════════════════════╝\n'
printf '\n'

# Start dev server, log output
LOGFILE="/tmp/nexuszim-dev.log"
"$NPM" run dev > "$LOGFILE" 2>&1 &
SERVER_PID=$!

# Wait for vite to print the Local URL
for i in {1..40}; do
  sleep 1
  URL=$(grep -oP 'Local:\s+\Khttp://localhost:\d+' "$LOGFILE" | tail -1)
  if [ -n "$URL" ]; then
    printf "  ✓  Server ready: %s\n\n" "$URL"
    xdg-open "$URL"
    break
  fi
done

# Keep terminal open showing live server output
tail -f "$LOGFILE" &
wait $SERVER_PID
