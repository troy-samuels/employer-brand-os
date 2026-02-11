/**
 * @module components/audit/source-gap-matrix
 * Responsive matrix view for category-level source coverage gaps.
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  DollarSign,
  Download,
  Gift,
  House,
  Star,
  Swords,
  TrendingUp,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import type { GapAnalysis, GapAnalysisRow, GapImpactLevel, GapStatus } from "@/lib/citation-chain/gap-analysis";
import { PROMPT_CATEGORIES } from "@/lib/citation-chain/prompts";
import type { PromptCategoryId } from "@/lib/citation-chain/types";
import { cn } from "@/lib/utils";

/**
 * Props for the source gap matrix component.
 */
export interface SourceGapMatrixProps {
  /** Precomputed gap analysis rows from `analyseGaps`. */
  analysis: GapAnalysis;
  /** Optional extra class names for outer wrapper styling. */
  className?: string;
}

const CATEGORY_LABELS: Record<PromptCategoryId, string> = PROMPT_CATEGORIES.reduce(
  (accumulator, category) => ({
    ...accumulator,
    [category.id]: category.label,
  }),
  {
    salary: "Salary",
    culture: "Culture",
    benefits: "Benefits",
    remote_policy: "Remote Policy",
    interview: "Interview",
    competitors: "Competitors",
    reviews: "Reviews",
    growth: "Growth",
  } satisfies Record<PromptCategoryId, string>
);

const CATEGORY_ICONS: Record<PromptCategoryId, LucideIcon> = {
  salary: DollarSign,
  culture: Users,
  benefits: Gift,
  remote_policy: House,
  interview: ClipboardCheck,
  competitors: Swords,
  reviews: Star,
  growth: TrendingUp,
};

const IMPACT_PRIORITY: Record<GapImpactLevel, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const STATUS_PRIORITY: Record<GapStatus, number> = {
  red: 0,
  amber: 1,
  green: 2,
};

const CATEGORY_ORDER: Record<PromptCategoryId, number> = {
  salary: 0,
  culture: 1,
  benefits: 2,
  remote_policy: 3,
  interview: 4,
  competitors: 5,
  reviews: 6,
  growth: 7,
};

/**
 * Render the source gap matrix as a desktop grid and a mobile card list.
 */
export function SourceGapMatrix({ analysis, className }: SourceGapMatrixProps) {
  const [expandedRows, setExpandedRows] = useState<Record<PromptCategoryId, boolean>>({
    salary: false,
    culture: false,
    benefits: false,
    remote_policy: false,
    interview: false,
    competitors: false,
    reviews: false,
    growth: false,
  });

  const rows = useMemo(
    () => analysis.rows.slice().sort(sortRowsByPriority),
    [analysis.rows]
  );

  const handleExportClick = () => {
    toast("Coming soon", {
      description: "PDF export for the Source Gap Matrix will be available in a future release.",
    });
  };

  const toggleRow = (category: PromptCategoryId) => {
    setExpandedRows((current) => ({
      ...current,
      [category]: !current[category],
    }));
  };

  return (
    <Card variant="bordered" padding="none" className={cn("overflow-hidden", className)}>
      <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-950">Source Gap Matrix</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Where AI sources employer information for each category.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExportClick}>
          <Download className="h-4 w-4" aria-hidden />
          Download as PDF
        </Button>
      </div>

      <div className="hidden md:block">
        <div className="grid grid-cols-[1.8fr_0.8fr_1.4fr_1.4fr_1fr_0.45fr] border-b border-gray-200 bg-neutral-50/80 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <span>Category</span>
          <span>Status</span>
          <span>Top Google Domains</span>
          <span>AI-Cited Domains</span>
          <span>Company Presence</span>
          <span className="text-right">Details</span>
        </div>

        {rows.map((row) => {
          const isExpanded = expandedRows[row.category];
          return (
            <div
              key={row.category}
              className={cn("border-b border-gray-200 last:border-b-0", getRowTintClass(row.status))}
            >
              <button
                type="button"
                onClick={() => toggleRow(row.category)}
                className="grid w-full grid-cols-[1.8fr_0.8fr_1.4fr_1.4fr_1fr_0.45fr] items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-black/[0.02]"
                aria-expanded={isExpanded}
                aria-controls={`matrix-row-details-${row.category}`}
              >
                <CategoryCell category={row.category} impact={row.impactLevel} />
                <StatusCell status={row.status} />
                <DomainPills domains={row.googleTopDomains} emptyText="No Google data" />
                <DomainPills domains={row.aiCitedDomains} emptyText="No AI citations" />
                <CompanyPresenceCell row={row} />
                <div className="flex justify-end">
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-neutral-500 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                    aria-hidden
                  />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    id={`matrix-row-details-${row.category}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <RowDetails row={row} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {rows.map((row) => {
          const isExpanded = expandedRows[row.category];
          return (
            <article
              key={row.category}
              className={cn(
                "overflow-hidden rounded-xl border border-gray-200",
                getRowTintClass(row.status)
              )}
            >
              <button
                type="button"
                onClick={() => toggleRow(row.category)}
                className="w-full p-4 text-left"
                aria-expanded={isExpanded}
                aria-controls={`matrix-card-details-${row.category}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <CategoryCell category={row.category} impact={row.impactLevel} />
                  <ChevronDown
                    className={cn(
                      "mt-0.5 h-4 w-4 text-neutral-500 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                    aria-hidden
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <StatusCell status={row.status} />
                  <CompanyPresenceCell row={row} compact />
                </div>

                <div className="mt-3 space-y-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                      Top Google Domains
                    </p>
                    <DomainPills domains={row.googleTopDomains} emptyText="No Google data" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                      AI-Cited Domains
                    </p>
                    <DomainPills domains={row.aiCitedDomains} emptyText="No AI citations" />
                  </div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    id={`matrix-card-details-${row.category}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="overflow-hidden border-t border-gray-200"
                  >
                    <RowDetails row={row} />
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          );
        })}
      </div>
    </Card>
  );
}

function CategoryCell({
  category,
  impact,
}: {
  category: PromptCategoryId;
  impact: GapImpactLevel;
}) {
  const Icon = CATEGORY_ICONS[category];

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/70 text-neutral-700 ring-1 ring-gray-200">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-neutral-950">
          {CATEGORY_LABELS[category]}
        </p>
        <p className="text-xs capitalize text-neutral-500">{impact} impact</p>
      </div>
    </div>
  );
}

function StatusCell({ status }: { status: GapStatus }) {
  const label = status === "red" ? "Not cited" : status === "amber" ? "1 model cited" : "2+ models cited";

  return (
    <div className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-700">
      <span className={cn("inline-block h-2.5 w-2.5 rounded-full", getStatusDotClass(status))} />
      <span>{label}</span>
    </div>
  );
}

function DomainPills({
  domains,
  emptyText,
}: {
  domains: string[];
  emptyText: string;
}) {
  if (domains.length === 0) {
    return <span className="text-xs text-neutral-500">{emptyText}</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {domains.map((domain) => (
        <span
          key={domain}
          className="inline-flex rounded-full border border-gray-200 bg-white/80 px-2.5 py-1 text-xs font-medium text-neutral-700"
        >
          {domain}
        </span>
      ))}
    </div>
  );
}

function CompanyPresenceCell({
  row,
  compact = false,
}: {
  row: GapAnalysisRow;
  compact?: boolean;
}) {
  if (row.companyAppears) {
    return (
      <div className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-status-verified", compact && "text-[11px]")}>
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        <span>
          Present
          {row.companyGooglePosition !== null && ` (Google #${row.companyGooglePosition})`}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-status-critical", compact && "text-[11px]")}>
      <XCircle className="h-4 w-4" aria-hidden />
      <span>Missing</span>
    </div>
  );
}

function RowDetails({ row }: { row: GapAnalysisRow }) {
  return (
    <div className="grid gap-5 bg-white/80 px-4 py-4 md:grid-cols-2 md:px-5">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Google Results
        </h4>
        {row.googleResults.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">No Google result snapshot available for this category.</p>
        ) : (
          <ul className="mt-2 space-y-2.5">
            {row.googleResults.map((result) => (
              <li key={`${result.position}-${result.url}`} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                <p className="text-xs font-semibold text-neutral-700">
                  #{result.position} · {result.domain || extractDomain(result.url)}
                </p>
                <p className="mt-1 text-sm font-medium text-neutral-900">{result.title}</p>
                {result.snippet && (
                  <p className="mt-1 text-xs text-neutral-600">{result.snippet}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          AI Citations
        </h4>
        {row.aiCitationDetails.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">No model responses were captured for this category.</p>
        ) : (
          <ul className="mt-2 space-y-2.5">
            {row.aiCitationDetails.map((detail) => (
              <li key={detail.modelId} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  {detail.modelId}
                </p>
                {detail.citations.length === 0 ? (
                  <p className="mt-1 text-xs text-neutral-500">No citations returned.</p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {detail.citations.map((citation) => (
                      <li key={`${detail.modelId}-${citation}`} className="text-xs text-neutral-700">
                        {extractDomain(citation)}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-3 md:col-span-2">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-neutral-500" aria-hidden />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Recommended Action
            </p>
            <p className="mt-1 text-sm text-neutral-700">{row.recommendedAction}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function sortRowsByPriority(left: GapAnalysisRow, right: GapAnalysisRow): number {
  const impactDiff = IMPACT_PRIORITY[left.impactLevel] - IMPACT_PRIORITY[right.impactLevel];
  if (impactDiff !== 0) {
    return impactDiff;
  }

  const statusDiff = STATUS_PRIORITY[left.status] - STATUS_PRIORITY[right.status];
  if (statusDiff !== 0) {
    return statusDiff;
  }

  return CATEGORY_ORDER[left.category] - CATEGORY_ORDER[right.category];
}

function getRowTintClass(status: GapStatus): string {
  if (status === "red") {
    return "bg-status-critical-light/50";
  }
  if (status === "green") {
    return "bg-status-verified-light/50";
  }
  return "bg-transparent";
}

function getStatusDotClass(status: GapStatus): string {
  if (status === "red") {
    return "bg-status-critical";
  }
  if (status === "amber") {
    return "bg-status-warning";
  }
  return "bg-status-verified";
}

function extractDomain(value: string): string {
  try {
    const url = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return value;
  }
}
