/**
 * @module app/api/audit/route
 * Runs the public website audit workflow and returns the computed audit result.
 */

import { isIP } from "node:net";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logAuditRequest } from "@/lib/audit/audit-logger";
import { resolveCompanyUrl } from "@/lib/audit/company-resolver";
import { isLikelyDomainOrUrl, validateUrl } from "@/lib/audit/url-validator";
import { runWebsiteChecks, type WebsiteCheckResult } from "@/lib/audit/website-checks";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";
import { validateCsrf } from "@/lib/utils/csrf";
import { RateLimiter } from "@/lib/utils/rate-limiter";

/**
 * Exposes exported value(s): runtime.
 */
export const runtime = "nodejs";

const AUDIT_RESOURCE = "api.audit";
const AUDIT_RATE_LIMIT_SCOPE = "audit-phase1";
const AUDIT_RATE_LIMIT_LIMIT = 50;
const AUDIT_RATE_LIMIT_WINDOW_SECONDS = 3600;

const rateLimiter = new RateLimiter();

const auditRequestSchema = z.object({
  url: z
    .string({ error: "Missing or invalid 'url' field." })
    .trim()
    .min(1, "Missing or invalid 'url' field.")
    .max(2048, "'url' is too long.")
    .refine(isLikelyDomainOrUrl, {
      message: "'url' must be a valid domain or HTTP(S) URL.",
    }),
});

function getClientIpAddress(request: NextRequest): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && isIP(realIp)) {
    return realIp;
  }

  // NOTE: Use `request.ip` from trusted infrastructure for production-grade limits.
  return "anonymous";
}

/**
 * Executes an audit request for a provided domain or URL.
 * @param request - The incoming audit request.
 * @returns A website audit result or a standardized error response.
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<WebsiteCheckResult | ApiErrorResponse>> {
  const clientIp = getClientIpAddress(request);

  try {
    if (!validateCsrf(request)) {
      void logAuditRequest({
        actor: clientIp,
        result: "denied",
        resource: AUDIT_RESOURCE,
        metadata: { reason: "csrf_failed" },
      });
      return apiErrorResponse({
        error: API_ERROR_MESSAGE.invalidOrigin,
        code: API_ERROR_CODE.invalidOrigin,
        status: 403,
      });
    }

    const allowed = await rateLimiter.check(
      clientIp,
      AUDIT_RATE_LIMIT_SCOPE,
      AUDIT_RATE_LIMIT_LIMIT,
      AUDIT_RATE_LIMIT_WINDOW_SECONDS,
    );

    if (!allowed) {
      void logAuditRequest({
        actor: clientIp,
        result: "denied",
        resource: AUDIT_RESOURCE,
        metadata: { reason: "rate_limited" },
      });
      return apiErrorResponse({
        error: "Rate limit exceeded. Please try again later.",
        code: API_ERROR_CODE.rateLimited,
        status: 429,
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      void logAuditRequest({
        actor: clientIp,
        result: "failure",
        resource: AUDIT_RESOURCE,
        metadata: { reason: "malformed_json" },
      });
      return apiErrorResponse({
        error: API_ERROR_MESSAGE.invalidJson,
        code: API_ERROR_CODE.invalidJson,
        status: 400,
      });
    }

    if (typeof body !== "object" || body === null || !("url" in body)) {
      void logAuditRequest({
        actor: clientIp,
        result: "failure",
        resource: AUDIT_RESOURCE,
        metadata: { reason: "missing_url_field" },
      });
      return apiErrorResponse({
        error: "Missing or invalid 'url' field.",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    const parsedBody = auditRequestSchema.safeParse(body);
    if (!parsedBody.success) {
      const firstIssue = parsedBody.error.issues[0];
      void logAuditRequest({
        actor: clientIp,
        result: "failure",
        resource: AUDIT_RESOURCE,
        metadata: {
          reason: "schema_validation_failed",
          issue: firstIssue?.message ?? "unknown",
        },
      });
      return apiErrorResponse({
        error: firstIssue?.message ?? "Missing or invalid 'url' field.",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    const input = parsedBody.data.url;
    const preflightValidation = await validateUrl(input);
    if (!preflightValidation.ok) {
      void logAuditRequest({
        actor: clientIp,
        result: "failure",
        resource: AUDIT_RESOURCE,
        metadata: {
          reason: "blocked_or_private_url",
          input,
        },
      });
      return apiErrorResponse({
        error: "URL points to a blocked or private network.",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    const resolved = await resolveCompanyUrl(input);
    const domain = resolved.url ?? preflightValidation.normalizedUrl.hostname;
    const companyName = resolved.name || preflightValidation.normalizedUrl.hostname;

    const result = await runWebsiteChecks(domain, companyName);
    void logAuditRequest({
      actor: clientIp,
      result: "success",
      resource: AUDIT_RESOURCE,
      metadata: {
        input,
        resolved_domain: domain,
        company_name: companyName,
        score: result.score,
      },
    });

    return apiSuccessResponse<WebsiteCheckResult>(result);
  } catch (error) {
    console.error("Audit API error:", error);
    void logAuditRequest({
      actor: clientIp,
      result: "failure",
      resource: AUDIT_RESOURCE,
      metadata: { reason: "internal_error" },
    });
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}
