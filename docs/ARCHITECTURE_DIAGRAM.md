# SMF Dashboard — Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                           SMF DASHBOARD (localhost:3000)                       │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                              HEADER                                       │   │
│  │  Good Morning, Michael    [🔍 Search...]  [🌙] [🔔3] [⚙️ Settings]      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ SIDEBAR (260px)           │           MAIN CONTENT AREA                  │  │
│  │                           │                                               │  │
│  │ ┌─────────────────────┐   │   ┌──────────────────────────────────────┐  │  │
│  │ │ 🏠 SMF Dashboard    │   │   │  QUICK STATS (4 cards)               │  │  │
│  │ │    Business Intel.  │   │   │  💰 Today   🤖 Agents  📋 Tasks  ⚡GW  │  │  │
│  │ └─────────────────────┘   │   └──────────────────────────────────────┘  │  │
│  │                           │                                               │  │
│  │ OVERVIEW                  │   ┌──────────────────────────────────────┐  │  │
│  │  📊 Dashboard  ←active   │   │  ☕ COFFEE BRIEFING    ✅ TASKS      │  │  │
│  │  📈 Usage & Costs         │   │  ┌────────────┐    ┌───┬───┬───┐   │  │  │
│  │  📞 Activity              │   │  │ 🌤️ 72°F   │    │To │In │Don│   │  │  │
│  │                           │   │  │ Partly Cloud│   │ Do│Pro│ e │   │  │  │
│  │ AGENTS                    │   │  │ 3 meetings │    │ 5 │ 3 │12 │   │  │  │
│  │  🤖 All Agents           │   │  │ 8 tasks    │    └───┴───┴───┘   │  │  │
│  │  💬 Chat                  │   │  │ $47 MTD   │                      │  │  │
│  │  📝 Sessions             │   │  └────────────┘                      │  │  │
│  │                           │   └──────────────────────────────────────┘  │  │
│  │ BUSINESS  ⭐PRO          │                                               │  │
│  │  ✅ Tasks (Kanban)       │   ┌──────────────────────────────────────┐  │  │
│  │  📅 Calendar            │   │  🤖 AGENTS        🔧 SKILLS           │  │  │
│  │  🔗 Integrations        │   │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ │  📁 📄 🔢 🔒 │  │  │
│  │                           │   │  │🤖│ │📝│ │🔍│ │✍️│ │  🌤️ ☕ 📊 📞  │  │  │
│  │ PLUGINS                   │   │  │  │ │  │ │  │ │  │ │   PRO ▶       │  │  │
│  │  📄 Simple CMS           │   │  └──┘ └──┘ └──┘ └──┘ │              │  │  │
│  │  🎣 Lead Capture ⭐PRO   │   │  Main Code  Writer Res. Idle│              │  │  │
│  │  🔍 SEO+GEO ⭐PRO       │   └──────────────────────────────────────┘  │  │
│  │                           │                                               │  │
│  │ KNOWLEDGE                 │                                               │  │
│  │  🧠 Memory              │                                               │  │
│  │  💾 Vectors              │                                               │  │
│  │  📁 Documents            │                                               │  │
│  │                           │                                               │  │
│  │ SYSTEM                    │                                               │  │
│  │  🔧 Skills              │                                               │  │
│  │  ⚙️ Settings            │                                               │  │
│  │                           │                                               │  │
│  │ ┌─────────────────────┐  │                                               │  │
│  │ │ 🟢 Gateway Online   │  │                                               │  │
│  │ └─────────────────────┘  │                                               │  │
│  └───────────────────────────┴───────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════

                              PLUGIN ARCHITECTURE

┌────────────────────────────────────────────────────────────────────────────────┐
│                     ~/.smf/dashboard/settings.json                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  {                                                                    │   │
│  │    "branding": { "logo": "...", "primaryColor": "#6366f1" },         │   │
│  │    "theme": "dark",                                                  │   │
│  │    "plugins": [                                                      │   │
│  │      { "id": "coffee-briefing", "enabled": true, "order": 1 },      │   │
│  │      { "id": "tasks", "enabled": true, "order": 2 },                 │   │
│  │      { "id": "simple-cms", "enabled": false },                       │   │
│  │      { "id": "lead-capture", "enabled": false },                     │   │
│  │      { "id": "seo-geo", "enabled": false }                           │   │
│  │    ]                                                                 │   │
│  │  }                                                                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ read at startup
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                        DASHBOARD APP (Next.js)                                 │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    useDashboard() Context                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │   │
│  │  │ useSettings │  │ usePlugins  │  │ useOpenClaw │                   │   │
│  │  │             │  │             │  │             │                   │   │
│  │  │ Branding    │  │ Registry    │  │ Gateway WS  │                   │   │
│  │  │ Theme       │  │ Enabled     │  │ Sessions    │                   │   │
│  │  │ Company     │  │ Order       │  │ Agents      │                   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                           │
│         ┌──────────────────────────┼──────────────────────────┐               │
│         │                          │                          │               │
│         ▼                          ▼                          ▼               │
│  ┌─────────────┐           ┌─────────────┐           ┌─────────────┐           │
│  │  BUILTIN    │           │  PLUGIN    │           │  PLUGIN    │           │
│  │  MODULES    │           │ : simple-  │           │: lead-     │           │
│  │             │           │   cms       │           │  capture   │           │
│  │ ☕ Briefing │           │             │           │            │           │
│  │ ✅ Tasks    │           │ /cms        │           │ /leads     │           │
│  │ 🤖 Agents  │           │ (route      │           │ (route     │           │
│  │ 🔧 Skills  │           │  group)     │           │  group)    │           │
│  └─────────────┘           └─────────────┘           └─────────────┘           │
│                                                                                 │
│  Each plugin in: ~/.smf/<plugin-name>/                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  ~/.smf/                                                               │   │
│  │  ├── coffee-briefing/  (Pro skill)                                     │   │
│  │  ├── tasks/           (Pro skill)                                      │   │
│  │  ├── simple-cms/      (future plugin)                                  │   │
│  │  ├── lead-capture/    (future plugin)                                  │   │
│  │  └── seo-geo/         (future plugin)                                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════

                            ROUTE STRUCTURE

/app
├── (dashboard)              ← route group with shared layout
│   ├── layout.tsx          ← sidebar + header
│   ├── page.tsx            ← dashboard home (briefing + stats)
│   ├── agents/
│   │   ├── page.tsx        ← agent grid
│   │   └── [id]/page.tsx   ← agent detail + chat
│   ├── sessions/
│   │   └── page.tsx
│   ├── work/
│   │   ├── page.tsx        ← tasks/kanban
│   │   └── calendar/
│   ├── business/            ← future plugins
│   │   ├── cms/
│   │   ├── leads/
│   │   └── seo/
│   ├── knowledge/
│   │   ├── memory/
│   │   ├── vectors/
│   │   └── documents/
│   ├── skills/
│   │   └── page.tsx        ← skills explorer
│   └── settings/
│       ├── page.tsx        ← branding, theme
│       └── page.tsx        ← system settings
└── (plugins)               ← plugin route groups
    ├── simple-cms/
    ├── lead-capture/
    └── seo-geo/

═══════════════════════════════════════════════════════════════════════════════════

                            OPENCLAW INTEGRATION

┌────────────────────────────────────────────────────────────────────────────────┐
│                    OPENCLAW GATEWAY (localhost:18789)                          │
│                                                                                 │
│  WebSocket Protocol:                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Client → Gateway:  { "type": "req", "method": "connect", ... }         │   │
│  │  Gateway → Client:  { "type": "res", "ok": true, ... }                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Available APIs:                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  sessions.list()     → active sessions with context usage                │   │
│  │  sessions.messages() → conversation history                              │   │
│  │  agents.list()      → all known agents on network                       │   │
│  │  cron.list()       → scheduled jobs                                    │   │
│  │  skills.list()      → installed skills                                 │   │
│  │  memory.search()    → vector search                                    │   │
│  │  config.get()       → gateway config                                   │   │
│  │  usage.get()        → API usage/costs                                  │   │
│  │  tools.invoke()     → run any tool                                     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

1. **Plugin Discovery**: JSON registry at `~/.smf/dashboard/settings.json`
2. **Each plugin is standalone**: Own data in `~/.smf/<plugin-name>/`
3. **Route Groups**: Plugins are Next.js route groups that share the dashboard layout
4. **Shared Context**: `useDashboard()` provides settings, plugins, and OpenClaw client
5. **Pro Badges**: Visual indicator for subscription-gated features
6. **Gateway Status**: Always-visible connection status in sidebar

## What Users See

1. **First Visit**: Setup wizard → choose theme → install initial plugins
2. **Dashboard Home**: Coffee Briefing + Stats + Tasks + Agents + Skills
3. **Plugin Pages**: `/cms`, `/leads`, `/seo` — all share sidebar/header
4. **Settings**: Branding, theme, plugin management

═══════════════════════════════════════════════════════════════════════════════════

                            FILES TO CREATE/MODIFY

PHASE 1 (Foundation):
├── src/contexts/DashboardContext.tsx     ← NEW: settings + plugins + theme
├── src/hooks/useDashboard.ts              ← NEW: shared hook
├── src/hooks/usePluginRegistry.ts         ← NEW: plugin discovery
├── src/lib/openclaw-client.ts             ← MOD: upgrade to full API
├── src/app/(dashboard)/layout.tsx         ← MOD: apply SMF branding
├── src/app/settings/page.tsx              ← MOD: branding UI
└── docs/mockup.html                       ← DONE: visual reference

PHASE 2 (Core Modules):
├── src/app/work/page.tsx                  ← NEW: Tasks/Kanban
├── src/components/briefing/               ← NEW: Coffee Briefing widget
├── src/components/kanban/                 ← NEW: Kanban board
├── src/components/agents-grid/            ← NEW: Agent cards
└── src/components/skills-explorer/        ← NEW: Skills grid

PHASE 3 (Plugin System):
├── src/lib/plugin-registry.ts             ← NEW: plugin discovery
├── src/app/(plugins)/                     ← NEW: plugin scaffold
├── scripts/plugin-template/               ← NEW: plugin generator
└── install.sh                            ← MOD: plugin install support
