/**
 * @module app/api/pixel/v1/facts/route
 * Smart Pixel Facts API Endpoint
 * GET /api/pixel/v1/facts
 *
 * This is the core API that powers the Rankwell Smart Pixel.
 * It returns verified employer facts as JSON-LD for injection into client websites.
 *
 * Security layers:
 * 1. CORS - Dynamic origin validation
 * 2. Domain allowlist - Server-side origin check
 * 3. API key validation - Key must be active and not expired
 * 4. Rate limiting - Per-key request limits
 * 5. Audit logging - All requests logged for forensics
 */

import { NextRequest } from "next/server";

import {
  buildErrorHeaders,
  buildPreflightResponse,
  buildSuccessHeaders,
} from '@/features/pixel/lib/cors';
import { generateJsonLd } from "@/features/pixel/lib/generate-jsonld";
import { validateApiKey } from "@/features/pixel/lib/validate-key";
import { validateDomain } from "@/features/pixel/lib/validate-domain";
import { pixelFactsQuerySchema } from '@/features/pixel/schemas/pixel.schema';
import { verifyPixelRequestSignature } from "@/lib/pixel/request-signing";
import { API_ERROR_CODE } from "@/lib/utils/api-errors";
import { type ApiErrorResponse } from "@/lib/utils/api-response";

const PIXEL_FACTS_ERROR_CODE = {
  domainNotAllowed: "domain_not_allowed",
  invalidKey: "invalid_key",
} as const;

/**
 * Handles CORS preflight checks for the facts endpoint.
 * @param request - The incoming preflight request.
 * @returns A preflight response with CORS headers when origin is provided.
 */
export async function OPTIONS(request: NextRequest): Promise<Response> {
  const origin = request.headers.get("origin");

  try {
    if (origin) {
      return buildPreflightResponse(origin);
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[PIXEL] OPTIONS preflight error:", error);
    return errorResponse(
      API_ERROR_CODE.internal,
      "An error occurred processing the request",
      500,
      origin,
    );
  }
}

/**
 * Returns verified employer facts as JSON-LD.
 * @param request - The incoming facts request.
 * @returns A JSON-LD payload or a standardized error response.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const startTime = Date.now();
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const ipAddress = extractClientIp(request);
  const userAgent = request.headers.get('user-agent');

  try {
    // Parse and validate query parameters
    const url = new URL(request.url);
    const rawKey = url.searchParams.get('key');
    const rawLocation = url.searchParams.get('location');

    // Build params object, excluding null values (Zod optional expects undefined, not null)
    const params: { key?: string; location?: string } = {};
    if (rawKey !== null) params.key = rawKey;
    if (rawLocation !== null) params.location = rawLocation;

    const queryResult = pixelFactsQuerySchema.safeParse(params);

    if (!queryResult.success) {
      console.error('[PIXEL] Validation error:', queryResult.error.format());
      return errorResponse(
        PIXEL_FACTS_ERROR_CODE.invalidKey,
        'Missing or invalid API key parameter',
        400,
        origin
      );
    }

    const { key, location } = queryResult.data;

    // Layer 3: Validate API key
    const validatedKey = await validateApiKey(key, {
      ipAddress,
      userAgent,
      resource: 'pixel.v1.facts',
    });
    if (!validatedKey) {
      return errorResponse(
        PIXEL_FACTS_ERROR_CODE.invalidKey,
        'API key not found or inactive',
        401,
        origin
      );
    }

    // Layer 4: Verify request signature and replay protection
    const signatureResult = verifyPixelRequestSignature(request, key);
    if (!signatureResult.ok) {
      const errorCode =
        signatureResult.error === 'replay_detected'
          ? API_ERROR_CODE.replayDetected
          : API_ERROR_CODE.invalidSignature;

      return errorResponse(
        errorCode,
        signatureResult.message,
        signatureResult.status,
        origin
      );
    }

    // Layer 2: Validate domain against allowlist
    const domainResult = validateDomain(
      origin,
      referer,
      validatedKey.allowedDomains
    );

    if (!domainResult.valid) {
      // Log suspicious request for security monitoring
      console.warn(
        `[PIXEL] Domain validation failed: ${domainResult.requestedOrigin} not in ${validatedKey.allowedDomains.join(', ')}`
      );

      return errorResponse(
        PIXEL_FACTS_ERROR_CODE.domainNotAllowed,
        'Origin not in allowed domains',
        403,
        origin
      );
    }

    // Generate JSON-LD from verified facts
    const jsonLd = await generateJsonLd({
      organisationId: validatedKey.organisationId,
      locationId: location,
    });

    // Build response with CORS headers
    const responseOrigin = domainResult.requestedOrigin || origin || '';
    const headers = buildSuccessHeaders(responseOrigin);

    // Add timing header for performance monitoring
    headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

    // Log successful request (async, don't block response)
    logPixelEvent({
      organisationId: validatedKey.organisationId,
      apiKeyId: validatedKey.id,
      eventType: 'schema_inject',
      origin: responseOrigin,
      responseTimeMs: Date.now() - startTime,
    });

    return new Response(JSON.stringify(jsonLd), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('[PIXEL] Error generating JSON-LD:', error);

    return errorResponse(
      API_ERROR_CODE.internal,
      'An error occurred processing the request',
      500,
      origin
    );
  }
}

/**
 * Build a standardized error response
 */
function errorResponse(
  errorCode: string,
  message: string,
  status: number,
  origin: string | null
): Response {
  const headers = buildErrorHeaders(origin || undefined);

  const body: ApiErrorResponse = {
    error: message,
    code: errorCode,
    status,
  };

  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

function extractClientIp(request: NextRequest): string | null {
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) {
    return realIp;
  }

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const [first] = forwarded.split(',');
    if (first?.trim()) {
      return first.trim();
    }
  }

  return null;
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
