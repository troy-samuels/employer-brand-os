/**
 * @module app/api/pixel/v1/sanitize/route
 * Sanitization Engine API Endpoint
 * GET /api/pixel/v1/sanitize
 *
 * Part of Layer 1: Infrastructure - ATS Code Translation
 * Translates internal job codes (e.g., L4-Eng-NY) to public titles (e.g., Senior Software Engineer)
 *
 * Security layers:
 * 1. CORS + preflight allowlist checks
 * 2. API key validation - Includes missing/format/expiry handling
 * 3. Request signing verification + replay protection
 * 4. Domain allowlist validation
 * 5. Rate limiting - Per-key request limits
 * 6. Audit logging - All requests logged
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
  zodValidationDetails,
} from "@/features/pixel/lib/pixel-api";
import { sanitizeJobCode } from "@/features/sanitization/lib/sanitize";
import { markPixelServiceRequest } from "@/lib/pixel/health";
import { verifyPixelRequestSignature } from "@/lib/pixel/request-signing";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";

// Query parameter schema
const sanitizeQuerySchema = z.object({
  key: z
    .string()
    .min(1, 'API key is required')
    .startsWith('bos_', 'Invalid API key format'),
  code: z
    .string()
    .min(1, 'Internal code is required')
    .max(100, 'Internal code too long'),
});

/**
 * Handles CORS preflight checks for sanitize requests.
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
        "pixel.v1.sanitize.preflight",
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
    console.error("[SANITIZE] OPTIONS preflight error:", error);
    return pixelErrorResponse({
      code: API_ERROR_CODE.internal,
      message: API_ERROR_MESSAGE.internal,
      status: 500,
      origin,
    });
  }
}

/**
 * Sanitizes internal ATS job codes into public-friendly titles.
 * @param request - The incoming sanitize request.
 * @returns Sanitization output or a standardized error response.
 */
export async function GET(request: NextRequest): Promise<Response> {
  markPixelServiceRequest();
  const startTime = Date.now();
  const origin = getCorsOrigin(request.headers.get('origin'));
  const referer = request.headers.get('referer');

  try {
    const url = new URL(request.url);
    const rawKey = url.searchParams.get('key');
    const rawCode = url.searchParams.get('code');
    const keyResult = await requireApiKey(
      rawKey,
      request,
      "pixel.v1.sanitize",
      origin
    );
    if (!keyResult.ok) {
      return keyResult.response;
    }

    const params: { key: string; code?: string } = { key: keyResult.key };
    if (rawCode !== null) {
      params.code = rawCode;
    }

    const queryResult = sanitizeQuerySchema.safeParse(params);

    if (!queryResult.success) {
      return pixelErrorResponse({
        code: API_ERROR_CODE.malformedRequest,
        message: "Malformed request parameters",
        status: 400,
        origin,
        details: zodValidationDetails(queryResult.error),
      });
    }

    const { key, code } = queryResult.data;

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
      "pixel.v1.sanitize",
      keyResult.validatedKey.id,
      keyResult.validatedKey.rateLimitPerMinute,
      origin
    );
    if (!rateLimitResult.ok) {
      return rateLimitResult.response;
    }

    const result = await sanitizeJobCode({
      organizationId: keyResult.validatedKey.organisationId,
      internalCode: code,
    });

    const headers = buildSuccessHeaders(origin);
    headers.set('Content-Type', 'application/json; charset=utf-8');
    headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

    logSanitizeEvent({
      organisationId: keyResult.validatedKey.organisationId,
      apiKeyId: keyResult.validatedKey.id,
      internalCode: code,
      sanitized: result.sanitized,
      origin: origin || referer || '',
      responseTimeMs: Date.now() - startTime,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('[SANITIZE] Error processing request:', error);

    return pixelErrorResponse({
      code: API_ERROR_CODE.internal,
      message: API_ERROR_MESSAGE.internal,
      status: 500,
      origin,
    });
  }
}

/**
 * Log sanitization event for audit trail
 * Fire and forget - don't block the response
 */
async function logSanitizeEvent(event: {
  organisationId: string;
  apiKeyId: string;
  internalCode: string;
  sanitized: boolean;
  origin: string;
  responseTimeMs: number;
}): Promise<void> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase/admin');

    await supabaseAdmin.from('pixel_events').insert({
      organization_id: event.organisationId,
      api_key_id: event.apiKeyId,
      event_type: event.sanitized ? 'sanitize_success' : 'sanitize_miss',
      page_url: event.origin,
      metadata: {
        internal_code: event.internalCode,
        sanitized: event.sanitized,
      },
      response_time_ms: event.responseTimeMs,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[SANITIZE] Failed to log event:', error);
  }
}
