/**
 * @module app/api/audit/client-crawl/route
 * Accepts HTML submitted from the user's browser for pages behind bot protection.
 * Runs careers-page analysis on the submitted content and returns updated check results.
 */

import { NextRequest } from "next/server";
import { z } from "zod";

import { validateCsrf } from "@/lib/utils/csrf";
import {
  apiErrorResponse,
  apiSuccessResponse,
} from "@/lib/utils/api-response";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import { analyzeClientSubmittedHtml } from "@/lib/audit/client-crawl";
import { normalizeDomain } from "@/lib/utils/validation";

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
    .trim()
    .min(1, "Domain is required.")
    .max(255)
    .transform((value) => normalizeDomain(value))
    .refine((value) => value.length > 0, "A valid domain is required."),
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
    const parsed = clientCrawlSchema.safeParse(body);

    if (!parsed.success) {
      return apiErrorResponse({
        error: parsed.error.issues[0]?.message ?? "Invalid request.",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    const { html, url, domain } = parsed.data;
    if (Buffer.byteLength(html, "utf8") > MAX_HTML_BYTES) {
      return apiErrorResponse({
        error: "HTML content is too large.",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    const result = analyzeClientSubmittedHtml(html, url, domain);

    return apiSuccessResponse(result);
  } catch {
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}
