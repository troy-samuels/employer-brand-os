/**
 * @module app/api/pixel/v1/integrity/route
 * Exposes script integrity metadata for client-side Smart Pixel verification.
 */

import { NextResponse } from "next/server";
import { z } from "zod";

import {
  PIXEL_SCRIPT_ETAG,
  PIXEL_SCRIPT_SRI,
  PIXEL_SCRIPT_VERSION,
} from "@/lib/pixel/script-artifact";
import { markPixelServiceRequest } from "@/lib/pixel/health";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";

/**
 * Exposes exported value(s): runtime.
 */
export const runtime = "nodejs";

const integrityQuerySchema = z.object({}).passthrough();

interface IntegrityResponse {
  algorithm: "sha384";
  sri: string;
  etag: string;
  version: string;
}

/**
 * Returns Smart Pixel integrity metadata.
 * @returns Integrity metadata or a standardized error response.
 */
export async function GET(
  request: Request,
): Promise<NextResponse<IntegrityResponse | ApiErrorResponse>> {
  markPixelServiceRequest();

  try {
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams);
    const parsedQuery = integrityQuerySchema.safeParse(query);

    if (!parsedQuery.success) {
      return apiErrorResponse({
        error: "Invalid query parameters",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    return apiSuccessResponse<IntegrityResponse>(
      {
        algorithm: "sha384",
        sri: PIXEL_SCRIPT_SRI,
        etag: PIXEL_SCRIPT_ETAG,
        version: PIXEL_SCRIPT_VERSION,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300",
          ETag: PIXEL_SCRIPT_ETAG,
          "X-Rankwell-SRI": PIXEL_SCRIPT_SRI,
          "X-Rankwell-Script-Version": PIXEL_SCRIPT_VERSION,
        },
      },
    );
  } catch (error) {
    console.error("Pixel integrity API error:", error);
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}
