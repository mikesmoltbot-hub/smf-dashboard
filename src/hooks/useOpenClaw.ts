"use client";

import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface OpenClawAgent {
  id: string;
  name: string;
  status: "active" | "idle" | "offline";
  lastSeen: string;
  model?: string;
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

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://127.0.0.1:18789";

async function gatewayRequest<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${GATEWAY_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
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
  { id: "1", name: "Main Agent", status: "active", lastSeen: new Date().toISOString(), model: "minimax-m2.7:cloud" },
  { id: "2", name: "Code Writer", status: "active", lastSeen: new Date().toISOString(), model: "minimax-m2.7:cloud" },
  { id: "3", name: "Researcher", status: "active", lastSeen: new Date().toISOString(), model: "qwen3.5:9b" },
  { id: "4", name: "Writer", status: "idle", lastSeen: new Date(Date.now() - 3600000).toISOString(), model: "kimi-k2.5:cloud" },
];

const MOCK_SESSIONS: OpenClawSession[] = [
  { id: "s1", agentId: "1", model: "minimax-m2.7:cloud", contextUsed: 45000, contextLimit: 128000, createdAt: new Date(Date.now() - 86400000).toISOString(), lastActive: new Date().toISOString(), type: "dm" },
  { id: "s2", agentId: "2", model: "minimax-m2.7:cloud", contextUsed: 12000, contextLimit: 128000, createdAt: new Date(Date.now() - 3600000).toISOString(), lastActive: new Date().toISOString(), type: "cron" },
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

  // Check gateway status
  const checkStatus = useCallback(async () => {
    const health = await gatewayRequest<{ ok: boolean; version?: string; uptime?: number }>("/healthz");
    if (health?.ok) {
      setStatus({
        online: true,
        version: health.version,
        uptime: health.uptime,
      });
      return true;
    }
    setStatus({ online: false });
    return false;
  }, []);

  // Fetch agents
  const refreshAgents = useCallback(async () => {
    const data = await gatewayRequest<{ agents?: OpenClawAgent[] }>("/api/agents");
    if (data?.agents) {
      setAgents(data.agents);
    } else {
      setAgents(MOCK_AGENTS);
    }
  }, []);

  // Fetch sessions
  const refreshSessions = useCallback(async () => {
    const data = await gatewayRequest<{ sessions?: OpenClawSession[] }>("/api/sessions");
    if (data?.sessions) {
      setSessions(data.sessions);
    } else {
      setSessions(MOCK_SESSIONS);
    }
  }, []);

  // Fetch cron jobs
  const refreshCronJobs = useCallback(async () => {
    const data = await gatewayRequest<{ jobs?: OpenClawCronJob[] }>("/api/cron");
    if (data?.jobs) {
      setCronJobs(data.jobs);
    } else {
      setCronJobs(MOCK_CRON_JOBS);
    }
  }, []);

  // Fetch skills
  const refreshSkills = useCallback(async () => {
    const data = await gatewayRequest<{ skills?: OpenClawSkill[] }>("/api/skills");
    if (data?.skills) {
      setSkills(data.skills);
    } else {
      setSkills(MOCK_SKILLS);
    }
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
