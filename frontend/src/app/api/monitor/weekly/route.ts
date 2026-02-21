/**
 * @module app/api/monitor/weekly/route
 * POST endpoint that triggers a weekly AI reputation check for a company.
 * Designed to be invoked by a cron job (e.g. Vercel Cron, external scheduler).
 * Stores the result in the `monitor_checks` Supabase table.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  collectDataPoints,
  runMonitorCheck,
  type MonitorCheckResult,
} from "@/lib/monitor/reputation-monitor";
import { generateMonitorEmail } from "@/lib/monitor/monitor-email";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";

/**
 * Edge / Node runtime selector — keep Node for Supabase client compatibility.
 */
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const weeklyRequestSchema = z.object({
  companySlug: z
    .string()
    .trim()
    .min(1, "companySlug is required")
    .max(256, "companySlug is too long"),
  companyName: z
    .string()
    .trim()
    .min(1, "companyName is required")
    .max(512, "companyName is too long")
    .optional(),
  cronSecret: z.string().trim().optional(),
});

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

/** Shape of the successful response payload. */
interface WeeklyMonitorResponse {
  /** The computed check result. */
  check: MonitorCheckResult;
  /** Whether the result was persisted to the database. */
  stored: boolean;
  /** Whether an email was generated (not necessarily sent). */
  emailGenerated: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Validates the cron secret when configured. Returns `true` when the request
 * is authorised, `false` otherwise.
 * @param provided - The secret sent by the caller (may be undefined).
 * @returns Whether access is granted.
 */
function validateCronSecret(provided: string | undefined): boolean {
  const expected = process.env.CRON_SECRET;
  // Allow open access only in non-production environments.
  if (!expected) return process.env.NODE_ENV !== "production";
  return provided === expected;
}

/**
 * Attempts to load the previous check for a company from Supabase.
 * Gracefully returns `null` when the table doesn't exist yet or the query
 * fails (first-run tolerance).
 * @param companySlug - Company identifier.
 * @returns The previous {@link MonitorCheckResult} or `null`.
 */
async function loadPreviousCheck(
  companySlug: string,
): Promise<MonitorCheckResult | null> {
  try {
    // Dynamic import to avoid hard crash when env vars are missing during build
    const { untypedTable } = await import("@/lib/supabase/untyped-table");

    const { data, error } = await untypedTable("monitor_checks")
      .select("check_data, score, previous_score, changes, created_at")
      .eq("company_slug", companySlug)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      companySlug,
      checkedAt: data.created_at,
      score: data.score,
      previousScore: data.previous_score ?? null,
      trend: "stable",
      checkData: (data.check_data as MonitorCheckResult["checkData"]) ?? [],
      changes: (data.changes as MonitorCheckResult["changes"]) ?? [],
      recommendations: [],
    };
  } catch {
    // Table may not exist yet — that's fine for first run
    return null;
  }
}

/**
 * Persists a check result to Supabase. Returns `true` on success.
 * @param result - The check result to store.
 * @returns Whether the insert succeeded.
 */
async function storeCheck(result: MonitorCheckResult): Promise<boolean> {
  try {
    const { untypedTable } = await import("@/lib/supabase/untyped-table");

    const { error } = await untypedTable("monitor_checks")
      .insert({
        company_slug: result.companySlug,
        check_data: result.checkData,
        score: result.score,
        previous_score: result.previousScore,
        changes: result.changes,
        created_at: result.checkedAt,
      });

    return !error;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

/**
 * Handles a POST request to run the weekly AI reputation monitor for one
 * company. Collects data points, runs the comparison, stores the result,
 * and generates the email HTML.
 *
 * @param request - Incoming HTTP request with JSON body.
 * @returns The check result or a standardised error.
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<WeeklyMonitorResponse | ApiErrorResponse>> {
  try {
    // ── Parse body ────────────────────────────────────────────────────
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

    const parsed = weeklyRequestSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return apiErrorResponse({
        error: firstIssue?.message ?? "Invalid request payload.",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    const { companySlug, companyName, cronSecret } = parsed.data;

    // ── Auth ──────────────────────────────────────────────────────────
    const headerSecret =
      request.headers.get("x-openrole-cron-secret")
      ?? request.headers.get("x-cron-secret")
      ?? undefined;
    const providedSecret = headerSecret ?? cronSecret;

    if (!validateCronSecret(providedSecret)) {
      return apiErrorResponse({
        error: "Invalid cron secret.",
        code: API_ERROR_CODE.unauthorized,
        status: 401,
      });
    }

    // ── Run check ─────────────────────────────────────────────────────
    const previousCheck = await loadPreviousCheck(companySlug);
    const dataPoints = collectDataPoints(companySlug);
    const result = runMonitorCheck(companySlug, dataPoints, previousCheck);

    // ── Store ─────────────────────────────────────────────────────────
    const stored = await storeCheck(result);

    // ── Generate email (for future sending) ───────────────────────────
    const displayName = companyName ?? companySlug;
    // Generate the email to validate the template; actual sending is
    // handled by a separate email service when RESEND_API_KEY is configured.
    generateMonitorEmail(result, displayName);

    return apiSuccessResponse<WeeklyMonitorResponse>({
      check: result,
      stored,
      emailGenerated: true,
    });
  } catch (error) {
    console.error("Monitor weekly API error:", error);
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}
