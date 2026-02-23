/**
 * @module app/dashboard/analytics/page
 * AI Brand Intelligence Dashboard — the core product page.
 * Server component that fetches monitoring data and renders the full dashboard.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { untypedTable } from "@/lib/supabase/untyped-table";
import { fetchBrandIntelligenceData } from "@/lib/monitor/fetch-monitor-data";
import type { PlanTier } from "@/components/dashboard/dashboard-shell";

import {
  ScoreHero,
  MetricsRow,
  ResponseTracker,
  ChangesFeed,
  RecommendationsPanel,
  CompetitorSnapshot,
  CompetitorSnapshotLocked,
  BrandIntelligenceEmptyState,
} from "@/components/dashboard/brand-intelligence";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Data fetching helpers (duplicated from layout to keep page independent)
// ---------------------------------------------------------------------------

async function getUserPlan(userId: string): Promise<PlanTier> {
  try {
    const { data, error } = await untypedTable("subscriptions")
      .select("plan_name, status")
      .eq("user_id", userId)
      .in("status", ["active", "trialing"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return "free";
    const plan = (data as { plan_name: string }).plan_name;
    const validPlans: PlanTier[] = [
      "free", "pro", "enterprise", "starter", "growth", "scale",
      "control", "compete", "command",
    ];
    return validPlans.includes(plan as PlanTier) ? (plan as PlanTier) : "free";
  } catch {
    return "free";
  }
}

async function getCompanySlug(
  userId: string,
  userMeta: Record<string, unknown> | undefined,
): Promise<string | undefined> {
  // Check auth metadata first
  if (userMeta?.company_slug && typeof userMeta.company_slug === "string") {
    return userMeta.company_slug;
  }
  if (userMeta?.company_name && typeof userMeta.company_name === "string") {
    return (userMeta.company_name as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  // Fallback: check profiles table
  try {
    const { data } = await untypedTable("profiles")
      .select("company_name, company_slug")
      .eq("id", userId)
      .single();

    if (data) {
      const row = data as { company_name?: string; company_slug?: string };
      if (row.company_slug) return row.company_slug;
      if (row.company_name) {
        return row.company_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }
    }
  } catch {
    // profiles table may not exist
  }

  return undefined;
}

async function getCompanyName(
  userId: string,
  userMeta: Record<string, unknown> | undefined,
): Promise<string | undefined> {
  if (userMeta?.company_name && typeof userMeta.company_name === "string") {
    return userMeta.company_name;
  }
  try {
    const { data } = await untypedTable("profiles")
      .select("company_name")
      .eq("id", userId)
      .single();
    if (data && (data as { company_name: string }).company_name) {
      return (data as { company_name: string }).company_name;
    }
  } catch {
    // ignore
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Plan checks
// ---------------------------------------------------------------------------

/** Plans that include competitor benchmarking. */
const COMPETITOR_PLANS: PlanTier[] = ["compete", "command", "enterprise", "scale"];

function hasCompetitorAccess(plan: PlanTier): boolean {
  return COMPETITOR_PLANS.includes(plan);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/analytics");
  }

  const [plan, companySlug, companyName] = await Promise.all([
    getUserPlan(user.id),
    getCompanySlug(user.id, user.user_metadata),
    getCompanyName(user.id, user.user_metadata),
  ]);

  // Fetch dashboard data
  const data = await fetchBrandIntelligenceData(companySlug);

  // Show empty state if no company set up and no data
  if (!companySlug && data.isSimulated) {
    // Still show the dashboard with simulated data — it's a better preview
    // than an empty state for users who just signed up
  }

  const showCompetitor = hasCompetitorAccess(plan);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <p className="overline mb-2">Brand Intelligence</p>
        <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">
          AI Brand Intelligence
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Monitor how AI models represent{" "}
          {companyName ? (
            <span className="font-medium text-neutral-700">{companyName}</span>
          ) : (
            "your company"
          )}{" "}
          to candidates
        </p>
      </div>

      {/* 1. Score Hero — AI Visibility Score with sparkline */}
      <ScoreHero
        score={data.score}
        previousScore={data.previousScore}
        trend={data.trend}
        scoreHistory={data.scoreHistory}
        lastCheckedAt={data.lastCheckedAt}
        isSimulated={data.isSimulated}
      />

      {/* 2. Key Metrics Row */}
      <MetricsRow
        informationGaps={data.metrics.informationGaps}
        aiCorrections={data.metrics.aiCorrections}
        modelsMonitored={data.metrics.modelsMonitored}
        competitorGap={data.metrics.competitorGap}
        showCompetitor={showCompetitor}
      />

      {/* 3. AI Response Tracker */}
      <ResponseTracker rows={data.trackerRows} />

      {/* 4 + 5: Changes + Recommendations side by side on desktop */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Changes Feed */}
        <ChangesFeed changes={data.changes} />

        {/* Recommendations Panel */}
        <RecommendationsPanel recommendations={data.recommendations} />
      </div>

      {/* 6. Competitor Snapshot — gated */}
      {showCompetitor ? (
        <CompetitorSnapshot
          userScore={data.score}
          companyName={companyName}
        />
      ) : (
        <CompetitorSnapshotLocked />
      )}
    </div>
  );
}
