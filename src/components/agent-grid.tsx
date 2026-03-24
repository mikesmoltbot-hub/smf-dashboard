"use client";

import { useEffect } from "react";
import { useOpenClaw } from "@/hooks/useOpenClaw";
import { Bot, Clock, Wifi, WifiOff } from "lucide-react";

export function AgentGrid() {
  const { agents, activeAgents, isConnected, refreshAgents } = useOpenClaw();

  useEffect(() => {
    // Refresh agents on mount
    refreshAgents();
  }, [refreshAgents]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "idle":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-[var(--accent)]" />
          <h3 className="font-semibold">Active Agents</h3>
        </div>
        <a
          href="/agents"
          className="text-sm text-[var(--accent)] hover:underline"
        >
          Manage →
        </a>
      </div>

      {/* Agent Grid */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-hover)] p-4 text-center cursor-pointer hover:border-[var(--accent)] transition-all"
            >
              {/* Avatar */}
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] text-xl">
                🤖
              </div>

              {/* Name */}
              <div className="mb-1 text-sm font-semibold truncate">{agent.name}</div>

              {/* Status */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${getStatusColor(agent.status)}`}
                />
                <span className="capitalize">{agent.status}</span>
              </div>

              {/* Model (if available) */}
              {agent.model && (
                <div className="mt-2 truncate text-[10px] text-[var(--text-muted)]">
                  {agent.model}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {agents.length === 0 && (
          <div className="py-8 text-center text-[var(--text-muted)]">
            <Bot className="mx-auto mb-3 h-10 w-10 opacity-50" />
            <p className="text-sm">No agents found</p>
            <p className="text-xs">Start an agent to see it here</p>
          </div>
        )}
      </div>
    </div>
  );
}
