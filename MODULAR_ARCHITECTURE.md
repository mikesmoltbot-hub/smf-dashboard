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

### Plugin Architecture

**How plugins work:**
1. Plugin is a Next.js route group (e.g., `/app/cms/`)
2. Plugin registers its nav items in a shared registry
3. Baseline dashboard reads registry and renders nav
4. Plugin shares the same layout, theme, and auth

**Plugin Registry:**
```typescript
// ~/.smf/dashboard/plugins.json
{
  "plugins": [
    {
      "id": "simple-cms",
      "name": "Simple CMS",
      "version": "1.0.0",
      "routes": ["/cms"],
      "nav": { "label": "CMS", "icon": "FileText", "order": 10 }
    }
  ]
}
```

**Plugin API (for plugins to access shared data):**
```typescript
// Shared hooks
useSettings() → { logo, colors, company }
useOpenClaw() → gateway API client
useAuth() → subscription status
```

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

**Dependency:** Baseline Dashboard

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

**Integration:** Move data to `~/.smf/lead-capture/`

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

**Integration:** Package as plugin that uses skill internally

---

## Implementation Roadmap

### Phase 1: Baseline Dashboard Restructure
**Goal:** Simplify existing dashboard to baseline + core modules

1. **Create plugin registry system** (1 day)
   - `~/.smf/dashboard/plugins.json` schema
   - Registry reader hook
   - Nav items builder from registry

2. **Add Settings module** (1 day)
   - Branding panel (logo, colors)
   - Company info panel
   - Export/import settings

3. **Simplify existing dashboard** (2 days)
   - Remove clutter, focus on core
   - Apply SMF Works skin
   - Fix any broken routes

4. **Create Coffee Briefing widget** (1 day)
   - Use existing coffee-briefing skill
   - Dashboard widget on home

5. **Create Task Manager (Kanban)** (2 days)
   - Reuse task-manager skill data format
   - Build Kanban UI

6. **Create Agents View** (1 day)
   - Fetch from OpenClaw gateway
   - Display in card grid

7. **Create Skills Visualization** (1 day)
   - Fetch from OpenClaw gateway
   - Grid view with filters

**Phase 1 Total:** ~9 days

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

## Tech Stack (Current)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui + radix-ui |
| State | React Context + Zustand |
| Icons | Lucide React |
| Fonts | Inter, Geist Mono |
| Build | Webpack |

**No changes needed** — existing stack supports modular architecture.

---

## Next Steps

1. **Confirm this plan** with Michael
2. **Start Phase 1, Step 1:** Create plugin registry system
3. **Get baseline dashboard running** and accessible
4. **Skin to SMF Works branding**
5. **Build core modules one by one**

---

## Open Questions

1. Should baseline include ALL existing features (chat, sessions, memory, etc.) or be truly minimal?
2. How should plugin authentication work — shared JWT or per-plugin?
3. Should plugins be separate git repos or all in one monorepo?
4. Version compatibility — how do plugins declare which baseline version they need?

---

*Plan created: 2026-03-24*
