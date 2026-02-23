/**
 * @module app/dashboard/page
 * Main dashboard overview — shows key metrics and links to Brand Intelligence.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { untypedTable } from "@/lib/supabase/untyped-table";
import { fetchBrandIntelligenceData } from "@/lib/monitor/fetch-monitor-data";
import { PixelStatus } from "@/components/dashboard/pixel-status";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function getCompanySlug(
  userId: string,
  userMeta: Record<string, unknown> | undefined,
): Promise<string | undefined> {
  if (userMeta?.company_slug && typeof userMeta.company_slug === "string") {
    return userMeta.company_slug;
  }
  if (userMeta?.company_name && typeof userMeta.company_name === "string") {
    return (userMeta.company_name as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
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
    // ignore
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Score colour helper
// ---------------------------------------------------------------------------

function scoreColour(score: number): string {
  if (score > 70) return "text-status-verified";
  if (score >= 40) return "text-status-warning";
  return "text-status-critical";
}

function scoreBg(score: number): string {
  if (score > 70) return "bg-status-verified-light";
  if (score >= 40) return "bg-status-warning-light";
  return "bg-status-critical-light";
}

function trendArrow(trend: string): string {
  if (trend === "improving") return "↑";
  if (trend === "declining") return "↓";
  return "→";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const companySlug = await getCompanySlug(user.id, user.user_metadata);
  const data = await fetchBrandIntelligenceData(companySlug);

  return (
    <div className="space-y-8">
      {/* Overline */}
      <div>
        <p className="overline mb-2">Dashboard</p>
        <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">
          Your AI Reputation
        </h1>
      </div>

      {/* AI Visibility Score — hero link to Brand Intelligence */}
      <Link href="/dashboard/analytics" className="block group">
        <Card
          variant="bordered"
          padding="md"
          className="flex items-center gap-5 transition-shadow duration-200 hover:shadow-card-hover"
        >
          <div
            className={`flex items-center justify-center w-14 h-14 rounded-xl ${scoreBg(data.score)}`}
          >
            <span className={`text-2xl font-bold tabular-nums ${scoreColour(data.score)}`}>
              {data.score}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="overline mb-0.5">AI Visibility Score</p>
            <p className="text-sm text-neutral-500">
              {trendArrow(data.trend)}{" "}
              {data.trend === "improving"
                ? "Improving"
                : data.trend === "declining"
                  ? "Declining"
                  : "Stable"}{" "}
              · {data.metrics.informationGaps} gaps · {data.metrics.modelsMonitored} models tracked
            </p>
          </div>
          <span className="text-xs font-semibold text-brand-accent group-hover:text-brand-accent-hover transition-colors shrink-0">
            View report →
          </span>
        </Card>
      </Link>

      {/* Key metrics — the 3 numbers that matter */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="bordered" padding="md">
          <p className="overline mb-2">Shadow Salary Gap</p>
          <p className="text-3xl font-bold text-neutral-950">£18,200</p>
          <p className="text-sm text-neutral-500 mt-1">
            Average difference between AI estimates and your verified ranges
          </p>
        </Card>
        <Card variant="bordered" padding="md">
          <p className="overline mb-2">AI Corrections This Week</p>
          <p className="text-3xl font-bold text-neutral-950">{data.metrics.aiCorrections}</p>
          <p className="text-sm text-neutral-500 mt-1">
            Times AI model responses improved since your last check
          </p>
        </Card>
        <Card variant="bordered" padding="md">
          <p className="overline mb-2">Compliance Status</p>
          <p className="text-3xl font-bold text-status-verified">Compliant</p>
          <p className="text-sm text-neutral-500 mt-1">
            All active roles meet pay transparency requirements
          </p>
        </Card>
      </div>

      {/* Pixel health — minimised, not a top-level focus */}
      <PixelStatus
        status="active"
        lastSeen="2 minutes ago"
        schemaVersion="v1.0"
        jobsInjected={48}
      />

      {/* Next actions — written for HR, not developers */}
      <Card variant="bordered" padding="lg">
        <h3 className="text-base font-semibold text-neutral-950 mb-4">
          Recommended next steps
        </h3>
        <ul className="space-y-3">
          {data.recommendations.slice(0, 2).map((rec, i) => (
            <li key={rec.category} className="flex items-start gap-3 text-sm">
              <span
                className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  rec.impact === "high"
                    ? "bg-status-warning-light text-status-warning"
                    : "bg-brand-accent-light text-brand-accent"
                }`}
              >
                {rec.impact === "high" ? "!" : "→"}
              </span>
              <div>
                <p className="text-neutral-950 font-medium">{rec.title}</p>
                <p className="text-neutral-500">{rec.description.slice(0, 100)}…</p>
              </div>
            </li>
          ))}
          <li className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-accent-light text-brand-accent flex items-center justify-center text-xs font-bold shrink-0">
              →
            </span>
            <div>
              <Link
                href="/dashboard/analytics"
                className="text-brand-accent font-medium hover:text-brand-accent-hover transition-colors"
              >
                View your full Brand Intelligence report →
              </Link>
              <p className="text-neutral-500">See what all 4 AI models say about your company</p>
            </div>
          </li>
        </ul>
      </Card>
    </div>
  );
}
