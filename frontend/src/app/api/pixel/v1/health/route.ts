/**
 * @module app/api/pixel/v1/health/route
 * Returns runtime health for the pixel service.
 */

import { NextResponse } from "next/server";
import { z } from "zod";

import { getPixelServiceHealth, markPixelServiceRequest } from "@/lib/pixel/health";
import {
  PIXEL_SCRIPT_SRI,
  PIXEL_SCRIPT_VERSION,
} from "@/lib/pixel/script-artifact";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";

const healthQuerySchema = z.object({}).passthrough();

interface PixelHealthResponse {
  status: "ok";
  script_version: string;
  sri_hash: string;
  uptime_seconds: number;
  started_at: string;
  last_request_timestamp: string | null;
}

export async function GET(
  request: Request,
): Promise<NextResponse<PixelHealthResponse | ApiErrorResponse>> {
  try {
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams);
    const parsedQuery = healthQuerySchema.safeParse(query);

    if (!parsedQuery.success) {
      return apiErrorResponse({
        error: "Invalid query parameters",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    markPixelServiceRequest();
    const health = getPixelServiceHealth();

    return apiSuccessResponse<PixelHealthResponse>({
      status: "ok",
      script_version: PIXEL_SCRIPT_VERSION,
      sri_hash: PIXEL_SCRIPT_SRI,
      uptime_seconds: health.uptimeSeconds,
      started_at: health.startedAt,
      last_request_timestamp: health.lastRequestAt,
    });
  } catch (error) {
    console.error("Pixel health API error:", error);
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}
