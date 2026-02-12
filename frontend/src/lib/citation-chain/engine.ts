/**
 * @module lib/citation-chain/engine
 * Citation chain orchestrator: Google + LLM queries + source mapping + scoring.
 */

import {
  buildGoogleQuery,
  buildLlmPrompt,
  DEFAULT_EMPLOYER_ROLE,
  PROMPT_CATEGORIES,
} from "@/lib/citation-chain/prompts";
import { fetchGoogleResults } from "@/lib/citation-chain/google-search";
import { queryModel } from "@/lib/citation-chain/llm-query";
import { getCanonicalDomainKey, mapSources } from "@/lib/citation-chain/source-mapper";
import type {
  CitationChainModelId,
  CitationChainResult,
  CitationRunError,
  LlmResponse,
  PromptCategoryId,
} from "@/lib/citation-chain/types";
import { CITATION_CHAIN_MODEL_IDS } from "@/lib/citation-chain/types";

/**
 * Maximum concurrent LLM requests to prevent burst throttling.
 * Google tasks are lightweight and run separately.
 */
const MAX_CONCURRENT_LLM = 4;

interface EngineOptions {
  role?: string;
  googleTimeoutMs?: number;
  modelTimeoutMs?: number;
  categories?: PromptCategoryId[];
}

interface CitationChainDependencies {
  fetchGoogleResultsFn?: typeof fetchGoogleResults;
  queryModelFn?: typeof queryModel;
  now?: () => Date;
}

/**
 * Run citation chain audits for a company.
 */
export class CitationChainEngine {
  private readonly fetchGoogleResultsFn: typeof fetchGoogleResults;

  private readonly queryModelFn: typeof queryModel;

  private readonly now: () => Date;

  constructor(dependencies: CitationChainDependencies = {}) {
    this.fetchGoogleResultsFn = dependencies.fetchGoogleResultsFn ?? fetchGoogleResults;
    this.queryModelFn = dependencies.queryModelFn ?? queryModel;
    this.now = dependencies.now ?? (() => new Date());
  }

  /**
   * Execute the citation chain audit in parallel and return aggregated results.
   */
  async run(
    companyName: string,
    companyDomain: string,
    options: EngineOptions = {}
  ): Promise<CitationChainResult> {
    const categories = options.categories ?? PROMPT_CATEGORIES.map((category) => category.id);
    const role = options.role ?? DEFAULT_EMPLOYER_ROLE;
    const errors: CitationRunError[] = [];

    const googleTasks = categories.map(async (category) => {
      const query = buildGoogleQuery(category, companyName, role);

      try {
        const results = await this.fetchGoogleResultsFn(query, {
          category,
          timeoutMs: options.googleTimeoutMs,
        });
        return results;
      } catch (error) {
        errors.push({
          scope: "google",
          category,
          message: getErrorMessage(error),
        });
        return [];
      }
    });

    const llmTaskFns = categories.flatMap((category) =>
      CITATION_CHAIN_MODEL_IDS.map((modelId) => async (): Promise<LlmResponse> => {
        const prompt = buildLlmPrompt(category, companyName, role);

        try {
          return await this.queryModelFn(modelId, prompt, {
            category,
            timeoutMs: options.modelTimeoutMs,
          });
        } catch (error) {
          errors.push({
            scope: modelId,
            category,
            message: getErrorMessage(error),
          });

          return createFailedLlmResponse(modelId, category, prompt, getErrorMessage(error));
        }
      })
    );

    const [googleResultGroups, llmResponses] = await Promise.all([
      Promise.all(googleTasks),
      runWithConcurrencyLimit(llmTaskFns, MAX_CONCURRENT_LLM),
    ]);

    const googleResults = googleResultGroups.flat();
    const sourceMappings = mapSources(googleResults, llmResponses, companyDomain);
    const citationScore = calculateCitationScore(companyDomain, llmResponses);

    return {
      companyName,
      companyDomain,
      googleResults,
      llmResponses,
      sourceMappings,
      citationScore,
      timestamp: this.now().toISOString(),
      errors,
    };
  }
}

/**
 * Calculate Citation Score as employer-domain citation share.
 */
export function calculateCitationScore(companyDomain: string, llmResponses: LlmResponse[]): number {
  const companyKey = getCanonicalDomainKey(companyDomain);
  const allCitations = llmResponses.flatMap((response) => response.citations);
  const totalCitations = allCitations.length;

  if (totalCitations === 0 || !companyKey) {
    return 0;
  }

  const employerCitations = allCitations.filter((citation) => {
    const citationKey = getCanonicalDomainKey(citation);
    return citationKey === companyKey;
  }).length;

  const rawScore = (employerCitations / totalCitations) * 100;
  const roundedScore = Number(rawScore.toFixed(2));

  return Math.max(0, Math.min(100, roundedScore));
}

function createFailedLlmResponse(
  modelId: CitationChainModelId,
  category: PromptCategoryId,
  prompt: string,
  error: string
): LlmResponse {
  return {
    modelId,
    category,
    prompt,
    response: "",
    citations: [],
    latencyMs: 0,
    failed: true,
    error,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown citation-chain error";
}

/**
 * Execute async tasks with a concurrency cap.
 * Prevents burst-throttling when fanning out to multiple LLM providers.
 */
async function runWithConcurrencyLimit<T>(
  taskFns: Array<() => Promise<T>>,
  limit: number,
): Promise<T[]> {
  const results: T[] = new Array(taskFns.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < taskFns.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await taskFns[index]!();
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, taskFns.length) },
    () => worker(),
  );
  await Promise.all(workers);

  return results;
}
