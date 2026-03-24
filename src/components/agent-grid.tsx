"use client";

import { useOpenClaw } from "@/hooks/useOpenClaw";
import { Users } from "lucide-react";

export function AgentGrid() {
  const { agents, isConnected } = useOpenClaw();

  const statusColor = (status: string) => {
    switch (status) {
      case "active":
        return "var(--smf-success)";
      case "idle":
        return "var(--smf-warning)";
      case "offline":
        return "var(--text-muted)";
      default:
        return "var(--text-muted)";
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[var(--smf-primary)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Agents</h2>
          <span className="rounded-full bg-[var(--smf-primary)]/10 px-2 py-0.5 text-xs text-[var(--smf-primary)]">
            {agents.length}
          </span>
          {!isConnected && (
            <span className="rounded-full bg-[var(--smf-warning)]/10 px-2 py-0.5 text-xs text-[var(--smf-warning)]">
              Demo
            </span>
          )}
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="py-8 text-center text-sm text-[var(--text-muted)]">
          No agents found. Create one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--smf-primary)]/10 text-lg">
                {agent.emoji || "🤖"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-[var(--text-primary)]">
                    {agent.name}
                  </span>
                  {agent.isDefault && (
                    <span className="shrink-0 rounded-full bg-[var(--smf-primary)]/10 px-1.5 py-0.5 text-[10px] text-[var(--smf-primary)]">
                      Default
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-[var(--text-muted)]">
                  {agent.model}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: statusColor(agent.status) }}
                />
                <span className="text-xs capitalize text-[var(--text-muted)]">
                  {agent.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isConnected && (
        <div className="mt-4 text-right">
          <a
            href="/agents"
            className="text-xs text-[var(--smf-primary)] hover:underline"
          >
            View all →
          </a>
        </div>
      )}
    </div>
  );
}
