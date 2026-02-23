/**
 * @module app/api/companies/search/route
 * Returns debounced company autocomplete matches from Supabase.
 *
 * SECURITY: Uses anon key (respects RLS) — never service-role for public endpoints.
 * Rate-limited to 30 requests per 60s per IP. CSRF-validated.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { resolveRequestActor } from "@/lib/security/request-metadata";
import { supabaseAnon } from "@/lib/supabase/anon";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";
import { validateCsrf } from "@/lib/utils/csrf";
import { RateLimiter } from "@/lib/utils/rate-limiter";
import type { Database } from "@/types/database.types";

/**
 * Exposes exported value(s): runtime.
 */
export const runtime = "nodejs";

const MAX_RESULTS = 8;
const SEARCH_RATE_LIMIT_SCOPE = "company-search";
const SEARCH_RATE_LIMIT_LIMIT = 30;
const SEARCH_RATE_LIMIT_WINDOW_SECONDS = 60;
const CONTROL_CHARACTER_REGEX = /[\u0000-\u001F\u007F]/g;
const ANGLE_BRACKET_REGEX = /[<>]/g;
const LIKE_SPECIAL_CHARACTER_REGEX = /[%_\\]/g;

const companySearchQuerySchema = z.object({
  q: z.string().trim().min(2, "Search query must be at least 2 characters.").max(100),
});

const rateLimiter = new RateLimiter();

/**
 * Defines the CompanySearchItem contract.
 */
export interface CompanySearchItem {
  id: string;
  name: string;
  domain: string;
  industry: string | null;
  employee_count: number | null;
}

/**
 * Defines the CompanySearchResponse contract.
 */
export interface CompanySearchResponse {
  companies: CompanySearchItem[];
}

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];

function sanitizeSearchTerm(value: string): string {
  return value
    .replace(CONTROL_CHARACTER_REGEX, "")
    .replace(ANGLE_BRACKET_REGEX, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeResponseValue(value: string): string {
  return value
    .replace(CONTROL_CHARACTER_REGEX, "")
    .replace(ANGLE_BRACKET_REGEX, "")
    .trim();
}

function escapeIlikePattern(value: string): string {
  return value.replace(LIKE_SPECIAL_CHARACTER_REGEX, (character) => `\\${character}`);
}

function mapCompany(row: Pick<CompanyRow, "id" | "name" | "domain" | "industry" | "employee_count">): CompanySearchItem {
  return {
    id: sanitizeResponseValue(row.id),
    name: sanitizeResponseValue(row.name),
    domain: sanitizeResponseValue(row.domain).toLowerCase(),
    industry: row.industry ? sanitizeResponseValue(row.industry) : null,
    employee_count:
      typeof row.employee_count === "number" && Number.isFinite(row.employee_count)
        ? row.employee_count
        : null,
  };
}

/**
 * Handles GET /api/companies/search for autocomplete results.
 * @param request - Incoming request containing `q` query parameter.
 * @returns Up to 8 company records for the provided search term.
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<CompanySearchResponse | ApiErrorResponse>> {
  // CSRF validation — reject cross-origin requests.
  if (!validateCsrf(request)) {
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.invalidOrigin,
      code: API_ERROR_CODE.invalidOrigin,
      status: 403,
    });
  }

  // Rate limiting — 30 requests per 60s per IP.
  const clientIp = resolveRequestActor(request);
  const allowed = await rateLimiter.check(
    clientIp,
    SEARCH_RATE_LIMIT_SCOPE,
    SEARCH_RATE_LIMIT_LIMIT,
    SEARCH_RATE_LIMIT_WINDOW_SECONDS,
  );

  if (!allowed) {
    return apiErrorResponse({
      error: "Rate limit exceeded. Please try again later.",
      code: API_ERROR_CODE.rateLimited,
      status: 429,
    });
  }

  const rawQuery = request.nextUrl.searchParams.get("q") ?? "";
  const sanitizedQuery = sanitizeSearchTerm(rawQuery);

  const parsedQuery = companySearchQuerySchema.safeParse({ q: sanitizedQuery });
  if (!parsedQuery.success) {
    const issueMessage = parsedQuery.error.issues[0]?.message ?? "Invalid search query.";
    return apiErrorResponse({
      error: issueMessage,
      code: API_ERROR_CODE.invalidPayload,
      status: 400,
    });
  }

  const ilikePattern = `%${escapeIlikePattern(parsedQuery.data.q)}%`;
  const { data, error } = await supabaseAnon
    .from("companies")
    .select("id, name, domain, industry, employee_count")
    .ilike("name", ilikePattern)
    .order("name", { ascending: true })
    .limit(MAX_RESULTS);

  if (error) {
    // If migrations are pending, allow the UI to gracefully show fallback URL mode.
    if (error.code === "42P01") {
      return apiSuccessResponse<CompanySearchResponse>({ companies: [] });
    }

    console.error("Company search query failed:", error);
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }

  const companies = (data ?? []).map((row) => mapCompany(row));
  return apiSuccessResponse<CompanySearchResponse>({ companies });
}
