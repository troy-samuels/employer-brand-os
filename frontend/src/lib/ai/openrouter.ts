/**
 * @module lib/ai/openrouter
 * OpenRouter API client for querying multiple LLMs with employer prompts.
 * Used by the audit LLM testing module and the monitoring system.
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Model mapping: our canonical model IDs → OpenRouter model identifiers. */
const MODEL_MAP: Record<string, string> = {
  chatgpt: "openai/gpt-4o-mini",
  "google-ai": "google/gemini-2.0-flash-001",
  perplexity: "perplexity/sonar",
  claude: "anthropic/claude-3.5-haiku",
  copilot: "openai/gpt-4o-mini", // Copilot uses GPT-4o under the hood
  "meta-ai": "meta-llama/llama-3.3-70b-instruct",
};

export interface LlmQueryResult {
  /** The model that was queried. */
  modelId: string;
  /** The raw response text. */
  response: string;
  /** Whether the query succeeded. */
  success: boolean;
  /** Error message if the query failed. */
  error?: string;
  /** Response latency in milliseconds. */
  latencyMs: number;
  /** Tokens used (for cost tracking). */
  tokensUsed?: number;
  /** Citations returned by the model (Perplexity). */
  citations?: string[];
}

/**
 * Query a single LLM model via OpenRouter.
 * Returns the raw text response with metadata.
 */
export async function queryModel(
  modelId: string,
  prompt: string,
  options?: { timeoutMs?: number }
): Promise<LlmQueryResult> {
  const startTime = Date.now();

  if (!OPENROUTER_API_KEY) {
    return {
      modelId,
      response: "",
      success: false,
      error: "OPENROUTER_API_KEY not configured",
      latencyMs: 0,
    };
  }

  const openrouterModel = MODEL_MAP[modelId];
  if (!openrouterModel) {
    return {
      modelId,
      response: "",
      success: false,
      error: `Unknown model: ${modelId}`,
      latencyMs: 0,
    };
  }

  const timeoutMs = options?.timeoutMs ?? 30_000;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(OPENROUTER_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://openrole.co.uk",
        "X-Title": "OpenRole AI Audit",
      },
      body: JSON.stringify({
        model: openrouterModel,
        messages: [
          {
            role: "system",
            content:
              "You are helping a job seeker research an employer. Answer based on publicly available information. Be specific and factual. If you don't have reliable information, say so clearly rather than guessing. Keep your response concise (under 300 words).",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "Unknown error");
      return {
        modelId,
        response: "",
        success: false,
        error: `OpenRouter API error (${res.status}): ${errorBody.slice(0, 200)}`,
        latencyMs: Date.now() - startTime,
      };
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    const tokensUsed = data?.usage?.total_tokens;
    // Perplexity returns citations as a top-level array
    const citations: string[] | undefined = Array.isArray(data?.citations)
      ? data.citations
      : undefined;

    return {
      modelId,
      response: content,
      success: true,
      latencyMs: Date.now() - startTime,
      tokensUsed,
      citations,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? `Request timed out after ${timeoutMs}ms`
          : err.message
        : "Unknown error";

    return {
      modelId,
      response: "",
      success: false,
      error: message,
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * Query multiple models in parallel.
 * Returns results for all models, including failures.
 */
export async function queryModels(
  modelIds: string[],
  prompt: string,
  options?: { timeoutMs?: number; concurrency?: number }
): Promise<LlmQueryResult[]> {
  const concurrency = options?.concurrency ?? 4;
  const results: LlmQueryResult[] = [];

  // Process in batches to respect concurrency limits
  for (let i = 0; i < modelIds.length; i += concurrency) {
    const batch = modelIds.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((id) => queryModel(id, prompt, { timeoutMs: options?.timeoutMs }))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Check if the OpenRouter API is configured and reachable.
 */
export function isConfigured(): boolean {
  return !!OPENROUTER_API_KEY;
}
