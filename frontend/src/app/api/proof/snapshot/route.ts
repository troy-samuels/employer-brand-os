/**
 * @module app/api/proof/snapshot/route
 * API endpoint to capture a new AI snapshot for a company.
 * Rate limited to 5 per hour per company.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";
import { captureSnapshot, type AISnapshot } from "@/lib/proof/snapshot";
import { untypedTable } from "@/lib/supabase/untyped-table";

/* ------------------------------------------------------------------ */
/* Rate Limiting                                                       */
/* ------------------------------------------------------------------ */

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5;

interface RateLimitCheck {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Checks if a snapshot creation is allowed based on rate limits.
 *
 * @param companySlug - The company slug to check
 * @returns Rate limit status
 */
async function checkRateLimit(companySlug: string): Promise<RateLimitCheck> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

  const { data, error } = await untypedTable("ai_snapshots")
    .select("id", { count: "exact" })
    .eq("company_slug", companySlug)
    .gte("created_at", windowStart.toISOString());

  if (error) {
    // If we can't check the rate limit, allow it (fail open)
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX,
      resetAt: new Date(Date.now() + RATE_LIMIT_WINDOW_MS),
    };
  }

  const count = data?.length ?? 0;
  const remaining = Math.max(0, RATE_LIMIT_MAX - count);
  const allowed = count < RATE_LIMIT_MAX;

  return {
    allowed,
    remaining,
    resetAt: new Date(Date.now() + RATE_LIMIT_WINDOW_MS),
  };
}

/* ------------------------------------------------------------------ */
/* Request Schema                                                      */
/* ------------------------------------------------------------------ */

const snapshotRequestSchema = z.object({
  companySlug: z.string().min(1),
  isBaseline: z.boolean().optional().default(false),
});

/* ------------------------------------------------------------------ */
/* Route Handler                                                       */
/* ------------------------------------------------------------------ */

/**
 * POST /api/proof/snapshot
 * Captures a new AI snapshot for a company.
 *
 * @param request - The incoming request
 * @returns The created snapshot or error
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<AISnapshot | ApiErrorResponse>> {
  try {
    // Parse request body
    const body = await request.json();
    const parseResult = snapshotRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return apiErrorResponse({
        error: "Invalid request body",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
        details: parseResult.error.flatten(),
      });
    }

    const { companySlug, isBaseline } = parseResult.data;

    // Check rate limit
    const rateLimit = await checkRateLimit(companySlug);
    if (!rateLimit.allowed) {
      return apiErrorResponse({
        error: "Rate limit exceeded. Maximum 5 snapshots per hour per company.",
        code: API_ERROR_CODE.rateLimited,
        status: 429,
        retryAfter: Math.ceil(
          (rateLimit.resetAt.getTime() - Date.now()) / 1000
        ),
      });
    }

    // Capture the snapshot
    const snapshot = await captureSnapshot(companySlug, isBaseline);

    return apiSuccessResponse<AISnapshot>(snapshot, {
      status: 201,
      headers: {
        "X-RateLimit-Limit": RATE_LIMIT_MAX.toString(),
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        "X-RateLimit-Reset": rateLimit.resetAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Snapshot API error:", error);

    if (error instanceof Error) {
      if (error.message.includes("No audit found")) {
        return apiErrorResponse({
          error: "Company audit not found. Run an audit first.",
          code: API_ERROR_CODE.notFound,
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
