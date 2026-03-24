"use client";

import { useOpenClaw } from "@/hooks/useOpenClaw";
import { DollarSign, Users, Activity, Zap, Clock } from "lucide-react";

interface QuickStatsProps {
  className?: string;
}

export function QuickStats({ className }: QuickStatsProps) {
  const { isConnected, agents, todaySpend, monthSpend } = useOpenClaw();

  const activeCount = agents.filter((a) => a.status === "active").length;
  const idleCount = agents.filter((a) => a.status === "idle").length;
  const totalTokens = agents.reduce((sum, a) => sum + (a.totalTokens || 0), 0);

  const stats = [
    {
      label: "Today's Spend",
      value: `$${todaySpend.toFixed(2)}`,
      change: `$${monthSpend.toFixed(2)} this month`,
      trend: "up" as const,
      icon: DollarSign,
    },
    {
      label: "Active Agents",
      value: String(agents.length),
      change: `${activeCount} active, ${idleCount} idle`,
      trend: "neutral" as const,
      icon: Users,
    },
    {
      label: "Total Sessions",
      value: String(agents.reduce((sum, a) => sum + (a.sessionCount || 0), 0)),
      change: `${(totalTokens / 1000).toFixed(0)}K tokens processed`,
      trend: "neutral" as const,
      icon: Activity,
    },
    {
      label: "Gateway",
      value: isConnected ? "Online" : "Offline",
      change: isConnected ? "99.9% uptime" : "Reconnecting...",
      trend: isConnected ? "up" as const : "down" as const,
      icon: Zap,
      valueColor: isConnected ? "var(--smf-success)" : "var(--smf-danger)",
    },
  ];

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
            >
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-3">
                <Icon className="h-4 w-4" />
                {stat.label}
              </div>
              <div
                className="text-3xl font-bold"
                style={{ color: stat.valueColor || "var(--text-primary)" }}
              >
                {stat.value}
              </div>
              <div
                className={`mt-1 text-xs ${
                  stat.trend === "up"
                    ? "text-[var(--smf-success)]"
                    : stat.trend === "down"
                    ? "text-[var(--smf-danger)]"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {stat.change}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
