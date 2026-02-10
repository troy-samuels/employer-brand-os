/**
 * @module app/api/pixel/route
 * Provides dashboard pixel status metadata.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";

const pixelStatusQuerySchema = z.object({}).passthrough();

interface PixelStatusResponse {
  pixel: {
    status: "active";
    last_seen_at: string;
    schema_version: string;
    jobs_injected: number;
  };
}

/**
 * Returns current smart pixel status summary.
 * @param request - The incoming API request.
 * @returns A typed pixel status payload or a standardized error response.
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<PixelStatusResponse | ApiErrorResponse>> {
  try {
    const query = Object.fromEntries(request.nextUrl.searchParams);
    const parsedQuery = pixelStatusQuerySchema.safeParse(query);

    if (!parsedQuery.success) {
      return apiErrorResponse({
        error: "Invalid query parameters",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    return apiSuccessResponse<PixelStatusResponse>({
      pixel: {
        status: "active",
        last_seen_at: "2 minutes ago",
        schema_version: "v1.0",
        jobs_injected: 48,
      },
    });
  } catch (error) {
    console.error("Pixel status API error:", error);
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}
