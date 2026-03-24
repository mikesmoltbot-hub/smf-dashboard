"use client";

import { useState, useEffect, useRef } from "react";
import { Lock, X, AlertCircle } from "lucide-react";

interface PinLockProps {
  onUnlock: () => void;
  storedHash?: string;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

export function PinLock({ onUnlock, storedHash }: PinLockProps) {
  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setError(`Too many attempts. Try again in ${remaining}s`);
    }
  }, [lockoutUntil]);

  const handleInput = (index: number, value: string) => {
    if (value.length > 1) {
      // Pasting a PIN
      const chars = value.replace(/\D/g, "").slice(0, 4).split("");
      const newPin = ["", "", "", ""];
      chars.forEach((c, i) => { if (i < 4) newPin[i] = c; });
      setPin(newPin);
      inputRefs.current[Math.min(chars.length, 3)]?.focus();
      return;
    }

    const newPin = [...pin];
    newPin[index] = value.replace(/\D/g, "");
    setPin(newPin);
    setError(null);

    // Auto-advance
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when 4 digits entered
    if (newPin.every((d) => d !== "") && newPin.join("").length === 4) {
      verifyPin(newPin.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyPin = (enteredPin: string) => {
    if (!storedHash) {
      onUnlock();
      return;
    }

    // Simple hash comparison (in production, use bcrypt)
    const enteredHash = btoa(enteredPin);
    if (enteredHash === storedHash) {
      setAttempts(0);
      onUnlock();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin(["", "", "", ""]);
      inputRefs.current[0]?.focus();

      if (newAttempts >= MAX_ATTEMPTS) {
        setLockoutUntil(Date.now() + LOCKOUT_DURATION);
        setError(`Too many attempts. Locked for 5 minutes.`);
      } else {
        setError(`Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }
    }
  };

  const isLocked = lockoutUntil && Date.now() < lockoutUntil;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-xl">
        {/* Lock Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--smf-primary)]/10">
            <Lock className="h-8 w-8 text-[var(--smf-primary)]" />
          </div>
        </div>

        <h2 className="mb-2 text-center text-lg font-semibold text-[var(--text-primary)]">
          Dashboard Locked
        </h2>
        <p className="mb-8 text-center text-sm text-[var(--text-muted)]">
          Enter your PIN to continue
        </p>

        {/* PIN Input */}
        <div className="mb-6 flex justify-center gap-3">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={4}
              disabled={isLocked || false}
              value={digit}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-14 w-14 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-center text-xl font-bold text-[var(--text-primary)] focus:border-[var(--smf-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--smf-primary)]/20 disabled:opacity-50"
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-[var(--smf-danger)]/10 px-4 py-2 text-sm text-[var(--smf-danger)]">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Attempts */}
        {!isLocked && attempts > 0 && (
          <p className="text-center text-xs text-[var(--text-muted)]">
            {MAX_ATTEMPTS - attempts} attempts remaining
          </p>
        )}
      </div>
    </div>
  );
}
