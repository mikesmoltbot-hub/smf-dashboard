"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";

export function SecuritySettings() {
  const [pinEnabled, setPinEnabled] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSetPin = () => {
    if (!newPin || newPin.length !== 4) {
      setMessage({ type: "error", text: "PIN must be 4 digits" });
      return;
    }
    if (newPin !== confirmPin) {
      setMessage({ type: "error", text: "PINs do not match" });
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      setMessage({ type: "error", text: "PIN must be numbers only" });
      return;
    }

    // Save PIN hash to localStorage
    const hash = btoa(newPin);
    localStorage.setItem("smf_dashboard_pin_hash", hash);
    localStorage.setItem("smf_dashboard_pin_enabled", "true");
    setPinEnabled(true);
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setMessage({ type: "success", text: "PIN set successfully" });
  };

  const handleDisablePin = () => {
    localStorage.removeItem("smf_dashboard_pin_hash");
    localStorage.setItem("smf_dashboard_pin_enabled", "false");
    setPinEnabled(false);
    setMessage({ type: "success", text: "PIN protection disabled" });
  };

  return (
    <div className="space-y-8">
      {/* PIN Lock Section */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--smf-primary)]/10">
            <Lock className="h-5 w-5 text-[var(--smf-primary)]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              PIN Lock
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              Require a PIN to access your dashboard
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-[var(--text-muted)]" />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Enable PIN Protection
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Lock your dashboard with a 4-digit PIN
                </p>
              </div>
            </div>
            <button
              onClick={() => setPinEnabled(!pinEnabled)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                pinEnabled ? "bg-[var(--smf-primary)]" : "bg-[var(--border)]"
              }`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  pinEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* PIN Form */}
          {pinEnabled && (
            <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
              <h4 className="text-sm font-medium text-[var(--text-primary)]">
                Change PIN
              </h4>

              {/* Current PIN (if already set) */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                  Current PIN
                </label>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    maxLength={4}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--smf-primary)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New PIN */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                  New PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--smf-primary)] focus:outline-none"
                />
              </div>

              {/* Confirm PIN */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--smf-primary)] focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSetPin}
                  className="flex-1 rounded-lg bg-[var(--smf-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--smf-primary)]/90"
                >
                  Save PIN
                </button>
                <button
                  onClick={handleDisablePin}
                  className="rounded-lg border border-[var(--smf-danger)]/50 px-4 py-2 text-sm font-medium text-[var(--smf-danger)] transition-colors hover:bg-[var(--smf-danger)]/10"
                >
                  Disable
                </button>
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    message.type === "success"
                      ? "bg-[var(--smf-success)]/10 text-[var(--smf-success)]"
                      : "bg-[var(--smf-danger)]/10 text-[var(--smf-danger)]"
                  }`}
                >
                  {message.type === "error" && <AlertTriangle className="h-4 w-4" />}
                  {message.text}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Security Info */}
      <div className="rounded-xl border border-[var(--smf-warning)]/30 bg-[var(--smf-warning)]/5 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-[var(--smf-warning)]" />
          <div className="text-sm">
            <p className="font-medium text-[var(--text-primary)]">
              Security Note
            </p>
            <p className="mt-1 text-[var(--text-muted)]">
              PIN is stored locally in your browser. For production use, consider
              TOTP-based authentication (available in the full OpenClaw security module).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
