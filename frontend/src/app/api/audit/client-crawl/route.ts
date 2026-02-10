/**
 * @module app/api/audit/client-crawl/route
 * Accepts HTML submitted from the user's browser for pages behind bot protection.
 * Runs careers-page analysis on the submitted content and returns updated check results.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { validateCsrf } from "@/lib/utils/csrf";
import {
  apiErrorResponse,
  apiSuccessResponse,
} from "@/lib/utils/api-response";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import { analyzeClientSubmittedHtml } from "@/lib/audit/client-crawl";

export const runtime = "nodejs";

const MAX_HTML_BYTES = 5 * 1024 * 1024; // 5 MB

const clientCrawlSchema = z.object({
  html: z
    .string()
    .min(1, "HTML content is required.")
    .max(MAX_HTML_BYTES, "HTML content is too large."),
  url: z
    .string()
    .url("A valid page URL is required.")
    .max(2048),
  domain: z
    .string()
    .min(1, "Domain is required.")
    .max(255),
});

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrf(request)) {
      return apiErrorResponse({
        error: API_ERROR_MESSAGE.invalidOrigin,
        code: API_ERROR_CODE.invalidOrigin,
        status: 403,
      });
    }

    const body: unknown = await request.json();
    const parsed = clientCrawlSchema.safeParse(body);

    if (!parsed.success) {
      return apiErrorResponse({
        error: parsed.error.issues[0]?.message ?? "Invalid request.",
        code: "invalid_payload",
        status: 400,
      });
    }

    const { html, url, domain } = parsed.data;
    const result = analyzeClientSubmittedHtml(html, url, domain);

    return apiSuccessResponse(result);
  } catch {
    return apiErrorResponse({
      error: "Failed to process submitted HTML.",
      code: "internal_error",
      status: 500,
    });
  }
}
