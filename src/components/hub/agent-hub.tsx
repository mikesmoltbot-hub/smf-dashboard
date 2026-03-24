"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Network, CheckSquare, DollarSign, Heart, Plus, MoreHorizontal, RefreshCw, Globe, Server, Settings, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface RemoteGateway {
  id: string;
  name: string;
  url: string;
  token: string;
  emoji: string;
  agentName: string;
  status: "online" | "offline" | "unknown";
  lastSeen: number | null;
}

interface HubAgent {
  id: string;
  name: string;
  emoji: string;
  role: string;
  status: "active" | "idle" | "offline";
  model: string;
  totalTokens: number;
  lastActive: number | null;
  sessionCount: number;
  channels: string[];
  workspace: string;
  gatewayId: string;
  gatewayName: string;
}

interface HubTask {
  id: string;
  title: string;
  assignedTo: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  due?: string;
}

interface UsageData {
  totalTokens: number;
  totalCost: number;
  period: string;
}

interface HubTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const TABS: HubTab[] = [
  { id: "overview", label: "Overview", icon: <Network className="h-4 w-4" /> },
  { id: "org", label: "Org Chart", icon: <Network className="h-4 w-4" /> },
  { id: "tasks", label: "Tasks", icon: <CheckSquare className="h-4 w-4" /> },
  { id: "gateways", label: "Gateways", icon: <Server className="h-4 w-4" /> },
];

const GATEWAY_STORAGE_KEY = "smf.hub.gateways";
const MOCK_TASKS: HubTask[] = [
  { id: "t1", title: "Deploy Agent Hub", assignedTo: "Aiona", status: "done", priority: "high" },
  { id: "t2", title: "Connect Gabriel to hub", assignedTo: "Gabriel", status: "in-progress", priority: "high", due: "today" },
  { id: "t3", title: "Connect Rafael to hub", assignedTo: "Rafael", status: "todo", priority: "medium", due: "tomorrow" },
];

// ── Gateway tool invocation ─────────────────────────────────────────────────────

async function invokeGateway(gateway: RemoteGateway, tool: string, args: Record<string, unknown> = {}): Promise<unknown> {
  const res = await fetch(`${gateway.url}/tools/invoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${gateway.token}` },
    body: JSON.stringify({ tool, action: "json", args }),
  });
  if (!res.ok) throw new Error(`Gateway ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error?.message || "Tool failed");
  return typeof data.result?.content === "string" ? JSON.parse(data.result.content) : data.result;
}

async function fetchAgentsFromGateway(gateway: RemoteGateway): Promise<HubAgent[]> {
  try {
    const result = await invokeGateway(gateway, "sessions_list", {}) as { sessions: Array<Record<string, unknown>> };
    const sessions = result.sessions || [];
    return [{
      id: `gateway-${gateway.id}`,
      name: gateway.agentName,
      emoji: gateway.emoji,
      role: "Agent",
      status: sessions.length > 0 ? "active" : "idle",
      model: (sessions[0]?.model as string) || "unknown",
      totalTokens: sessions.reduce((s: number, n: Record<string, unknown>) => s + ((n.totalTokens as number) || 0), 0),
      lastActive: sessions[0] ? (sessions[0].updatedAt as number) : null,
      sessionCount: sessions.length,
      channels: ["telegram"],
      workspace: `/${gateway.name}`,
      gatewayId: gateway.id,
      gatewayName: gateway.name,
    }];
  } catch {
    return [{
      id: `gateway-${gateway.id}`,
      name: gateway.agentName,
      emoji: gateway.emoji,
      role: "Agent",
      status: "offline",
      model: "unknown",
      totalTokens: 0,
      lastActive: null,
      sessionCount: 0,
      channels: [],
      workspace: `/${gateway.name}`,
      gatewayId: gateway.id,
      gatewayName: gateway.name,
    }];
  }
}

// ── Default gateways ───────────────────────────────────────────────────────────

const DEFAULT_GATEWAYS: RemoteGateway[] = [
  { id: "mikesai2", name: "Gabriel", url: "https://mikesai2.tail09297b.ts.net", token: "245d70199eb9d85b91366c3f80a4bdee9c35c4d33e609b29", emoji: "👼", agentName: "Gabriel", status: "unknown", lastSeen: null },
  { id: "mikesai3", name: "Rafael", url: "https://mikesai3.tail09297b.ts.net", token: "06388975354b0cbf69d22dc5848079af56e860f2628aa85f", emoji: "🎨", agentName: "Rafael", status: "unknown", lastSeen: null },
];

// ── Main component ─────────────────────────────────────────────────────────────

export function AgentHub() {
  const [activeTab, setActiveTab] = useState("overview");
  const [agents, setAgents] = useState<HubAgent[]>([]);
  const [tasks] = useState<HubTask[]>(MOCK_TASKS);
  const [gateways, setGateways] = useState<RemoteGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGatewaySettings, setShowGatewaySettings] = useState(false);
  const [editingGateway, setEditingGateway] = useState<RemoteGateway | null>(null);

  // Load gateways from localStorage
  const loadGateways = useCallback(() => {
    try {
      const stored = localStorage.getItem(GATEWAY_STORAGE_KEY);
      if (stored) {
        setGateways(JSON.parse(stored));
      } else {
        setGateways(DEFAULT_GATEWAYS);
        localStorage.setItem(GATEWAY_STORAGE_KEY, JSON.stringify(DEFAULT_GATEWAYS));
      }
    } catch {
      setGateways(DEFAULT_GATEWAYS);
    }
  }, []);

  const fetchAllAgents = useCallback(async (gatewaysToFetch: RemoteGateway[]) => {
    setLoading(true);
    setError(null);
    try {
      // Always add local gateway first
      const localRes = await fetch("/api/agents");
      const localData = await localRes.json();
      const localAgents: HubAgent[] = (localData.agents || []).map((a: Record<string, unknown>) => ({
        id: String(a.id || ""),
        name: String(a.name || a.id || ""),
        emoji: String(a.emoji || "🤖"),
        role: a.identitySnippet ? String(a.identitySnippet).slice(0, 60) : String(a.model || "AI Agent"),
        status: a.status === "active" ? "active" : a.status === "idle" ? "idle" : "offline",
        model: String(a.model || ""),
        totalTokens: (a.totalTokens as number) || 0,
        lastActive: a.lastActive as number | null,
        sessionCount: (a.sessionCount as number) || 0,
        channels: (a.channels as string[]) || [],
        workspace: String(a.workspace || ""),
        gatewayId: "local",
        gatewayName: "Aiona",
      }));

      // Fetch from all remote gateways in parallel
      const remoteResults = await Promise.all(gatewaysToFetch.map(g => fetchAgentsFromGateway(g)));

      const allAgents = [...localAgents, ...remoteResults.flat()];

      // Update gateway statuses
      const now = Date.now();
      setGateways(prev => prev.map(g => {
        const gAgents = allAgents.filter(a => a.gatewayId === g.id);
        const hasOnline = gAgents.some(a => a.status !== "offline");
        return { ...g, status: hasOnline ? "online" : "offline", lastSeen: hasOnline ? now : g.lastSeen };
      }));

      setAgents(allAgents);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGateways(); }, [loadGateways]);

  useEffect(() => {
    if (gateways.length > 0) {
      fetchAllAgents(gateways);
    }
  }, [gateways, fetchAllAgents]);

  const saveGateway = (gw: RemoteGateway) => {
    const updated = gateways.map(g => g.id === gw.id ? gw : g);
    if (!updated.find(g => g.id === gw.id)) updated.push(gw);
    setGateways(updated);
    localStorage.setItem(GATEWAY_STORAGE_KEY, JSON.stringify(updated));
    setEditingGateway(null);
    fetchAllAgents(updated);
  };

  const removeGateway = (id: string) => {
    const updated = gateways.filter(g => g.id !== id);
    setGateways(updated);
    localStorage.setItem(GATEWAY_STORAGE_KEY, JSON.stringify(updated));
    fetchAllAgents(updated);
  };

  const totalTokens = agents.reduce((sum, a) => sum + a.totalTokens, 0);
  const activeCount = agents.filter(a => a.status === "active").length;
  const onlineGateways = gateways.filter(g => g.status === "online").length;

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><RefreshCw className="h-8 w-8 animate-spin text-[var(--smf-primary)]" /></div>;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors", activeTab === tab.id ? "bg-[var(--smf-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]")}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "gateways" && (
            <button onClick={() => setEditingGateway({ id: "", name: "", url: "", token: "", emoji: "🤖", agentName: "", status: "unknown", lastSeen: null })} className="flex items-center gap-2 rounded-lg bg-[var(--smf-primary)] px-3 py-2 text-sm font-medium text-white">
              <Plus className="h-4 w-4" />Add Gateway
            </button>
          )}
          <button onClick={() => fetchAllAgents(gateways)} className="flex items-center gap-2 rounded-lg bg-[var(--bg-hover)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--border)]">
            <RefreshCw className="h-4 w-4" />Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "overview" && <OverviewTab agents={agents} tasks={tasks} totalTokens={totalTokens} activeCount={activeCount} />}
        {activeTab === "org" && <OrgChartTab agents={agents} gateways={gateways} />}
        {activeTab === "tasks" && <TasksTab tasks={tasks} agents={agents} />}
        {activeTab === "gateways" && (
          <GatewaysTab gateways={gateways} onEdit={setEditingGateway} onRemove={removeGateway} onSave={saveGateway} editingGateway={editingGateway} />
        )}
      </div>
    </div>
  );
}

// ── Overview ───────────────────────────────────────────────────────────────────

function OverviewTab({ agents, tasks, totalTokens, activeCount }: { agents: HubAgent[]; tasks: HubTask[]; totalTokens: number; activeCount: number }) {
  const doneTasks = tasks.filter(t => t.status === "done").length;
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">Agent Hub Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Connected Agents" value={`${activeCount}/${agents.length}`} icon="🤖" />
        <StatCard label="Tasks Completed" value={`${doneTasks}/${tasks.length}`} icon="✅" />
        <StatCard label="Total Tokens" value={totalTokens > 0 ? `${(totalTokens/1000).toFixed(0)}k` : "—"} icon="🔢" />
        <StatCard label="Uptime" value={activeCount > 0 ? "All systems go" : "Offline"} icon="☁️" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">All Agents</h3>
          <div className="space-y-3">
            {agents.map(agent => (
              <div key={agent.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{agent.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{agent.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{agent.gatewayName} · {agent.model}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", agent.status === "active" ? "bg-[var(--smf-success)]" : agent.status === "idle" ? "bg-[var(--smf-warning)]" : "bg-[var(--text-muted)]")} />
                  <span className="text-xs text-[var(--text-muted)]">{agent.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Tasks</h3>
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                <span>{task.status === "done" ? "☑️" : task.status === "in-progress" ? "🔄" : "☐"}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm truncate", task.status === "done" ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]")}>{task.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{task.assignedTo}</p>
                </div>
                <span className={cn("px-2 py-1 rounded text-xs", task.priority === "high" ? "bg-[var(--smf-danger)]/10 text-[var(--smf-danger)]" : task.priority === "medium" ? "bg-[var(--smf-warning)]/10 text-[var(--smf-warning)]" : "bg-[var(--smf-success)]/10 text-[var(--smf-success)]")}>{task.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Org Chart ─────────────────────────────────────────────────────────────────

function OrgChartTab({ agents, gateways }: { agents: HubAgent[]; gateways: RemoteGateway[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Org Chart</h2>
        <span className="text-sm text-[var(--text-muted)]">{agents.length} agent{agents.length !== 1 ? "s" : ""} · {gateways.filter(g => g.status === "online").length} gateway{gateways.filter(g => g.status === "online").length !== 1 ? "s" : ""} online</span>
      </div>
      <div className="space-y-4">
        {gateways.map(gw => {
          const gwAgents = agents.filter(a => a.gatewayId === gw.id);
          return (
            <div key={gw.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[var(--border)]">
                <span className={cn("w-3 h-3 rounded-full", gw.status === "online" ? "bg-[var(--smf-success)]" : "bg-[var(--text-muted)]")} />
                <span className="text-lg">{gw.emoji}</span>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{gw.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{gw.url}</p>
                </div>
              </div>
              <div className="space-y-2">
                {gwAgents.length === 0 && <p className="text-sm text-[var(--text-muted)] italic">No agents</p>}
                {gwAgents.map(agent => (
                  <div key={agent.id} className="flex items-center gap-3 ml-4">
                    <span className="text-lg">{agent.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium text-[var(--text-primary)]">{agent.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{agent.model} · {agent.sessionCount} sessions · {agent.totalTokens > 0 ? `${(agent.totalTokens/1000).toFixed(1)}k tokens` : "no data"}</p>
                    </div>
                    <span className={cn("px-2 py-1 rounded text-xs", agent.status === "active" ? "bg-[var(--smf-success)]/10 text-[var(--smf-success)]" : agent.status === "idle" ? "bg-[var(--smf-warning)]/10 text-[var(--smf-warning)]" : "bg-[var(--bg-hover)] text-[var(--text-muted)]")}>{agent.status}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

function TasksTab({ tasks, agents }: { tasks: HubTask[]; agents: HubAgent[] }) {
  const [filter, setFilter] = useState<"all" | "todo" | "in-progress" | "done">("all");
  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);
  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Tasks</h2>
      <div className="flex gap-2 mb-4">
        {(["all", "todo", "in-progress", "done"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={cn("rounded-lg px-3 py-1.5 text-sm font-medium", filter === f ? "bg-[var(--smf-primary)] text-white" : "bg-[var(--bg-hover)] text-[var(--text-secondary)]")}>
            {f === "all" ? "All" : f === "in-progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map(task => (
          <div key={task.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-4">
            <span>{task.status === "done" ? "☑️" : task.status === "in-progress" ? "🔄" : "☐"}</span>
            <div className="flex-1">
              <p className={cn("text-sm font-medium", task.status === "done" && "line-through text-[var(--text-muted)]")}>{task.title}</p>
              <p className="text-xs text-[var(--text-muted)]">{task.assignedTo}</p>
            </div>
            <span className={cn("px-2 py-1 rounded text-xs", task.priority === "high" ? "bg-[var(--smf-danger)]/10 text-[var(--smf-danger)]" : task.priority === "medium" ? "bg-[var(--smf-warning)]/10 text-[var(--smf-warning)]" : "bg-[var(--smf-success)]/10 text-[var(--smf-success)]")}>{task.priority}</span>
            {task.due && <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-hover)] px-2 py-1 rounded">{task.due}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Gateways ─────────────────────────────────────────────────────────────────

function GatewaysTab({ gateways, onEdit, onRemove, onSave, editingGateway }: {
  gateways: RemoteGateway[];
  onEdit: (gw: RemoteGateway | null) => void;
  onRemove: (id: string) => void;
  onSave: (gw: RemoteGateway) => void;
  editingGateway: RemoteGateway | null;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Connected Gateways</h2>
      <div className="grid lg:grid-cols-2 gap-4">
        {gateways.map(gw => (
          <div key={gw.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{gw.emoji}</span>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{gw.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{gw.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("w-2.5 h-2.5 rounded-full", gw.status === "online" ? "bg-[var(--smf-success)]" : gw.status === "offline" ? "bg-[var(--smf-danger)]" : "bg-[var(--smf-warning)]")} />
                <span className="text-xs text-[var(--text-muted)]">{gw.status}</span>
              </div>
            </div>
            <div className="text-xs text-[var(--text-muted)] space-y-1 mb-3">
              <p>Agent: {gw.agentName}</p>
              <p>Token: {gw.token.slice(0, 8)}...</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(gw)} className="flex items-center gap-1 rounded-lg bg-[var(--bg-hover)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--border)]">
                <Settings className="h-3 w-3" />Edit
              </button>
              <button onClick={() => onRemove(gw.id)} className="flex items-center gap-1 rounded-lg bg-[var(--smf-danger)]/10 px-3 py-1.5 text-xs font-medium text-[var(--smf-danger)] hover:bg-[var(--smf-danger)]/20">
                <X className="h-3 w-3" />Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingGateway && (
        <GatewayEditor gateway={editingGateway} onSave={onSave} onCancel={() => onEdit(null)} />
      )}
    </div>
  );
}

function GatewayEditor({ gateway, onSave, onCancel }: { gateway: RemoteGateway; onSave: (gw: RemoteGateway) => void; onCancel: () => void }) {
  const [gw, setGw] = useState(gateway);
  return (
    <div className="mt-6 bg-[var(--bg-card)] border border-[var(--smf-primary)]/30 rounded-xl p-4">
      <h3 className="font-semibold text-[var(--text-primary)] mb-4">{gw.id ? "Edit Gateway" : "Add Gateway"}</h3>
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <label className="space-y-1">
          <span className="text-xs text-[var(--text-secondary)]">Name</span>
          <input value={gw.name} onChange={e => setGw({ ...gw, name: e.target.value })} placeholder="Gabriel" className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)]" />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-[var(--text-secondary)]">Emoji</span>
          <input value={gw.emoji} onChange={e => setGw({ ...gw, emoji: e.target.value })} placeholder="👼" className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)]" />
        </label>
        <label className="space-y-1 lg:col-span-2">
          <span className="text-xs text-[var(--text-secondary)]">Gateway URL</span>
          <input value={gw.url} onChange={e => setGw({ ...gw, url: e.target.value })} placeholder="https://mikesai2.tail09297b.ts.net" className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)]" />
        </label>
        <label className="space-y-1 lg:col-span-2">
          <span className="text-xs text-[var(--text-secondary)]">Auth Token</span>
          <input value={gw.token} onChange={e => setGw({ ...gw, token: e.target.value })} placeholder="gateway auth token" className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)]" />
        </label>
        <label className="space-y-1 lg:col-span-2">
          <span className="text-xs text-[var(--text-secondary)]">Agent Name</span>
          <input value={gw.agentName} onChange={e => setGw({ ...gw, agentName: e.target.value })} placeholder="Gabriel" className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)]" />
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave(gw)} className="flex items-center gap-2 rounded-lg bg-[var(--smf-primary)] px-4 py-2 text-sm font-medium text-white">
          <Check className="h-4 w-4" />Save
        </button>
        <button onClick={onCancel} className="rounded-lg bg-[var(--bg-hover)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)]">Cancel</button>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
          <p className="text-xs text-[var(--text-muted)]">{label}</p>
        </div>
      </div>
    </div>
  );
}
