/**
 * Shared utility for auto-enabling the OpenResponses endpoint.
 * Used by chat routes that need streaming support.
 */

import { gatewayCall } from "./openclaw";

let _responsesEndpointEnsured = false;
let _responsesLastAttempt = 0;
const RESPONSES_RETRY_COOLDOWN_MS = 5 * 60_000; // 5 minutes

/** Resolves when the setup attempt completes (success or fail). */
let _responsesSetupPromise: Promise<void> | null = null;

export function triggerResponsesEndpointSetup(): void {
  ensureResponsesEndpoint();
}

export function ensureResponsesEndpoint(): void {
  if (_responsesEndpointEnsured) return;
  if (Date.now() - _responsesLastAttempt < RESPONSES_RETRY_COOLDOWN_MS) return;
  _responsesLastAttempt = Date.now();

  // Fire-and-forget — don't block the health check response
  _responsesSetupPromise = (async () => {
    try {
      const cfg = await gatewayCall<{
        hash?: string;
        parsed?: Record<string, unknown>;
        config?: Record<string, unknown>;
      }>(
        "config.get",
        undefined,
        8000,
      );
      // Check both parsed (standard) and config (legacy) shapes
      const root = cfg?.parsed ?? cfg?.config ?? {};
      const gw = (root as Record<string, unknown>)?.gateway as Record<string, unknown> | undefined;
      const http = gw?.http as Record<string, unknown> | undefined;
      const endpoints = http?.endpoints as Record<string, unknown> | undefined;
      const responses = endpoints?.responses as Record<string, unknown> | undefined;
      if (responses?.enabled === true) {
        _responsesEndpointEnsured = true; // Already enabled, no patch needed
        return;
      }

      await gatewayCall(
        "config.patch",
        {
          raw: JSON.stringify({
            gateway: { http: { endpoints: { responses: { enabled: true } } } },
          }),
          baseHash: String(cfg?.hash || ""),
          restartDelayMs: 3000,
        },
        10000,
      );
      _responsesEndpointEnsured = true;
    } catch {
      // Non-fatal — streaming falls back to non-streaming.
      // Do NOT reset _responsesEndpointEnsured; cooldown timer handles retry.
    } finally {
      _responsesSetupPromise = null;
    }
  })();
}

/**
 * Wait for the in-flight responses endpoint setup to finish.
 * Called by the chat route to avoid racing with the fire-and-forget setup.
 */
export async function waitForResponsesEndpoint(): Promise<void> {
  if (_responsesSetupPromise) {
    await _responsesSetupPromise;
  }
}
