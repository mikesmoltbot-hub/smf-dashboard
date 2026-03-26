# Auto-Start SMF Dashboard on Boot

Start the dashboard automatically after a system reboot using a simple cron `@reboot` entry.

## Prerequisites

- **Node.js + npm** installed (NVM is supported and auto-detected)
- **Dashboard repo** cloned (default: `~/projects/smf-dashboard`)
- Access to edit your user crontab (`crontab -e`)

## Quick Setup (3 steps)

### 1. Make the launcher executable

```bash
chmod +x scripts/start-dashboard.sh
```

### 2. Add the cron entry

```bash
# Open your crontab
crontab -e

# Add this line at the bottom:
@reboot /path/to/smf-dashboard/scripts/start-dashboard.sh
```

Replace `/path/to/smf-dashboard` with the actual path to your cloned repo.

**Example:**
```
@reboot /home/youruser/projects/smf-dashboard/scripts/start-dashboard.sh
```

### 3. Verify after reboot

```bash
# Check the process is running
ps -ef | grep 'npm run dev'

# Check logs
tail -f ~/logs/smf-dashboard.log

# Test the dashboard
curl -s http://localhost:3000/
```

## Configuration

The launcher script supports environment variables for customization:

| Variable | Default | Description |
|----------|---------|-------------|
| `DASHBOARD_DIR` | `~/projects/smf-dashboard` | Path to dashboard repo |
| `LOG_DIR` | `~/logs` | Directory for log files |
| `NVM_DIR` | `~/.nvm` | NVM installation directory |

**Example with custom paths:**
```
@reboot DASHBOARD_DIR=/opt/smf-dashboard LOG_DIR=/var/log/smf /opt/smf-dashboard/scripts/start-dashboard.sh
```

## How It Works

1. Cron runs the launcher script at system boot (`@reboot`)
2. The script loads NVM (if present) to ensure `npm` is available
3. Starts `npm run dev` in the background with `nohup`
4. Logs output to `~/logs/smf-dashboard.log`
5. The dashboard is available at `http://localhost:3000`

## Troubleshooting

**Dashboard doesn't start after reboot:**
- Check cron logs: `grep CRON /var/log/syslog` or `journalctl -u cron`
- Check dashboard logs: `cat ~/logs/smf-dashboard.log`
- Ensure `npm` is in the PATH — the script loads NVM automatically, but verify your NVM setup is correct

**Port already in use:**
- Another process is using port 3000. Kill it: `lsof -i :3000` then `kill <PID>`

**Logs not appearing:**
- Ensure `~/logs/` exists (the script creates it, but check permissions)

## Alternative: systemd Service

For production deployments, a systemd service provides better process management (auto-restart on crash, journal integration). See your system admin or create a service file at `/etc/systemd/system/smf-dashboard.service`.
