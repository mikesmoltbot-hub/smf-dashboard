"use client";

import { useState, useEffect, Component, ReactNode } from "react";

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

interface RemoteGateway {
  id: string;
  name: string;
  url: string;
  token: string;
  status: "online" | "offline";
}

const GATEWAY_STORAGE_KEY = "smf.hub.gateways";

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

async function fetchAgentsFromGateway(gateway: RemoteGateway): Promise<HubAgent[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${gateway.url}/tools/invoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${gateway.token}` },
      body: JSON.stringify({ tool: "sessions_list", action: "json", args: {} }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const data = await res.json();
    let content = data;
    
    if (data.result?.content) {
      try {
        content = typeof data.result.content === "string" 
          ? JSON.parse(data.result.content) 
          : data.result.content;
      } catch {
        content = { sessions: [] };
      }
    }

    const sessions = content?.sessions || [];
    return sessions.slice(0, 3).map((s: Record<string, unknown>, i: number) => ({
      id: `${gateway.id}-${i}`,
      name: String(s.name || `${gateway.name} Session ${i + 1}`),
      emoji: "🤖",
      role: String(s.model || "AI Agent"),
      status: s.status === "active" ? "active" as const : s.status === "idle" ? "idle" as const : "offline" as const,
      model: String(s.model || ""),
      totalTokens: (s.totalTokens as number) || 0,
      lastActive: (s.lastActive as number) || null,
      sessionCount: 1,
      channels: (s.channels as string[]) || [],
      workspace: String(s.workspace || ""),
      gatewayId: gateway.id,
      gatewayName: gateway.name,
    }));
  } catch {
    return [];
  }
}

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[AgentHub ErrorBoundary]", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-[var(--smf-danger)] text-lg font-medium">Something went wrong</p>
          <p className="text-sm text-[var(--text-muted)]">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-[var(--smf-primary)] px-4 py-2 text-sm font-medium text-white"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AgentHubPage() {
  return (
    <ErrorBoundary fallback={
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-[var(--smf-danger)]">Failed to load Agent Hub</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-[var(--smf-primary)] px-4 py-2 text-sm font-medium text-white"
        >
          Reload Page
        </button>
      </div>
    }>
      <AgentHubContent />
    </ErrorBoundary>
  );
}

function AgentHubContent() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [agents, setAgents] = useState<HubAgent[]>([]);
  const [gateways, setGateways] = useState<RemoteGateway[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>("Starting...");
  const [refreshCounter, setRefreshCounter] = useState<number>(0);

  // Single effect for loading gateways and agents
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      // Step 1: Load gateways
      setDebug("Loading gateways...");
      
      let loadedGateways: RemoteGateway[] = [];
      try {
        const stored = localStorage.getItem(GATEWAY_STORAGE_KEY);
        if (stored) {
          loadedGateways = JSON.parse(stored);
        } else {
          loadedGateways = DEFAULT_GATEWAYS;
          localStorage.setItem(GATEWAY_STORAGE_KEY, JSON.stringify(DEFAULT_GATEWAYS));
        }
      } catch {
        loadedGateways = DEFAULT_GATEWAYS;
      }

      if (cancelled) return;
      setGateways(loadedGateways);
      setDebug(`Gateways: ${loadedGateways.length}`);

      // Step 2: Fetch local agent
      await new Promise(r => setTimeout(r, 50));
      if (cancelled) return;

      setDebug("Fetching local...");
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
          totalTokens: (a.totalTokens as number) || 0,
          lastActive: a.lastActive as number | null,
          sessionCount: (a.sessionCount as number) || 0,
          channels: (a.channels as string[]) || [],
          workspace: String(a.workspace || ""),
          gatewayId: "local",
          gatewayName: "Aiona",
        }));

        // Step 3: Fetch remote agents
        setDebug(`Got ${localAgents.length} local, fetching remote...`);
        
        const remoteResults = await Promise.allSettled(
          loadedGateways.map(g => fetchAgentsFromGateway(g))
        );
        
        if (cancelled) return;

        const allAgents = [...localAgents];
        remoteResults.forEach((result, i) => {
          if (result.status === "fulfilled") {
            allAgents.push(...result.value);
          }
        });

        setAgents(allAgents);
        setDebug(`Done: ${allAgents.length} agents`);
        
        // Update gateway status
        setGateways(prev => prev.map(g => {
          const gAgents = allAgents.filter(a => a.gatewayId === g.id);
          return { ...g, status: gAgents.some(a => a.status !== "offline") ? "online" as const : "offline" as const };
        }));
      } catch (err) {
        if (!cancelled) {
          setError(String(err));
          setDebug(`Error: ${err}`);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [refreshCounter]);

  const handleRefresh = () => {
    setLoading(true);
    setAgents([]);
    setGateways([]);
    setError(null);
    setRefreshCounter(c => c + 1);
  };

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-[var(--smf-danger)] text-lg font-medium">Error</p>
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <p className="text-xs text-[var(--text-muted)]">{debug}</p>
        <button
          onClick={handleRefresh}
          className="rounded-lg bg-[var(--smf-primary)] px-4 py-2 text-sm font-medium text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--smf-primary)]" />
        <span className="text-[var(--text-secondary)]">Loading Agent Hub...</span>
        <p className="text-xs text-[var(--text-muted)] font-mono">{debug}</p>
      </div>
    );
  }

  // Main content
  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Agent Hub</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {agents.length} agents across {gateways.length} gateways
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 rounded-lg bg-[var(--bg-hover)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--border)]"
          >
            <RefreshIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)] px-6">
        {(["overview", "orgchart", "gateways"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-[var(--smf-primary)] text-[var(--smf-primary)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "overview" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map(agent => (
              <div key={agent.id} className="rounded-lg border border-[var(--border)] p-4 bg-[var(--bg-card)]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{agent.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate">{agent.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{agent.gatewayName}</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                  <p>Role: {agent.role}</p>
                  <p>Status: {agent.status}</p>
                </div>
              </div>
            ))}
            {agents.length === 0 && (
              <div className="col-span-full text-center py-8 text-[var(--text-muted)]">
                No agents found
              </div>
            )}
          </div>
        )}

        {activeTab === "orgchart" && (
          <div className="space-y-4">
            {gateways.map(gw => {
              const gwAgents = agents.filter(a => a.gatewayId === gw.id);
              return (
                <div key={gw.id} className="rounded-lg border border-[var(--border)] p-4 bg-[var(--bg-card)]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${gw.status === "online" ? "bg-green-400" : "bg-stone-500"}`} />
                    <span className="font-medium text-[var(--text-primary)]">{gw.name}</span>
                    <span className="text-xs text-[var(--text-muted)]">({gwAgents.length})</span>
                  </div>
                  <div className="space-y-2 ml-4">
                    {gwAgents.map(agent => (
                      <div key={agent.id} className="flex items-center gap-2 text-sm">
                        <span>{agent.emoji}</span>
                        <span className="text-[var(--text-primary)]">{agent.name}</span>
                      </div>
                    ))}
                    {gwAgents.length === 0 && <p className="text-xs text-[var(--text-muted)]">No agents</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "gateways" && (
          <div className="grid gap-4 md:grid-cols-2">
            {gateways.map(gw => (
              <div key={gw.id} className="rounded-lg border border-[var(--border)] p-4 bg-[var(--bg-card)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[var(--text-primary)]">{gw.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${gw.status === "online" ? "bg-green-500/20 text-green-400" : "bg-stone-500/20 text-stone-400"}`}>
                    {gw.status}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] font-mono truncate">{gw.url}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
