/**
 * @module app/api/pixel/companies/[id]/employment-data/route
 * Returns signed employment data payloads for the Smart Pixel endpoint.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { buildCorsHeaders } from "@/features/pixel/lib/cors";
import {
  getCorsOrigin,
  pixelErrorResponse,
  requireApiKey,
  requireDomain,
  requireRateLimit,
} from "@/features/pixel/lib/pixel-api";
import { markPixelServiceRequest } from "@/lib/pixel/health";
import { getEmploymentData } from "@/lib/pixel/pixel-manager";
import { verifyPixelRequestSignature } from "@/lib/pixel/request-signing";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";

const companyParamsSchema = z.object({
  id: z.string().min(1),
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
): Promise<Response> {
  markPixelServiceRequest();
  const origin = getCorsOrigin(request.headers.get("origin"));
  const referer = request.headers.get("referer");

  try {
    const parsedParams = companyParamsSchema.safeParse(await params);
    if (!parsedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid company id",
          code: API_ERROR_CODE.invalidPayload,
          status: 400,
        } satisfies ApiErrorResponse,
        { status: 400 }
      );
    }

    const keyResult = await requireApiKey(
      request.headers.get("X-Rankwell-Key") ??
        request.headers.get("X-Rankwell-Pixel-ID") ??
        request.headers.get("X-BrandOS-Pixel-ID") ??
        new URL(request.url).searchParams.get("key"),
      request,
      "pixel.companies.employment-data",
      origin
    );
    if (!keyResult.ok) {
      return keyResult.response;
    }

    const { id: companyId } = parsedParams.data;
    const domainResult = requireDomain(
      origin,
      referer,
      keyResult.validatedKey.allowedDomains
    );
    if (!domainResult.ok) {
      return domainResult.response;
    }

    const rateLimitResult = await requireRateLimit(
      "pixel.companies.employment-data",
      keyResult.validatedKey.id,
      keyResult.validatedKey.rateLimitPerMinute,
      origin
    );
    if (!rateLimitResult.ok) {
      return rateLimitResult.response;
    }

    const signatureResult = verifyPixelRequestSignature(request, keyResult.key);
    if (!signatureResult.ok) {
      return pixelErrorResponse({
        code:
          signatureResult.error === "replay_detected"
            ? API_ERROR_CODE.replayDetected
            : API_ERROR_CODE.invalidSignature,
        message: signatureResult.message,
        status: signatureResult.status,
        origin,
      });
    }

    const data = await getEmploymentData(companyId);
    const headers = new Headers({
      "Cache-Control": "no-store",
    });
    if (origin) {
      const corsHeaders = buildCorsHeaders(origin);
      corsHeaders.forEach((value, key) => {
        headers.set(key, value);
      });
    }

    return apiSuccessResponse<EmploymentDataResponse>(data, { headers });
  } catch (error) {
    console.error("Pixel data error:", error);
    return pixelErrorResponse({
      message: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
      origin,
    });
  }
}
