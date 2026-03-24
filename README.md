# SMF Dashboard

[![SMF Works](https://img.shields.io/badge/SMF-Works-blue)](https://smfworks.com)
[![OpenClaw](https://img.shields.io/badge/Powered%20by-OpenClaw-green)](https://github.com/openclaw/openclaw)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive AI agent management dashboard for OpenClaw. Monitor, chat with, and manage your local AI agents, models, cron jobs, vector memory, and skills — all from a single local interface that runs entirely on your machine.

**Live Demo:** [smfworks.com/dashboard](https://smfworks.com/dashboard) (placeholder)

## Why SMF Dashboard?

Running AI agents locally shouldn't require juggling multiple terminal windows and configuration files. SMF Dashboard provides a unified, web-based interface for managing your entire OpenClaw setup — from agent spawning to model management to memory inspection.

**Key Benefits:**
- 🖥️ **Visual Management** - GUI for everything that used to require CLI commands
- 🔒 **Privacy First** - Runs entirely locally, no data leaves your machine
- ⚡ **Real-time Updates** - Live monitoring of agent status and system health
- 🛠️ **Skill Management** - Install, update, and configure skills with clicks
- 🧠 **Memory Inspection** - Browse vector memory and conversation history

## Features

### Agent Management
- Spawn new agents with customizable parameters
- Monitor active agent sessions with real-time status
- Chat directly with any running agent through the integrated chat panel
- View agent logs and conversation history
- Terminate or restart agents as needed

### Model Management
- Switch between local LLM models (Ollama, etc.)
- Configure model parameters (temperature, context window, etc.)
- Monitor model loading status and VRAM usage
- Support for multiple model backends

### Cron Job Scheduler
- Visual cron job management interface
- Create, edit, and delete scheduled tasks
- Monitor job execution history and logs
- Pause/resume scheduled jobs

### Vector Memory Browser
- Inspect vector database contents
- Search through embeddings and metadata
- View conversation context and memory associations
- Debug RAG (Retrieval-Augmented Generation) issues

### Skills Marketplace
- Browse available OpenClaw skills
- One-click installation from ClawHub
- Update skills to latest versions
- Configure skill settings through UI

### System Monitoring
- Real-time resource usage (CPU, RAM, GPU)
- OpenClaw gateway status monitoring
- Error logs and system alerts
- Update notifications

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui |
| State Management | React Context + Zustand |
| Icons | Lucide React |
| Fonts | Inter, Geist Mono |
| Build | Webpack (custom config) |

## Prerequisites

- **Node.js:** 18+ (20+ recommended)
- **OpenClaw:** Running locally with gateway enabled
- **OS:** Linux, macOS, or Windows with WSL

## Installation

### Option 1: Global Installation (Recommended)

Install SMF Dashboard as a global CLI tool:

```bash
# Install from npm
npm install -g @smfworks/dashboard

# Run the dashboard
openclaw-dashboard

# Or with options
openclaw-dashboard --port 3000 --host 127.0.0.1
```

### Option 2: Local Development

Clone and run from source:

```bash
# Clone the repository
git clone https://github.com/smfworks/smf-dashboard.git
cd smf-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

### Option 3: Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Configuration

SMF Dashboard auto-detects your OpenClaw installation. If needed, create a `.env.local` file:

```bash
# OpenClaw Gateway URL
OPENCLAW_GATEWAY_URL=ws://localhost:18789

# Dashboard port (default: 3000)
PORT=3000

# Host binding (default: 127.0.0.1)
HOST=127.0.0.1
```

## Project Structure

```
smf-dashboard/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Dashboard home
│   └── ...
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── sidebar.tsx       # Navigation sidebar
│   ├── header.tsx        # Top bar + chat panel
│   └── ...
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── public/               # Static assets
└── ...
```

## Usage Guide

### Getting Started

1. **Ensure OpenClaw is running:**
   ```bash
   openclaw gateway status
   # Should show: Gateway running on ws://127.0.0.1:18789
   ```

2. **Launch SMF Dashboard:**
   ```bash
   openclaw-dashboard
   ```

3. **Access the interface:**
   Open http://localhost:3000 in your browser

### Managing Agents

- Click "Agents" in the sidebar to see all running agents
- Click "Spawn Agent" to create a new agent session
- Use the chat panel to communicate with active agents
- View logs by clicking on any agent card

### Switching Models

1. Navigate to "Models" in the sidebar
2. Select your desired model from the dropdown
3. Configure parameters (temperature, max tokens, etc.)
4. Click "Apply" to switch the active model

### Installing Skills

1. Go to "Skills" in the sidebar
2. Browse available skills or search by name
3. Click "Install" on any skill
4. Configure skill settings as needed

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Open command palette |
| `Ctrl/Cmd + /` | Toggle chat panel |
| `Ctrl/Cmd + B` | Toggle sidebar |
| `Esc` | Close modals/panels |

## Troubleshooting

### Dashboard can't connect to OpenClaw

1. Verify OpenClaw gateway is running:
   ```bash
   openclaw gateway status
   ```
2. Check the gateway URL in settings matches your OpenClaw config
3. Ensure no firewall is blocking WebSocket connections

### Port already in use

```bash
# Use a different port
openclaw-dashboard --port 3001
```

### Build errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## Development

### Running Tests

```bash
# E2E tests with Playwright
npm run test:e2e

# Headed mode for debugging
npm run test:e2e:headed
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] Plugin system for custom dashboard widgets
- [ ] Advanced agent analytics and metrics
- [ ] Multi-user support with authentication
- [ ] Mobile app companion
- [ ] Integration with external LLM providers

## Related Projects

- [OpenClaw](https://github.com/openclaw/openclaw) - The AI agent platform that powers this dashboard
- [SMF Works](https://smfworks.com) - AI automation consulting and tools

## License

MIT License - See [LICENSE](./LICENSE) for details.

## Support

- **Issues:** [GitHub Issues](https://github.com/smfworks/smf-dashboard/issues)
- **Discussions:** [GitHub Discussions](https://github.com/smfworks/smf-dashboard/discussions)
- **Email:** michael@smfworks.com

---

*Built by SMF Works | Powered by OpenClaw*penClaw*