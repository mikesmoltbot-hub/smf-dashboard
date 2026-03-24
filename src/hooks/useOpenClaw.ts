"use client";

import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface OpenClawAgent {
  id: string;
  name: string;
  emoji?: string;
  model: string;
  fallbackModels: string[];
  status: "active" | "idle" | "offline" | "unknown";
  lastActive: number | null;
  sessionCount: number;
  totalTokens: number;
  channels: string[];
  isDefault: boolean;
  runtimeSubagents: Array<{
    sessionKey: string;
    sessionId: string;
    model: string;
    status: "running" | "recent";
    lastActive: number;
  }>;
}

export interface OpenClawSession {
  id: string;
  agentId: string;
  model: string;
  contextUsed: number;
  contextLimit: number;
  createdAt: string;
  lastActive: string;
  type: "dm" | "group" | "cron" | "subagent";
}

export interface OpenClawCronJob {
  id: string;
  name: string;
  schedule: string;
  lastRun?: string;
  nextRun?: string;
  status: "active" | "paused" | "error";
  enabled: boolean;
}

export interface OpenClawSkill {
  id: string;
  name: string;
  description: string;
  version: string;
  type: "free" | "pro";
  installed: boolean;
}

export interface OpenClawGatewayStatus {
  online: boolean;
  version?: string;
  uptime?: number;
  pid?: number;
  memory?: number;
}

export interface UseOpenClawReturn {
  // Gateway
  status: OpenClawGatewayStatus;
  isConnected: boolean;

  // Agents
  agents: OpenClawAgent[];
  activeAgents: OpenClawAgent[];

  // Sessions
  sessions: OpenClawSession[];

  // Cron
  cronJobs: OpenClawCronJob[];

  // Skills
  skills: OpenClawSkill[];

  // Usage
  todaySpend: number;
  monthSpend: number;

  // Actions
  refreshAgents: () => Promise<void>;
  refreshSessions: () => Promise<void>;
  refreshCronJobs: () => Promise<void>;
  refreshSkills: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Helper
// ─────────────────────────────────────────────────────────────────────────────

async function apiRequest<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(endpoint, {
      credentials: "include",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data (when gateway not available)
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_AGENTS: OpenClawAgent[] = [
  { id: "main", name: "Aiona Edge", emoji: "🎯", status: "active", lastActive: Date.now(), model: "minimax-m2.7:cloud", fallbackModels: ["qwen3.5:9b"], sessionCount: 12, totalTokens: 125000, channels: ["webchat", "telegram"], isDefault: true, runtimeSubagents: [] },
  { id: "writer", name: "Content Writer", emoji: "✍️", status: "idle", lastActive: Date.now() - 3600000, model: "kimi-k2.5:cloud", fallbackModels: [], sessionCount: 5, totalTokens: 45000, channels: [], isDefault: false, runtimeSubagents: [] },
];

const MOCK_SESSIONS: OpenClawSession[] = [
  { id: "s1", agentId: "main", model: "minimax-m2.7:cloud", contextUsed: 45000, contextLimit: 128000, createdAt: new Date(Date.now() - 86400000).toISOString(), lastActive: new Date().toISOString(), type: "dm" },
];

const MOCK_CRON_JOBS: OpenClawCronJob[] = [
  { id: "c1", name: "Morning Briefing", schedule: "0 7 * * *", lastRun: new Date(Date.now() - 3600000).toISOString(), nextRun: new Date(Date.now() + 82800000).toISOString(), status: "active", enabled: true },
  { id: "c2", name: "Daily Backup", schedule: "0 2 * * *", lastRun: new Date(Date.now() - 86400000).toISOString(), nextRun: new Date(Date.now() + 61200000).toISOString(), status: "active", enabled: true },
  { id: "c3", name: "Health Check", schedule: "*/15 * * * *", status: "error", enabled: true },
];

const MOCK_SKILLS: OpenClawSkill[] = [
  { id: "file-organizer", name: "File Organizer", description: "Organize files by date, type, find duplicates", version: "1.0.0", type: "free", installed: true },
  { id: "pdf-toolkit", name: "PDF Toolkit", description: "Merge, split, extract, compress PDFs", version: "1.0.0", type: "free", installed: true },
  { id: "coffee-briefing", name: "Coffee Briefing", description: "Your morning briefing", version: "1.0.0", type: "pro", installed: true },
  { id: "lead-capture", name: "Lead Capture", description: "Capture and manage sales leads", version: "1.0.0", type: "pro", installed: false },
  { id: "seo-geo", name: "SEO + GEO", description: "SEO and generative engine optimization", version: "1.0.0", type: "pro", installed: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useOpenClaw(): UseOpenClawReturn {
  const [status, setStatus] = useState<OpenClawGatewayStatus>({ online: false });
  const [agents, setAgents] = useState<OpenClawAgent[]>([]);
  const [sessions, setSessions] = useState<OpenClawSession[]>([]);
  const [cronJobs, setCronJobs] = useState<OpenClawCronJob[]>([]);
  const [skills, setSkills] = useState<OpenClawSkill[]>([]);
  const [todaySpend] = useState(2.47);
  const [monthSpend] = useState(47.23);

  // Check gateway status via Next.js API
  const checkStatus = useCallback(async () => {
    const data = await apiRequest<{ status: string; health?: { ok?: boolean; version?: string } }>("/api/gateway");
    if (data?.status === "online" || data?.health?.ok) {
      setStatus({
        online: true,
        version: data.health?.version,
      });
      return true;
    }
    setStatus({ online: false });
    return false;
  }, []);

  // Fetch agents from the rich /api/agents endpoint
  const refreshAgents = useCallback(async () => {
    const data = await apiRequest<{ agents?: OpenClawAgent[]; defaultModel?: string }>("/api/agents");
    if (data?.agents) {
      setAgents(data.agents);
    } else {
      setAgents(MOCK_AGENTS);
    }
  }, []);

  // Fetch sessions (placeholder - no real session endpoint yet)
  const refreshSessions = useCallback(async () => {
    // TODO: Wire up to real session API when available
    setSessions(MOCK_SESSIONS);
  }, []);

  // Fetch cron jobs (placeholder)
  const refreshCronJobs = useCallback(async () => {
    // TODO: Wire up to real cron API when available
    setCronJobs(MOCK_CRON_JOBS);
  }, []);

  // Fetch skills (placeholder)
  const refreshSkills = useCallback(async () => {
    // TODO: Wire up to real skills API when available
    setSkills(MOCK_SKILLS);
  }, []);

  // Refresh all
  const refreshAll = useCallback(async () => {
    await checkStatus();
    await Promise.all([refreshAgents(), refreshSessions(), refreshCronJobs(), refreshSkills()]);
  }, [checkStatus, refreshAgents, refreshSessions, refreshCronJobs, refreshSkills]);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    status,
    isConnected: status.online,
    agents,
    activeAgents: agents.filter((a) => a.status === "active"),
    sessions,
    cronJobs,
    skills,
    todaySpend,
    monthSpend,
    refreshAgents,
    refreshSessions,
    refreshCronJobs,
    refreshSkills,
    refreshAll,
  };
}
