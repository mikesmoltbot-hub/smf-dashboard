# SMF Dashboard — Modular Architecture Plan

**Project:** smf-dashboard (https://github.com/smfworks/smf-dashboard)  
**Vision:** Modular dashboard where plugins (CMS, Lead Capture, SEO) plug into a shared baseline  
**Last Updated:** 2026-03-24

---

## The Vision

A **modular dashboard** where:
- **Baseline Dashboard** = single React app, skinned to SMF Works branding, runs on localhost
- **Add-on modules** = separate plugins that plug into the baseline via left-hand navigation
- **No extra web servers** — plugins mount into the baseline dashboard
- **Shared infrastructure** — settings, auth, branding shared across all modules

**Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│  SMF Dashboard (Baseline) — localhost:3000                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Shared: Left Nav + Branding + Settings + Auth      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Coffee  │ │ Tasks   │ │ Agents  │ │ Skills  │  ...   │
│  │Briefing │ │ (Kanban)│ │  View   │ │  List   │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                              │
│  [Plugins Mount Here]                                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                    │
│  │ Simple  │ │ Lead    │ │ SEO+GEO │                    │
│  │   CMS   │ │ Capture  │ │         │                    │
│  └─────────┘ └─────────┘ └─────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Research Findings

### OpenClaw Plugin System (Key Insight)

OpenClaw **already has a full plugin system**. Before building a new plugin architecture, we should leverage it:

**OpenClaw Plugin Capabilities:**
- Channel plugins (Telegram, WhatsApp, Discord, etc.)
- Provider plugins (model providers: OpenAI, Anthropic, etc.)
- Tool/hook plugins (skills)
- Context engine plugins
- HTTP route plugins

**What this means for SMF Dashboard:**
- The dashboard is a **visual frontend** for OpenClaw, not a separate plugin host
- Dashboard "plugins" (CMS, Lead Capture) should be **OpenClaw skills** that the dashboard visualizes
- The dashboard already connects to OpenClaw via WebSocket gateway protocol
- We don't need to build plugin loading/sandboxing — OpenClaw handles that

**Dashboard Plugin Registry** (lightweight, for SMF add-ons only):
```json
// ~/.smf/dashboard/plugins.json
{
  "plugins": [
    {
      "id": "simple-cms",
      "name": "Simple CMS",
      "type": "openclaw-skill",
      "skillId": "smf-simple-cms",
      "nav": { "label": "CMS", "icon": "FileText", "order": 10 }
    }
  ]
}
```

### Next.js Modular Architecture Patterns (2025-2026 Best Practices)

Based on research of Next.js patterns:

**1. Feature-Based Folder Structure (recommended)**
```
src/
├── app/                    # App Router routes
│   ├── (dashboard)/        # Route group for dashboard
│   │   ├── layout.tsx     # Dashboard layout with nav
│   │   ├── page.tsx       # Dashboard home
│   │   ├── tasks/         # Kanban module
│   │   ├── agents/        # Agents view module
│   │   └── settings/      # Settings module
│   └── (plugins)/          # Plugin routes
│       ├── cms/
│       └── lead-capture/
├── features/              # Feature modules
│   ├── coffee-briefing/
│   ├── kanban/
│   ├── agents/
│   └── skills/
├── shared/                # Shared UI, hooks, utils
│   ├── ui/
│   ├── hooks/
│   └── lib/
└── components/            # Shared components
```

**2. Route Groups for Isolation**
- `(dashboard)/` — baseline modules, always loaded
- `(plugins)/` — plugin-provided routes, lazy-loaded
- Each group shares a layout but has isolated routes

**3. Shared Context Pattern**
```typescript
// Shared context for theme/branding
<DashboardProvider>
  <ThemeProvider>
    {children}
  </ThemeProvider>
</DashboardProvider>

// Plugin registration hook
function usePlugin(pluginId: string) {
  const plugins = useContext(PluginContext);
  return plugins.find(p => p.id === pluginId);
}
```

**4. Module Federation (future)**
For true runtime plugin isolation, consider Next.js Module Federation. However, for SMF dashboard, feature-based code splitting is sufficient.

---

## Baseline Dashboard Modules

The baseline ships with core modules and provides the plugin infrastructure.

### Module 1: Coffee Briefing
**Dependency:** `smfworks-skills/coffee-briefing` (Pro skill)

**Features:**
- Morning briefing widget on dashboard home
- Weather, calendar, top tasks
- One-click briefing regeneration
- Configurable briefing time (e.g., 7:00 AM daily)

**Data Source:** Reads from OpenClaw gateway + weather API + calendar

**Implementation:**
- Component that fetches from OpenClaw gateway `/api/briefing`
- Uses `smfw run coffee-briefing` internally
- Requires Pro subscription check

---

### Module 2: Task Manager (Kanban)
**Dependency:** `smfworks-skills/task-manager` (Pro skill)

**Features:**
- Kanban board: To Do | In Progress | Done
- Drag-and-drop task cards
- Deadline tracking
- Priority levels
- Task creation/editing inline
- Filter by assignee, priority, due date

**Data Source:** Local SQLite or JSON file (`~/.smf/task-manager/tasks.json`)

**Implementation:**
- Reuse existing `task-manager` skill data format
- Build Kanban UI with `@xyflow/react` (already in deps)
- Plugin interface: reads from `~/.smf/task-manager/`

---

### Module 3: OpenClaw Agents View
**Dependency:** OpenClaw gateway running

**Features:**
- List all OpenClaw agents on the network
- Show active/inactive status
- Last heartbeat timestamp
- Agent capabilities (skills installed)
- Click to open agent chat in new tab

**Data Source:** OpenClaw gateway API (`/api/sessions`, `/api/agents`)

**Implementation:**
- Call OpenClaw gateway REST API
- Display agents in card grid
- Color-coded status indicators (green=active, gray=inactive)

---

### Module 4: Skills Visualization
**Dependency:** OpenClaw + installed skills

**Features:**
- Visual skill browser
- Categories: Free | Pro | Installed | Available
- Skill cards with icons and descriptions
- One-click install for Free skills
- Pro skills show lock icon + upgrade CTA
- Dependencies listed (e.g., "Requires: task-manager")

**Data Source:** OpenClaw skills API + `~/.smf/skills/`

**Implementation:**
- Fetch from OpenClaw gateway `/api/skills`
- Build visual grid with filtering
- Use existing shadcn/ui components

---

## Baseline Dashboard Infrastructure

### Shared Settings
**Module:** Built-in

**Features:**
- **Branding:** Logo upload, primary color, accent color
- **Company Info:** Business name, tagline, contact info
- **Defaults:** Default module on login, timezone, date format
- **Export/Import:** Backup and restore all settings

**Storage:** `~/.smf/dashboard/settings.json`

**Implementation:**
- React Context for theme/branding
- Tailwind CSS variables for colors
- Settings persisted locally

---

### Plugin Architecture (Revised)

**Key insight:** Use OpenClaw's existing plugin system for actual plugins. Build a **lightweight dashboard plugin registry** for SMF-specific add-ons that don't fit as OpenClaw skills.

**Two types of plugins:**

1. **OpenClaw Skills** (most add-ons)
   - CMS, Lead Capture, SEO+GEO are OpenClaw skills
   - Dashboard provides a **visual interface** for them
   - Skill data stored in `~/.smf/<skill-name>/`
   - Dashboard reads skill data and renders UI

2. **Dashboard-Only Plugins** (rare)
   - Pure React components for dashboard-specific features
   - Mount into dashboard via plugin registry
   - Share the dashboard theme/layout

**Plugin Registry:**
```typescript
// types/plugin.ts
interface DashboardPlugin {
  id: string;
  name: string;
  version: string;
  type: 'openclaw-skill' | 'dashboard-module';
  skillId?: string;           // if type === 'openclaw-skill'
  route?: string;             // base route for this plugin
  nav: {
    label: string;
    icon: string;
    order: number;
  };
  component?: React.ComponentType;  // for dashboard-only modules
}
```

**Registry storage:** `~/.smf/dashboard/plugins.json`

**Plugin discovery:**
1. Read `~/.smf/dashboard/plugins.json`
2. For each plugin, load its route group
3. Register nav items
4. Initialize skill data if needed

---

## Add-on Modules (Future)

### Plugin 1: smf-simple-cms
**Status:** Not started

**Features:**
- Simple page editor (Markdown/rich text)
- Page list with status (draft/published)
- Navigation menu editor
- SEO fields per page
- Static site generation option

**Dependency:** Baseline Dashboard + OpenClaw skill

**Implementation:**
- Build as OpenClaw skill with data in `~/.smf/simple-cms/`
- Dashboard provides visual editor UI
- CMS pages stored as Markdown files

---

### Plugin 2: smf-lead-capture
**Status:** Not started  
**Existing Code:** `smfworks-skills/lead-capture` (standalone Pro skill)

**Features:**
- Lead form builder
- Lead list with status (new/contacted/qualified/lost)
- Lead detail view with notes
- Export to CSV
- Email notification on new lead

**Integration:** 
- Move data to `~/.smf/lead-capture/`
- Dashboard provides visual lead management UI
- Existing skill provides automation (forms, notifications)

---

### Plugin 3: smf-seo-geo
**Status:** Code ready in `smfworks/SMF-SEO`  
**Note:** Renamed from SMF-SEO

**Features:**
- Keyword research dashboard
- SERP analysis view
- Content calendar
- GEO optimization checker
- Article brief generator

**Integration:** 
- Package as OpenClaw skill
- Dashboard provides visual analytics UI
- Uses skill for content generation

---

## Tech Stack (Current - No Changes Needed)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui + radix-ui |
| State | React Context + Zustand |
| Icons | Lucide React |
| Build | Webpack |

**Key libraries already in use:**
- `@xyflow/react` — for Kanban board
- `recharts` — for data visualization
- `@monaco-editor/react` — for code/text editing
- `ai` SDK — for AI agent interactions

---

## Implementation Roadmap

### Phase 1: Baseline Dashboard Restructure
**Goal:** Simplify existing dashboard to baseline + core modules

1. **Create plugin registry system** (1 day)
   - `~/.smf/dashboard/plugins.json` schema
   - Registry reader hook
   - Nav items builder from registry
   - Settings persistence

2. **Skin to SMF Works branding** (1 day)
   - Logo, colors, fonts from smfworks.com
   - Tailwind CSS variables for theming
   - Responsive layout

3. **Add Settings module** (1 day)
   - Branding panel (logo, colors)
   - Company info panel
   - Export/import settings

4. **Create Coffee Briefing widget** (1 day)
   - Use existing coffee-briefing skill
   - Dashboard widget on home

5. **Create Task Manager (Kanban)** (2 days)
   - Reuse task-manager skill data format
   - Build Kanban UI with @xyflow/react

6. **Create Agents View** (1 day)
   - Fetch from OpenClaw gateway
   - Display in card grid

7. **Create Skills Visualization** (1 day)
   - Fetch from OpenClaw gateway
   - Grid view with filters

**Phase 1 Total:** ~8 days

### Phase 2: Plugin System
**Goal:** Enable add-on modules

1. **Plugin scaffold generator** (1 day)
   - `smfw dashboard:plugin:create <name>`
   - Template with routes/nav registration

2. **Shared hooks library** (1 day)
   - `useSettings()`, `useOpenClaw()`, `useAuth()`
   - Theme context

3. **Documentation** (1 day)
   - Plugin authoring guide
   - Plugin API reference

**Phase 2 Total:** ~3 days

### Phase 3: Add-on Plugins
**Goal:** Build the add-on modules

1. **smf-simple-cms** (~5 days)
2. **smf-lead-capture** (~5 days)
3. **smf-seo-geo** (~5 days)

**Phase 3 Total:** ~15 days

---

## Open Questions

1. **Existing dashboard features** — Current dashboard has chat, sessions, memory, vectors, terminals. Should baseline keep ALL of these, strip to minimal, or reorganize into modules?

2. **Data storage** — Skills store data in `~/.smf/<skill-name>/`. Should dashboard plugins also use this pattern or have their own storage?

3. **Plugin distribution** — Should plugins be separate git repos (like skills) or all in one monorepo?

4. **OpenClaw dependency** — Dashboard requires OpenClaw gateway running. Is this acceptable or should it be more standalone?

5. **Real-time updates** — Dashboard uses WebSocket for OpenClaw. Should plugin data also be real-time or polling-based?

---

## Next Steps

1. **Confirm this plan** with Michael
2. **Start Phase 1, Step 1:** Create plugin registry system
3. **Get baseline dashboard running** and accessible at localhost:3000
4. **Skin to SMF Works branding**
5. **Build core modules one by one**

---

*Plan created: 2026-03-24*
*Research completed: OpenClaw plugin architecture, Next.js modular patterns 2025-2026*
