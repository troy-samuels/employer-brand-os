/**
 * @module app/api/proof/report/route
 * API endpoint to retrieve a proof report for a company.
 * Shows all score changes and milestones over time.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";
import { generateProofReport, type ProofReport } from "@/lib/proof/tracker";

/* ------------------------------------------------------------------ */
/* Request Schema                                                      */
/* ------------------------------------------------------------------ */

const reportQuerySchema = z.object({
  company: z.string().min(1),
});

/* ------------------------------------------------------------------ */
/* Caching                                                             */
/* ------------------------------------------------------------------ */

const CACHE_DURATION_SECONDS = 60 * 60; // 1 hour

/**
 * Generates cache headers for the response.
 *
 * @returns Cache-Control header value
 */
function getCacheHeaders(): HeadersInit {
  return {
    "Cache-Control": `public, s-maxage=${CACHE_DURATION_SECONDS}, stale-while-revalidate=${CACHE_DURATION_SECONDS * 2}`,
  };
}

/* ------------------------------------------------------------------ */
/* Route Handler                                                       */
/* ------------------------------------------------------------------ */

/**
 * GET /api/proof/report?company=slug
 * Retrieves a proof report showing AI visibility changes over time.
 *
 * @param request - The incoming request
 * @returns The proof report or error
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ProofReport | ApiErrorResponse>> {
  try {
    // Parse query parameters
    const query = Object.fromEntries(request.nextUrl.searchParams);
    const parseResult = reportQuerySchema.safeParse(query);

    if (!parseResult.success) {
      return apiErrorResponse({
        error: "Missing or invalid 'company' query parameter",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
        details: parseResult.error.flatten(),
      });
    }

    const { company } = parseResult.data;

    // Generate the report
    const report = await generateProofReport(company);

    return apiSuccessResponse<ProofReport>(report, {
      headers: getCacheHeaders(),
    });
  } catch (error) {
    console.error("Report API error:", error);

    if (error instanceof Error) {
      if (error.message.includes("No snapshots found")) {
        return apiErrorResponse({
          error: "No snapshots found for this company. Create a snapshot first.",
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
