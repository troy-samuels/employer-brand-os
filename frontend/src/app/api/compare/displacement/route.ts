/**
 * @module app/api/compare/displacement/route
 * API endpoint for generating competitor displacement reports.
 *
 * POST /api/compare/displacement
 * Body: { companySlug: string, competitorSlug: string }
 * Returns: DisplacementReport
 *
 * Rate limit: 20 requests/hour per IP
 * Cache: 24 hours in Supabase
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  generateDisplacementReport,
  type DisplacementReport,
} from "@/lib/compare/displacement";
import { resolveRequestActor } from "@/lib/security/request-metadata";
import { untypedTable } from "@/lib/supabase/untyped-table";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";
import { validateCsrf } from "@/lib/utils/csrf";
import { RateLimiter } from "@/lib/utils/rate-limiter";

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

export const runtime = "nodejs";

const DISPLACEMENT_RESOURCE = "api.compare.displacement";
const RATE_LIMIT_SCOPE = "displacement-report";
const RATE_LIMIT_LIMIT = 20;
const RATE_LIMIT_WINDOW_SECONDS = 3600; // 1 hour
const CACHE_DURATION_HOURS = 24;

const rateLimiter = new RateLimiter();

/* ------------------------------------------------------------------ */
/* Request validation                                                  */
/* ------------------------------------------------------------------ */

const displacementRequestSchema = z.object({
  companySlug: z
    .string()
    .trim()
    .min(1, "Missing companySlug")
    .max(100, "companySlug too long"),
  competitorSlug: z
    .string()
    .trim()
    .min(1, "Missing competitorSlug")
    .max(100, "competitorSlug too long"),
});

/* ------------------------------------------------------------------ */
/* Cache helpers                                                       */
/* ------------------------------------------------------------------ */

/**
 * Check if a cached report exists and is still valid.
 */
async function getCachedReport(
  companySlug: string,
  competitorSlug: string,
): Promise<DisplacementReport | null> {
  const { data, error } = await untypedTable("displacement_reports")
    .select("report, expires_at")
    .eq("company_slug", companySlug)
    .eq("competitor_slug", competitorSlug)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !data) return null;

  return data.report as DisplacementReport;
}

/**
 * Cache a displacement report in Supabase.
 */
async function cacheReport(
  companySlug: string,
  competitorSlug: string,
  report: DisplacementReport,
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + CACHE_DURATION_HOURS);

  await untypedTable("displacement_reports").upsert(
    {
      company_slug: companySlug,
      competitor_slug: competitorSlug,
      report,
      expires_at: expiresAt.toISOString(),
    },
    {
      onConflict: "company_slug,competitor_slug",
    },
  );
}

/* ------------------------------------------------------------------ */
/* Route handler                                                       */
/* ------------------------------------------------------------------ */

/**
 * POST /api/compare/displacement
 *
 * Generate a displacement report comparing two companies and showing
 * actionable opportunities to beat the competitor in AI visibility.
 *
 * @param request - The incoming request
 * @returns Displacement report or error response
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<DisplacementReport | ApiErrorResponse>> {
  const clientIp = resolveRequestActor(request);

  try {
    // CSRF validation
    if (!validateCsrf(request)) {
      return apiErrorResponse({
        error: API_ERROR_MESSAGE.invalidOrigin,
        code: API_ERROR_CODE.invalidOrigin,
        status: 403,
      });
    }

    // Rate limiting
    const allowed = await rateLimiter.check(
      clientIp,
      RATE_LIMIT_SCOPE,
      RATE_LIMIT_LIMIT,
      RATE_LIMIT_WINDOW_SECONDS,
    );

    if (!allowed) {
      return apiErrorResponse({
        error: "Rate limit exceeded. Please try again later.",
        code: API_ERROR_CODE.rateLimited,
        status: 429,
      });
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiErrorResponse({
        error: API_ERROR_MESSAGE.invalidJson,
        code: API_ERROR_CODE.invalidJson,
        status: 400,
      });
    }

    // Validate schema
    const parsedBody = displacementRequestSchema.safeParse(body);
    if (!parsedBody.success) {
      const firstIssue = parsedBody.error.issues[0];
      return apiErrorResponse({
        error: firstIssue?.message ?? "Invalid request payload",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    const { companySlug, competitorSlug } = parsedBody.data;

    // Prevent comparing company to itself
    if (companySlug === competitorSlug) {
      return apiErrorResponse({
        error: "Cannot compare a company to itself",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    // Check cache first
    const cachedReport = await getCachedReport(companySlug, competitorSlug);
    if (cachedReport) {
      return apiSuccessResponse<DisplacementReport>(cachedReport);
    }

    // Generate fresh report
    const report = await generateDisplacementReport(companySlug, competitorSlug);

    // Cache for future requests
    void cacheReport(companySlug, competitorSlug, report);

    return apiSuccessResponse<DisplacementReport>(report);
  } catch (error) {
    console.error("Displacement report error:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("not found in audit database")) {
        return apiErrorResponse({
          error: "One or both companies not found. Run audits first.",
          code: API_ERROR_CODE.invalidPayload,
          status: 404,
        });
      }
    }

    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}
