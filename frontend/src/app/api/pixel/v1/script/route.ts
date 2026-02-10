import { NextRequest, NextResponse } from "next/server";
import { logPixelLoad } from "@/lib/audit/audit-logger";
import {
  PIXEL_SCRIPT_BODY,
  PIXEL_SCRIPT_ETAG,
  PIXEL_SCRIPT_SRI,
  PIXEL_SCRIPT_VERSION,
} from "@/lib/pixel/script-artifact";

export const runtime = "nodejs";

function getClientIp(request: NextRequest): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const [first] = forwarded.split(",");
    if (first?.trim()) {
      return first.trim();
    }
  }

  return "unknown";
}

export async function GET(request: NextRequest): Promise<Response> {
  const headers = new Headers({
    "Content-Type": "application/javascript; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "public, max-age=300, s-maxage=300, immutable",
    ETag: PIXEL_SCRIPT_ETAG,
    "X-Rankwell-SRI": PIXEL_SCRIPT_SRI,
    "X-Rankwell-Script-Version": PIXEL_SCRIPT_VERSION,
  });

  if (request.headers.get("if-none-match") === PIXEL_SCRIPT_ETAG) {
    return new NextResponse(null, {
      status: 304,
      headers,
    });
  }

  void logPixelLoad({
    actor: getClientIp(request),
    result: "success",
    metadata: {
      script_version: PIXEL_SCRIPT_VERSION,
      user_agent: request.headers.get("user-agent"),
      path: request.nextUrl.pathname,
    },
  });

  return new NextResponse(PIXEL_SCRIPT_BODY, {
    status: 200,
    headers,
  });
}
