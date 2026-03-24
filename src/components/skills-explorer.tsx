"use client";

import { useOpenClaw } from "@/hooks/useOpenClaw";
import { Wrench, Crown, Lock } from "lucide-react";

export function SkillsExplorer() {
  const { skills } = useOpenClaw();

  const installed = skills.filter((s) => s.installed);
  const notInstalled = skills.filter((s) => !s.installed);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
      <div className="mb-4 flex items-center gap-2">
        <Wrench className="h-4 w-4 text-[var(--smf-primary)]" />
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Skills</h2>
        <span className="rounded-full bg-[var(--smf-primary)]/10 px-2 py-0.5 text-xs text-[var(--smf-primary)]">
          {installed.length}
        </span>
      </div>

      {/* Installed Skills */}
      <div className="space-y-2">
        {installed.map((skill) => (
          <div
            key={skill.id}
            className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {skill.name}
                </span>
                {skill.type === "pro" && (
                  <span className="shrink-0 rounded-full bg-[var(--smf-pro)]/10 px-1.5 py-0.5 text-[10px] font-medium text-[var(--smf-pro)]">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {skill.description}
              </p>
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">
              v{skill.version}
            </div>
          </div>
        ))}
      </div>

      {/* Available Skills */}
      {notInstalled.length > 0 && (
        <>
          <div className="mt-4 mb-2 text-xs font-medium text-[var(--text-muted)]">
            Available
          </div>
          <div className="space-y-2">
            {notInstalled.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center gap-3 rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-secondary)]/50 p-3 opacity-60"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {skill.name}
                    </span>
                    {skill.type === "pro" && (
                      <span className="shrink-0 rounded-full bg-[var(--smf-pro)]/10 px-1.5 py-0.5 text-[10px] font-medium text-[var(--smf-pro)]">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {skill.description}
                  </p>
                </div>
                <button className="shrink-0 rounded-lg bg-[var(--smf-primary)]/10 px-2 py-1 text-xs text-[var(--smf-primary)] hover:bg-[var(--smf-primary)]/20">
                  Install
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {installed.length === 0 && notInstalled.length === 0 && (
        <div className="py-6 text-center text-sm text-[var(--text-muted)]">
          No skills installed. Browse ClawHub to discover skills.
        </div>
      )}
    </div>
  );
}
