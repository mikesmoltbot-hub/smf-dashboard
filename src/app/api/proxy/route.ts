import { NextRequest, NextResponse } from "next/server";
import { gatewayCallWithRetry } from "@/lib/gateway-config";
import { withGateway } from "@/lib/request-gateway";

export const dynamic = "force-dynamic";

// GET /api/proxy?gateway=http://...&method=config.get&timeout=10000&...
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const gateway = url.searchParams.get("gateway");
  const method = url.searchParams.get("method");
  const timeout = parseInt(url.searchParams.get("timeout") || "15000");

  if (!gateway || !method) {
    return NextResponse.json({ error: "gateway and method required" }, { status: 400 });
  }

  // Extract params from query string
  const params: Record<string, unknown> = {};
  for (const [key, value] of url.searchParams.entries()) {
    if (key !== "gateway" && key !== "method" && key !== "timeout") {
      try {
        params[key] = JSON.parse(value);
      } catch {
        params[key] = value;
      }
    }
  }

  const result = await withGateway(
    { gatewayUrl: gateway },
    () => gatewayCallWithRetry(method, Object.keys(params).length > 0 ? params : undefined, timeout)
  );
  return NextResponse.json(result);
}

// POST /api/proxy - body: { gateway, method, params, timeout }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gateway, method, params, timeout = 15000 } = body;

    if (!gateway || !method) {
      return NextResponse.json({ error: "gateway and method required" }, { status: 400 });
    }

    const result = await withGateway(
      { gatewayUrl: gateway },
      () => gatewayCallWithRetry(method, params, timeout)
    );
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
