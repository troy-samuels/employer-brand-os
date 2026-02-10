/**
 * @module app/api/pixel/v1/sanitize/route
 * Sanitization Engine API Endpoint
 * GET /api/pixel/v1/sanitize
 *
 * Part of Layer 1: Infrastructure - ATS Code Translation
 * Translates internal job codes (e.g., L4-Eng-NY) to public titles (e.g., Senior Software Engineer)
 *
 * Security layers:
 * 1. CORS - Dynamic origin validation
 * 2. API key validation - Key must be active and not expired
 * 3. Rate limiting - Per-key request limits
 * 4. Audit logging - All requests logged
 */

import { NextRequest } from "next/server";
import { z } from "zod";

import {
  buildErrorHeaders,
  buildPreflightResponse,
  buildSuccessHeaders,
} from "@/features/pixel/lib/cors";
import { validateApiKey } from "@/features/pixel/lib/validate-key";
import { sanitizeJobCode } from "@/features/sanitization/lib/sanitize";
import { verifyPixelRequestSignature } from "@/lib/pixel/request-signing";
import { API_ERROR_CODE } from "@/lib/utils/api-errors";
import { type ApiErrorResponse } from "@/lib/utils/api-response";

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

const SANITIZE_ERROR_CODE = {
  invalidKey: "invalid_key",
  missingCode: "missing_code",
} as const;

/**
 * Handles CORS preflight checks for sanitize requests.
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
    console.error("[SANITIZE] OPTIONS preflight error:", error);
    return errorResponse(
      API_ERROR_CODE.internal,
      "An error occurred processing the request",
      500,
      origin,
    );
  }
}

/**
 * Sanitizes internal ATS job codes into public-friendly titles.
 * @param request - The incoming sanitize request.
 * @returns Sanitization output or a standardized error response.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const startTime = Date.now();
  const origin = request.headers.get('origin');
  const ipAddress = extractClientIp(request);
  const userAgent = request.headers.get('user-agent');

  try {
    // Parse and validate query parameters
    const url = new URL(request.url);
    const rawKey = url.searchParams.get('key');
    const rawCode = url.searchParams.get('code');

    const params: { key?: string; code?: string } = {};
    if (rawKey !== null) params.key = rawKey;
    if (rawCode !== null) params.code = rawCode;

    const queryResult = sanitizeQuerySchema.safeParse(params);

    if (!queryResult.success) {
      const errors = queryResult.error.format();

      if (errors.key) {
        return errorResponse(
          SANITIZE_ERROR_CODE.invalidKey,
          'Missing or invalid API key parameter',
          400,
          origin
        );
      }

      return errorResponse(
        SANITIZE_ERROR_CODE.missingCode,
        'Missing or invalid code parameter',
        400,
        origin
      );
    }

    const { key, code } = queryResult.data;

    // Validate API key
    const validatedKey = await validateApiKey(key, {
      ipAddress,
      userAgent,
      resource: 'pixel.v1.sanitize',
    });
    if (!validatedKey) {
      return errorResponse(
        SANITIZE_ERROR_CODE.invalidKey,
        'API key not found or inactive',
        401,
        origin
      );
    }

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

    // Sanitize the job code
    const result = await sanitizeJobCode({
      organizationId: validatedKey.organisationId,
      internalCode: code,
    });

    // Build response
    const headers = buildSuccessHeaders(origin || '');
    headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

    // Log the sanitization request (async, don't block)
    logSanitizeEvent({
      organisationId: validatedKey.organisationId,
      apiKeyId: validatedKey.id,
      internalCode: code,
      sanitized: result.sanitized,
      origin: origin || '',
      responseTimeMs: Date.now() - startTime,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('[SANITIZE] Error processing request:', error);

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
