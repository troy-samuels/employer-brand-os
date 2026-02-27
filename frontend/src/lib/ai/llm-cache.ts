/**
 * @module lib/ai/llm-cache
 * 24-hour cache layer for LLM responses.
 * Prevents redundant OpenRouter calls for the same company.
 */

import { untypedTable } from "@/lib/supabase/untyped-table";
import type { LlmClaim } from "@/types/llm-audit";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface CachedLlmResponse {
  modelId: string;
  rawResponse: string;
  claims: LlmClaim[];
  score: number;
  tokensUsed: number | null;
  latencyMs: number | null;
  createdAt: string;
}

/**
 * Check cache for a company + model combination.
 * Returns null if no valid cache entry exists (missing or expired).
 */
export async function getCachedResponse(
  companySlug: string,
  modelId: string
): Promise<CachedLlmResponse | null> {
  try {
    const { data, error } = await untypedTable("llm_response_cache")
      .select("*")
      .eq("company_slug", companySlug)
      .eq("model_id", modelId)
      .single();

    if (error || !data) return null;

    // Check TTL
    const createdAt = new Date(data.created_at).getTime();
    if (Date.now() - createdAt > CACHE_TTL_MS) return null;

    return {
      modelId: data.model_id,
      rawResponse: data.raw_response,
      claims: (data.claims as LlmClaim[]) ?? [],
      score: data.score ?? 0,
      tokensUsed: data.tokens_used,
      latencyMs: data.latency_ms,
      createdAt: data.created_at,
    };
  } catch {
    // Cache miss on error — don't block the audit
    return null;
  }
}

/**
 * Check cache for multiple models at once.
 * Returns a map of modelId → cached response (only for cache hits).
 */
export async function getCachedResponses(
  companySlug: string,
  modelIds: string[]
): Promise<Map<string, CachedLlmResponse>> {
  const results = new Map<string, CachedLlmResponse>();

  try {
    const { data, error } = await untypedTable("llm_response_cache")
      .select("*")
      .eq("company_slug", companySlug)
      .in("model_id", modelIds);

    if (error || !data) return results;

    const cutoff = Date.now() - CACHE_TTL_MS;

    for (const row of data as Array<Record<string, unknown>>) {
      const createdAt = new Date(row.created_at as string).getTime();
      if (createdAt < cutoff) continue; // Expired

      results.set(row.model_id as string, {
        modelId: row.model_id as string,
        rawResponse: row.raw_response as string,
        claims: (row.claims as LlmClaim[]) ?? [],
        score: (row.score as number) ?? 0,
        tokensUsed: row.tokens_used as number | null,
        latencyMs: row.latency_ms as number | null,
        createdAt: row.created_at as string,
      });
    }
  } catch {
    // Partial results are fine — uncached models will be queried fresh
  }

  return results;
}

/**
 * Write an LLM response to the cache.
 * Uses upsert so re-audits update the cached response.
 */
export async function setCachedResponse(
  companySlug: string,
  companyDomain: string,
  modelId: string,
  prompt: string,
  rawResponse: string,
  claims: LlmClaim[],
  score: number,
  tokensUsed?: number,
  latencyMs?: number
): Promise<void> {
  try {
    await untypedTable("llm_response_cache").upsert(
      {
        company_slug: companySlug,
        company_domain: companyDomain,
        model_id: modelId,
        prompt,
        raw_response: rawResponse,
        claims,
        score,
        tokens_used: tokensUsed ?? null,
        latency_ms: latencyMs ?? null,
        created_at: new Date().toISOString(),
      },
      { onConflict: "company_slug,model_id" }
    );
  } catch (err) {
    // Fire-and-forget — don't block the audit response
    console.error("[llm-cache] Failed to write cache:", err);
  }
}
