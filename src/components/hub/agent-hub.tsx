"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Network, CheckSquare, DollarSign, Heart, Plus, MoreHorizontal, RefreshCw, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AgentNode {
  id: string;
  name: string;
  emoji: string;
  role: string;
  parentId?: string;
  status: "active" | "idle" | "offline";
  model: string;
  monthlyBudget?: number;
  spentToday: number;
  lastActive: number | null;
  sessionCount: number;
  totalTokens: number;
  channels: string[];
  workspace: string;
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
  { id: "budgets", label: "Budgets", icon: <DollarSign className="h-4 w-4" /> },
  { id: "heartbeats", label: "Heartbeats", icon: <Heart className="h-4 w-4" /> },
];

const MOCK_TASKS: HubTask[] = [
  { id: "t1", title: "Publish Q1 blog post", assignedTo: "writer", status: "done", priority: "high" },
  { id: "t2", title: "Review agent performance", assignedTo: "main", status: "in-progress", priority: "high", due: "today" },
  { id: "t3", title: "Schedule social posts", assignedTo: "main", status: "todo", priority: "medium", due: "tomorrow" },
];

// ── Main component ─────────────────────────────────────────────────────────────

export function AgentHub() {
  const [activeTab, setActiveTab] = useState("overview");
  const [agents, setAgents] = useState<AgentNode[]>([]);
  const [tasks] = useState<HubTask[]>(MOCK_TASKS);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Read gateway URL from localStorage (same pattern as useOpenClaw)
      let gatewayUrl = "local";
      if (typeof window !== "undefined") {
        try {
          const settings = JSON.parse(localStorage.getItem("openclaw.settings") || "{}");
          gatewayUrl = settings.currentGateway || "local";
        } catch { /* ignore */ }
      }

      const headers: Record<string, string> = {};
      if (gatewayUrl && gatewayUrl !== "local") {
        headers["x-gateway-url"] = gatewayUrl;
      }

      const [agentsRes, usageRes] = await Promise.all([
        fetch("/api/agents", { headers }),
        fetch("/api/usage", { headers }).catch(() => null),
      ]);

      if (!agentsRes.ok) throw new Error("Failed to load agents");
      const data = await agentsRes.json();

      const mapped: AgentNode[] = (data.agents || []).map((a: Record<string, unknown>) => ({
        id: String(a.id || ""),
        name: String(a.name || a.id || ""),
        emoji: String(a.emoji || "🤖"),
        role: a.identitySnippet ? String(a.identitySnippet).slice(0, 60) : String(a.model || "AI Agent"),
        status: a.status === "active" ? "active" : a.status === "idle" ? "idle" : "offline",
        model: String(a.model || ""),
        spentToday: 0,
        lastActive: a.lastActive as number | null,
        sessionCount: (a.sessionCount as number) || 0,
        totalTokens: (a.totalTokens as number) || 0,
        channels: (a.channels as string[]) || [],
        workspace: String(a.workspace || ""),
      }));

      setAgents(mapped);

      if (usageRes?.ok) {
        const u = await usageRes.json();
        setUsage({ totalTokens: u.totalTokens || 0, totalCost: u.totalCost || 0, period: u.period || "30d" });
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const totalSpend = agents.reduce((sum, a) => sum + a.spentToday, 0);
  const activeCount = agents.filter((a) => a.status === "active").length;
  const totalBudget = agents.reduce((sum, a) => sum + (a.monthlyBudget || 0), 0);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-[var(--smf-primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-[var(--smf-danger)]">Failed to load: {error}</p>
        <button onClick={fetchAgents} className="rounded-lg bg-[var(--smf-primary)] px-4 py-2 text-sm font-medium text-white">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-[var(--smf-primary)] text-white"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={fetchAgents}
          className="flex items-center gap-2 rounded-lg bg-[var(--bg-hover)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--border)]"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="p-6">
        {activeTab === "overview" && <OverviewTab agents={agents} tasks={tasks} totalSpend={totalSpend} activeCount={activeCount} usage={usage} />}
        {activeTab === "org" && <OrgChartTab agents={agents} />}
        {activeTab === "tasks" && <TasksTab tasks={tasks} agents={agents} />}
        {activeTab === "budgets" && <BudgetsTab agents={agents} totalBudget={totalBudget} />}
        {activeTab === "heartbeats" && <HeartbeatsTab agents={agents} />}
      </div>
    </div>
  );
}

function OverviewTab({ agents, tasks, totalSpend, activeCount, usage }: {
  agents: AgentNode[]; tasks: HubTask[]; totalSpend: number; activeCount: number; usage: UsageData | null;
}) {
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">Agent Hub Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Agents" value={`${activeCount}/${agents.length}`} icon="🤖" />
        <StatCard label="Tasks In Progress" value={`${inProgressTasks}`} icon="📋" />
        <StatCard label="Tasks Done Today" value={`${doneTasks}`} icon="✅" />
        <StatCard label="Total Tokens" value={usage ? `${(usage.totalTokens / 1000).toFixed(0)}k` : "—"} icon="🔢" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Connected Agents</h3>
          <div className="space-y-3">
            {agents.slice(0, 5).map((agent) => (
              <div key={agent.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{agent.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{agent.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{agent.channels.length > 0 ? agent.channels.join(", ") : agent.model}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn("w-2 h-2 rounded-full", agent.status === "active" ? "bg-[var(--smf-success)]" : agent.status === "idle" ? "bg-[var(--smf-warning)]" : "bg-[var(--text-muted)]")} />
                  <span className="text-xs text-[var(--text-muted)]">{agent.status}</span>
                </div>
              </div>
            ))}
            {agents.length === 0 && <p className="text-sm text-[var(--text-muted)] text-center py-4">No agents found — add one in Agents</p>}
          </div>
        </div>
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Active Tasks</h3>
          <div className="space-y-2">
            {tasks.filter((t) => t.status !== "done").map((task) => (
              <div key={task.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                <span className={cn("w-2 h-2 rounded-full", task.priority === "high" ? "bg-[var(--smf-danger)]" : task.priority === "medium" ? "bg-[var(--smf-warning)]" : "bg-[var(--smf-success)]")} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)] truncate">{task.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{agents.find(a => a.id === task.assignedTo)?.name || task.assignedTo}</p>
                </div>
                {task.due && <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-hover)] px-2 py-1 rounded">{task.due}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrgChartTab({ agents }: { agents: AgentNode[] }) {
  const roots = agents.filter((a) => !a.parentId);
  const getChildren = (parentId: string) => agents.filter((a) => a.parentId === parentId);

  const renderNode = (agent: AgentNode, depth = 0) => {
    const children = getChildren(agent.id);
    return (
      <div key={agent.id}>
        <div className={cn("bg-[var(--bg-card)] border rounded-xl p-4 mb-2", depth === 0 ? "border-[var(--smf-primary)]/30" : "border-[var(--border)]")} style={{ marginLeft: depth * 32 }}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{agent.emoji}</span>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">{agent.name}</p>
              <p className="text-sm text-[var(--text-secondary)]">{agent.role}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {agent.channels.map((ch) => (
                <span key={ch} className="text-xs bg-[var(--bg-hover)] px-2 py-1 rounded text-[var(--text-muted)]">{ch}</span>
              ))}
              {agent.sessionCount > 0 && (
                <span className="text-xs bg-[var(--smf-primary)]/10 text-[var(--smf-primary)] px-2 py-1 rounded">
                  {agent.sessionCount} session{agent.sessionCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          {children.length > 0 && <div className="mt-3 pt-3 border-t border-[var(--border)]">{children.map((c) => renderNode(c, depth + 1))}</div>}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Org Chart</h2>
        <span className="text-sm text-[var(--text-muted)]">{agents.length} agent{agents.length !== 1 ? "s" : ""}</span>
      </div>
      {roots.length > 0 ? roots.map((r) => renderNode(r)) : <p className="text-[var(--text-muted)]">No agents configured</p>}
    </div>
  );
}

function TasksTab({ tasks, agents }: { tasks: HubTask[]; agents: AgentNode[] }) {
  const [filter, setFilter] = useState<"all" | "todo" | "in-progress" | "done">("all");
  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Tasks</h2>
        <button className="flex items-center gap-2 rounded-lg bg-[var(--smf-primary)] px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" />New Task</button>
      </div>
      <div className="flex gap-2 mb-4">
        {(["all", "todo", "in-progress", "done"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("rounded-lg px-3 py-1.5 text-sm font-medium", filter === f ? "bg-[var(--smf-primary)] text-white" : "bg-[var(--bg-hover)] text-[var(--text-secondary)]")}>
            {f === "all" ? "All" : f === "in-progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((task) => (
          <div key={task.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-4">
            <button className="text-[var(--text-muted)]">{task.status === "done" ? "☑️" : task.status === "in-progress" ? "🔄" : "☐"}</button>
            <div className="flex-1">
              <p className={cn("text-sm font-medium", task.status === "done" && "line-through text-[var(--text-muted)]")}>{task.title}</p>
              <p className="text-xs text-[var(--text-muted)]">{agents.find(a => a.id === task.assignedTo)?.name || task.assignedTo}</p>
            </div>
            <span className={cn("px-2 py-1 rounded text-xs font-medium", task.priority === "high" ? "bg-[var(--smf-danger)]/10 text-[var(--smf-danger)]" : task.priority === "medium" ? "bg-[var(--smf-warning)]/10 text-[var(--smf-warning)]" : "bg-[var(--smf-success)]/10 text-[var(--smf-success)]")}>{task.priority}</span>
            {task.due && <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-hover)] px-2 py-1 rounded">{task.due}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetsTab({ agents, totalBudget }: { agents: AgentNode[]; totalBudget: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Agent Budgets</h2>
        <button className="flex items-center gap-2 rounded-lg bg-[var(--smf-primary)] px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" />Set Budget</button>
      </div>
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--text-secondary)]">Total Monthly Budget</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">${totalBudget.toFixed(0)}</span>
        </div>
        <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--smf-primary)] rounded-full" style={{ width: "0%" }} />
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">Budget limits coming soon</p>
      </div>
      <div className="space-y-3">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{agent.emoji}</span>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{agent.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{agent.model}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{agent.totalTokens > 0 ? `${(agent.totalTokens / 1000).toFixed(1)}k tokens` : "—"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeartbeatsTab({ agents }: { agents: AgentNode[] }) {
  const formatLastActive = (ts: number | null) => {
    if (!ts) return "never";
    const diff = Date.now() - ts;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Heartbeat Schedules</h2>
        <button className="flex items-center gap-2 rounded-lg bg-[var(--smf-primary)] px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" />Add Schedule</button>
      </div>
      <div className="space-y-3">
        {agents.filter((a) => a.status !== "offline").map((agent) => (
          <div key={agent.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-4">
            <span className="text-2xl">💓</span>
            <div className="flex-1">
              <p className="font-medium text-[var(--text-primary)]">{agent.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{agent.workspace}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-[var(--smf-primary)]">Every 30 min</p>
              <p className="text-xs text-[var(--text-muted)]">Last: {formatLastActive(agent.lastActive)}</p>
            </div>
            <button className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"><MoreHorizontal className="h-4 w-4" /></button>
          </div>
        ))}
        {agents.filter((a) => a.status !== "offline").length === 0 && (
          <p className="text-sm text-[var(--text-muted)] text-center py-8">No active agents to schedule</p>
        )}
      </div>
    </div>
  );
}

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
