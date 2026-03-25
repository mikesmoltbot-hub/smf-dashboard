"use client";

import { motion } from "framer-motion";
import { Network, Mail } from "lucide-react";

const features = [
  {
    title: "Multi-Gateway Overview",
    description: "View all agents across all connected gateways in one place",
    status: "coming-soon",
  },
  {
    title: "Agent Status",
    description: "Real-time status and activity monitoring",
    status: "coming-soon",
  },
  {
    title: "Cross-Gateway Chat",
    description: "Chat with any agent from any gateway seamlessly",
    status: "coming-soon",
  },
  {
    title: "Org Chart View",
    description: "Visual hierarchy of your AI agents and their roles",
    status: "coming-soon",
  },
];

export default function AgentHubPage() {
  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--smf-primary)]/10">
              <Network className="h-5 w-5 text-[var(--smf-primary)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Agent Hub</h1>
            <span className="rounded-full bg-[var(--smf-pro)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--smf-pro)]">
              PREMIUM
            </span>
          </div>
          <p className="text-[var(--text-muted)]">
            A unified dashboard to monitor and manage agents across multiple gateways.
          </p>
        </div>

        {/* Coming Soon */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--smf-primary)]/10">
            <Network className="h-8 w-8 text-[var(--smf-primary)]" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
            Coming Soon
          </h2>
          <p className="mx-auto mb-8 max-w-md text-[var(--text-muted)]">
            Agent Hub is currently under development. This premium feature will let you monitor and manage agents across all your gateways.
          </p>

          {/* Feature Preview */}
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature, i) => (
              <div
                key={i}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-left"
              >
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-medium text-[var(--text-primary)]">{feature.title}</h3>
                  <span className="text-xs text-[var(--text-muted)]">{feature.status}</span>
                </div>
                <p className="text-sm text-[var(--text-muted)]">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 flex justify-center gap-4">
            <button className="flex items-center gap-2 rounded-lg bg-[var(--smf-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--smf-primary)]/90">
              <Mail className="h-4 w-4" />
              Get Early Access
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
