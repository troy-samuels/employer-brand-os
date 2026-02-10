/**
 * @module app/api/health/route
 * Returns health and liveness metadata for service monitoring.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";

const healthQuerySchema = z.object({}).passthrough();

interface HealthResponse {
  status: "OK";
  message: string;
  timestamp: string;
}

/**
 * Returns API health metadata.
 * @param request - The incoming health request.
 * @returns A health payload or a standardized error response.
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<HealthResponse | ApiErrorResponse>> {
  try {
    const query = Object.fromEntries(request.nextUrl.searchParams);
    const parsedQuery = healthQuerySchema.safeParse(query);

    if (!parsedQuery.success) {
      return apiErrorResponse({
        error: "Invalid query parameters",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    return apiSuccessResponse<HealthResponse>({
      status: "OK",
      message: "Rankwell API server is running",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health API error:", error);
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}
