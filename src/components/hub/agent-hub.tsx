"use client";

import React, { useState } from "react";
import { Network, CheckSquare, DollarSign, Heart, Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface AgentNode {
  id: string;
  name: string;
  role: string;
  parentId?: string;
  status: "active" | "idle" | "offline";
  model: string;
  monthlyBudget?: number;
  spentToday: number;
  lastActive: string;
}

interface TaskItem {
  id: string;
  title: string;
  assignedTo: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  due?: string;
}

const MOCK_AGENTS: AgentNode[] = [
  { id: "ceo", name: "Michael", role: "CEO / Founder", status: "active", model: "minimax-m2.7", spentToday: 0.12, lastActive: "now" },
  { id: "aiona", name: "Aiona Edge", role: "Chief of Staff", parentId: "ceo", status: "active", model: "minimax-m2.7", spentToday: 2.47, lastActive: "now" },
  { id: "writer", name: "Content Writer", role: "Content Lead", parentId: "aiona", status: "idle", model: "kimi-k2.5", spentToday: 1.20, lastActive: "2h ago" },
  { id: "coder", name: "Code Agent", role: "Engineering", parentId: "aiona", status: "active", model: "minimax-m2.7", monthlyBudget: 200, spentToday: 8.40, lastActive: "now" },
  { id: "marketer", name: "Marketing Agent", role: "Growth", parentId: "aiona", status: "offline", model: "kimi-k2.5", spentToday: 0, lastActive: "1d ago" },
];

const MOCK_TASKS: TaskItem[] = [
  { id: "t1", title: "Publish Q1 blog post", assignedTo: "writer", status: "done", priority: "high" },
  { id: "t2", title: "Fix dashboard bug", assignedTo: "coder", status: "in-progress", priority: "high", due: "today" },
  { id: "t3", title: "Schedule social posts", assignedTo: "marketer", status: "todo", priority: "medium", due: "tomorrow" },
  { id: "t4", title: "Review agent performance", assignedTo: "aiona", status: "todo", priority: "low" },
];

export function AgentHub() {
  const [activeTab, setActiveTab] = useState("overview");
  const [agents] = useState<AgentNode[]>(MOCK_AGENTS);
  const [tasks] = useState<TaskItem[]>(MOCK_TASKS);

  const totalSpend = agents.reduce((sum, a) => sum + a.spentToday, 0);
  const activeCount = agents.filter((a) => a.status === "active").length;
  const totalBudget = agents.reduce((sum, a) => sum + (a.monthlyBudget || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-[var(--border)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-1 px-4 py-2">
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
      </div>

      <div className="p-6">
        {activeTab === "overview" && (
          <OverviewTab agents={agents} tasks={tasks} totalSpend={totalSpend} activeCount={activeCount} />
        )}
        {activeTab === "org" && <OrgChartTab agents={agents} />}
        {activeTab === "tasks" && <TasksTab tasks={tasks} agents={agents} />}
        {activeTab === "budgets" && <BudgetsTab agents={agents} totalBudget={totalBudget} />}
        {activeTab === "heartbeats" && <HeartbeatsTab agents={agents} />}
      </div>
    </div>
  );
}

function OverviewTab({ agents, tasks, totalSpend, activeCount }: {
  agents: AgentNode[];
  tasks: TaskItem[];
  totalSpend: number;
  activeCount: number;
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
        <StatCard label="Spend Today" value={`$${totalSpend.toFixed(2)}`} icon="💰" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {agents.slice(0, 3).map((agent) => (
              <div key={agent.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{agent.status === "active" ? "🟢" : agent.status === "idle" ? "🟡" : "⚫"}</span>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{agent.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{agent.role}</p>
                  </div>
                </div>
                <span className="text-xs text-[var(--text-muted)]">{agent.lastActive}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Active Tasks</h3>
          <div className="space-y-2">
            {tasks.filter((t) => t.status !== "done").map((task) => (
              <div key={task.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  task.priority === "high" ? "bg-[var(--smf-danger)]" :
                  task.priority === "medium" ? "bg-[var(--smf-warning)]" : "bg-[var(--smf-success)]"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)] truncate">{task.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{agents.find(a => a.id === task.assignedTo)?.name}</p>
                </div>
                {task.due && (
                  <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-hover)] px-2 py-1 rounded">
                    {task.due}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrgChartTab({ agents }: { agents: AgentNode[] }) {
  const getChildren = (parentId: string) => agents.filter((a) => a.parentId === parentId);

  const renderNode = (agent: AgentNode, depth = 0) => {
    const children = getChildren(agent.id);
    return (
      <div key={agent.id} className="relative">
        <div
          className={cn(
            "bg-[var(--bg-card)] border rounded-xl p-4 mb-2",
            depth === 0 ? "border-[var(--smf-primary)]/30" : "border-[var(--border)]"
          )}
          style={{ marginLeft: depth * 32 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{agent.status === "active" ? "🟢" : agent.status === "idle" ? "🟡" : "⚫"}</span>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">{agent.name}</p>
              <p className="text-sm text-[var(--text-secondary)]">{agent.role}</p>
            </div>
          </div>
          {children.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              {children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const root = agents.find((a) => !a.parentId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Org Chart</h2>
        <button className="flex items-center gap-2 rounded-lg bg-[var(--smf-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--smf-primary)]/90">
          <Plus className="h-4 w-4" />
          Add Agent
        </button>
      </div>
      {root ? renderNode(root) : <p className="text-[var(--text-muted)]">No org structure defined</p>}
    </div>
  );
}

function TasksTab({ tasks, agents }: { tasks: TaskItem[]; agents: AgentNode[] }) {
  const [filter, setFilter] = useState<"all" | "todo" | "in-progress" | "done">("all");
  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Tasks</h2>
        <button className="flex items-center gap-2 rounded-lg bg-[var(--smf-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--smf-primary)]/90">
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(["all", "todo", "in-progress", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              filter === f
                ? "bg-[var(--smf-primary)] text-white"
                : "bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
            )}
          >
            {f === "all" ? "All" : f === "in-progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((task) => (
          <div key={task.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-4">
            <button className="text-[var(--text-muted)] hover:text-[var(--smf-primary)]">
              {task.status === "done" ? "☑️" : task.status === "in-progress" ? "🔄" : "☐"}
            </button>
            <div className="flex-1">
              <p className={cn("text-sm font-medium", task.status === "done" && "line-through text-[var(--text-muted)]")}>
                {task.title}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{agents.find(a => a.id === task.assignedTo)?.name}</p>
            </div>
            <span className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              task.priority === "high" ? "bg-[var(--smf-danger)]/10 text-[var(--smf-danger)]" :
              task.priority === "medium" ? "bg-[var(--smf-warning)]/10 text-[var(--smf-warning)]" :
              "bg-[var(--smf-success)]/10 text-[var(--smf-success)]"
            )}>
              {task.priority}
            </span>
            {task.due && (
              <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-hover)] px-2 py-1 rounded">
                {task.due}
              </span>
            )}
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
        <button className="flex items-center gap-2 rounded-lg bg-[var(--smf-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--smf-primary)]/90">
          <Plus className="h-4 w-4" />
          Set Budget
        </button>
      </div>

      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--text-secondary)]">Total Monthly Budget</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">${totalBudget.toFixed(0)}</span>
        </div>
        <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--smf-primary)] rounded-full" style={{ width: "32%" }} />
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">32% of budget used this month</p>
      </div>

      <div className="space-y-3">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-lg">{agent.status === "active" ? "🟢" : agent.status === "idle" ? "🟡" : "⚫"}</span>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{agent.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{agent.role}</p>
                </div>
              </div>
              {agent.monthlyBudget && (
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">${(agent.spentToday * 30).toFixed(0)}/mo</p>
                  <p className="text-xs text-[var(--text-muted)]">of ${agent.monthlyBudget}</p>
                </div>
              )}
            </div>
            {agent.monthlyBudget && (
              <div className="h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    (agent.spentToday * 30) > agent.monthlyBudget ? "bg-[var(--smf-danger)]" : "bg-[var(--smf-success)]"
                  )}
                  style={{ width: `${Math.min(100, (agent.spentToday * 30 / agent.monthlyBudget) * 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HeartbeatsTab({ agents }: { agents: AgentNode[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Heartbeat Schedules</h2>
        <button className="flex items-center gap-2 rounded-lg bg-[var(--smf-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--smf-primary)]/90">
          <Plus className="h-4 w-4" />
          Add Schedule
        </button>
      </div>

      <div className="space-y-3">
        {agents.filter(a => a.status !== "offline").map((agent) => (
          <div key={agent.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-4">
            <span className="text-2xl">💓</span>
            <div className="flex-1">
              <p className="font-medium text-[var(--text-primary)]">{agent.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{agent.role}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-[var(--smf-primary)]">Every 30 min</p>
              <p className="text-xs text-[var(--text-muted)]">Last: {agent.lastActive}</p>
            </div>
            <button className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        ))}
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
