"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { Moon, Sun, Monitor, Check } from "lucide-react";

const THEMES = [
  { id: "dark", label: "Dark", icon: Moon, preview: "bg-[#101214]" },
  { id: "light", label: "Light", icon: Sun, preview: "bg-[#fafaf9]" },
  { id: "system", label: "System", icon: Monitor, preview: "bg-gradient-to-r from-[#101214] to-[#fafaf9]" },
] as const;

export function ThemeSettings() {
  const { settings, updateTheme } = useDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Appearance</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Choose how SMF Dashboard looks to you
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {THEMES.map((theme) => {
          const Icon = theme.icon;
          const isActive = settings.theme.mode === theme.id;

          return (
            <button
              key={theme.id}
              onClick={() => updateTheme({ mode: theme.id })}
              className={`relative flex flex-col items-center gap-3 rounded-xl border p-4 transition-all ${
                isActive
                  ? "border-[var(--smf-primary)] bg-[var(--smf-primary)]/10"
                  : "border-[var(--border)] hover:border-[var(--smf-primary)]/50"
              }`}
            >
              {/* Theme Preview */}
              <div
                className={`h-16 w-full rounded-lg ${theme.preview} border border-[var(--border)]`}
              >
                <div className="flex h-full items-center justify-center gap-1 p-2">
                  <div className="h-3 w-3 rounded-full bg-[var(--smf-primary)] opacity-60" />
                  <div className="h-3 w-3 rounded-full bg-[var(--smf-accent)] opacity-60" />
                  <div className="h-3 w-3 rounded-full bg-[var(--smf-pro)] opacity-60" />
                </div>
              </div>

              {/* Label */}
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
                <span className="text-sm font-medium">{theme.label}</span>
                {isActive && <Check className="h-4 w-4 text-[var(--smf-primary)]" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-[var(--smf-primary)]/20 p-2">
            <Monitor className="h-5 w-5 text-[var(--smf-primary)]" />
          </div>
          <div>
            <div className="font-medium">System theme</div>
            <div className="text-sm text-[var(--text-muted)]">
              Automatically matches your computer&apos;s light/dark mode preference.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
