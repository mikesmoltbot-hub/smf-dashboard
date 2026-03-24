"use client";

import { useState, useRef } from "react";
import { useDashboard, type BrandingSettings } from "@/contexts/DashboardContext";
import {
  Palette,
  Building2,
  Moon,
  Sun,
  Monitor,
  Check,
  Upload,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

const THEMES = [
  { id: "dark", label: "Dark", icon: Moon, preview: "#101214" },
  { id: "light", label: "Light", icon: Sun, preview: "#fafaf9" },
  { id: "system", label: "System", icon: Monitor, preview: "linear-gradient(135deg, #101214 50%, #fafaf9 50%)" },
] as const;

const PRESET_COLORS = [
  { name: "Indigo", primary: "#6366f1", accent: "#a855f7" },
  { name: "Emerald", primary: "#10b981", accent: "#06b6d4" },
  { name: "Rose", primary: "#f43f5e", accent: "#fb923c" },
  { name: "Violet", primary: "#8b5cf6", accent: "#ec4899" },
  { name: "Amber", primary: "#f59e0b", accent: "#ef4444" },
  { name: "Slate", primary: "#64748b", accent: "#475569" },
];

export function BrandingSettings() {
  const { settings, updateBranding } = useDashboard();
  const [branding, setBranding] = useState<BrandingSettings>(settings.branding);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    updateBranding(branding);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePreset = (preset: (typeof PRESET_COLORS)[number]) => {
    setBranding((prev) => ({
      ...prev,
      primaryColor: preset.primary,
      accentColor: preset.accent,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    // Convert to data URL for local storage
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setBranding((prev) => ({ ...prev, logo: dataUrl }));
      setUploading(false);
    };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      {/* Company Info */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Info
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={branding.companyName}
              onChange={(e) => setBranding((p) => ({ ...p, companyName: e.target.value }))}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--smf-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--smf-primary)]"
              placeholder="Your Company"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Logo URL
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={branding.logo || ""}
                onChange={(e) => setBranding((p) => ({ ...p, logo: e.target.value || null }))}
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--smf-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--smf-primary)]"
                placeholder="https://example.com/logo.png"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            {branding.logo && (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] p-3">
                <img
                  src={branding.logo}
                  alt="Logo preview"
                  className="h-10 w-10 rounded object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <span className="flex-1 text-sm text-[var(--text-muted)] truncate">{branding.logo}</span>
                <button
                  onClick={() => setBranding((p) => ({ ...p, logo: null }))}
                  className="rounded p-1 hover:bg-[var(--bg-card)] text-[var(--text-muted)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Color Scheme */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Color Scheme
        </h3>

        {/* Preset Colors */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
            Preset Themes
          </label>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePreset(preset)}
                className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-all ${
                  branding.primaryColor === preset.primary && branding.accentColor === preset.accent
                    ? "border-[var(--smf-primary)] bg-[var(--smf-primary)]/10"
                    : "border-[var(--border)] hover:border-[var(--smf-primary)]"
                }`}
              >
                <div className="flex gap-1">
                  <div
                    className="h-5 w-5 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="h-5 w-5 rounded-full"
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <span className="text-xs text-[var(--text-secondary)]">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Primary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={branding.primaryColor}
                onChange={(e) => setBranding((p) => ({ ...p, primaryColor: e.target.value }))}
                className="h-10 w-20 rounded-lg border border-[var(--border)] cursor-pointer"
              />
              <input
                type="text"
                value={branding.primaryColor}
                onChange={(e) => setBranding((p) => ({ ...p, primaryColor: e.target.value }))}
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm font-mono text-[var(--text-primary)] focus:border-[var(--smf-primary)] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Accent Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={branding.accentColor}
                onChange={(e) => setBranding((p) => ({ ...p, accentColor: e.target.value }))}
                className="h-10 w-20 rounded-lg border border-[var(--border)] cursor-pointer"
              />
              <input
                type="text"
                value={branding.accentColor}
                onChange={(e) => setBranding((p) => ({ ...p, accentColor: e.target.value }))}
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm font-mono text-[var(--text-primary)] focus:border-[var(--smf-primary)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] p-4">
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-3">Live Preview</label>
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-white text-lg font-bold"
              style={{ backgroundColor: branding.primaryColor }}
            >
              S
            </div>
            <div className="flex-1">
              <div className="font-semibold" style={{ color: branding.primaryColor }}>
                {branding.companyName || "Your Company"}
              </div>
              <div className="text-sm text-[var(--text-muted)]">Dashboard Preview</div>
            </div>
            <div
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-white"
              style={{ backgroundColor: branding.accentColor }}
            >
              Primary
            </div>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
        {saved && (
          <span className="flex items-center gap-1 text-sm text-[var(--smf-success)]">
            <Check className="h-4 w-4" />
            Saved!
          </span>
        )}
        <button
          onClick={handleSave}
          className="rounded-lg bg-[var(--smf-primary)] px-6 py-2.5 font-medium text-white hover:opacity-90 transition-opacity"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
