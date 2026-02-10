/**
 * @module app/api/pixel/companies/[id]/employment-data/route
 * Returns signed employment data payloads for the Smart Pixel endpoint.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getEmploymentData } from "@/lib/pixel/pixel-manager";
import { verifyPixelRequestSignature } from "@/lib/pixel/request-signing";
import { API_ERROR_CODE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";

const companyParamsSchema = z.object({
  id: z.string().min(1),
});

const pixelHeadersSchema = z.object({
  pixelId: z.string().min(1),
});

type EmploymentDataResponse = Awaited<ReturnType<typeof getEmploymentData>>;

/**
 * Returns signed employment data for a specific company ID.
 * @param request - The incoming request.
 * @param context - Route params context.
 * @returns Employment data payload or a standardized error response.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<EmploymentDataResponse | ApiErrorResponse>> {
  try {
    const parsedParams = companyParamsSchema.safeParse(await params);
    if (!parsedParams.success) {
      return apiErrorResponse({
        error: "Invalid company id",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    const headersInput = {
      pixelId: request.headers.get("X-Rankwell-Pixel-ID") ?? "",
    };
    const parsedHeaders = pixelHeadersSchema.safeParse(headersInput);
    if (!parsedHeaders.success) {
      return apiErrorResponse({
        error: "Missing pixel ID",
        code: API_ERROR_CODE.missingHeader,
        status: 400,
      });
    }

    const { id: companyId } = parsedParams.data;
    const { pixelId } = parsedHeaders.data;

    const signatureResult = verifyPixelRequestSignature(request, pixelId);
    if (!signatureResult.ok) {
      return apiErrorResponse({
        error: signatureResult.message,
        code:
          signatureResult.error === "replay_detected"
            ? API_ERROR_CODE.replayDetected
            : API_ERROR_CODE.invalidSignature,
        status: signatureResult.status,
      });
    }

    const data = await getEmploymentData(companyId);
    return apiSuccessResponse<EmploymentDataResponse>(data);
  } catch (error) {
    console.error("Pixel data error:", error);
    return apiErrorResponse({
      error: "Unable to load employment data",
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}
