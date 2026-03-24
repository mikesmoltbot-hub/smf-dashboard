"use client";

import { useEffect } from "react";
import { useOpenClaw } from "@/hooks/useOpenClaw";
import { Wrench, Lock, Unlock, Star, ExternalLink } from "lucide-react";

export function SkillsExplorer() {
  const { skills, refreshSkills } = useOpenClaw();

  useEffect(() => {
    refreshSkills();
  }, [refreshSkills]);

  const installedSkills = skills.filter((s) => s.installed);
  const proSkills = skills.filter((s) => s.type === "pro");
  const freeSkills = skills.filter((s) => s.type === "free");

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-[var(--accent)]" />
          <h3 className="font-semibold">Skills</h3>
        </div>
        <a
          href="/skills"
          className="text-sm text-[var(--accent)] hover:underline"
        >
          Browse All →
        </a>
      </div>

      {/* Skills Grid */}
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {installedSkills.map((skill) => (
            <div
              key={skill.id}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                skill.type === "pro"
                  ? "border-[var(--pro)]/50 bg-[var(--pro)]/10 text-[var(--pro)]"
                  : "border-[var(--border)] bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:border-[var(--accent)]"
              }`}
            >
              {skill.type === "pro" ? (
                <Star className="h-3 w-3" />
              ) : (
                <Unlock className="h-3 w-3" />
              )}
              <span>{skill.name}</span>
            </div>
          ))}

          {/* Show locked pro skills */}
          {proSkills.filter((s) => !s.installed).map((skill) => (
            <div
              key={skill.id}
              className="flex items-center gap-2 rounded-full border border-[var(--border)]/50 bg-[var(--bg-secondary)] px-3 py-1.5 text-sm text-[var(--text-muted)] opacity-60"
              title={`Requires Pro subscription: ${skill.description}`}
            >
              <Lock className="h-3 w-3" />
              <span>{skill.name}</span>
            </div>
          ))}
        </div>

        {/* Pro CTA */}
        {proSkills.some((s) => !s.installed) && (
          <div className="mt-4 rounded-lg border border-[var(--pro)]/30 bg-[var(--pro)]/10 p-4">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-[var(--pro)]" />
              <div>
                <div className="font-medium text-[var(--pro)]">Upgrade to Pro</div>
                <div className="text-xs text-[var(--text-muted)]">
                  Unlock {proSkills.filter((s) => !s.installed).length} premium skills
                </div>
              </div>
              <a
                href="/settings?tab=subscription"
                className="ml-auto rounded bg-[var(--pro)] px-3 py-1.5 text-sm font-medium text-black hover:bg-[var(--pro)]/80 transition-colors"
              >
                Upgrade
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
