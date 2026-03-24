# SMF Dashboard — Modular Architecture Plan

**Project:** smf-dashboard (https://github.com/smfworks/smf-dashboard)  
**Vision:** Modular dashboard where plugins (CMS, Lead Capture, SEO) plug into a shared baseline  
**Last Updated:** 2026-03-24

---

## Research: Existing OpenClaw Dashboards

### 1. tugcantopaloglu/openclaw-dashboard ⭐
**Stack:** Next.js + TypeScript + Tailwind  
**Highlights:**
- Auth with TOTP MFA, rate limiting, security hardening
- Real-time session monitoring, live feed of agent messages
- Cost tracking by model, rate limit monitoring
- Memory viewer, file manager with security
- System health (CPU, RAM, disk, temperature)
- Docker management, service control
- Cron management, log viewer
- Activity heatmap, streak tracking
- 6 built-in themes (dark/light)
- Browser notifications
- Config editor with JSON validation

**Lessons:** Feature-rich but monolithic. Everything included, no plugin system.

---

### 2. mudrii/openclaw-dashboard ⭐
**Stack:** Go backend + Pure HTML/CSS/JS frontend (zero dependencies)  
**Highlights:**
- Pure SVG charts (no chart library dependency)
- 6 themes (Midnight, Nord, Catppuccin Mocha dark; GitHub, Solarized, Catppuccin Latte light)
- Glass morphism UI
- AI Chat via OpenClaw gateway (natural language queries)
- Sub-agent activity tracking
- Cost forecasting
- Multiple OpenClaw instance support
- Zero npm/framework dependencies on frontend
- Cross-platform (macOS + Linux)

**Lessons:** Radical simplicity — single HTML file + Go binary. Extremely portable. No build step.

---

### Key Takeaways from Research

1. **Next.js is the dominant choice** for community dashboards (tugcantopaloglu)
2. **Theme systems matter** — both dashboards have 6 themes with dark/light
3. **Cost tracking is essential** — everyone tracks spend by model
4. **Real-time updates are expected** — live feed, auto-refresh
5. **System health is table stakes** — CPU/RAM/disk always visible
6. **No one has solved the plugin architecture** — both are monolithic
7. ** mudrii's zero-dependency approach is compelling** — but harder to maintain

---

## The Vision

A **modular dashboard** that combines the best of both research projects:

```
┌─────────────────────────────────────────────────────────────┐
│  SMF Dashboard (Baseline) — localhost:3000                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Shared: Left Nav + Branding + Settings + Auth        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Baseline Modules:        Plugin Modules:                    │
│  ┌─────────┐ ┌─────────┐  ┌─────────┐ ┌─────────┐         │
│  │ Coffee  │ │ Tasks   │  │ Simple  │ │ Lead    │         │
│  │Briefing │ │(Kanban) │  │   CMS   │ │Capture  │         │
│  └─────────┘ └─────────┘  └─────────┘ └─────────┘         │
│  ┌─────────┐ ┌─────────┐  ┌─────────┐                    │
│  │ Agents  │ │ Skills  │  │ SEO+    │                    │
│  │  View   │ │  List   │  │  GEO    │                    │
│  └─────────┘ └─────────┘  └─────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Recommended Architecture

### 1. Plugin Registry System (Key Innovation)

```typescript
// ~/.smf/dashboard/plugins.json
{
  "plugins": [
    {
      "id": "coffee-briefing",
      "name": "Coffee Briefing",
      "version": "1.0.0",
      "type": "builtin",          // or "plugin"
      "route": "/dashboard",
      "nav": {
        "label": "Dashboard",
        "icon": "Coffee",
        "order": 1
      },
      "dependencies": ["smfworks-skills/coffee-briefing"],
      "permission": "pro"         // or "free", "admin"
    },
    {
      "id": "simple-cms",
      "name": "Simple CMS",
      "version": "1.0.0",
      "type": "plugin",
      "route": "/cms",
      "nav": {
        "label": "CMS",
        "icon": "FileText",
        "order": 10
      },
      "dependencies": [],
      "permission": "free"
    }
  ]
}
```

**Why this approach:**
- Plugins are discovered at runtime, not build time
- No need to rebuild dashboard when adding/removing plugins
- Each plugin can be a separate npm package OR Next.js route group
- Nav items auto-generate from registry
- Permissions enforced at the module level

---

### 2. Three Plugin Distribution Options

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| **A. Route Groups** (same repo) | Simple, shared build, easy debugging | Single repo, tighter coupling | Baseline + SMF add-ons |
| **B. Nx Monorepo** | True separation, shared tooling | Complex setup, slower builds | Multiple teams |
| **C. Separate npm packages** | Fully independent, can version separately | Version management overhead, complex releases | Third-party plugins |

**Recommendation:** Option A initially — route groups within the Next.js app. Migrate to Option B if/when third-party plugins emerge.

---

### 3. Module Types

```
┌─────────────────────────────────────────────────────────────┐
│ MODULE TYPE          │ DESCRIPTION                         │
├──────────────────────┼────────────────────────────────────┤
│ builtin              │ Ships with baseline dashboard        │
│ plugin               │ Separate package, installs into base │
│ skill-visualization  │ Visual wrapper around a CLI skill    │
└─────────────────────────────────────────────────────────────┘
```

**Builtin Modules (Phase 1):**
1. **Coffee Briefing** — Dashboard home widget
2. **Task Manager (Kanban)** — Full Kanban board
3. **Agents View** — Network agent visualization
4. **Skills Explorer** — Visual skill browser

**Plugin Modules (Phase 2+):**
1. **Simple CMS** — Page editor, nav menu
2. **Lead Capture** — Forms, lead list
3. **SEO+GEO** — Keyword research, content calendar

---

### 4. Shared Infrastructure

```typescript
// src/lib/dashboard-context.tsx
interface DashboardSettings {
  branding: {
    logo: string;           // URL or base64
    primaryColor: string;    // Hex
    accentColor: string;    // Hex
    companyName: string;
  };
  theme: 'light' | 'dark' | 'system';
  defaults: {
    defaultRoute: string;
    timezone: string;
  };
}

// All modules consume this context
const { settings, updateSettings } = useDashboard();
```

**Storage:** `~/.smf/dashboard/settings.json`

**Theme System (from research):**
- 6 built-in themes (like mudrii)
- CSS variables for easy theming
- Persist preference in settings

---

### 5. OpenClaw Integration (Critical)

From the OpenClaw plugin architecture docs, the dashboard should:

```typescript
// Connect to OpenClaw Gateway via WebSocket
import { api } from '@/lib/openclaw-client';

// Available APIs:
// - sessions.list() — active sessions
// - agents.list() — all agents on network
// - cron.list() — scheduled jobs
// - skills.list() — installed skills
// - memory.search() — vector memory
// - config.get() — gateway config
// - usage.get() — API usage/costs
```

**Key OpenClaw Plugin Concepts to Use:**
1. **Capability registration** — Dashboard registers as an OpenClaw client
2. **Provider plugins** — For future provider switching UI
3. **Hook system** — React to gateway events (new session, cron fired, etc.)
4. **HTTP routes** — Dashboard can expose its own API routes

---

### 6. Recommended Tech Stack (Keep Current)

| Layer | Current | Recommendation |
|-------|---------|----------------|
| Framework | Next.js 16 | ✅ Keep |
| Language | TypeScript | ✅ Keep |
| Styling | Tailwind CSS 4 + shadcn/ui | ✅ Keep |
| State | React Context + Zustand | ✅ Keep |
| Icons | Lucide React | ✅ Keep |
| Charts | recharts | ✅ Keep |
| Theme | CSS Variables | ✅ Add theme switcher |

**Key additions needed:**
1. `zustand` for global plugin state (already have context)
2. CSS variable-based theming system
3. Plugin registry reader hook
4. Settings persistence layer

---

### 7. Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Next.js App (localhost:3000)                       │   │
│  │                                                     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │ Baseline │  │ Plugin   │  │ Plugin   │          │   │
│  │  │ Modules  │  │  Route   │  │  Route   │          │   │
│  │  │          │  │  Group   │  │  Group   │          │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘          │   │
│  │       │              │              │                 │   │
│  │  ┌────┴──────────────┴──────────────┴────┐          │   │
│  │  │        Shared: useDashboard()           │          │   │
│  │  │   - Settings (branding, theme)          │          │   │
│  │  │   - Plugin registry                    │          │   │
│  │  │   - OpenClaw gateway client           │          │   │
│  │  └─────────────────┬──────────────────────┘          │   │
│  └───────────────────┼──────────────────────────────────┘   │
└───────────────────────│─────────────────────────────────────┘
                        │ WebSocket + REST
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              OpenClaw Gateway (localhost:18789)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Sessions │  │  Agents  │  │  Cron    │  │ Skills   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Roadmap

### Phase 1: Foundation (1-2 weeks)

**1.1 Plugin Registry System**
- Create `~/.smf/dashboard/settings.json` schema
- Build `usePluginRegistry()` hook
- Build `useDashboard()` context
- Create Settings page with branding (logo, colors)

**1.2 Theme System**
- Add 6 themes (research-based)
- CSS variable approach
- Theme switcher in settings
- Persist theme preference

**1.3 OpenClaw Client Upgrade**
- Upgrade existing `openclaw-client.ts` to full API
- Add WebSocket support for real-time
- Add subscription/permission checks

### Phase 2: Baseline Modules (2-3 weeks)

**2.1 Coffee Briefing Widget**
- Dashboard home page redesign
- Fetch from OpenClaw gateway
- Weather integration
- Task summary (from Kanban)
- Pro subscription required

**2.2 Task Manager (Kanban)**
- Reuse `task-manager` skill data format
- Build Kanban UI with drag-and-drop
- Deadline tracking
- Filter/sort options
- Pro subscription required

**2.3 Agents View**
- Fetch from OpenClaw gateway
- Card grid with status
- Last heartbeat display
- Click to chat

**2.4 Skills Explorer**
- Fetch from OpenClaw gateway
- Grid with filtering (Free/Pro/Installed)
- One-click install (Free)
- Pro lock icons + upgrade CTA

### Phase 3: Plugin System (1-2 weeks)

**3.1 Plugin Scaffold**
- Create `smfw dashboard:plugin:create` command
- Template with route group + nav registration
- Example plugin showing API usage

**3.2 Plugin API**
- `useDashboard().registerModule()`
- Shared hooks: `useSettings()`, `useOpenClaw()`, `useAuth()`
- Type definitions for plugins

**3.3 Plugin Marketplace (future)**
- Browse available plugins
- One-click install
- Version management

### Phase 4: Add-on Plugins (3-4 weeks)

**4.1 Simple CMS**
- Page editor (Markdown)
- Navigation menu builder
- Page list (draft/published)
- SEO fields per page

**4.2 Lead Capture**
- Form builder
- Lead list with status
- Lead detail + notes
- Export to CSV
- Email notifications

**4.3 SEO+GEO**
- Keyword research dashboard
- SERP analysis
- Content calendar
- GEO optimization checker

---

## Comparison: Baseline vs Research Dashboards

| Feature | smf-dashboard (planned) | tugcantopaloglu | mudrii |
|---------|------------------------|-----------------|--------|
| **Stack** | Next.js | Next.js | Go + Pure HTML |
| **Themes** | 6 (CSS variables) | 2 (dark/light) | 6 (pure CSS) |
| **Plugin System** | ✅ Yes | ❌ No | ❌ No |
| **Modular** | ✅ Yes | ❌ No | ❌ No |
| **Auth/MFA** | Future | ✅ Yes | ❌ No |
| **Cost Tracking** | Future | ✅ Yes | ✅ Yes |
| **Real-time** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Skills Viz** | ✅ Yes | ❌ No | ❌ No |
| **Kanban** | ✅ Yes | ❌ No | ❌ No |
| **CMS** | Future | ❌ No | ❌ No |
| **Theming** | Per-module | Global | Global |

---

## Decisions Needed

1. **Auth system** — Add now or later? (tugcantopaloglu has TOTP MFA)
2. **Plugin distribution** — Same repo (route groups) or separate packages?
3. **Permission model** — Per-module or per-dashboard Pro check?
4. **Data storage** — Keep JSON files or migrate to SQLite?
5. **Real-time** — WebSocket or polling? (OpenClaw supports both)

---

## Next Steps

1. **Decide** on auth timing and plugin distribution model
2. **Start Phase 1** — Build plugin registry + settings
3. **Apply SMF Works branding** — Logo, colors, fonts
4. **Add theme switcher** — 6 themes from research
5. **Build baseline modules one by one**

---

*Architecture plan created: 2026-03-24*
*Research sources: tugcantopaloglu/openclaw-dashboard, mudrii/openclaw-dashboard*
*OpenClaw docs: plugin architecture, capability model, gateway protocol*
