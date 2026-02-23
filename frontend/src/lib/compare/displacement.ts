/**
 * @module lib/compare/displacement
 * Generates actionable displacement reports showing employers exactly what
 * content to publish to beat competitors in AI responses.
 *
 * Core insight: AI visibility isn't static — it's a race. Show employers
 * how to win by publishing specific content at specific locations.
 */

import { untypedTable } from "@/lib/supabase/untyped-table";
import { generateContentBrief, type ContentBrief } from "./content-briefs";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/**
 * A single dimension where a competitor outperforms the target company.
 */
export interface DisplacementOpportunity {
  /** Dimension name (e.g., "Salary Transparency", "Work-Life Balance") */
  dimension: string;
  
  /** Current state comparison */
  currentState: {
    /** Target company's score on this dimension */
    yourScore: number;
    /** Competitor's score on this dimension */
    competitorScore: number;
    /** Gap size (positive = competitor winning) */
    gap: number;
    /** What AI currently says about each company */
    aiSays: string;
  };
  
  /** Actionable content recommendation */
  action: {
    /** Priority level based on gap size and effort */
    priority: "critical" | "high" | "medium" | "low";
    /** One-sentence description of what to do */
    contentBrief: string;
    /** Content format to publish */
    targetFormat: string;
    /** Estimated impact timeline */
    estimatedImpact: string;
    /** Draft content snippet ready to use */
    exampleContent: string;
    /** Where to publish (careers page, blog, etc.) */
    publishTo: string;
  };
}

/**
 * Full displacement report comparing two companies.
 */
export interface DisplacementReport {
  /** Target company data */
  company: {
    name: string;
    slug: string;
    score: number;
  };
  
  /** Competitor company data */
  competitor: {
    name: string;
    slug: string;
    score: number;
  };
  
  /** Overall score gap */
  overallGap: number;
  
  /** All displacement opportunities (competitor wins) */
  opportunities: DisplacementOpportunity[];
  
  /** Top 3 easiest/highest-ROI opportunities */
  quickWins: DisplacementOpportunity[];
  
  /** Report generation timestamp */
  generatedAt: string;
}

/**
 * Company audit data structure from public_audits view.
 */
interface CompanyAudit {
  company_name: string;
  company_slug: string;
  score: number;
  score_breakdown: {
    jsonld: number;
    robotsTxt: number;
    careersPage: number;
    brandReputation: number;
    salaryData: number;
    contentFormat: number;
    llmsTxt: number;
  };
  has_llms_txt: boolean;
  has_jsonld: boolean;
  has_salary_data: boolean;
  careers_page_status: string;
  robots_txt_status: string;
}

/* ------------------------------------------------------------------ */
/* Dimension mappings                                                  */
/* ------------------------------------------------------------------ */

/**
 * Maps audit dimensions to human-readable names and max scores.
 */
const DIMENSION_MAP: Record<
  keyof CompanyAudit["score_breakdown"],
  { label: string; maxScore: number }
> = {
  jsonld: { label: "Structured Data", maxScore: 20 },
  robotsTxt: { label: "Bot Access", maxScore: 15 },
  careersPage: { label: "Careers Page Quality", maxScore: 20 },
  brandReputation: { label: "Brand Reputation", maxScore: 15 },
  salaryData: { label: "Salary Transparency", maxScore: 15 },
  contentFormat: { label: "Content Format", maxScore: 10 },
  llmsTxt: { label: "llms.txt File", maxScore: 5 },
};

/* ------------------------------------------------------------------ */
/* Priority calculation                                                */
/* ------------------------------------------------------------------ */

/**
 * Calculate priority based on gap size and implementation effort.
 * Larger gaps + easier fixes = higher priority.
 */
function calculatePriority(
  gap: number,
  maxScore: number,
  effortScore: number,
): "critical" | "high" | "medium" | "low" {
  // Normalize gap to 0-1 scale
  const normalizedGap = gap / maxScore;
  
  // ROI = impact (gap size) / effort
  const roi = normalizedGap / effortScore;
  
  if (roi > 0.8 || normalizedGap > 0.7) return "critical";
  if (roi > 0.5 || normalizedGap > 0.5) return "high";
  if (roi > 0.25 || normalizedGap > 0.3) return "medium";
  return "low";
}

/**
 * Estimate implementation effort (0-1 scale, lower = easier).
 */
function getEffortScore(dimension: keyof CompanyAudit["score_breakdown"]): number {
  const effortMap: Record<keyof CompanyAudit["score_breakdown"], number> = {
    llmsTxt: 0.1, // 5 minutes - create a text file
    jsonld: 0.2, // 30 mins - add structured data
    salaryData: 0.3, // 1-2 hours - publish salary ranges
    robotsTxt: 0.2, // 15 mins - edit robots.txt
    careersPage: 0.6, // 1-2 days - create/improve page
    contentFormat: 0.4, // 2-4 hours - restructure content
    brandReputation: 0.8, // Weeks/months - build reputation
  };
  return effortMap[dimension];
}

/* ------------------------------------------------------------------ */
/* Data fetching                                                       */
/* ------------------------------------------------------------------ */

/**
 * Fetch company audit data from Supabase.
 */
async function getCompanyAudit(slug: string): Promise<CompanyAudit | null> {
  const { data, error } = await untypedTable("public_audits")
    .select(
      "company_name, company_slug, score, score_breakdown, has_llms_txt, has_jsonld, has_salary_data, careers_page_status, robots_txt_status",
    )
    .eq("company_slug", slug)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as CompanyAudit;
}

/* ------------------------------------------------------------------ */
/* Opportunity generation                                              */
/* ------------------------------------------------------------------ */

/**
 * Generate a displacement opportunity for a dimension where competitor wins.
 */
async function generateOpportunity(
  dimension: keyof CompanyAudit["score_breakdown"],
  yourScore: number,
  competitorScore: number,
  companyName: string,
  competitorName: string,
): Promise<DisplacementOpportunity> {
  const gap = competitorScore - yourScore;
  const { label, maxScore } = DIMENSION_MAP[dimension];
  const effortScore = getEffortScore(dimension);
  const priority = calculatePriority(gap, maxScore, effortScore);

  // Generate content brief
  const brief: ContentBrief = await generateContentBrief(
    dimension,
    gap,
    companyName,
    competitorName,
  );

  // AI narrative about current state
  const aiSays = generateAiNarrative(dimension, yourScore, competitorScore, companyName, competitorName);

  return {
    dimension: label,
    currentState: {
      yourScore,
      competitorScore,
      gap,
      aiSays,
    },
    action: {
      priority,
      contentBrief: brief.title,
      targetFormat: brief.placement,
      estimatedImpact: getEstimatedImpact(priority, effortScore),
      exampleContent: brief.template,
      publishTo: brief.placement,
    },
  };
}

/**
 * Generate AI narrative explaining current state.
 */
function generateAiNarrative(
  dimension: keyof CompanyAudit["score_breakdown"],
  yourScore: number,
  competitorScore: number,
  companyName: string,
  competitorName: string,
): string {
  const narratives: Record<keyof CompanyAudit["score_breakdown"], string> = {
    salaryData: yourScore === 0
      ? `AI can cite ${competitorName}'s salary ranges but finds nothing about ${companyName}'s compensation — making ${competitorName} look more transparent.`
      : `${competitorName} publishes more comprehensive salary data than ${companyName}, giving AI more to cite when candidates ask about pay.`,
    
    careersPage: yourScore < 10
      ? `${competitorName} has a structured careers page that AI can easily parse. ${companyName}'s careers content is harder for AI to find or understand.`
      : `${competitorName}'s careers page has richer detail — AI generates longer, more complete answers when asked about their opportunities vs ${companyName}.`,
    
    jsonld: yourScore === 0
      ? `${competitorName} uses structured data (JSON-LD) that AI reads directly. ${companyName} doesn't — so AI has to guess from unstructured HTML.`
      : `${competitorName}'s structured data is more complete, helping AI surface their jobs and company info more accurately.`,
    
    robotsTxt: yourScore < competitorScore
      ? `${competitorName} allows AI bots to crawl freely. ${companyName} blocks or restricts them — limiting what AI knows.`
      : `${competitorName} has fewer bot restrictions, giving AI crawlers more access to their employer content.`,
    
    llmsTxt: yourScore === 0
      ? `${competitorName} has published an llms.txt file explicitly telling AI how to cite them. ${companyName} hasn't — missing an easy visibility win.`
      : `${competitorName} has a more comprehensive llms.txt file, making it easier for AI to cite their employment content accurately.`,
    
    contentFormat: yourScore < competitorScore
      ? `${competitorName}'s content is better formatted for AI parsing — clear sections, bullet lists, semantic HTML. ${companyName}'s is harder to extract.`
      : `${competitorName} structures their content slightly better for machine reading, giving AI cleaner data to cite.`,
    
    brandReputation: yourScore < competitorScore
      ? `AI finds more positive mentions of ${competitorName} as an employer across the web — reviews, articles, discussions. ${companyName} has fewer citations.`
      : `${competitorName} is mentioned more frequently in employer-related contexts online, giving AI more sources to cite when asked about them.`,
  };

  return narratives[dimension];
}

/**
 * Generate estimated impact timeline based on priority and effort.
 */
function getEstimatedImpact(
  priority: "critical" | "high" | "medium" | "low",
  effortScore: number,
): string {
  if (effortScore < 0.3) {
    return "Could shift AI response within 3-7 days";
  }
  if (effortScore < 0.5) {
    return "Expect AI visibility lift in 7-14 days";
  }
  if (effortScore < 0.7) {
    return "Impact visible in AI responses within 2-4 weeks";
  }
  return "Long-term play — builds reputation over 1-3 months";
}

/* ------------------------------------------------------------------ */
/* Main report generation                                              */
/* ------------------------------------------------------------------ */

/**
 * Generate a full displacement report comparing two companies.
 *
 * @param companySlug - Target company slug (the one trying to improve)
 * @param competitorSlug - Competitor company slug (the one to beat)
 * @returns Complete displacement report with actionable opportunities
 *
 * @example
 * ```ts
 * const report = await generateDisplacementReport("revolut", "monzo");
 * console.log(report.quickWins); // Top 3 easiest wins
 * ```
 */
export async function generateDisplacementReport(
  companySlug: string,
  competitorSlug: string,
): Promise<DisplacementReport> {
  // Fetch both companies' audit data
  const [company, competitor] = await Promise.all([
    getCompanyAudit(companySlug),
    getCompanyAudit(competitorSlug),
  ]);

  if (!company || !competitor) {
    throw new Error("One or both companies not found in audit database");
  }

  // Generate opportunities for each dimension where competitor wins
  const opportunities: DisplacementOpportunity[] = [];

  for (const [dimension, { maxScore }] of Object.entries(DIMENSION_MAP)) {
    const key = dimension as keyof CompanyAudit["score_breakdown"];
    const yourScore = (company.score_breakdown[key] as number) ?? 0;
    const competitorScore = (competitor.score_breakdown[key] as number) ?? 0;

    // Only include dimensions where competitor has a meaningful lead
    if (competitorScore > yourScore && competitorScore - yourScore >= 2) {
      const opportunity = await generateOpportunity(
        key,
        yourScore,
        competitorScore,
        company.company_name,
        competitor.company_name,
      );
      opportunities.push(opportunity);
    }
  }

  // Sort by priority (critical > high > medium > low) then by gap size
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  opportunities.sort((a, b) => {
    const priorityDiff = priorityOrder[a.action.priority] - priorityOrder[b.action.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.currentState.gap - a.currentState.gap;
  });

  // Quick wins = top 3 opportunities
  const quickWins = opportunities.slice(0, 3);

  return {
    company: {
      name: company.company_name,
      slug: company.company_slug,
      score: company.score,
    },
    competitor: {
      name: competitor.company_name,
      slug: competitor.company_slug,
      score: competitor.score,
    },
    overallGap: competitor.score - company.score,
    opportunities,
    quickWins,
    generatedAt: new Date().toISOString(),
  };
}
