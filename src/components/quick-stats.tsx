"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { useOpenClaw } from "@/hooks/useOpenClaw";
import { Coffee, DollarSign, Users, Activity, Zap } from "lucide-react";

interface QuickStatsProps {
  className?: string;
}

export function QuickStats({ className }: QuickStatsProps) {
  const { isConnected } = useOpenClaw();

  const stats = [
    {
      label: "Today's Spend",
      value: "$2.47",
      change: "↑ 12% vs yesterday",
      trend: "up",
      icon: DollarSign,
    },
    {
      label: "Active Agents",
      value: "4",
      change: "3 online, 1 idle",
      trend: "neutral",
      icon: Users,
    },
    {
      label: "Open Tasks",
      value: "12",
      change: "↓ 3 completed today",
      trend: "down",
      icon: Activity,
    },
    {
      label: "Gateway",
      value: isConnected ? "Online" : "Offline",
      change: isConnected ? "99.9% uptime" : "Reconnecting...",
      trend: isConnected ? "up" : "down",
      icon: Zap,
      valueColor: isConnected ? "var(--success)" : "var(--danger)",
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
                    ? "text-[var(--success)]"
                    : stat.trend === "down"
                    ? "text-[var(--danger)]"
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
