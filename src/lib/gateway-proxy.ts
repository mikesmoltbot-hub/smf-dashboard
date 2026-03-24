/**
 * Direct gateway proxy — used by API routes to forward requests to
 * the gateway selected in the dashboard (via x-gateway-url header).
 *
 * This bypasses the local gateway resolution so remote gateways work.
 */

export interface GatewayProxyOptions {
  gatewayUrl: string;
  token?: string;
}

/**
 * Make a direct call to a gateway's /tools/invoke endpoint.
 * Used for remote gateway routing from dashboard API routes.
 */
export async function gatewayProxyInvoke<T>(
  method: string,
  params: Record<string, unknown> = {},
  options: GatewayProxyOptions,
  timeout = 15000,
): Promise<T> {
  const { gatewayUrl, token } = options;
  const url = `${gatewayUrl.replace(/\/$/, "")}/tools/invoke`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ tool: method, args: params }),
      signal: controller.signal,
    });

    const body = (await res.json().catch(() => null)) as
      | { ok?: boolean; result?: T; error?: { message?: string } }
      | T
      | null;

    if (!res.ok) {
      const text =
        body && typeof body === "object" && "error" in body && body.error?.message
          ? body.error.message
          : JSON.stringify(body || "");
      throw new Error(`Gateway ${method} returned ${res.status}: ${text}`);
    }

    if (body && typeof body === "object" && "ok" in body) {
      if (body.ok === false) {
        throw new Error((body as { error?: { message?: string } }).error?.message || `Tool ${method} failed`);
      }
      return ((body as { result?: T }).result as T) ?? ({} as T);
    }

    return (body || {}) as T;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Extract gateway URL and token from the x-gateway-url request header.
 * Header format: <url> or <url>:<token>
 */
export function parseGatewayHeader(headerValue: string | null): GatewayProxyOptions | null {
  if (!headerValue) return null;
  const parts = headerValue.split(":");
  const url = parts[0];
  const token = parts.slice(1).join(":") || undefined;
  if (!url) return null;
  return { gatewayUrl: url, token };
}
