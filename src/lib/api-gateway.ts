/**
 * Reads x-gateway-url / x-gateway-token headers from a Next.js NextRequest
 * and returns a GatewayContext for use with withGateway().
 */

import { NextRequest } from "next/server";
import type { GatewayContext } from "./request-gateway";

export function getGatewayContext(request: NextRequest): GatewayContext | undefined {
  const gatewayUrl = request.headers.get("x-gateway-url") || undefined;
  const gatewayToken = request.headers.get("x-gateway-token") || undefined;
  if (!gatewayUrl) return undefined;
  return { gatewayUrl, gatewayToken };
}
