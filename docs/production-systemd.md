# Production Deployment with systemd

Run the SMF Dashboard as a managed systemd service with automatic restart on crash and boot.

## Why systemd?

| Feature | Cron @reboot | systemd |
|---------|-------------|---------|
| Auto-start on boot | ✅ | ✅ |
| Auto-restart on crash | ❌ | ✅ |
| Centralized logs (journalctl) | ❌ | ✅ |
| Status / health checks | ❌ | ✅ |
| Clean stop / restart | Manual | `systemctl restart` |

**Use cron** for quick dev setups. **Use systemd** for production.

## Quick Install (one command)

```bash
sudo ./scripts/install-service.sh
```

This script will:
1. Build production assets (`npm run build`)
2. Install the systemd unit file
3. Enable the service (auto-start on boot)
4. Start the dashboard

## Manual Setup

If you prefer to set things up yourself:

### 1. Build for production

```bash
npm run build
```

### 2. Copy the service file

```bash
# Edit the template to replace placeholders
sudo cp scripts/smf-dashboard.service /etc/systemd/system/smf-dashboard.service

# Edit the file — replace __USER__ and __DASHBOARD_DIR__
sudo nano /etc/systemd/system/smf-dashboard.service
```

Replace:
- `__USER__` → your username (e.g., `mikesai1`)
- `__DASHBOARD_DIR__` → full path to the dashboard repo (e.g., `/home/mikesai1/projects/smf-dashboard`)

### 3. Enable and start

```bash
sudo systemctl daemon-reload
sudo systemctl enable smf-dashboard
sudo systemctl start smf-dashboard
```

### 4. Verify

```bash
# Check status
systemctl status smf-dashboard

# Follow logs
journalctl -u smf-dashboard -f

# Test the dashboard
curl -s http://localhost:3000/
```

## Managing the Service

```bash
# Check status
systemctl status smf-dashboard

# View logs (last 50 lines)
journalctl -u smf-dashboard -n 50

# Follow logs in real-time
journalctl -u smf-dashboard -f

# Restart after code changes
sudo systemctl restart smf-dashboard

# Stop
sudo systemctl stop smf-dashboard

# Disable auto-start
sudo systemctl disable smf-dashboard
```

## Updating the Dashboard

After pulling new code:

```bash
cd /path/to/smf-dashboard
git pull
npm run build
sudo systemctl restart smf-dashboard
```

## Changing the Port

Edit the service file:

```bash
sudo systemctl edit smf-dashboard
```

Add an override:

```ini
[Service]
Environment=PORT=8080
```

Then restart:

```bash
sudo systemctl restart smf-dashboard
```

## Uninstalling

```bash
sudo systemctl stop smf-dashboard
sudo systemctl disable smf-dashboard
sudo rm /etc/systemd/system/smf-dashboard.service
sudo systemctl daemon-reload
```

## Troubleshooting

**Service fails to start:**
- Check logs: `journalctl -u smf-dashboard -n 100`
- Verify `npm` is available: the service uses `bash -l` to load your shell profile (including NVM)
- Ensure `npm run build` completed successfully

**Port conflict:**
- Another process is using port 3000: `lsof -i :3000`
- Change the port via the `PORT` environment variable (see above)

**Permission denied:**
- Ensure the `User=` in the service file matches the owner of the dashboard directory
- The install script auto-detects this from the directory owner
