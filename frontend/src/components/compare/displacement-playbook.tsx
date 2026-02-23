/**
 * @module components/compare/displacement-playbook
 * Client component displaying actionable displacement opportunities.
 *
 * Shows employers exactly what content to publish to beat competitors
 * in AI visibility. Expandable cards with full content briefs.
 */

"use client";

import { useState } from "react";
import { Zap, ChevronDown, ChevronUp, Lock, Trophy, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DisplacementOpportunity } from "@/lib/compare/displacement";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface DisplacementPlaybookProps {
  opportunities: DisplacementOpportunity[];
  quickWins: DisplacementOpportunity[];
  isFreeTier?: boolean;
  companyName: string;
  competitorName: string;
}

interface OpportunityCardProps {
  opportunity: DisplacementOpportunity;
  isQuickWin: boolean;
  isLocked?: boolean;
  index: number;
}

/* ------------------------------------------------------------------ */
/* Opportunity Card Component                                          */
/* ------------------------------------------------------------------ */

function OpportunityCard({ opportunity, isQuickWin, isLocked, index }: OpportunityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityColors = {
    critical: "bg-red-50 border-red-200 text-red-700",
    high: "bg-orange-50 border-orange-200 text-orange-700",
    medium: "bg-amber-50 border-amber-200 text-amber-700",
    low: "bg-slate-50 border-slate-200 text-slate-600",
  };

  const priorityBadgeColors = {
    critical: "error" as const,
    high: "warning" as const,
    medium: "warning" as const,
    low: "neutral" as const,
  };

  if (isLocked) {
    return (
      <div className="relative rounded-2xl border border-slate-200 bg-white p-6 opacity-60">
        {/* Blur overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-white/40 rounded-2xl flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">
              Unlock full displacement report
            </p>
            <a
              href="#upgrade"
              className="text-sm text-teal-600 hover:text-teal-700 underline mt-1 inline-block"
            >
              Upgrade to Growth →
            </a>
          </div>
        </div>

        {/* Blurred content preview */}
        <div className="filter blur-sm pointer-events-none">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">{opportunity.dimension}</h3>
              <p className="text-sm text-slate-500 mt-1">
                Gap: {opportunity.currentState.gap} points
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border bg-white transition-all duration-200 ${
        isExpanded ? "shadow-elevated" : "shadow-card hover:shadow-card-hover"
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isQuickWin && (
                <span className="flex items-center gap-1 rounded-full bg-teal-500 px-2 py-0.5 text-xs font-semibold text-white">
                  <Zap className="h-3 w-3" />
                  Quick Win
                </span>
              )}
              <Badge variant={priorityBadgeColors[opportunity.action.priority]}>
                {opportunity.action.priority.toUpperCase()}
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {opportunity.dimension}
            </h3>
            <p className="text-sm text-slate-600 mb-3">{opportunity.action.contentBrief}</p>

            {/* Gap visual */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Your score:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {opportunity.currentState.yourScore}
                </span>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Competitor:</span>
                <span className="font-bold text-teal-600 tabular-nums">
                  {opportunity.currentState.competitorScore}
                </span>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Gap:</span>
                <span className="font-bold text-red-600 tabular-nums">
                  -{opportunity.currentState.gap}
                </span>
              </div>
            </div>
          </div>

          <div className="ml-4 flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-slate-100 p-6 pt-5 bg-slate-50/50">
          {/* AI says section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">
              What AI Currently Says
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {opportunity.currentState.aiSays}
            </p>
          </div>

          {/* Action details */}
          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Format</h4>
              <p className="text-sm text-slate-600">{opportunity.action.targetFormat}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Timeline</h4>
              <p className="text-sm text-slate-600">{opportunity.action.estimatedImpact}</p>
            </div>
          </div>

          {/* Example content */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-teal-600">📝</span>
              Ready-to-Publish Template
            </h4>
            <div className="prose prose-sm max-w-none">
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-x-auto">
                {opportunity.action.exampleContent}
              </div>
            </div>
          </div>

          {/* Publish to */}
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-900">Publish to:</span>
            <span className="text-slate-600">{opportunity.action.publishTo}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Playbook Component                                             */
/* ------------------------------------------------------------------ */

export function DisplacementPlaybook({
  opportunities,
  quickWins,
  isFreeTier = false,
  companyName,
  competitorName,
}: DisplacementPlaybookProps) {
  const displayOpportunities = isFreeTier ? opportunities.slice(0, 2) : opportunities;
  const lockedCount = isFreeTier ? Math.max(0, opportunities.length - 2) : 0;

  if (opportunities.length === 0) {
    return (
      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <Trophy className="h-12 w-12 text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">You're Already Winning</h2>
          <p className="text-slate-600">
            {companyName} scores equal or higher than {competitorName} across all dimensions. No
            displacement opportunities found.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-14">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5 text-brand-accent" />
          <h2 className="text-2xl font-bold text-slate-900">Displacement Playbook</h2>
        </div>
        <p className="text-slate-600 text-lg">
          {competitorName} is beating {companyName} in {opportunities.length}{" "}
          {opportunities.length === 1 ? "area" : "areas"}. Here's exactly what to publish to close
          the gap and win in AI responses.
        </p>
      </div>

      {/* Quick wins callout */}
      {quickWins.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 p-6 mb-8">
          <div className="flex items-start gap-3">
            <Zap className="h-6 w-6 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-teal-900 mb-1">
                Start with Quick Wins
              </h3>
              <p className="text-sm text-teal-700">
                These {quickWins.length} opportunities have the highest ROI — biggest impact for
                least effort. Tackle them first to see results within 7-14 days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Opportunity cards */}
      <div className="space-y-4">
        {displayOpportunities.map((opportunity, index) => (
          <OpportunityCard
            key={`${opportunity.dimension}-${index}`}
            opportunity={opportunity}
            isQuickWin={quickWins.some((qw) => qw.dimension === opportunity.dimension)}
            index={index}
          />
        ))}

        {/* Locked cards for free tier */}
        {isFreeTier &&
          lockedCount > 0 &&
          Array.from({ length: Math.min(lockedCount, 3) }).map((_, index) => (
            <OpportunityCard
              key={`locked-${index}`}
              opportunity={opportunities[displayOpportunities.length + index]!}
              isQuickWin={false}
              isLocked={true}
              index={displayOpportunities.length + index}
            />
          ))}
      </div>

      {/* Upgrade CTA for free tier */}
      {isFreeTier && lockedCount > 0 && (
        <div
          id="upgrade"
          className="mt-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-3">
            Unlock {lockedCount} More {lockedCount === 1 ? "Opportunity" : "Opportunities"}
          </h3>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Get the full displacement report with content briefs, templates, and step-by-step
            guidance to beat {competitorName} across all dimensions.
          </p>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-base font-semibold text-white hover:bg-teal-400 transition-colors"
          >
            Upgrade to Growth Plan
            <ArrowRight className="h-4 w-4" />
          </a>
          <p className="text-sm text-slate-400 mt-4">
            One-time payment · Full displacement reports · Priority support
          </p>
        </div>
      )}
    </section>
  );
}
