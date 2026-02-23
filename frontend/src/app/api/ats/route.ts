/**
 * @module app/api/ats/route
 * ATS detection and job scraping endpoint.
 * Detects the ATS provider, fetches public job postings, analyses them, and generates Facts.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { detectATS, isReliableDetection } from "@/lib/ats/detect";
import { analyseJobs, type JobAnalysis } from "@/lib/ats/analyse";
import { generateFacts, hasSubstantialFacts, type GeneratedFacts } from "@/lib/ats/generate-facts";
import { fetchJobsFromProvider } from "@/lib/ats/providers";
import { resolveRequestActor } from "@/lib/security/request-metadata";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";
import { validateCsrf } from "@/lib/utils/csrf";
import { RateLimiter } from "@/lib/utils/rate-limiter";

export const runtime = "nodejs";

const ATS_RESOURCE = "api.ats";
const ATS_RATE_LIMIT_SCOPE = "ats-detection";
const ATS_RATE_LIMIT_LIMIT = 10;
const ATS_RATE_LIMIT_WINDOW_SECONDS = 3600;
const ATS_EXECUTION_TIMEOUT_MS = 30_000;

const rateLimiter = new RateLimiter();

class ATSExecutionTimeoutError extends Error {
  constructor() {
    super("ATS detection timed out");
    this.name = "ATSExecutionTimeoutError";
  }
}

function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new ATSExecutionTimeoutError());
    }, timeoutMs);

    operation.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

const atsRequestSchema = z.object({
  careersUrl: z
    .string()
    .trim()
    .min(1, "Missing or invalid 'careersUrl' field.")
    .max(2048, "'careersUrl' is too long.")
    .url("'careersUrl' must be a valid HTTP(S) URL."),
});

export interface ATSAnalysisResult {
  provider: string | null;
  boardToken: string | null;
  confidence: number;
  jobCount: number;
  analysis: JobAnalysis | null;
  facts: GeneratedFacts | null;
  cached: boolean;
  timestamp: string;
}

// Simple in-memory cache (1 hour TTL)
const cache = new Map<string, { result: ATSAnalysisResult; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCached(careersUrl: string): ATSAnalysisResult | null {
  const entry = cache.get(careersUrl);
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    cache.delete(careersUrl);
    return null;
  }
  
  return { ...entry.result, cached: true };
}

function setCache(careersUrl: string, result: ATSAnalysisResult): void {
  cache.set(careersUrl, {
    result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

/**
 * POST /api/ats
 * 
 * Detect ATS, fetch jobs, analyse, and generate facts.
 * 
 * Request body:
 * ```json
 * {
 *   "careersUrl": "https://monzo.com/careers"
 * }
 * ```
 * 
 * Response:
 * ```json
 * {
 *   "provider": "greenhouse",
 *   "boardToken": "monzo",
 *   "confidence": 1.0,
 *   "jobCount": 47,
 *   "analysis": { ... },
 *   "facts": { ... },
 *   "cached": false,
 *   "timestamp": "2024-02-23T16:30:00Z"
 * }
 * ```
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ATSAnalysisResult | ApiErrorResponse>> {
  const clientIp = resolveRequestActor(request);

  try {
    // CSRF validation
    if (!validateCsrf(request)) {
      return apiErrorResponse({
        error: API_ERROR_MESSAGE.invalidOrigin,
        code: API_ERROR_CODE.invalidOrigin,
        status: 403,
      });
    }

    // Rate limiting
    const allowed = await rateLimiter.check(
      clientIp,
      ATS_RATE_LIMIT_SCOPE,
      ATS_RATE_LIMIT_LIMIT,
      ATS_RATE_LIMIT_WINDOW_SECONDS,
    );

    if (!allowed) {
      return apiErrorResponse({
        error: "Rate limit exceeded. Please try again later.",
        code: API_ERROR_CODE.rateLimited,
        status: 429,
      });
    }

    // Parse request body
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

    const parsedBody = atsRequestSchema.safeParse(body);
    if (!parsedBody.success) {
      const firstIssue = parsedBody.error.issues[0];
      return apiErrorResponse({
        error: firstIssue?.message ?? "Invalid request payload.",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    const { careersUrl } = parsedBody.data;

    // Check cache
    const cached = getCached(careersUrl);
    if (cached) {
      return apiSuccessResponse<ATSAnalysisResult>(cached);
    }

    // Run ATS detection and job analysis
    const result = await withTimeout(
      (async () => {
        // Step 1: Detect ATS
        const detection = await detectATS(careersUrl);
        
        if (!isReliableDetection(detection)) {
          return {
            provider: null,
            boardToken: null,
            confidence: detection.confidence,
            jobCount: 0,
            analysis: null,
            facts: null,
            cached: false,
            timestamp: new Date().toISOString(),
          };
        }

        // Step 2: Fetch jobs from detected ATS
        const jobs = await fetchJobsFromProvider(
          detection.provider!,
          detection.boardToken!
        );

        if (jobs.length === 0) {
          return {
            provider: detection.provider,
            boardToken: detection.boardToken,
            confidence: detection.confidence,
            jobCount: 0,
            analysis: null,
            facts: null,
            cached: false,
            timestamp: new Date().toISOString(),
          };
        }

        // Step 3: Analyse jobs
        const analysis = analyseJobs(jobs);

        // Step 4: Generate facts
        const facts = generateFacts(jobs, analysis, detection.provider!);

        // Only return facts if they're substantial
        const finalFacts = hasSubstantialFacts(facts) ? facts : null;

        return {
          provider: detection.provider,
          boardToken: detection.boardToken,
          confidence: detection.confidence,
          jobCount: jobs.length,
          analysis,
          facts: finalFacts,
          cached: false,
          timestamp: new Date().toISOString(),
        };
      })(),
      ATS_EXECUTION_TIMEOUT_MS,
    );

    // Cache the result
    setCache(careersUrl, result);

    return apiSuccessResponse<ATSAnalysisResult>(result);
    
  } catch (error) {
    if (error instanceof ATSExecutionTimeoutError) {
      return apiErrorResponse({
        error: "ATS detection timed out. Please try again.",
        code: API_ERROR_CODE.internal,
        status: 504,
      });
    }

    console.error("[ATS API] Error:", error);
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}
