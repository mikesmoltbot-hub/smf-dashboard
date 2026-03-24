/**
 * AsyncLocalStorage-based request-scoped gateway context.
 * Safely carries the target gateway URL + token across concurrent async calls
 * within a single request, without leaking to other concurrent requests.
 */

import { AsyncLocalStorage } from "async_hooks";

export interface GatewayContext {
  gatewayUrl: string;
  gatewayToken?: string;
}

export const gatewayContextStorage = new AsyncLocalStorage<GatewayContext>();

/**
 * Run a callback within a given gateway context.
 * All gateway calls made during `fn` will use the provided URL + token.
 */
export function withGateway<T>(ctx: GatewayContext, fn: () => T): T {
  return gatewayContextStorage.run(ctx, fn);
}

/**
 * Get the current request's gateway context (if any).
 */
export function getGateway(): GatewayContext | undefined {
  return gatewayContextStorage.getStore();
}
