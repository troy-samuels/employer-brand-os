/**
 * @module features/pixel/lib/cors
 * Module implementation for cors.ts.
 */

import { validateDomain } from './validate-domain';

/**
 * CORS Headers Helper
 * Builds dynamic CORS headers for the Smart Pixel API
 *
 * Security: We use dynamic origin matching instead of wildcard (*)
 * This is Layer 1 of our defense in depth strategy
 */

/**
 * Build CORS headers for a validated origin
 *
 * Security notes:
 * - Never use Access-Control-Allow-Origin: *
 * - Always set Vary: Origin for proper caching
 * - Limit methods to GET and OPTIONS only
 *
 * @param origin - The validated origin to allow
 * @returns Headers object with CORS configuration
 */
export function buildCorsHeaders(
  origin: string,
  options?: {
    allowMethods?: string;
    allowHeaders?: string;
  }
): Headers {
  const headers = new Headers();

  // Dynamic origin - reflects the requesting origin if validated
  headers.set('Access-Control-Allow-Origin', origin);

  // Only GET is needed for reading facts
  headers.set(
    'Access-Control-Allow-Methods',
    options?.allowMethods ?? 'GET, OPTIONS'
  );

  // Signature headers are required for pixel request authentication.
  headers.set(
    'Access-Control-Allow-Headers',
    options?.allowHeaders ??
      'Content-Type, X-Rankwell-Key, X-Rankwell-Timestamp, X-Rankwell-Nonce, X-Rankwell-Signature'
  );

  // Cache preflight for 24 hours
  headers.set('Access-Control-Max-Age', '86400');

  // Critical for CDN caching - responses vary by origin
  headers.set('Vary', 'Origin');

  return headers;
}

/**
 * Build headers for a successful JSON-LD response
 * Includes CORS headers plus caching configuration
 */
export function buildSuccessHeaders(origin?: string | null): Headers {
  const headers = new Headers();

  // Cache for 5 minutes - balances freshness with performance
  headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');

  // Content type for JSON-LD
  headers.set('Content-Type', 'application/ld+json; charset=utf-8');

  // Version header for debugging
  headers.set('X-Rankwell-Version', '1.0');

  if (origin) {
    const corsHeaders = buildCorsHeaders(origin);
    corsHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

/**
 * Build headers for an error response
 * No caching, includes CORS for error visibility
 */
export function buildErrorHeaders(origin?: string | null): Headers {
  const headers = new Headers();

  // If we have a valid origin, include CORS headers so client can read error
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }

  // Don't cache errors
  headers.set('Cache-Control', 'no-store');

  // JSON error response
  headers.set('Content-Type', 'application/json; charset=utf-8');

  return headers;
}

/**
 * Handle OPTIONS preflight request
 * Returns 204 No Content with CORS headers
 */
export function buildPreflightResponse(
  origin: string,
  allowedDomains?: string[],
  options?: {
    allowMethods?: string;
    allowHeaders?: string;
  }
): Response {
  if (allowedDomains) {
    const domainResult = validateDomain(origin, null, allowedDomains);
    if (!domainResult.valid) {
      return new Response(null, {
        status: 403,
        headers: new Headers({
          'Cache-Control': 'no-store',
          Vary: 'Origin',
        }),
      });
    }
  }

  const headers = buildCorsHeaders(origin, options);

  return new Response(null, {
    status: 204,
    headers,
  });
}
