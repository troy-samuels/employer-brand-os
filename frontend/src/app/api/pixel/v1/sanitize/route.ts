/**
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

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { validateApiKey } from '@/features/pixel/lib/validate-key';
import {
  buildSuccessHeaders,
  buildErrorHeaders,
  buildPreflightResponse,
} from '@/features/pixel/lib/cors';
import { sanitizeJobCode } from '@/features/sanitization/lib/sanitize';
import type { SanitizationResult } from '@/features/sanitization/types/sanitization.types';

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

interface SanitizeErrorResponse {
  error: 'invalid_key' | 'missing_code' | 'internal_error';
  message: string;
}

/**
 * Handle OPTIONS preflight requests
 */
export async function OPTIONS(request: NextRequest): Promise<Response> {
  const origin = request.headers.get('origin');

  if (origin) {
    return buildPreflightResponse(origin);
  }

  return new Response(null, { status: 204 });
}

/**
 * Handle GET requests for job code sanitization
 *
 * Query Parameters:
 * - key: API key (required) - format: bos_live_xxx or bos_test_xxx
 * - code: Internal job code (required) - e.g., L4-Eng-NY
 *
 * Returns:
 * {
 *   originalCode: string,
 *   publicTitle: string | null,
 *   jobFamily: string | null,
 *   levelIndicator: string | null,
 *   sanitized: boolean
 * }
 */
export async function GET(request: NextRequest): Promise<Response> {
  const startTime = Date.now();
  const origin = request.headers.get('origin');

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
          'invalid_key',
          'Missing or invalid API key parameter',
          400,
          origin
        );
      }

      return errorResponse(
        'missing_code',
        'Missing or invalid code parameter',
        400,
        origin
      );
    }

    const { key, code } = queryResult.data;

    // Validate API key
    const validatedKey = await validateApiKey(key);
    if (!validatedKey) {
      return errorResponse(
        'invalid_key',
        'API key not found or inactive',
        401,
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
  errorCode: SanitizeErrorResponse['error'],
  message: string,
  status: number,
  origin: string | null
): Response {
  const headers = buildErrorHeaders(origin || undefined);

  const body: SanitizeErrorResponse = {
    error: errorCode,
    message,
  };

  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
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
