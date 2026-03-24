"use client";

import { useState } from "react";
import { BrandingSettings } from "@/components/settings/branding-settings";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { PluginSettings } from "@/components/settings/plugin-settings";
import { Settings, Palette, Plug, Shield, Keyboard } from "lucide-react";

type Tab = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const TABS: Tab[] = [
  { id: "general", label: "General", icon: Settings },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "plugins", label: "Plugins", icon: Plug },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-4xl p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            Customize your dashboard experience
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-[var(--border)]">
          <nav className="flex gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-[var(--smf-primary)] text-[var(--smf-primary)]"
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-4">
          {activeTab === "general" && <BrandingSettings />}
          {activeTab === "appearance" && <ThemeSettings />}
          {activeTab === "plugins" && <PluginSettings />}
        </div>
      </div>
    </div>
  );
}
