#!/bin/bash
# Email automation polling service
# Uses frequent polling as backup for IMAP IDLE (instant push)
# IDLE handles real-time; this catches anything IDLE misses

# Initial delay to let Next.js start
sleep 10

while true; do
  # Poll via the internal API (also starts IDLE listener on first call)
  result=$(curl -sf -X POST http://localhost:3000/api/email-automation/poll --max-time 25 2>&1) || true
  if [ -n "$result" ]; then
    # Only log if something happened or it's been a while
    emails=$(echo "$result" | grep -o '"emailsProcessed":[0-9]*' | grep -o '[0-9]*')
    if [ "$emails" != "0" ] && [ -n "$emails" ]; then
      echo "[$(date '+%H:%M:%S')] Poll result: $result"
    fi
  fi
  # Poll every 15 seconds (IDLE handles instant, this is safety net)
  sleep 15
done