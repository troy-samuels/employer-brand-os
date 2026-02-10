/**
 * @module app/api/analytics/route
 * Handles authenticated analytics read/write requests for the dashboard.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";
import { validateCsrf } from "@/lib/utils/csrf";
import { SAMPLE_ANALYTICS } from "@/lib/utils/constants";

const analyticsPayloadSchema = z
  .object({
    event: z.string().min(1).max(100).optional(),
    page: z.string().min(1).max(2048).optional(),
    timestamp: z.union([z.string(), z.number()]).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

const analyticsQuerySchema = z.object({}).passthrough();

interface AnalyticsResponse {
  analytics: typeof SAMPLE_ANALYTICS;
}

interface AnalyticsEventResponse {
  success: true;
  event: z.infer<typeof analyticsPayloadSchema>;
}

/**
 * Returns analytics overview payload for authenticated dashboard users.
 * @param request - The incoming analytics GET request.
 * @returns A typed analytics payload or a standardized error response.
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<AnalyticsResponse | ApiErrorResponse>> {
  try {
    const query = Object.fromEntries(request.nextUrl.searchParams);
    const parsedQuery = analyticsQuerySchema.safeParse(query);

    if (!parsedQuery.success) {
      return apiErrorResponse({
        error: "Invalid query parameters",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiErrorResponse({
        error: API_ERROR_MESSAGE.unauthorized,
        code: API_ERROR_CODE.unauthorized,
        status: 401,
      });
    }

    return apiSuccessResponse<AnalyticsResponse>({ analytics: SAMPLE_ANALYTICS });
  } catch (error) {
    console.error("Analytics GET API error:", error);
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}

/**
 * Accepts analytics events from authenticated dashboard sessions.
 * @param request - The incoming analytics POST request.
 * @returns A typed success payload or a standardized error response.
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<AnalyticsEventResponse | ApiErrorResponse>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiErrorResponse({
        error: API_ERROR_MESSAGE.unauthorized,
        code: API_ERROR_CODE.unauthorized,
        status: 401,
      });
    }

    if (!validateCsrf(request)) {
      return apiErrorResponse({
        error: API_ERROR_MESSAGE.invalidOrigin,
        code: API_ERROR_CODE.invalidOrigin,
        status: 403,
      });
    }

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

    const parsedPayload = analyticsPayloadSchema.safeParse(body);
    if (!parsedPayload.success) {
      return apiErrorResponse({
        error: "Invalid analytics payload",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    return apiSuccessResponse<AnalyticsEventResponse>({
      success: true,
      event: parsedPayload.data,
    });
  } catch (error) {
    console.error("Analytics POST API error:", error);
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}
