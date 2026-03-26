#!/bin/bash
# Install SMF Dashboard as a systemd service (production)
# Run with sudo: sudo ./scripts/install-service.sh
# See docs/production-systemd.md for full instructions.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DASHBOARD_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVICE_NAME="smf-dashboard"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
TEMPLATE="$SCRIPT_DIR/smf-dashboard.service"

# Detect the user who owns the dashboard directory
DASH_USER="$(stat -c '%U' "$DASHBOARD_DIR")"

echo "=== SMF Dashboard Service Installer ==="
echo ""
echo "  Dashboard dir : $DASHBOARD_DIR"
echo "  Run as user   : $DASH_USER"
echo "  Service file  : $SERVICE_FILE"
echo ""

# Check we're root
if [ "$EUID" -ne 0 ]; then
  echo "Error: This script must be run with sudo."
  echo "Usage: sudo $0"
  exit 1
fi

# Build production assets first
echo "[1/4] Building production assets..."
sudo -u "$DASH_USER" bash -lc "cd '$DASHBOARD_DIR' && npm run build"

# Generate service file from template
echo "[2/4] Installing systemd service..."
sed \
  -e "s|__USER__|$DASH_USER|g" \
  -e "s|__DASHBOARD_DIR__|$DASHBOARD_DIR|g" \
  "$TEMPLATE" > "$SERVICE_FILE"

chmod 644 "$SERVICE_FILE"

# Reload and enable
echo "[3/4] Enabling service..."
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"

# Start
echo "[4/4] Starting service..."
systemctl start "$SERVICE_NAME"

echo ""
echo "✅ SMF Dashboard service installed and running."
echo ""
echo "Useful commands:"
echo "  systemctl status $SERVICE_NAME    # Check status"
echo "  journalctl -u $SERVICE_NAME -f    # Follow logs"
echo "  systemctl restart $SERVICE_NAME   # Restart"
echo "  systemctl stop $SERVICE_NAME      # Stop"
echo ""
echo "Dashboard available at http://localhost:3000"
