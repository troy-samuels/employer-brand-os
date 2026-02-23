/**
 * @module features/pixel/lib/pixel-api
 * Shared guards and response helpers for pixel API routes.
 */

import type { NextRequest } from "next/server";
import type { ZodError } from "zod";

import { buildErrorHeaders } from "@/features/pixel/lib/cors";
import {
  type ApiKeyValidationFailureReason,
  isValidPixelApiKeyFormat,
  validateApiKeyWithStatus,
} from "@/features/pixel/lib/validate-key";
import { validateDomain } from "@/features/pixel/lib/validate-domain";
import type { ValidatedPixelKey } from "@/features/pixel/types/pixel.types";
import { extractClientIp as extractClientIpFromRequest } from "@/lib/security/request-metadata";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import type { ApiErrorResponse } from "@/lib/utils/api-response";
import { pixelRateLimiter } from "@/lib/utils/distributed-rate-limiter";
import { recordAuthFailure, isIpBlocked, resetAuthFailures } from "@/lib/security/auth-monitor";

const RATE_LIMIT_WINDOW_SECONDS = 60;

type PixelRouteErrorResponseOptions = {
  code: string;
  message: string;
  status: number;
  origin?: string | null;
  includeCors?: boolean;
  retryAfterSeconds?: number;
  details?: unknown;
};

function mapApiKeyValidationFailure(
  reason: ApiKeyValidationFailureReason
): {
  status: number;
  code: string;
  message: string;
} {
  switch (reason) {
    case "invalid_format":
      return {
        status: 400,
        code: API_ERROR_CODE.invalidKeyFormat,
        message: "Invalid API key format",
      };
    case "expired":
      return {
        status: 401,
        code: API_ERROR_CODE.keyExpired,
        message: "API key expired",
      };
    case "not_found_or_inactive":
    case "hash_mismatch":
      return {
        status: 401,
        code: API_ERROR_CODE.invalidKey,
        message: "API key not found or inactive",
      };
    default:
      return {
        status: 500,
        code: API_ERROR_CODE.internal,
        message: API_ERROR_MESSAGE.internal,
      };
  }
}

export function getCorsOrigin(originHeader: string | null): string | null {
  if (!originHeader) {
    return null;
  }

  try {
    return new URL(originHeader).origin;
  } catch {
    return null;
  }
}

export function pixelErrorResponse(
  options: PixelRouteErrorResponseOptions
): Response {
  const corsOrigin = getCorsOrigin(options.origin ?? null);
  const headers = buildErrorHeaders(
    options.includeCors === false ? null : corsOrigin
  );
  if (options.retryAfterSeconds !== undefined) {
    headers.set("Retry-After", String(options.retryAfterSeconds));
  }

  const body: ApiErrorResponse = {
    error: options.message,
    code: options.code,
    status: options.status,
    ...(options.retryAfterSeconds !== undefined
      ? { retryAfter: options.retryAfterSeconds }
      : {}),
    ...(options.details !== undefined ? { details: options.details } : {}),
  };

  return new Response(JSON.stringify(body), {
    status: options.status,
    headers,
  });
}

export function zodValidationDetails(error: ZodError): {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
} {
  const formatted = error.flatten();
  return {
    formErrors: formatted.formErrors,
    fieldErrors: formatted.fieldErrors,
  };
}

export function extractClientIp(request: NextRequest): string | null {
  return extractClientIpFromRequest(request);
}

export async function requireApiKey(
  key: string | null,
  request: NextRequest,
  resource: string,
  origin: string | null
): Promise<
  | {
      ok: true;
      key: string;
      validatedKey: ValidatedPixelKey;
    }
  | {
      ok: false;
      response: Response;
    }
> {
  const ip = extractClientIp(request);

  // SECURITY: Check if IP is blocked due to repeated failures
  if (isIpBlocked(ip)) {
    return {
      ok: false,
      response: pixelErrorResponse({
        code: API_ERROR_CODE.rateLimited,
        message: "Too many failed authentication attempts. Please try again later.",
        status: 429,
        origin,
        retryAfterSeconds: 1800, // 30 minutes
      }),
    };
  }

  const normalizedKey = key?.trim() ?? "";
  if (!normalizedKey) {
    void recordAuthFailure(ip, 'invalid_key', {
      origin: origin ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
      resource,
    });

    return {
      ok: false,
      response: pixelErrorResponse({
        code: API_ERROR_CODE.missingApiKey,
        message: "Missing API key",
        status: 401,
        origin,
      }),
    };
  }

  if (!isValidPixelApiKeyFormat(normalizedKey)) {
    void recordAuthFailure(ip, 'invalid_key', {
      origin: origin ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
      resource,
    });

    return {
      ok: false,
      response: pixelErrorResponse({
        code: API_ERROR_CODE.invalidKeyFormat,
        message: "Invalid API key format",
        status: 400,
        origin,
      }),
    };
  }

  const validated = await validateApiKeyWithStatus(normalizedKey, {
    ipAddress: ip,
    userAgent: request.headers.get("user-agent"),
    resource,
  });

  if (!validated.ok) {
    const failure = mapApiKeyValidationFailure(validated.reason);
    
    // Record auth failure
    const failureType =
      validated.reason === 'expired'
        ? 'key_expired'
        : 'invalid_key';
    
    void recordAuthFailure(ip, failureType, {
      apiKeyPrefix: normalizedKey.substring(0, 16),
      origin: origin ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
      resource,
    });

    return {
      ok: false,
      response: pixelErrorResponse({
        code: failure.code,
        message: failure.message,
        status: failure.status,
        origin,
      }),
    };
  }

  // Success - reset failure counter for this IP
  resetAuthFailures(ip);

  return {
    ok: true,
    key: normalizedKey,
    validatedKey: validated.key,
  };
}

export function requireDomain(
  origin: string | null,
  referer: string | null,
  allowedDomains: string[]
): { ok: true } | { ok: false; response: Response } {
  const domainResult = validateDomain(origin, referer, allowedDomains);

  if (!domainResult.valid) {
    return {
      ok: false,
      response: pixelErrorResponse({
        code: API_ERROR_CODE.domainNotAllowed,
        message: "Origin not in allowed domains",
        status: 403,
        origin: null,
        includeCors: false,
      }),
    };
  }

  return { ok: true };
}

export async function requireRateLimit(
  scope: string,
  key: string | null,
  limit: number,
  origin: string | null
): Promise<{ ok: true } | { ok: false; response: Response }> {
  if (!key) {
    // No key means no rate limiting (handled by requireApiKey)
    return { ok: true };
  }

  const result = await pixelRateLimiter.check(
    key,
    scope,
    Math.max(1, limit),
    RATE_LIMIT_WINDOW_SECONDS
  );

  if (!result.allowed) {
    const retryAfter = Math.max(
      1,
      Math.ceil((result.resetAt - Date.now()) / 1000)
    );

    const headers = buildErrorHeaders(origin);
    headers.set('X-RateLimit-Limit', String(limit));
    headers.set('X-RateLimit-Remaining', String(result.remaining));
    headers.set('X-RateLimit-Reset', String(Math.floor(result.resetAt / 1000)));
    headers.set('Retry-After', String(retryAfter));

    const body: ApiErrorResponse = {
      error: 'Rate limit exceeded',
      code: API_ERROR_CODE.rateLimited,
      status: 429,
      retryAfter,
    };

    return {
      ok: false,
      response: new Response(JSON.stringify(body), {
        status: 429,
        headers,
      }),
    };
  }

  return { ok: true };
}
