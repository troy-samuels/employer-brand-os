/**
 * @module app/api/cron/snapshots/route
 * Weekly cron job to capture snapshots for all tracked companies.
 * Runs every Monday at 9am.
 */

import { NextRequest, NextResponse } from "next/server";

import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";
import {
  getTrackedCompanies,
  captureSnapshot,
} from "@/lib/proof/snapshot";
import { generateProofReport } from "@/lib/proof/tracker";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface CronResult {
  timestamp: string;
  totalCompanies: number;
  successfulSnapshots: number;
  failedSnapshots: number;
  errors: { slug: string; error: string }[];
  milestonesDetected: number;
}

/* ------------------------------------------------------------------ */
/* Authorization                                                       */
/* ------------------------------------------------------------------ */

/**
 * Verifies the cron request is authorized.
 * Vercel Cron sends a special header we can check.
 *
 * @param request - The incoming request
 * @returns Whether the request is authorized
 */
function isAuthorizedCron(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // In production, verify the cron secret
  if (cronSecret) {
    return authHeader === `Bearer ${cronSecret}`;
  }

  // In development, allow any request
  // (or check for Vercel's internal header)
  const vercelCronHeader = request.headers.get("x-vercel-cron");
  return vercelCronHeader === "true" || process.env.NODE_ENV === "development";
}

/* ------------------------------------------------------------------ */
/* Route Handler                                                       */
/* ------------------------------------------------------------------ */

/**
 * POST /api/cron/snapshots
 * Captures weekly snapshots for all tracked companies.
 * Called by Vercel Cron every Monday at 9am.
 *
 * @param request - The incoming cron request
 * @returns Summary of snapshot creation
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<CronResult | ApiErrorResponse>> {
  try {
    // Verify authorization
    if (!isAuthorizedCron(request)) {
      return apiErrorResponse({
        error: "Unauthorized",
        code: API_ERROR_CODE.unauthorized,
        status: 401,
      });
    }

    console.log("[CRON] Starting weekly snapshot job");

    // Get all companies being tracked
    const companies = await getTrackedCompanies();
    console.log(`[CRON] Found ${companies.length} tracked companies`);

    if (companies.length === 0) {
      return apiSuccessResponse<CronResult>({
        timestamp: new Date().toISOString(),
        totalCompanies: 0,
        successfulSnapshots: 0,
        failedSnapshots: 0,
        errors: [],
        milestonesDetected: 0,
      });
    }

    // Capture snapshots for each company
    const errors: { slug: string; error: string }[] = [];
    let successfulSnapshots = 0;
    let milestonesDetected = 0;

    for (const companySlug of companies) {
      try {
        console.log(`[CRON] Capturing snapshot for: ${companySlug}`);
        
        // Capture the snapshot
        await captureSnapshot(companySlug, false);
        successfulSnapshots++;

        // Generate report to detect milestones
        const report = await generateProofReport(companySlug);
        milestonesDetected += report.milestones.length;

        console.log(
          `[CRON] ✓ ${companySlug}: snapshot created, ${report.milestones.length} milestones`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`[CRON] ✗ ${companySlug}: ${errorMessage}`);
        errors.push({ slug: companySlug, error: errorMessage });
      }
    }

    const result: CronResult = {
      timestamp: new Date().toISOString(),
      totalCompanies: companies.length,
      successfulSnapshots,
      failedSnapshots: errors.length,
      errors,
      milestonesDetected,
    };

    console.log("[CRON] Completed:", result);

    return apiSuccessResponse<CronResult>(result);
  } catch (error) {
    console.error("[CRON] Fatal error:", error);
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}

/**
 * GET /api/cron/snapshots
 * Health check for the cron endpoint.
 *
 * @returns Status message
 */
export async function GET(): Promise<NextResponse<{ status: string }>> {
  return apiSuccessResponse({
    status: "Weekly snapshot cron endpoint is active",
  });
}
