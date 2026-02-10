/**
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

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/features/pixel/lib/validate-key';
import { validateDomain } from '@/features/pixel/lib/validate-domain';
import { generateJsonLd } from '@/features/pixel/lib/generate-jsonld';
import { verifyPixelRequestSignature } from '@/lib/pixel/request-signing';
import {
  buildSuccessHeaders,
  buildErrorHeaders,
  buildPreflightResponse,
} from '@/features/pixel/lib/cors';
import { pixelFactsQuerySchema } from '@/features/pixel/schemas/pixel.schema';
import type { PixelErrorResponse } from '@/features/pixel/types/pixel.types';

/**
 * Handle OPTIONS preflight requests
 * Required for CORS to work with cross-origin requests
 */
export async function OPTIONS(request: NextRequest): Promise<Response> {
  const origin = request.headers.get('origin');

  // For preflight, we allow the request if origin is provided
  // The actual validation happens on the GET request
  if (origin) {
    return buildPreflightResponse(origin);
  }

  return new Response(null, { status: 204 });
}

/**
 * Handle GET requests for employer facts
 *
 * Query Parameters:
 * - key: API key (required) - format: bos_live_xxx or bos_test_xxx
 * - location: Location ID (optional) - UUID for multi-location filtering
 *
 * Headers checked:
 * - Origin: Primary domain validation
 * - Referer: Fallback domain validation
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
        'invalid_key',
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
        'invalid_key',
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
          ? 'replay_detected'
          : 'invalid_signature';

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
        'domain_not_allowed',
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
      'internal_error',
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
  errorCode: PixelErrorResponse['error'],
  message: string,
  status: number,
  origin: string | null
): Response {
  const headers = buildErrorHeaders(origin || undefined);

  const body: PixelErrorResponse = {
    error: errorCode,
    message,
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
