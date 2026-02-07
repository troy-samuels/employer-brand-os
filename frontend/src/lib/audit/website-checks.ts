import { validateUrl } from "@/lib/audit/url-validator";

const FETCH_TIMEOUT_MS = 5000;
const AUDIT_USER_AGENT = "BrandOSAuditBot/1.0";

const LLMS_EMPLOYMENT_KEYWORDS = [
  "career",
  "careers",
  "job",
  "jobs",
  "employment",
  "salary",
  "compensation",
  "hiring",
  "recruit",
];

const SALARY_KEYWORDS = [
  "salary",
  "£",
  "$",
  "compensation",
  "pay range",
  "pay band",
  "remuneration",
  "per annum",
  "p.a.",
  "k per year",
];

const CAREERS_PATHS = [
  "/careers",
  "/jobs",
  "/careers/",
  "/jobs/",
  "/about/careers",
  "/join-us",
  "/work-with-us",
];

const AI_BOTS = [
  {
    label: "GPTBot",
    userAgents: ["gptbot"],
  },
  {
    label: "ChatGPT-User",
    userAgents: ["chatgpt-user"],
  },
  {
    label: "Google-Extended",
    userAgents: ["google-extended"],
  },
  {
    label: "Anthropic",
    userAgents: ["anthropic-ai", "claudebot", "anthropic"],
  },
  {
    label: "CCBot",
    userAgents: ["ccbot"],
  },
] as const;

type CareersPageStatus = "full" | "partial" | "none" | "not_found";
type RobotsTxtStatus = "allows" | "partial" | "blocks" | "no_rules" | "not_found";

type SafeFetchResult = {
  ok: boolean;
  status: number | null;
  text: string;
};

type CareersCheckResult = {
  status: CareersPageStatus;
  url: string | null;
  html: string;
};

type RobotsPolicyParseResult = {
  status: Exclude<RobotsTxtStatus, "not_found">;
  allowedBots: string[];
  blockedBots: string[];
};

export type WebsiteCheckResult = {
  domain: string;
  companyName: string;
  companySlug: string;
  hasLlmsTxt: boolean;
  llmsTxtHasEmployment: boolean;
  hasJsonld: boolean;
  jsonldSchemasFound: string[];
  hasSalaryData: boolean;
  careersPageStatus: CareersPageStatus;
  careersPageUrl: string | null;
  robotsTxtStatus: RobotsTxtStatus;
  robotsTxtAllowedBots: string[];
  robotsTxtBlockedBots: string[];
  score: number;
  scoreBreakdown: {
    llmsTxt: number;
    jsonld: number;
    salaryData: number;
    careersPage: number;
    robotsTxt: number;
  };
};

async function fetchSafe(url: string): Promise<SafeFetchResult> {
  const validation = await validateUrl(url);
  if (!validation.ok) {
    return {
      ok: false,
      status: null,
      text: "",
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": AUDIT_USER_AGENT,
      },
      signal: controller.signal,
    });

    const text = await response.text();
    return {
      ok: true,
      status: response.status,
      text,
    };
  } catch {
    return {
      ok: false,
      status: null,
      text: "",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeDomain(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const normalizedInput = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return new URL(normalizedInput).hostname.toLowerCase();
  } catch {
    const withoutProtocol = trimmed.replace(/^https?:\/\//i, "");
    return withoutProtocol.split("/")[0]?.toLowerCase() ?? "";
  }
}

function createCompanySlug(companyName: string): string {
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "company";
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractJsonLdBlocks(html: string): string[] {
  const matches = html.matchAll(
    /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );

  return Array.from(matches, (match) => match[1]?.trim() ?? "").filter(Boolean);
}

function normalizeSchemaType(typeValue: string): string {
  const trimmed = typeValue.trim();
  if (!trimmed) {
    return "";
  }

  const hashSplit = trimmed.split("#");
  const hashPart = hashSplit[hashSplit.length - 1] ?? "";
  const slashSplit = hashPart.split("/");
  return (slashSplit[slashSplit.length - 1] ?? "").trim();
}

function collectJsonLdTypes(node: unknown, typeSet: Set<string>): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      collectJsonLdTypes(item, typeSet);
    }
    return;
  }

  if (node === null || typeof node !== "object") {
    return;
  }

  const record = node as Record<string, unknown>;
  const schemaType = record["@type"];

  if (typeof schemaType === "string") {
    const normalized = normalizeSchemaType(schemaType);
    if (normalized) {
      typeSet.add(normalized);
    }
  } else if (Array.isArray(schemaType)) {
    for (const typeValue of schemaType) {
      if (typeof typeValue === "string") {
        const normalized = normalizeSchemaType(typeValue);
        if (normalized) {
          typeSet.add(normalized);
        }
      }
    }
  }

  for (const value of Object.values(record)) {
    if (value && typeof value === "object") {
      collectJsonLdTypes(value, typeSet);
    }
  }
}

async function runCareersCheck(domain: string): Promise<CareersCheckResult> {
  for (const path of CAREERS_PATHS) {
    const careersUrl = `https://${domain}${path}`;
    const response = await fetchSafe(careersUrl);

    if (!response.ok || response.status !== 200) {
      continue;
    }

    const textLength = stripHtmlTags(response.text).length;
    if (textLength > 1000) {
      return { status: "full", url: careersUrl, html: response.text };
    }
    if (textLength >= 200) {
      return { status: "partial", url: careersUrl, html: response.text };
    }

    return { status: "none", url: careersUrl, html: response.text };
  }

  return {
    status: "not_found",
    url: null,
    html: "",
  };
}

type RobotsRule = {
  type: "allow" | "disallow";
  path: string;
};

type RobotsGroup = {
  agents: string[];
  rules: RobotsRule[];
};

function parseRobotsGroups(robotsTxt: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let currentGroup: RobotsGroup = {
    agents: [],
    rules: [],
  };
  let hasRules = false;

  const flush = () => {
    if (currentGroup.agents.length > 0) {
      groups.push(currentGroup);
    }
    currentGroup = {
      agents: [],
      rules: [],
    };
    hasRules = false;
  };

  for (const rawLine of robotsTxt.split(/\r?\n/)) {
    const noComment = rawLine.split("#")[0] ?? "";
    const line = noComment.trim();
    if (!line) {
      flush();
      continue;
    }

    const directiveMatch = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!directiveMatch) {
      continue;
    }

    const directive = directiveMatch[1]?.toLowerCase();
    const value = (directiveMatch[2] ?? "").trim();

    if (directive === "user-agent") {
      if (hasRules) {
        flush();
      }
      if (value) {
        currentGroup.agents.push(value.toLowerCase());
      }
      continue;
    }

    if (directive === "allow" || directive === "disallow") {
      if (currentGroup.agents.length === 0) {
        continue;
      }

      hasRules = true;
      currentGroup.rules.push({
        type: directive,
        path: value,
      });
    }
  }

  flush();
  return groups;
}

function doesAgentMatch(agent: string, botAgent: string): boolean {
  if (agent === "*") {
    return true;
  }

  return botAgent === agent || botAgent.startsWith(agent);
}

function getMatchingGroups(groups: RobotsGroup[], botAgents: readonly string[]): RobotsGroup[] {
  const specificMatches = groups.filter((group) =>
    group.agents.some(
      (agent) => agent !== "*" && botAgents.some((botAgent) => doesAgentMatch(agent, botAgent))
    )
  );
  if (specificMatches.length > 0) {
    return specificMatches;
  }

  return groups.filter((group) => group.agents.includes("*"));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function doesRuleMatchPath(rulePath: string, targetPath: string): boolean {
  const trimmed = rulePath.trim();
  if (!trimmed) {
    return false;
  }

  let regexPattern = "";
  for (const char of trimmed) {
    if (char === "*") {
      regexPattern += ".*";
      continue;
    }

    if (char === "$") {
      regexPattern += "$";
      continue;
    }

    regexPattern += escapeRegex(char);
  }

  if (!trimmed.endsWith("$")) {
    regexPattern += ".*";
  }

  const regex = new RegExp(`^${regexPattern}`, "i");
  return regex.test(targetPath);
}

function getRuleSpecificity(rulePath: string): number {
  return rulePath.replace(/\*/g, "").replace(/\$/g, "").length;
}

function evaluateBotAccess(groups: RobotsGroup[], botAgents: readonly string[]): "allow" | "block" | "no_rules" {
  const matchingGroups = getMatchingGroups(groups, botAgents);
  if (matchingGroups.length === 0) {
    return "no_rules";
  }

  const rules = matchingGroups.flatMap((group) => group.rules);
  if (rules.length === 0) {
    return "no_rules";
  }

  let bestMatch: RobotsRule | null = null;
  let bestSpecificity = -1;

  for (const rule of rules) {
    if (!doesRuleMatchPath(rule.path, "/")) {
      continue;
    }

    const specificity = getRuleSpecificity(rule.path);
    if (specificity > bestSpecificity) {
      bestSpecificity = specificity;
      bestMatch = rule;
      continue;
    }

    if (specificity === bestSpecificity && bestMatch?.type === "disallow" && rule.type === "allow") {
      bestMatch = rule;
    }
  }

  if (!bestMatch) {
    // If rules exist but none match "/", bots can still crawl at least part of the site.
    return "allow";
  }

  return bestMatch.type === "allow" ? "allow" : "block";
}

export function parseRobotsPolicy(robotsTxt: string): RobotsPolicyParseResult {
  const groups = parseRobotsGroups(robotsTxt);

  const allowedBots: string[] = [];
  const blockedBots: string[] = [];
  let botsWithRules = 0;

  for (const bot of AI_BOTS) {
    const access = evaluateBotAccess(groups, bot.userAgents);
    if (access === "no_rules") {
      continue;
    }

    botsWithRules += 1;
    if (access === "allow") {
      allowedBots.push(bot.label);
    } else {
      blockedBots.push(bot.label);
    }
  }

  if (botsWithRules === 0) {
    return {
      status: "no_rules",
      allowedBots: [],
      blockedBots: [],
    };
  }

  if (allowedBots.length > 0 && blockedBots.length > 0) {
    return {
      status: "partial",
      allowedBots,
      blockedBots,
    };
  }

  if (allowedBots.length > 0) {
    return {
      status: "allows",
      allowedBots,
      blockedBots: [],
    };
  }

  return {
    status: "blocks",
    allowedBots: [],
    blockedBots,
  };
}

function scoreLlmsCheck(hasLlmsTxt: boolean, llmsTxtHasEmployment: boolean): number {
  if (hasLlmsTxt && llmsTxtHasEmployment) {
    return 25;
  }
  if (hasLlmsTxt) {
    return 12;
  }
  return 0;
}

function scoreJsonLdCheck(schemas: string[]): number {
  const hasJobSchema = schemas.includes("JobPosting") || schemas.includes("EmployerAggregateRating");
  if (hasJobSchema) {
    return 25;
  }

  if (schemas.includes("Organization")) {
    return 12;
  }

  return 0;
}

function scoreCareersCheck(status: CareersPageStatus): number {
  if (status === "full") {
    return 15;
  }
  if (status === "partial") {
    return 8;
  }
  return 0;
}

function scoreRobotsCheck(status: RobotsTxtStatus, allowedBotsCount: number): number {
  if (status === "allows") {
    return 15;
  }
  if (status === "partial") {
    const partialBonus = Math.round((allowedBotsCount / AI_BOTS.length) * 7);
    return 8 + partialBonus;
  }
  if (status === "no_rules") {
    return 8;
  }
  return 0;
}

export async function runWebsiteChecks(
  domain: string,
  companyName: string
): Promise<WebsiteCheckResult> {
  const normalizedDomain = normalizeDomain(domain);
  const companySlug = createCompanySlug(companyName);

  let hasLlmsTxt = false;
  let llmsTxtHasEmployment = false;
  let hasJsonld = false;
  let jsonldSchemasFound: string[] = [];
  let hasSalaryData = false;
  let careersPageStatus: CareersPageStatus = "not_found";
  let careersPageUrl: string | null = null;
  let robotsTxtStatus: RobotsTxtStatus = "not_found";
  let robotsTxtAllowedBots: string[] = [];
  let robotsTxtBlockedBots: string[] = [];

  if (normalizedDomain) {
    const homepageUrl = `https://${normalizedDomain}/`;

    const llmsResponse = await fetchSafe(`https://${normalizedDomain}/llms.txt`);
    if (llmsResponse.ok && llmsResponse.status === 200) {
      hasLlmsTxt = true;
      const llmsText = llmsResponse.text.toLowerCase();
      llmsTxtHasEmployment = LLMS_EMPLOYMENT_KEYWORDS.some((keyword) => llmsText.includes(keyword));
    }

    const homepageResponse = await fetchSafe(homepageUrl);
    const homepageHtml = homepageResponse.ok && homepageResponse.status === 200 ? homepageResponse.text : "";

    if (homepageHtml) {
      const jsonLdBlocks = extractJsonLdBlocks(homepageHtml);
      const schemas = new Set<string>();

      for (const block of jsonLdBlocks) {
        try {
          const parsed = JSON.parse(block);
          collectJsonLdTypes(parsed, schemas);
        } catch {
          continue;
        }
      }

      jsonldSchemasFound = Array.from(schemas);
      hasJsonld = jsonldSchemasFound.length > 0;
    }

    const careersCheck = await runCareersCheck(normalizedDomain);
    careersPageStatus = careersCheck.status;
    careersPageUrl = careersCheck.url;

    const salarySourceText = `${stripHtmlTags(homepageHtml)} ${stripHtmlTags(careersCheck.html)}`.toLowerCase();
    hasSalaryData = SALARY_KEYWORDS.some((keyword) => salarySourceText.includes(keyword.toLowerCase()));

    const robotsResponse = await fetchSafe(`https://${normalizedDomain}/robots.txt`);
    if (robotsResponse.ok && robotsResponse.status === 200) {
      const parsedRobots = parseRobotsPolicy(robotsResponse.text);
      robotsTxtStatus = parsedRobots.status;
      robotsTxtAllowedBots = parsedRobots.allowedBots;
      robotsTxtBlockedBots = parsedRobots.blockedBots;
    } else if (robotsResponse.ok && robotsResponse.status === 404) {
      robotsTxtStatus = "not_found";
    }
  }

  const scoreBreakdown = {
    llmsTxt: scoreLlmsCheck(hasLlmsTxt, llmsTxtHasEmployment),
    jsonld: scoreJsonLdCheck(jsonldSchemasFound),
    salaryData: hasSalaryData ? 20 : 0,
    careersPage: scoreCareersCheck(careersPageStatus),
    robotsTxt: scoreRobotsCheck(robotsTxtStatus, robotsTxtAllowedBots.length),
  };

  const score =
    scoreBreakdown.llmsTxt +
    scoreBreakdown.jsonld +
    scoreBreakdown.salaryData +
    scoreBreakdown.careersPage +
    scoreBreakdown.robotsTxt;

  return {
    domain: normalizedDomain || domain.trim(),
    companyName,
    companySlug,
    hasLlmsTxt,
    llmsTxtHasEmployment,
    hasJsonld,
    jsonldSchemasFound,
    hasSalaryData,
    careersPageStatus,
    careersPageUrl,
    robotsTxtStatus,
    robotsTxtAllowedBots,
    robotsTxtBlockedBots,
    score,
    scoreBreakdown,
  };
}
