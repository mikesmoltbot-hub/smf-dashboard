"use client";

import React, { useState, useEffect } from "react";
import { Network, CheckSquare, Server, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RemoteGateway {
  id: string;
  name: string;
  url: string;
  token: string;
  emoji: string;
  agentName: string;
  status: "online" | "offline" | "unknown";
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

interface HubTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const TABS: HubTab[] = [
  { id: "overview", label: "Overview", icon: <Network className="h-4 w-4" /> },
  { id: "org", label: "Org Chart", icon: <Network className="h-4 w-4" /> },
  { id: "gateways", label: "Gateways", icon: <Server className="h-4 w-4" /> },
];

const GATEWAY_STORAGE_KEY = "smf.hub.gateways";

const DEFAULT_GATEWAYS: RemoteGateway[] = [
  { id: "mikesai2", name: "Gabriel", url: "https://mikesai2.tail09297b.ts.net", token: "245d70199eb9d85b91366c3f80a4bdee9c35c4d33e609b29", emoji: "👼", agentName: "Gabriel", status: "unknown" },
  { id: "mikesai3", name: "Rafael", url: "https://mikesai3.tail09297b.ts.net", token: "06388975354b0cbf69d22dc5848079af56e860f2628aa85f", emoji: "🎨", agentName: "Rafael", status: "unknown" },
];

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

export function AgentHub() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [agents, setAgents] = useState<HubAgent[]>([]);
  const [gateways, setGateways] = useState<RemoteGateway[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load gateways from localStorage once
  useEffect(() => {
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

  // Fetch all agents when gateways are loaded
  useEffect(() => {
    if (gateways.length === 0) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        // Fetch local agents
        const localRes = await fetch("/api/agents");
        const localData = await localRes.json();
        const localAgents: HubAgent[] = (localData.agents || []).map((a: Record<string, unknown>) => ({
          id: String(a.id || ""),
          name: String(a.name || a.id || ""),
          emoji: String(a.emoji || "🤖"),
          role: String(a.model || "AI Agent"),
          status: a.status === "active" ? "active" as const : a.status === "idle" ? "idle" as const : "offline" as const,
          model: String(a.model || ""),
          totalTokens: (a.totalTokens as number) || 0,
          lastActive: a.lastActive as number | null,
          sessionCount: (a.sessionCount as number) || 0,
          channels: (a.channels as string[]) || [],
          workspace: String(a.workspace || ""),
          gatewayId: "local",
          gatewayName: "Aiona",
        }));

        // Fetch remote agents
        const remoteResults = await Promise.all(gateways.map(g => fetchAgentsFromGateway(g)));
        if (!cancelled) {
          const allAgents = [...localAgents, ...remoteResults.flat()];
          setAgents(allAgents);
          // Update gateway statuses
          const now = Date.now();
          setGateways(prev => prev.map(g => {
            const gAgents = allAgents.filter(a => a.gatewayId === g.id);
            const hasOnline = gAgents.some(a => a.status !== "offline");
            return { ...g, status: hasOnline ? "online" as const : "offline" as const };
          }));
        }
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [gateways]);

  const totalTokens = agents.reduce((sum, a) => sum + a.totalTokens, 0);
  const activeCount = agents.filter(a => a.status === "active").length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-[var(--smf-primary)]" />
        <span className="ml-3 text-[var(--text-secondary)]">Loading Agent Hub...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-[var(--smf-danger)]">Error: {error}</p>
        <button
          onClick={() => setGateways(gateways)}
          className="rounded-lg bg-[var(--smf-primary)] px-4 py-2 text-sm font-medium text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1">
          {TABS.map(tab => (
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
          onClick={() => setGateways([...gateways])}
          className="flex items-center gap-2 rounded-lg bg-[var(--bg-hover)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--border)]"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="p-6">
        {activeTab === "overview" && <OverviewTab agents={agents} totalTokens={totalTokens} activeCount={activeCount} />}
        {activeTab === "org" && <OrgChartTab agents={agents} gateways={gateways} />}
        {activeTab === "gateways" && <GatewaysTab gateways={gateways} />}
      </div>
    </div>
  );
}

function OverviewTab({ agents, totalTokens, activeCount }: { agents: HubAgent[]; totalTokens: number; activeCount: number }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">Agent Hub Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Connected Agents" value={`${activeCount}/${agents.length}`} icon="🤖" />
        <StatCard label="Total Tokens" value={totalTokens > 0 ? `${(totalTokens/1000).toFixed(0)}k` : "—"} icon="🔢" />
        <StatCard label="Gateways" value={`${agents.filter(a => a.gatewayId !== "local").length + 1}`} icon="🖥️" />
      </div>
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
              <span className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                agent.status === "active" ? "bg-[var(--smf-success)]/10 text-[var(--smf-success)]" :
                agent.status === "idle" ? "bg-[var(--smf-warning)]/10 text-[var(--smf-warning)]" :
                "bg-[var(--bg-hover)] text-[var(--text-muted)]"
              )}>
                {agent.status}
              </span>
            </div>
          ))}
          {agents.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">No agents found</p>
          )}
        </div>
      </div>
    </div>
  );
}

function OrgChartTab({ agents, gateways }: { agents: HubAgent[]; gateways: RemoteGateway[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Org Chart</h2>
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
                {gwAgents.map(agent => (
                  <div key={agent.id} className="flex items-center gap-3 ml-4">
                    <span className="text-lg">{agent.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium text-[var(--text-primary)]">{agent.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{agent.model}</p>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">{agent.sessionCount} sessions</span>
                  </div>
                ))}
                {gwAgents.length === 0 && (
                  <p className="text-sm text-[var(--text-muted)] italic ml-4">No agents</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GatewaysTab({ gateways }: { gateways: RemoteGateway[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Connected Gateways</h2>
      <div className="grid lg:grid-cols-2 gap-4">
        {gateways.map(gw => (
          <div key={gw.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{gw.emoji}</span>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{gw.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{gw.url}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className={cn("w-2.5 h-2.5 rounded-full", gw.status === "online" ? "bg-[var(--smf-success)]" : gw.status === "offline" ? "bg-[var(--smf-danger)]" : "bg-[var(--smf-warning)]")} />
                <span className="text-xs text-[var(--text-muted)]">{gw.status}</span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Agent: {gw.agentName}</p>
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
