/**
 * @module app/api/pixel/v1/facts/route
 * Smart Pixel Facts API Endpoint
 * GET /api/pixel/v1/facts
 *
 * This is the core API that powers the Rankwell Smart Pixel.
 * It returns verified employer facts as JSON-LD for injection into client websites.
 *
 * Security layers:
 * 1. CORS + preflight allowlist checks
 * 2. Domain allowlist - Server-side origin check
 * 3. API key validation - Includes missing/format/expiry handling
 * 4. Request signing verification + replay protection
 * 5. Rate limiting - Per-key request limits
 * 6. Audit logging - All requests logged for forensics
 */

import { NextRequest } from "next/server";

import {
  buildPreflightResponse,
  buildSuccessHeaders,
} from '@/features/pixel/lib/cors';
import { generateJsonLd } from "@/features/pixel/lib/generate-jsonld";
import {
  getCorsOrigin,
  pixelErrorResponse,
  requireApiKey,
  requireDomain,
  requireRateLimit,
  zodValidationDetails,
} from "@/features/pixel/lib/pixel-api";
import { pixelFactsQuerySchema } from '@/features/pixel/schemas/pixel.schema';
import { markPixelServiceRequest } from "@/lib/pixel/health";
import { verifyPixelRequestSignature } from "@/lib/pixel/request-signing";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";

/**
 * Handles CORS preflight checks for the facts endpoint.
 * @param request - The incoming preflight request.
 * @returns A preflight response with CORS headers when origin is provided.
 */
export async function OPTIONS(request: NextRequest): Promise<Response> {
  markPixelServiceRequest();
  const origin = getCorsOrigin(request.headers.get("origin"));

  try {
    if (origin) {
      const url = new URL(request.url);
      const keyResult = await requireApiKey(
        url.searchParams.get("key"),
        request,
        "pixel.v1.facts.preflight",
        origin
      );
      if (!keyResult.ok) {
        return keyResult.response;
      }

      const domainResult = requireDomain(
        origin,
        null,
        keyResult.validatedKey.allowedDomains
      );
      if (!domainResult.ok) {
        return domainResult.response;
      }

      return buildPreflightResponse(origin, keyResult.validatedKey.allowedDomains);
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[PIXEL] OPTIONS preflight error:", error);
    return pixelErrorResponse({
      code: API_ERROR_CODE.internal,
      message: API_ERROR_MESSAGE.internal,
      status: 500,
      origin,
    });
  }
}

/**
 * Returns verified employer facts as JSON-LD.
 * @param request - The incoming facts request.
 * @returns A JSON-LD payload or a standardized error response.
 */
export async function GET(request: NextRequest): Promise<Response> {
  markPixelServiceRequest();
  const startTime = Date.now();
  const origin = getCorsOrigin(request.headers.get('origin'));
  const referer = request.headers.get('referer');

  try {
    const url = new URL(request.url);
    const rawKey = url.searchParams.get('key');
    const rawLocation = url.searchParams.get('location');
    const keyResult = await requireApiKey(
      rawKey,
      request,
      "pixel.v1.facts",
      origin
    );
    if (!keyResult.ok) {
      return keyResult.response;
    }

    const params: { key: string; location?: string } = {
      key: keyResult.key,
    };
    if (rawLocation !== null) {
      params.location = rawLocation;
    }

    const queryResult = pixelFactsQuerySchema.safeParse(params);
    if (!queryResult.success) {
      return pixelErrorResponse({
        code: API_ERROR_CODE.malformedRequest,
        message: "Malformed request parameters",
        status: 400,
        origin,
        details: zodValidationDetails(queryResult.error),
      });
    }

    const { key, location } = queryResult.data;

    const signatureResult = verifyPixelRequestSignature(request, key);
    if (!signatureResult.ok) {
      const errorCode =
        signatureResult.error === 'replay_detected'
          ? API_ERROR_CODE.replayDetected
          : API_ERROR_CODE.invalidSignature;

      return pixelErrorResponse({
        code: errorCode,
        message: signatureResult.message,
        status: signatureResult.status,
        origin,
      });
    }

    const domainResult = requireDomain(
      origin,
      referer,
      keyResult.validatedKey.allowedDomains
    );
    if (!domainResult.ok) {
      return domainResult.response;
    }

    const rateLimitResult = await requireRateLimit(
      "pixel.v1.facts",
      keyResult.validatedKey.id,
      keyResult.validatedKey.rateLimitPerMinute,
      origin
    );
    if (!rateLimitResult.ok) {
      return rateLimitResult.response;
    }

    const jsonLd = await generateJsonLd({
      organisationId: keyResult.validatedKey.organisationId,
      locationId: location,
    });

    const headers = buildSuccessHeaders(origin);

    headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

    logPixelEvent({
      organisationId: keyResult.validatedKey.organisationId,
      apiKeyId: keyResult.validatedKey.id,
      eventType: 'schema_inject',
      origin: origin || referer || "",
      responseTimeMs: Date.now() - startTime,
    });

    return new Response(JSON.stringify(jsonLd), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('[PIXEL] Error generating JSON-LD:', error);

    return pixelErrorResponse({
      code: API_ERROR_CODE.internal,
      message: API_ERROR_MESSAGE.internal,
      status: 500,
      origin,
    });
  }
}

/**
 * Log pixel event for audit trail
 * Fire and forget - don't block the response
 */
async function logPixelEvent(event: {
  organisationId: string;
  apiKeyId: string;
  eventType: string;
  origin: string;
  responseTimeMs: number;
}): Promise<void> {
  try {
    // Dynamic import to avoid circular dependencies
    const { supabaseAdmin } = await import('@/lib/supabase/admin');

    await supabaseAdmin.from('pixel_events').insert({
      organization_id: event.organisationId,
      api_key_id: event.apiKeyId,
      event_type: event.eventType,
      page_url: event.origin,
      response_time_ms: event.responseTimeMs,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    // Don't let logging failures affect the API response
    console.error('[PIXEL] Failed to log event:', error);
  }
}
