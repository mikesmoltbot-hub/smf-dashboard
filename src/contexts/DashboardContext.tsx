"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface BrandingSettings {
  logo: string | null; // URL or base64
  primaryColor: string;
  accentColor: string;
  companyName: string;
  weatherLocation: string; // e.g. "New York, NY" or "zip:10001"
}

export interface DashboardTheme {
  mode: "light" | "dark" | "system";
}

export interface PluginConfig {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  order: number;
}

export interface DashboardSettings {
  branding: BrandingSettings;
  theme: DashboardTheme;
  plugins: PluginConfig[];
  setupComplete: boolean;
}

export interface DashboardContextValue {
  // Settings
  settings: DashboardSettings;
  updateSettings: (partial: Partial<DashboardSettings>) => void;
  updateBranding: (branding: Partial<BrandingSettings>) => void;
  updateTheme: (theme: Partial<DashboardTheme>) => void;

  // Plugin management
  plugins: PluginConfig[];
  enablePlugin: (id: string) => void;
  disablePlugin: (id: string) => void;
  reorderPlugins: (plugins: PluginConfig[]) => void;

  // Theme helpers
  resolvedTheme: "light" | "dark";

  // Loading state
  isLoading: boolean;

  // Pro subscription check
  isPro: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Settings
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_BRANDING: BrandingSettings = {
  logo: null,
  primaryColor: "#6366f1", // SMF Works indigo
  accentColor: "#a855f7", // Purple accent
  companyName: "SMF Works",
  weatherLocation: "New York, NY",
};

const DEFAULT_THEME: DashboardTheme = {
  mode: "dark",
};

const DEFAULT_PLUGINS: PluginConfig[] = [
  { id: "coffee-briefing", name: "Coffee Briefing", version: "1.0.0", enabled: true, order: 1 },
  { id: "tasks", name: "Task Manager", version: "1.0.0", enabled: true, order: 2 },
  { id: "agents", name: "Agents View", version: "1.0.0", enabled: true, order: 3 },
  { id: "skills", name: "Skills Explorer", version: "1.0.0", enabled: true, order: 4 },
  { id: "simple-cms", name: "Simple CMS", version: "1.0.0", enabled: false, order: 10 },
  { id: "lead-capture", name: "Lead Capture", version: "1.0.0", enabled: false, order: 11 },
  { id: "seo-geo", name: "SEO + GEO", version: "1.0.0", enabled: false, order: 12 },
];

const DEFAULT_SETTINGS: DashboardSettings = {
  branding: DEFAULT_BRANDING,
  theme: DEFAULT_THEME,
  plugins: DEFAULT_PLUGINS,
  setupComplete: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return ctx;
}

// ─────────────────────────────────────────────────────────────────────────────
// Storage
// ─────────────────────────────────────────────────────────────────────────────

const SETTINGS_PATH = ".smf/dashboard/settings.json";

function getSettingsPath(): string {
  // In browser, use localStorage
  if (typeof window !== "undefined") {
    return "smf_dashboard_settings";
  }
  return SETTINGS_PATH;
}

function loadSettings(): DashboardSettings {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(getSettingsPath());
    if (stored) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: DashboardSettings): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(getSettingsPath(), JSON.stringify(settings));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    setIsLoading(false);
  }, []);

  // Apply CSS variables when branding changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty("--smf-primary", settings.branding.primaryColor);
      root.style.setProperty("--smf-accent", settings.branding.accentColor);
    }
  }, [settings.branding]);

  // Resolve theme
  const resolvedTheme = (() => {
    if (settings.theme.mode === "system") {
      if (typeof window !== "undefined") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      return "dark";
    }
    return settings.theme.mode;
  })();

  // Apply theme class
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(resolvedTheme);
    }
  }, [resolvedTheme]);

  // Update settings
  const updateSettings = useCallback((partial: Partial<DashboardSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Update branding
  const updateBranding = useCallback((branding: Partial<BrandingSettings>) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        branding: { ...prev.branding, ...branding },
      };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Update theme
  const updateTheme = useCallback((theme: Partial<DashboardTheme>) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        theme: { ...prev.theme, ...theme },
      };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Plugin management
  const enablePlugin = useCallback((id: string) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        plugins: prev.plugins.map((p) =>
          p.id === id ? { ...p, enabled: true } : p
        ),
      };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const disablePlugin = useCallback((id: string) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        plugins: prev.plugins.map((p) =>
          p.id === id ? { ...p, enabled: false } : p
        ),
      };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const reorderPlugins = useCallback((plugins: PluginConfig[]) => {
    setSettings((prev) => {
      const updated = { ...prev, plugins };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const value: DashboardContextValue = {
    settings,
    updateSettings,
    updateBranding,
    updateTheme,
    plugins: settings.plugins,
    enablePlugin,
    disablePlugin,
    reorderPlugins,
    resolvedTheme,
    isLoading,
    isPro,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
