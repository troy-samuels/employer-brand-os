/**
 * @module app/api/pixel/v1/script/route
 * Serves the immutable Smart Pixel script with caching and audit logging.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logPixelLoad } from "@/lib/audit/audit-logger";
import { markPixelServiceRequest } from "@/lib/pixel/health";
import {
  PIXEL_SCRIPT_BODY,
  PIXEL_SCRIPT_ETAG,
  PIXEL_SCRIPT_SRI,
  PIXEL_SCRIPT_VERSION,
} from "@/lib/pixel/script-artifact";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";

/**
 * Exposes exported value(s): runtime.
 */
export const runtime = "nodejs";

const scriptQuerySchema = z.object({}).passthrough();

/**
 * Extracts a best-effort client IP for audit logging.
 * @param request - The script request.
 * @returns The inferred client IP or `unknown`.
 */
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

/**
 * Serves the JavaScript payload for the Smart Pixel runtime.
 * @param request - The incoming script request.
 * @returns Script bytes, cache revalidation response, or a standardized error response.
 */
export async function GET(
  request: NextRequest,
): Promise<Response | NextResponse<ApiErrorResponse>> {
  markPixelServiceRequest();

  try {
    const query = Object.fromEntries(request.nextUrl.searchParams);
    const parsedQuery = scriptQuerySchema.safeParse(query);

    if (!parsedQuery.success) {
      return apiErrorResponse({
        error: "Invalid query parameters",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    const headers = new Headers({
      "Content-Type": "application/javascript; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=300, s-maxage=300, immutable",
      ETag: PIXEL_SCRIPT_ETAG,
      "X-OpenRole-SRI": PIXEL_SCRIPT_SRI,
      "X-OpenRole-Script-Version": PIXEL_SCRIPT_VERSION,
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
  } catch (error) {
    console.error("Pixel script API error:", error);
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}
