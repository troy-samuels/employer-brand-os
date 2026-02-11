/**
 * @module lib/citation-chain/llm-query
 * LLM query interface for citation-chain checks.
 */

import type {
  CitationChainModelId,
  LlmResponse,
  PromptCategoryId,
} from "@/lib/citation-chain/types";
import { CITATION_CHAIN_MODEL_IDS } from "@/lib/citation-chain/types";

/**
 * Runtime options for `queryModel`.
 */
export interface QueryModelOptions {
  category?: PromptCategoryId;
  timeoutMs?: number;
  signal?: AbortSignal;
}

interface ProviderResult {
  response: string;
  citations: string[];
}

interface ProviderContext {
  companyName: string;
  companyDomain: string;
  category: PromptCategoryId;
}

interface ModelProvider {
  run(context: ProviderContext): Promise<ProviderResult>;
}

const DEFAULT_TIMEOUT_MS = 8_000;

const MODEL_LATENCY_MS: Record<CitationChainModelId, number> = {
  chatgpt: 380,
  claude: 460,
  perplexity: 320,
};

const MODEL_PROVIDERS: Record<CitationChainModelId, ModelProvider> = {
  chatgpt: {
    async run(context) {
      return {
        response: buildChatGptResponse(context),
        citations: buildBaseCitations(context),
      };
    },
  },
  claude: {
    async run(context) {
      return {
        response: buildClaudeResponse(context),
        citations: [
          `https://www.${context.companyDomain}/careers`,
          `https://www.reddit.com/r/jobs/comments/abc123/${slugify(context.companyName)}_employee_discussion/`,
          `https://www.glassdoor.co.uk/Reviews/${slugify(context.companyName)}-Reviews-E12345.htm`,
          `https://www.indeed.com/cmp/${slugify(context.companyName)}/reviews`,
        ],
      };
    },
  },
  perplexity: {
    async run(context) {
      return {
        response: buildPerplexityResponse(context),
        citations: [
          `https://www.${context.companyDomain}/careers`,
          `https://www.glassdoor.sg/Reviews/${slugify(context.companyName)}-Reviews-E12345.htm`,
          `https://www.indeed.com/cmp/${slugify(context.companyName)}/salaries`,
          `https://www.reddit.com/r/cscareerquestions/comments/pqr789/${slugify(context.companyName)}_interview_feedback/`,
          `https://www.linkedin.com/company/${slugify(context.companyName)}/jobs/`,
        ],
      };
    },
  },
};

/**
 * Query an LLM model with a prompt and return response plus citations.
 *
 * This phase uses realistic model-specific mock data so real provider
 * adapters can be dropped in later without changing callers.
 */
export async function queryModel(
  modelId: CitationChainModelId,
  prompt: string,
  options: QueryModelOptions = {}
): Promise<LlmResponse> {
  if (!isSupportedModel(modelId)) {
    throw new Error(`Unsupported model id: ${modelId}`);
  }

  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    throw new Error("Prompt cannot be empty");
  }

  const category = options.category ?? inferCategoryFromPrompt(trimmedPrompt);
  const companyName = inferCompanyFromPrompt(trimmedPrompt);
  const companyDomain = inferDomainFromCompany(companyName);

  const startedAt = Date.now();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const provider = MODEL_PROVIDERS[modelId];
  const result = await runWithTimeout(
    async () => {
      await delay(MODEL_LATENCY_MS[modelId], options.signal);
      return provider.run({
        companyName,
        companyDomain,
        category,
      });
    },
    timeoutMs,
    options.signal,
    modelId
  );

  return {
    modelId,
    category,
    prompt: trimmedPrompt,
    response: result.response,
    citations: result.citations,
    latencyMs: Date.now() - startedAt,
  };
}

function isSupportedModel(modelId: string): modelId is CitationChainModelId {
  return CITATION_CHAIN_MODEL_IDS.some((item) => item === modelId);
}

function buildBaseCitations(context: ProviderContext): string[] {
  return [
    `https://www.${context.companyDomain}/careers`,
    `https://www.glassdoor.com/Salary/${slugify(context.companyName)}-Salaries-E12345.htm`,
    `https://www.indeed.com/cmp/${slugify(context.companyName)}/salaries`,
    `https://www.reddit.com/r/cscareerquestions/comments/xyz123/working_at_${slugify(context.companyName)}/`,
  ];
}

function buildChatGptResponse(context: ProviderContext): string {
  const categoryCopy = categoryNarrative(context.category, context.companyName);
  return `${context.companyName} appears to have mixed but improving employer signals. ${categoryCopy} Commonly cited sources include Glassdoor, Indeed, Reddit threads, and the ${context.companyName} careers site.`;
}

function buildClaudeResponse(context: ProviderContext): string {
  const categoryCopy = categoryNarrative(context.category, context.companyName);
  return `From available public sources, ${context.companyName} shows a moderate employer reputation profile. ${categoryCopy} I would prioritise verified details from ${context.companyName}'s own careers pages over crowdsourced posts.`;
}

function buildPerplexityResponse(context: ProviderContext): string {
  const categoryCopy = categoryNarrative(context.category, context.companyName);
  return `Evidence across employer data sources suggests the following about ${context.companyName}. ${categoryCopy} Key references include Glassdoor, Indeed, Reddit discussions, LinkedIn, and the official ${context.companyName} domain.`;
}

function categoryNarrative(category: PromptCategoryId, companyName: string): string {
  switch (category) {
    case "salary":
      return `${companyName} salary ranges vary by level, with software roles usually benchmarked against market medians.`;
    case "culture":
      return `Employee commentary often mentions team autonomy, pace, and management quality at ${companyName}.`;
    case "benefits":
      return `${companyName} benefits appear to include standard healthcare, pension/retirement, and leave support.`;
    case "remote_policy":
      return `Public signals describe a hybrid policy with role-dependent flexibility.`;
    case "interview":
      return `Candidates report a multi-stage interview process combining recruiter screen, technical assessment, and final panel.`;
    case "competitors":
      return `${companyName} is often compared with similarly sized employers in the same hiring market.`;
    case "reviews":
      return `Review platforms show recurring themes around leadership visibility and progression opportunities.`;
    case "growth":
      return `Hiring volume and headcount mentions indicate ongoing growth in selected functions.`;
  }
}

function inferCompanyFromPrompt(prompt: string): string {
  const clean = prompt.replace(/\s+/g, " ").trim();

  const matchers = [
    /\bdoes\s+([A-Za-z0-9&.'\- ]{2,120})\s+offer\b/i,
    /\bis\s+([A-Za-z0-9&.'\- ]{2,120})\s+growing\b/i,
    /\bto\s+([A-Za-z0-9&.'\- ]{2,120})[?.!]?$/i,
    /\bat\s+([A-Za-z0-9&.'\- ]{2,120})[?.!]?$/i,
    /\bfor\s+([A-Za-z0-9&.'\- ]{2,120})[?.!]?$/i,
    /\bof\s+([A-Za-z0-9&.'\- ]{2,120})[?.!]?$/i,
  ];

  for (const matcher of matchers) {
    const match = clean.match(matcher);
    if (match?.[1]) {
      return titleCase(match[1].trim());
    }
  }

  const fallback = clean.match(/\b([A-Za-z][A-Za-z0-9&'\-]{1,})(?:\s+[A-Za-z0-9&'\-]{1,}){0,2}\b/);
  return titleCase(fallback?.[0] ?? "Example Company");
}

function inferCategoryFromPrompt(prompt: string): PromptCategoryId {
  const lower = prompt.toLowerCase();

  if (lower.includes("salary") || lower.includes("pay")) return "salary";
  if (lower.includes("culture")) return "culture";
  if (lower.includes("benefit")) return "benefits";
  if (lower.includes("remote") || lower.includes("hybrid")) return "remote_policy";
  if (lower.includes("interview")) return "interview";
  if (lower.includes("competitor")) return "competitors";
  if (lower.includes("review")) return "reviews";
  return "growth";
}

function inferDomainFromCompany(companyName: string): string {
  const slug = slugify(companyName);
  return `${slug || "example-company"}.com`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(input: string): string {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

async function runWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  signal: AbortSignal | undefined,
  modelId: CitationChainModelId
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${modelId} query timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  if (signal?.aborted) {
    throw new Error(`${modelId} query aborted before start`);
  }

  const abortPromise = signal
    ? new Promise<never>((_, reject) => {
      signal.addEventListener(
        "abort",
        () => reject(new Error(`${modelId} query aborted`)),
        { once: true }
      );
    })
    : null;

  try {
    if (abortPromise) {
      return await Promise.race([operation(), timeoutPromise, abortPromise]);
    }

    return await Promise.race([operation(), timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Operation aborted"));
      return;
    }

    const timeoutId = setTimeout(() => {
      resolve();
    }, ms);

    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timeoutId);
          reject(new Error("Operation aborted"));
        },
        { once: true }
      );
    }
  });
}
