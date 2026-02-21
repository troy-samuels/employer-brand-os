/**
 * @module app/api/pixel/v1/crawl-log
 * Logs AI crawler visits detected by the OpenRole pixel.
 * POST /api/pixel/v1/crawl-log
 */

import { NextRequest } from "next/server";
import { z } from "zod";

import {
  buildPreflightResponse,
  buildSuccessHeaders,
} from "@/features/pixel/lib/cors";
import {
  getCorsOrigin,
  pixelErrorResponse,
  requireApiKey,
  requireDomain,
  requireRateLimit,
} from "@/features/pixel/lib/pixel-api";
import { markPixelServiceRequest } from "@/lib/pixel/health";
import { verifyPixelRequestSignature } from "@/lib/pixel/request-signing";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import { untypedTable } from "@/lib/supabase/untyped-table";
import { apiErrorResponse, apiSuccessResponse } from "@/lib/utils/api-response";

export const runtime = "nodejs";

const crawlLogSchema = z.object({
  companyId: z.string().trim().min(1).max(128),
  botName: z.string().trim().min(1).max(128),
  userAgent: z.string().trim().min(1).max(1024),
  pageUrl: z.string().url().max(2048),
  timestamp: z.string().datetime().optional(),
  couldRead: z.boolean(),
});

export async function OPTIONS(request: NextRequest): Promise<Response> {
  markPixelServiceRequest();
  const origin = getCorsOrigin(request.headers.get("origin"));

  if (!origin) {
    return new Response(null, { status: 204 });
  }

  // Preflight does not include header values, so we cannot validate key/domain here.
  return buildPreflightResponse(origin, undefined, {
    allowMethods: "POST, OPTIONS",
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  markPixelServiceRequest();
  const origin = getCorsOrigin(request.headers.get("origin"));
  const referer = request.headers.get("referer");

  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return pixelErrorResponse({
        code: API_ERROR_CODE.invalidPayload,
        message: "Invalid crawl log payload",
        status: 400,
        origin,
      });
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return pixelErrorResponse({
        code: API_ERROR_CODE.invalidJson,
        message: API_ERROR_MESSAGE.invalidJson,
        status: 400,
        origin,
      });
    }

    const parsed = crawlLogSchema.safeParse(parsedBody);
    if (!parsed.success) {
      return pixelErrorResponse({
        code: API_ERROR_CODE.invalidPayload,
        message: "Invalid crawl log payload",
        status: 400,
        origin,
        details: parsed.error.flatten(),
      });
    }

    const url = new URL(request.url);
    const rawKey =
      request.headers.get("x-openrole-key") ??
      url.searchParams.get("key");

    const keyResult = await requireApiKey(
      rawKey,
      request,
      "pixel.v1.crawl-log",
      origin
    );
    if (!keyResult.ok) {
      return keyResult.response;
    }

    const domainResult = requireDomain(
      origin,
      referer,
      keyResult.validatedKey.allowedDomains
    );
    if (!domainResult.ok) {
      return domainResult.response;
    }

    const signatureResult = verifyPixelRequestSignature(request, keyResult.key, {
      body: rawBody,
    });
    if (!signatureResult.ok) {
      return pixelErrorResponse({
        code:
          signatureResult.error === "replay_detected"
            ? API_ERROR_CODE.replayDetected
            : API_ERROR_CODE.invalidSignature,
        message: signatureResult.message,
        status: signatureResult.status,
        origin,
      });
    }

    const rateLimitResult = await requireRateLimit(
      "pixel.v1.crawl-log",
      keyResult.validatedKey.id,
      keyResult.validatedKey.rateLimitPerMinute,
      origin
    );
    if (!rateLimitResult.ok) {
      return rateLimitResult.response;
    }

    const { companyId, botName, userAgent, pageUrl, timestamp, couldRead } =
      parsed.data;

    const { error } = await untypedTable("crawler_visits").insert({
      company_id: companyId,
      bot_name: botName,
      user_agent: userAgent,
      page_url: pageUrl,
      could_read: couldRead,
      response_served: false,
      visited_at: timestamp ?? new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to log crawler visit:", error);
      return pixelErrorResponse({
        code: API_ERROR_CODE.internal,
        message: API_ERROR_MESSAGE.internal,
        status: 500,
        origin,
      });
    }

    const headers = buildSuccessHeaders(origin);
    return apiSuccessResponse({ ok: true }, { status: 201, headers });
  } catch (error) {
    console.error("Crawl log API error:", error);
    return pixelErrorResponse({
      code: API_ERROR_CODE.internal,
      message: API_ERROR_MESSAGE.internal,
      status: 500,
      origin,
    });
  }
}

/**
 * Reject non-POST methods.
 */
export async function GET() {
  return apiErrorResponse({
    error: "Method not allowed",
    code: API_ERROR_CODE.invalidPayload,
    status: 405,
  });
}
