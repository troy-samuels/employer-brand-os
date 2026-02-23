/**
 * @module app/api/proof/case-study/route
 * API endpoint to generate a case study from a proof report.
 * Available for Growth+ plan customers.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";
import { generateProofReport } from "@/lib/proof/tracker";
import {
  generateCaseStudy,
  caseStudyToText,
  caseStudyToHTML,
  type CaseStudy,
} from "@/lib/proof/case-study";

/* ------------------------------------------------------------------ */
/* Request Schema                                                      */
/* ------------------------------------------------------------------ */

const caseStudyQuerySchema = z.object({
  company: z.string().min(1),
  format: z.enum(["json", "text", "html"]).optional().default("json"),
});

/* ------------------------------------------------------------------ */
/* Response Types                                                      */
/* ------------------------------------------------------------------ */

type CaseStudyResponse = CaseStudy | { text: string } | { html: string };

/* ------------------------------------------------------------------ */
/* Route Handler                                                       */
/* ------------------------------------------------------------------ */

/**
 * GET /api/proof/case-study?company=slug&format=json|text|html
 * Generates a case study from the company's proof report.
 *
 * @param request - The incoming request
 * @returns The case study in the requested format
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<CaseStudyResponse | ApiErrorResponse>> {
  try {
    // Parse query parameters
    const query = Object.fromEntries(request.nextUrl.searchParams);
    const parseResult = caseStudyQuerySchema.safeParse(query);

    if (!parseResult.success) {
      return apiErrorResponse({
        error: "Missing or invalid query parameters",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
        details: parseResult.error.flatten(),
      });
    }

    const { company, format } = parseResult.data;

    // Generate the proof report first
    const report = await generateProofReport(company);

    // Generate the case study
    const caseStudy = generateCaseStudy(report);

    // Return in requested format
    switch (format) {
      case "text":
        return NextResponse.json(
          { text: caseStudyToText(caseStudy) },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

      case "html":
        return NextResponse.json(
          { html: caseStudyToHTML(caseStudy) },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

      case "json":
      default:
        return apiSuccessResponse<CaseStudy>(caseStudy);
    }
  } catch (error) {
    console.error("Case study API error:", error);

    if (error instanceof Error) {
      if (error.message.includes("No snapshots found")) {
        return apiErrorResponse({
          error: "No snapshots found for this company. Create snapshots first.",
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
