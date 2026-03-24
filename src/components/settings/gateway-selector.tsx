"use client";

import { useState } from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { Globe, ChevronDown, Plus, X, Check, Loader2 } from "lucide-react";

interface GatewayEntry {
  id: string;
  name: string;
  url: string;
  token?: string;
  isDefault?: boolean;
}

export function GatewaySelector() {
  const { settings, updateSettings } = useDashboard();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [form, setForm] = useState({ name: "", url: "", token: "" });

  // Load gateways from localStorage or use default
  const gateways: GatewayEntry[] = [
    { id: "local", name: "Local", url: "http://127.0.0.1:18789", isDefault: true },
    ...(settings.gateways || []),
  ];

  const currentGateway = settings.currentGateway || "local";

  const handleTest = async () => {
    if (!form.url) return;
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`${form.url}/healthz`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        setTestResult({ ok: true, message: "Gateway reachable" });
      } else {
        setTestResult({ ok: false, message: `HTTP ${res.status}` });
      }
    } catch (err) {
      setTestResult({ ok: false, message: "Cannot reach gateway" });
    }
    setTesting(false);
  };

  const handleAdd = () => {
    if (!form.name || !form.url) return;

    const newGateway: GatewayEntry = {
      id: `gw-${Date.now()}`,
      name: form.name,
      url: form.url.replace(/\/$/, ""), // remove trailing slash
      token: form.token || undefined,
    };

    updateSettings({
      gateways: [...(settings.gateways || []), newGateway],
    });

    setForm({ name: "", url: "", token: "" });
    setEditing(false);
    setTestResult(null);
  };

  const handleRemove = (id: string) => {
    updateSettings({
      gateways: (settings.gateways || []).filter((g) => g.id !== id),
    });
  };

  const handleSwitch = (id: string) => {
    updateSettings({ currentGateway: id });
    setOpen(false);
    // Trigger page refresh to reconnect
    window.location.reload();
  };

  const current = gateways.find((g) => g.id === currentGateway) || gateways[0];

  return (
    <div className="relative">
      {/* Current Gateway Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--smf-primary)] transition-colors"
      >
        <Globe className="h-4 w-4 text-[var(--smf-primary)]" />
        <span className="hidden sm:inline max-w-[120px] truncate">{current?.name || "Local"}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setEditing(false); }} />

          {/* Panel */}
          <div className="absolute left-auto right-0 top-full mt-2 z-50 w-80 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xl">
            <div className="p-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Gateway Connections</h3>
            </div>

            {/* Gateway List */}
            <div className="max-h-64 overflow-y-auto p-2">
              {gateways.map((gw) => (
                <div
                  key={gw.id}
                  className={`flex items-center gap-3 rounded-lg p-3 mb-1 cursor-pointer transition-colors ${
                    gw.id === currentGateway
                      ? "bg-[var(--smf-primary)]/10 border border-[var(--smf-primary)]/30"
                      : "hover:bg-[var(--bg-hover)]"
                  }`}
                  onClick={() => handleSwitch(gw.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--text-primary)]">{gw.name}</span>
                      {gw.id === "local" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--smf-success)]/10 text-[var(--smf-success)]">Local</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] truncate">{gw.url}</p>
                  </div>
                  {gw.id === currentGateway && (
                    <Check className="h-4 w-4 text-[var(--smf-primary)] shrink-0" />
                  )}
                  {gw.id !== "local" && gw.id !== currentGateway && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(gw.id); }}
                      className="p-1 rounded hover:bg-[var(--smf-danger)]/10 text-[var(--text-muted)] hover:text-[var(--smf-danger)]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add New */}
            {editing ? (
              <div className="p-3 border-t border-[var(--border)] space-y-3">
                <h4 className="text-sm font-medium text-[var(--text-primary)]">Add Gateway</h4>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="My Other Machine"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--smf-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">URL</label>
                  <input
                    type="text"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="http://192.168.1.100:18789"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--smf-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Token (optional)</label>
                  <input
                    type="password"
                    value={form.token}
                    onChange={(e) => setForm({ ...form, token: e.target.value })}
                    placeholder="Gateway token"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--smf-primary)] focus:outline-none"
                  />
                </div>

                {/* Test Result */}
                {testResult && (
                  <div className={`flex items-center gap-2 text-xs ${testResult.ok ? "text-[var(--smf-success)]" : "text-[var(--smf-danger)]"}`}>
                    {testResult.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {testResult.message}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleTest}
                    disabled={!form.url || testing}
                    className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-50"
                  >
                    {testing ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : "Test"}
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!form.name || !form.url}
                    className="flex-1 rounded-lg bg-[var(--smf-primary)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--smf-primary)]/90 disabled:opacity-50"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setEditing(false); setTestResult(null); }}
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2 border-t border-[var(--border)]">
                <button
                  onClick={() => setEditing(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--smf-primary)] hover:bg-[var(--smf-primary)]/10"
                >
                  <Plus className="h-4 w-4" />
                  Add Gateway
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
