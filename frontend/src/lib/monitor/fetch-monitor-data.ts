/**
 * @module lib/monitor/fetch-monitor-data
 * Server-side data fetching for the AI Brand Intelligence dashboard.
 * Reads from `monitor_checks` Supabase table, falls back to simulated data.
 */

import {
  collectDataPoints,
  computeScore,
  determineTrend,
  detectChanges,
  generateRecommendations,
  type MonitorCheckResult,
  type CheckDataPoint,
  type MonitorChange,
  type MonitorRecommendation,
} from "@/lib/monitor/reputation-monitor";

// ---------------------------------------------------------------------------
// Extended types for the dashboard
// ---------------------------------------------------------------------------

/** AI model identifiers tracked by the monitoring system. */
export type AIModel = "chatgpt" | "claude" | "perplexity" | "gemini";

/** Readable labels for each AI model. */
export const AI_MODEL_LABELS: Record<AIModel, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  perplexity: "Perplexity",
  gemini: "Gemini",
};

/** Dashboard-specific category labels. */
export const CATEGORY_LABELS: Record<string, string> = {
  salary: "Salary & Compensation",
  culture: "Culture & Values",
  benefits: "Benefits",
  work_policy: "Work Policy",
  reputation: "Reputation",
  interview_process: "Interview Process",
  tech_stack: "Tech Stack",
  career_growth: "Career Growth",
};

/** A single row in the AI Response Tracker — per model, per category. */
export interface TrackerRow {
  category: string;
  categoryLabel: string;
  model: AIModel;
  modelLabel: string;
  aiResponse: string;
  confidence: number;
  sourceAttribution: string;
  matchesVerified: "match" | "mismatch" | "no-data";
  verifiedValue?: string;
}

/** A score snapshot for the sparkline. */
export interface ScoreSnapshot {
  weekLabel: string;
  score: number;
}

/** The full data payload for the Brand Intelligence dashboard. */
export interface BrandIntelligenceData {
  /** Current overall AI visibility score (0-100). */
  score: number;
  /** Previous score for trend calculation. */
  previousScore: number | null;
  /** Trend direction. */
  trend: "improving" | "declining" | "stable";
  /** Score history for sparkline (up to 12 weeks). */
  scoreHistory: ScoreSnapshot[];
  /** Key metrics for the overview cards. */
  metrics: {
    informationGaps: number;
    aiCorrections: number;
    modelsMonitored: number;
    competitorGap: number | null;
  };
  /** AI response tracker rows. */
  trackerRows: TrackerRow[];
  /** Weekly changes feed. */
  changes: MonitorChange[];
  /** Actionable recommendations. */
  recommendations: MonitorRecommendation[];
  /** Last check timestamp. */
  lastCheckedAt: string | null;
  /** Whether this is real data or simulation. */
  isSimulated: boolean;
}

// ---------------------------------------------------------------------------
// Supabase data loading
// ---------------------------------------------------------------------------

interface MonitorCheckRow {
  check_data: CheckDataPoint[];
  score: number;
  previous_score: number | null;
  changes: MonitorChange[];
  created_at: string;
}

/**
 * Loads the most recent monitor checks from Supabase.
 * Returns null if the table doesn't exist or no data found.
 */
async function loadChecksFromSupabase(
  companySlug: string,
  limit: number = 12,
): Promise<MonitorCheckRow[] | null> {
  try {
    const { untypedTable } = await import("@/lib/supabase/untyped-table");

    const { data, error } = await untypedTable("monitor_checks")
      .select("check_data, score, previous_score, changes, created_at")
      .eq("company_slug", companySlug)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data || (data as MonitorCheckRow[]).length === 0) return null;
    return data as MonitorCheckRow[];
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Simulation helpers
// ---------------------------------------------------------------------------

const MODELS: AIModel[] = ["chatgpt", "claude", "perplexity", "gemini"];

const EXPANDED_CATEGORIES = [
  "salary",
  "culture",
  "benefits",
  "work_policy",
  "reputation",
  "interview_process",
  "tech_stack",
  "career_growth",
] as const;

/**
 * Generates simulated tracker rows when no real data exists.
 * Produces varied responses per model to look realistic.
 */
function generateSimulatedTrackerRows(companySlug: string): TrackerRow[] {
  const seed = companySlug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rows: TrackerRow[] = [];

  const responseTemplates: Record<string, Record<AIModel, { response: string; confidence: number; source: string }>> = {
    salary: {
      chatgpt: { response: `£${45 + (seed % 20)}k – £${68 + (seed % 15)}k estimated range`, confidence: 42, source: "glassdoor.co.uk" },
      claude: { response: `Salary data limited. Estimated £${50 + (seed % 15)}k – £${75 + (seed % 12)}k`, confidence: 38, source: "indeed.co.uk" },
      perplexity: { response: `Based on employee reviews, £${48 + (seed % 18)}k – £${70 + (seed % 14)}k`, confidence: 55, source: "glassdoor.co.uk, reddit.com" },
      gemini: { response: `Competitive salary range, typically £${52 + (seed % 16)}k+`, confidence: 35, source: "linkedin.com" },
    },
    culture: {
      chatgpt: { response: "Collaborative team environment with emphasis on innovation", confidence: 60, source: "careers page" },
      claude: { response: "Mixed reviews — some praise flexibility, others note fast pace", confidence: 52, source: "glassdoor.co.uk" },
      perplexity: { response: "Generally positive culture, values transparency and teamwork", confidence: 65, source: "company website" },
      gemini: { response: "Limited data available. Appears to have standard corporate culture", confidence: 30, source: "linkedin.com" },
    },
    benefits: {
      chatgpt: { response: "Standard UK benefits package mentioned", confidence: 35, source: "indeed.co.uk" },
      claude: { response: "No specific benefits data found in available sources", confidence: 20, source: "N/A" },
      perplexity: { response: "Pension scheme and private healthcare reported by employees", confidence: 48, source: "glassdoor.co.uk" },
      gemini: { response: "Benefits information not publicly available", confidence: 15, source: "N/A" },
    },
    work_policy: {
      chatgpt: { response: "Hybrid work model, office 2-3 days per week", confidence: 58, source: "careers page" },
      claude: { response: "Flexible working arrangements available", confidence: 45, source: "job listings" },
      perplexity: { response: "Office-based with some remote flexibility", confidence: 50, source: "indeed.co.uk" },
      gemini: { response: "Hybrid working policy in place", confidence: 55, source: "company website" },
    },
    reputation: {
      chatgpt: { response: "Well-regarded employer in the sector", confidence: 62, source: "multiple sources" },
      claude: { response: "Generally positive reputation, growing brand", confidence: 58, source: "news articles" },
      perplexity: { response: "Established company with good industry standing", confidence: 70, source: "company website, news" },
      gemini: { response: "Limited online presence, appears reputable", confidence: 40, source: "linkedin.com" },
    },
    interview_process: {
      chatgpt: { response: "Multi-stage process: phone screen, technical, culture fit", confidence: 45, source: "glassdoor.co.uk" },
      claude: { response: "No detailed interview process data available", confidence: 15, source: "N/A" },
      perplexity: { response: "Typically 3-4 interview rounds based on role", confidence: 40, source: "glassdoor.co.uk" },
      gemini: { response: "Interview process information not found", confidence: 10, source: "N/A" },
    },
    tech_stack: {
      chatgpt: { response: "Modern tech stack, cloud-native architecture", confidence: 48, source: "job listings" },
      claude: { response: "Uses React, Node.js, and AWS based on job postings", confidence: 55, source: "job listings" },
      perplexity: { response: "TypeScript, React, cloud infrastructure mentioned in roles", confidence: 60, source: "careers page" },
      gemini: { response: "Technology details limited in available data", confidence: 25, source: "N/A" },
    },
    career_growth: {
      chatgpt: { response: "Career progression paths available, learning budget mentioned", confidence: 40, source: "glassdoor.co.uk" },
      claude: { response: "Limited data on career growth opportunities", confidence: 25, source: "N/A" },
      perplexity: { response: "Some employees mention good progression, others less so", confidence: 45, source: "glassdoor.co.uk" },
      gemini: { response: "No specific career growth information found", confidence: 15, source: "N/A" },
    },
  };

  for (const category of EXPANDED_CATEGORIES) {
    for (const model of MODELS) {
      const template = responseTemplates[category]?.[model];
      if (!template) continue;

      const matchesVerified: TrackerRow["matchesVerified"] =
        template.confidence > 55 ? "match" : template.confidence < 30 ? "no-data" : "mismatch";

      rows.push({
        category,
        categoryLabel: CATEGORY_LABELS[category] ?? category,
        model,
        modelLabel: AI_MODEL_LABELS[model],
        aiResponse: template.response,
        confidence: template.confidence,
        sourceAttribution: template.source,
        matchesVerified,
        verifiedValue:
          matchesVerified === "mismatch"
            ? `Your verified data differs from what ${AI_MODEL_LABELS[model]} reports`
            : undefined,
      });
    }
  }

  return rows;
}

/**
 * Generates simulated score history for the sparkline.
 */
function generateSimulatedHistory(currentScore: number, weeks: number = 12): ScoreSnapshot[] {
  const history: ScoreSnapshot[] = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekDate = new Date(now);
    weekDate.setDate(weekDate.getDate() - i * 7);
    const weekLabel = weekDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

    // Gentle upward trend with some noise
    const baseScore = currentScore - (weeks - 1 - i) * 1.5;
    const noise = Math.sin(i * 2.7) * 4;
    const score = Math.round(Math.max(0, Math.min(100, baseScore + noise)));

    history.push({ weekLabel, score });
  }

  return history;
}

/**
 * Generates simulated changes feed.
 */
function generateSimulatedChanges(): MonitorChange[] {
  return [
    {
      category: "salary",
      previousValue: "£45k – £62k estimated",
      currentValue: "£50k – £68k estimated (updated source)",
      direction: "improved",
      summary: "ChatGPT updated salary estimate closer to your verified range",
    },
    {
      category: "culture",
      previousValue: null,
      currentValue: "Collaborative team environment with emphasis on innovation",
      direction: "neutral",
      summary: "Perplexity now cites your careers page for culture data",
    },
    {
      category: "benefits",
      previousValue: "Standard package",
      currentValue: "No specific data found",
      direction: "declined",
      summary: "Claude lost confidence in benefits data — now shows 'no data'",
    },
    {
      category: "work_policy",
      previousValue: "Office-based",
      currentValue: "Hybrid work model, office 2-3 days per week",
      direction: "improved",
      summary: "Gemini corrected work policy from 'office-based' to hybrid",
    },
    {
      category: "interview_process",
      previousValue: null,
      currentValue: "No interview process data found by any model",
      direction: "declined",
      summary: "New gap detected: no AI model has interview process data",
    },
  ];
}

/**
 * Generates simulated recommendations.
 */
function generateSimulatedRecommendations(): MonitorRecommendation[] {
  return [
    {
      title: "Publish verified salary ranges",
      description:
        "3 of 4 AI models are guessing your salary data with low confidence. Add structured salary ranges to your careers page so AI models cite accurate figures instead of Glassdoor estimates.",
      impact: "high",
      category: "salary",
    },
    {
      title: "Add your benefits package",
      description:
        "No AI model has accurate benefits data. List your key benefits (healthcare, pension, learning budget) in structured format on your careers page.",
      impact: "high",
      category: "benefits",
    },
    {
      title: "Document your interview process",
      description:
        "Zero AI models have interview process data. Candidates asking AI 'what is the interview process at [company]?' get nothing. Add a clear breakdown to your careers page.",
      impact: "medium",
      category: "interview_process",
    },
    {
      title: "Strengthen culture narrative",
      description:
        "AI models are pulling culture info from Glassdoor reviews. Publish an authentic culture page with specifics — team rituals, values in action, day-in-the-life content.",
      impact: "medium",
      category: "culture",
    },
    {
      title: "List your tech stack",
      description:
        "Engineers researching your company via AI get vague results. Add your tech stack, development practices, and engineering blog links to improve AI responses.",
      impact: "low",
      category: "tech_stack",
    },
  ];
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Fetches all data needed for the Brand Intelligence dashboard.
 * Uses real Supabase data when available, falls back to realistic simulation.
 *
 * @param companySlug - The company identifier slug (from user profile).
 * @returns Complete dashboard data payload.
 */
export async function fetchBrandIntelligenceData(
  companySlug: string | undefined,
): Promise<BrandIntelligenceData> {
  const slug = companySlug ?? "demo-company";

  // Try loading real data first
  const checks = await loadChecksFromSupabase(slug);

  if (checks && checks.length > 0) {
    // Real data path
    const latest = checks[0];
    const previous = checks[1] ?? null;

    const score = latest.score;
    const previousScore = latest.previous_score ?? previous?.score ?? null;
    const trend = determineTrend(score, previousScore);

    const scoreHistory: ScoreSnapshot[] = checks
      .slice(0, 12)
      .reverse()
      .map((check) => ({
        weekLabel: new Date(check.created_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        }),
        score: check.score,
      }));

    const checkData = latest.check_data ?? [];
    const changes = latest.changes ?? [];
    const recommendations = generateRecommendations(checkData, changes);

    // Count information gaps (categories with confidence < 30)
    const informationGaps = checkData.filter((dp) => dp.confidence < 30).length;
    // Count improvements as "corrections"
    const aiCorrections = changes.filter((c) => c.direction === "improved").length;

    // Build tracker rows from real check data
    const trackerRows: TrackerRow[] = checkData.map((dp) => ({
      category: dp.category,
      categoryLabel: CATEGORY_LABELS[dp.category] ?? dp.category,
      model: (dp.source as AIModel) || "chatgpt",
      modelLabel: AI_MODEL_LABELS[(dp.source as AIModel) || "chatgpt"],
      aiResponse: dp.value,
      confidence: dp.confidence,
      sourceAttribution: dp.source,
      matchesVerified: dp.confidence > 60 ? "match" : dp.confidence < 30 ? "no-data" : "mismatch",
    }));

    return {
      score,
      previousScore,
      trend,
      scoreHistory,
      metrics: {
        informationGaps,
        aiCorrections,
        modelsMonitored: 4,
        competitorGap: null,
      },
      trackerRows,
      changes,
      recommendations,
      lastCheckedAt: latest.created_at,
      isSimulated: false,
    };
  }

  // Simulation fallback
  const dataPoints = collectDataPoints(slug);
  const score = computeScore(dataPoints);
  const scoreHistory = generateSimulatedHistory(score);
  const trackerRows = generateSimulatedTrackerRows(slug);
  const changes = generateSimulatedChanges();
  const recommendations = generateSimulatedRecommendations();

  const informationGaps = trackerRows.filter((r) => r.matchesVerified === "no-data").length;

  return {
    score,
    previousScore: score - 3,
    trend: "improving",
    scoreHistory,
    metrics: {
      informationGaps,
      aiCorrections: 3,
      modelsMonitored: 4,
      competitorGap: -12,
    },
    trackerRows,
    changes,
    recommendations,
    lastCheckedAt: null,
    isSimulated: true,
  };
}
