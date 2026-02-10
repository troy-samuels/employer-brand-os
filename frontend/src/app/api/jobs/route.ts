/**
 * @module app/api/jobs/route
 * Exposes authenticated dashboard job data for the current user session.
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
import { SAMPLE_JOBS } from "@/lib/utils/constants";

interface JobsResponse {
  jobs: typeof SAMPLE_JOBS;
}

const jobsQuerySchema = z.object({}).passthrough();

/**
 * Returns sample jobs for the authenticated dashboard user.
 * @param request - The incoming API request.
 * @returns A typed jobs payload or a standardized error response.
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<JobsResponse | ApiErrorResponse>> {
  try {
    const query = Object.fromEntries(request.nextUrl.searchParams);
    const parsedQuery = jobsQuerySchema.safeParse(query);

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

    return apiSuccessResponse<JobsResponse>({ jobs: SAMPLE_JOBS });
  } catch (error) {
    console.error("Jobs API error:", error);
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}
