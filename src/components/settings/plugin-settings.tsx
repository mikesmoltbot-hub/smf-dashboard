"use client";

import { useDashboard, type PluginConfig } from "@/contexts/DashboardContext";
import { useState } from "react";
import {
  Plug,
  Star,
  GripVertical,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

export function PluginSettings() {
  const { plugins, enablePlugin, disablePlugin } = useDashboard();
  const [expanded, setExpanded] = useState<string | null>(null);

  const builtinPlugins = plugins.filter((p) =>
    ["coffee-briefing", "tasks", "agents", "skills"].includes(p.id)
  );
  const installedPlugins = plugins.filter(
    (p) => !["coffee-briefing", "tasks", "agents", "skills"].includes(p.id)
  );

  const handleToggle = (plugin: PluginConfig) => {
    if (plugin.enabled) {
      disablePlugin(plugin.id);
    } else {
      enablePlugin(plugin.id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Plugins</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Enable or disable dashboard plugins and modules
        </p>
      </div>

      {/* Built-in Modules */}
      <div>
        <h4 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wide mb-3">
          Built-in Modules
        </h4>
        <div className="space-y-2">
          {builtinPlugins.map((plugin) => (
            <div
              key={plugin.id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--smf-primary)]/20">
                  <Plug className="h-5 w-5 text-[var(--smf-primary)]" />
                </div>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {plugin.name}
                    {plugin.id === "coffee-briefing" || plugin.id === "tasks" ? (
                      <span className="rounded bg-[var(--smf-pro)]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--smf-pro)]">
                        PRO
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">
                    v{plugin.version}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggle(plugin)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    plugin.enabled
                      ? "bg-[var(--smf-primary)]"
                      : "bg-[var(--border)]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      plugin.enabled ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Plugins */}
      <div>
        <h4 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wide mb-3">
          Available Plugins
        </h4>
        <div className="space-y-2">
          {installedPlugins.map((plugin) => (
            <div
              key={plugin.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/20">
                    <Plug className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {plugin.name}
                      <span className="rounded bg-[var(--smf-pro)]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--smf-pro)]">
                        PRO
                      </span>
                    </div>
                    <div className="text-sm text-[var(--text-muted)]">
                      v{plugin.version}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(plugin)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      plugin.enabled
                        ? "bg-[var(--smf-primary)]"
                        : "bg-[var(--border)]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        plugin.enabled ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Upsell */}
      {installedPlugins.some((p) => !p.enabled) && (
        <div className="rounded-lg border border-[var(--smf-pro)]/30 bg-[var(--smf-pro)]/10 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-[var(--smf-pro)]/20 p-2">
              <Star className="h-5 w-5 text-[var(--smf-pro)]" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-[var(--smf-pro)]">Upgrade to Pro</div>
              <div className="mt-1 text-sm text-[var(--text-secondary)]">
                Get access to all plugins including Simple CMS, Lead Capture, and SEO+GEO
              </div>
              <button className="mt-3 rounded-lg bg-[var(--smf-pro)] px-4 py-2 text-sm font-medium text-black hover:bg-[var(--smf-pro)]/80 transition-colors">
                Upgrade Now — $19.99/mo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plugin Directory Info */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[var(--text-muted)] mt-0.5" />
          <div className="text-sm text-[var(--text-muted)]">
            Plugins are stored in <code className="rounded bg-[var(--bg-card)] px-1.5 py-0.5 font-mono text-xs">~/.smf/&lt;plugin-name&gt;/</code>.
            Each plugin manages its own data and settings.
          </div>
        </div>
      </div>
    </div>
  );
}
