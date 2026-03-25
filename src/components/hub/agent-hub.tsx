"use client";

import React, { useState, useEffect } from "react";

interface HubAgent {
  id: string;
  name: string;
  emoji: string;
  role: string;
  status: "active" | "idle" | "offline";
  model: string;
  gatewayId: string;
  gatewayName: string;
}

interface RemoteGateway {
  id: string;
  name: string;
  url: string;
  token: string;
  status: "online" | "offline";
}

const DEFAULT_GATEWAYS: RemoteGateway[] = [
  {
    id: "gabriel",
    name: "Gabriel",
    url: "https://mikesai2.tail09297b.ts.net",
    token: "245d70199eb9d85b91366c3f80a4bdee9c35c4d33e609b29",
    status: "offline",
  },
  {
    id: "rafael",
    name: "Rafael",
    url: "https://mikesai3.tail09297b.ts.net",
    token: "06388975354b0cbf69d22dc5848079af56e860f2628aa85f",
    status: "offline",
  },
];

interface SessionData {
  name?: string;
  model?: string;
  status?: string;
  displayName?: string;
}

function parseSessionsFromResponse(data: unknown): SessionData[] {
  try {
    // Handle the OpenClaw tool response format
    if (data && typeof data === "object" && "result" in (data as Record<string, unknown>)) {
      const result = (data as { result: unknown }).result;
      if (result && typeof result === "object" && "content" in (result as Record<string, unknown>)) {
        const content = (result as { content: unknown[] }).content;
        if (Array.isArray(content) && content.length > 0) {
          const first = content[0];
          if (typeof first === "object" && first !== null && "text" in (first as Record<string, unknown>)) {
            const text = (first as { text: string }).text;
            const parsed = JSON.parse(text);
            if (parsed && typeof parsed === "object" && "sessions" in parsed) {
              return (parsed as { sessions: SessionData[] }).sessions;
            }
          }
        }
      }
    }
  } catch {
    // Fall through
  }
  return [];
}

async function fetchRemoteAgents(gateway: RemoteGateway): Promise<{ gateway: RemoteGateway; agents: HubAgent[] }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${gateway.url}/tools/invoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${gateway.token}` },
      body: JSON.stringify({ tool: "sessions_list", action: "json", args: {} }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return { gateway: { ...gateway, status: "offline" }, agents: [] };

    const data = await res.json();
    const sessions = parseSessionsFromResponse(data);

    const agents = sessions.slice(0, 3).map((s: SessionData, i: number) => ({
      id: `${gateway.id}-${i}`,
      name: String(s.displayName || s.name || `${gateway.name} Session ${i + 1}`),
      emoji: "🤖",
      role: String(s.model || "AI Agent"),
      status: (s.status === "active" || s.status === "running") ? "active" as const : 
               s.status === "idle" ? "idle" as const : "offline" as const,
      model: String(s.model || ""),
      gatewayId: gateway.id,
      gatewayName: gateway.name,
    }));

    return { gateway: { ...gateway, status: agents.length > 0 ? "online" : "offline" }, agents };
  } catch {
    return { gateway: { ...gateway, status: "offline" }, agents: [] };
  }
}

export function AgentHub() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [agents, setAgents] = useState<HubAgent[]>([]);
  const [gateways, setGateways] = useState<RemoteGateway[]>(DEFAULT_GATEWAYS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingRemote, setLoadingRemote] = useState<boolean>(false);

  // Initial load - local only (fast)
  useEffect(() => {
    async function loadLocal() {
      try {
        const localRes = await fetch("/api/agents");
        if (!localRes.ok) throw new Error(`API ${localRes.status}`);
        const localData = await localRes.json();
        
        const localAgents: HubAgent[] = (localData.agents || []).map((a: Record<string, unknown>) => ({
          id: String(a.id || ""),
          name: String(a.name || a.id || ""),
          emoji: String(a.emoji || "🤖"),
          role: String(a.model || "AI Agent"),
          status: a.status === "active" ? "active" as const : a.status === "idle" ? "idle" as const : "offline" as const,
          model: String(a.model || ""),
          gatewayId: "local",
          gatewayName: "Aiona",
        }));

        setAgents(localAgents);
        setLoading(false);
        
        // Now fetch remote in background
        setLoadingRemote(true);
        const results = await Promise.allSettled(gateways.map(g => fetchRemoteAgents(g)));
        
        const allAgents = [...localAgents];
        const updatedGateways = [...gateways];
        
        results.forEach((result, i) => {
          if (result.status === "fulfilled") {
            allAgents.push(...result.value.agents);
            updatedGateways[i] = result.value.gateway;
          }
        });
        
        setAgents(allAgents);
        setGateways(updatedGateways);
        setLoadingRemote(false);
      } catch (err) {
        setError(String(err));
        setLoading(false);
      }
    }
    loadLocal();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setAgents([]);
    setGateways([...DEFAULT_GATEWAYS]);
  };

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-[var(--smf-danger)]">Error: {error}</p>
        <button onClick={handleRefresh} className="rounded-lg bg-[var(--smf-primary)] px-4 py-2 text-white">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Agent Hub</h1>
        <p className="text-[var(--text-secondary)]">
          {loading ? "Loading..." : `${agents.length} agent${agents.length !== 1 ? "s" : ""}`}
          {loadingRemote && !loading && " (fetching remote...)"}
        </p>
      </div>

      <button
        onClick={handleRefresh}
        className="mb-4 flex items-center gap-2 rounded-lg bg-[var(--smf-primary)] px-4 py-2 text-sm text-white"
      >
        Refresh
      </button>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!loading && agents.length === 0 && (
          <div className="col-span-full text-center py-8 text-[var(--text-muted)]">
            No agents found
          </div>
        )}
        {agents.map(agent => (
          <div key={agent.id} className="rounded-lg border border-[var(--border)] p-4 bg-[var(--bg-card)]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{agent.emoji}</span>
              <div>
                <p className="font-medium text-[var(--text-primary)]">{agent.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{agent.gatewayName}</p>
              </div>
            </div>
            <div className="mt-2 text-xs text-[var(--text-secondary)]">
              <p>Role: {agent.role}</p>
              <p>Status: <span className={agent.status === "active" ? "text-green-400" : agent.status === "idle" ? "text-yellow-400" : "text-stone-400"}>{agent.status}</span></p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-[var(--border)]">
        <h2 className="text-lg font-medium text-[var(--text-primary)] mb-3">Gateways</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {gateways.map(gw => (
            <div key={gw.id} className="rounded-lg border border-[var(--border)] p-4 bg-[var(--bg-card)]">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[var(--text-primary)]">{gw.name}</span>
                <span className={`text-xs px-2 py-1 rounded ${gw.status === "online" ? "bg-green-500/20 text-green-400" : "bg-stone-500/20 text-stone-400"}`}>
                  {gw.status}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-mono truncate mt-1">{gw.url}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
