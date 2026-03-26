#!/bin/bash
# Auto-start SMF Dashboard on system boot (via cron @reboot)
# See docs/auto-start.md for setup instructions.
set -euo pipefail

LOG_DIR="${LOG_DIR:-$HOME/logs}"
LOG_FILE="$LOG_DIR/smf-dashboard.log"

# Default: assume repo is in $HOME/projects/smf-dashboard
# Override with DASHBOARD_DIR env var if needed
WORK_DIR="${DASHBOARD_DIR:-$HOME/projects/smf-dashboard}"

# Ensure log dir exists
mkdir -p "$LOG_DIR"

# Load NVM if installed (needed when running from cron context)
NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
fi

cd "$WORK_DIR"

export NODE_ENV=production

nohup npm run dev > "$LOG_FILE" 2>&1 &

echo "SMF Dashboard started (PID $!) — logs at $LOG_FILE"
