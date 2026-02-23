/**
 * @module app/api/audit/citation-chain/route
 * Runs the full citation-chain audit and returns all report sections.
 */

import { type NextRequest, type NextResponse } from "next/server";
import { z } from "zod";

import { CitationChainEngine } from "@/lib/citation-chain/engine";
import { detectEntityConfusion, type EntityConfusionResult } from "@/lib/citation-chain/entity-detection";
import { analyseGaps, type GapAnalysis } from "@/lib/citation-chain/gap-analysis";
import type { CitationChainResult } from "@/lib/citation-chain/types";
import { calculateTrustDelta, type TrustDeltaResult } from "@/lib/citation-chain/trust-delta";
import { resolveRequestActor } from "@/lib/security/request-metadata";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";
import { validateCsrf } from "@/lib/utils/csrf";
import { RateLimiter } from "@/lib/utils/rate-limiter";

/**
 * API response shape returned by the citation-chain audit endpoint.
 */
/**
 * Metadata envelope returned alongside audit results.
 */
export interface CitationChainAuditMeta {
  /** ISO timestamp of when the audit was generated. */
  generatedAt: string;
  /** Audit engine version. */
  auditVersion: string;
  /** True when one or more downstream analyses failed gracefully. */
  partial: boolean;
  /** Per-section error flags for partial results. */
  errorFlags: Record<string, { hasError: boolean; message: string }>;
}

export interface CitationChainAuditResponse {
  /** Core citation-chain output from the engine. */
  citationChain: CitationChainResult;
  /** Category-level source gap analysis. */
  gapAnalysis: GapAnalysis;
  /** Entity confusion findings across model responses. */
  entityConfusion: EntityConfusionResult;
  /** Trust-delta rows and hallucination rate. */
  trustDelta: TrustDeltaResult;
  /** Audit metadata (always present). */
  meta: CitationChainAuditMeta;
}

/**
 * API runtime target.
 */
export const runtime = "nodejs";

const AUDIT_RATE_LIMIT_SCOPE = "audit-citation-chain";
const AUDIT_RATE_LIMIT_LIMIT = 10;
const AUDIT_RATE_LIMIT_WINDOW_SECONDS = 3_600;
const DOMAIN_PATTERN =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

const auditRequestSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required.").max(200),
  companyDomain: z.string().trim().min(1, "Company domain is required.").max(255),
});

const rateLimiter = new RateLimiter();

/**
 * Execute a citation-chain audit request.
 * @param request - Incoming API request.
 * @returns Audit payload with citation chain, gap analysis, confusion signals, and trust delta.
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<CitationChainAuditResponse | ApiErrorResponse>> {
  const clientIp = resolveRequestActor(request);

  try {
    if (!validateCsrf(request)) {
      return apiErrorResponse({
        error: API_ERROR_MESSAGE.invalidOrigin,
        code: API_ERROR_CODE.invalidOrigin,
        status: 403,
      });
    }

    const allowed = await rateLimiter.check(
      clientIp,
      AUDIT_RATE_LIMIT_SCOPE,
      AUDIT_RATE_LIMIT_LIMIT,
      AUDIT_RATE_LIMIT_WINDOW_SECONDS,
    );

    if (!allowed) {
      return apiErrorResponse({
        error: "Rate limit exceeded. Please try again later.",
        code: API_ERROR_CODE.rateLimited,
        status: 429,
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

    const parsedRequest = auditRequestSchema.safeParse(body);
    if (!parsedRequest.success) {
      const firstIssue = parsedRequest.error.issues[0];
      return apiErrorResponse({
        error: firstIssue?.message ?? "Invalid request payload.",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    const companyName = parsedRequest.data.companyName.trim();
    const companyDomain = normaliseDomain(parsedRequest.data.companyDomain);

    if (!DOMAIN_PATTERN.test(companyDomain)) {
      return apiErrorResponse({
        error: "Please provide a valid company domain.",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    const engine = new CitationChainEngine();

    // --- Citation Chain (core — if this fails we still return 500) ---
    let citationChain: CitationChainResult;
    const errorFlags: Record<string, { hasError: boolean; message: string }> = {
      citationChain: { hasError: false, message: "" },
      gapAnalysis: { hasError: false, message: "" },
      entityConfusion: { hasError: false, message: "" },
      trustDelta: { hasError: false, message: "" },
    };

    try {
      citationChain = await engine.run(companyName, companyDomain);
    } catch (engineError) {
      console.error("[audit/citation-chain] Engine failed:", engineError);
      return apiErrorResponse({
        error: API_ERROR_MESSAGE.internal,
        code: API_ERROR_CODE.internal,
        status: 500,
      });
    }

    // --- Gap Analysis (partial on failure) ---
    let gapAnalysis: GapAnalysis;
    try {
      gapAnalysis = analyseGaps(citationChain, companyDomain);
    } catch (gapError) {
      const msg = gapError instanceof Error ? gapError.message : "Unknown gap analysis error";
      console.error("[audit/citation-chain] Gap analysis failed:", msg);
      errorFlags.gapAnalysis = { hasError: true, message: msg };
      gapAnalysis = { companyDomain, rows: [] };
    }

    // --- Entity Confusion (partial on failure) ---
    let entityConfusion: EntityConfusionResult;
    try {
      entityConfusion = detectEntityConfusion(
        citationChain.llmResponses,
        companyName,
        companyDomain,
      );
    } catch (entityError) {
      const msg = entityError instanceof Error ? entityError.message : "Unknown entity detection error";
      console.error("[audit/citation-chain] Entity detection failed:", msg);
      errorFlags.entityConfusion = { hasError: true, message: msg };
      entityConfusion = {
        isConfused: false,
        severity: "none",
        confusedEntities: [],
        correctIdentificationRate: 0,
        recommendation: "Entity detection unavailable.",
      };
    }

    // --- Trust Delta (partial on failure) ---
    let trustDelta: TrustDeltaResult;
    try {
      trustDelta = calculateTrustDelta(citationChain.llmResponses, companyDomain);
    } catch (deltaError) {
      const msg = deltaError instanceof Error ? deltaError.message : "Unknown trust delta error";
      console.error("[audit/citation-chain] Trust delta failed:", msg);
      errorFlags.trustDelta = { hasError: true, message: msg };
      trustDelta = { items: [], hallucinationRate: 0 };
    }

    const hasAnyError = Object.values(errorFlags).some((f) => f.hasError);

    return apiSuccessResponse({
      citationChain,
      gapAnalysis,
      entityConfusion,
      trustDelta,
      meta: {
        generatedAt: new Date().toISOString(),
        auditVersion: "1.0.0",
        partial: hasAnyError,
        errorFlags,
      },
    });
  } catch (error) {
    console.error("[audit/citation-chain] Unexpected route error:", error);
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}

function normaliseDomain(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) {
    return "";
  }

  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(candidate).hostname.replace(/^www\./i, "");
  } catch {
    const fallbackDomain = trimmed.split("/")[0] ?? "";
    return fallbackDomain.replace(/^www\./i, "");
  }
}
