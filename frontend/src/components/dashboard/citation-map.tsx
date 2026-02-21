/**
 * @module components/dashboard/citation-map
 * Citation tracking dashboard — shows which sources AI models cite
 * when answering questions about the employer, highlighting controlled
 * vs uncontrolled sources.
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowRight, ExternalLink } from "lucide-react";

import type {
  CitationSource,
  CompanyCitationReport,
  ModelCitation,
} from "@/types/citations";

/* ------------------------------------------------------------------ */
/* Model display config                                                */
/* ------------------------------------------------------------------ */

const MODEL_META: Record<
  ModelCitation["modelId"],
  { label: string; logo: string }
> = {
  chatgpt: { label: "ChatGPT", logo: "/logos/chatgpt.svg" },
  "google-ai": { label: "Google AI", logo: "/logos/google-ai.svg" },
  perplexity: { label: "Perplexity", logo: "/logos/perplexity.svg" },
  copilot: { label: "Copilot", logo: "/logos/copilot.svg" },
  claude: { label: "Claude", logo: "/logos/claude.svg" },
  "meta-ai": { label: "Meta AI", logo: "/logos/meta-ai.svg" },
};

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const CAREERS_SOURCE: CitationSource = {
  url: "https://careers.meridiantech.com",
  domain: "careers.meridiantech.com",
  title: "Meridian Tech — Careers",
  type: "employer-controlled",
  frequency: 14,
  lastSeen: "2025-01-18T09:00:00Z",
};

const MAIN_SITE_SOURCE: CitationSource = {
  url: "https://meridiantech.com/about",
  domain: "meridiantech.com",
  title: "About Meridian Tech",
  type: "employer-controlled",
  frequency: 11,
  lastSeen: "2025-01-18T09:00:00Z",
};

const REDDIT_SOURCE: CitationSource = {
  url: "https://reddit.com/r/ukjobs/comments/abc123/meridian_tech_reviews",
  domain: "reddit.com",
  title: "r/ukjobs — Meridian Tech Reviews",
  type: "forum",
  frequency: 18,
  lastSeen: "2025-01-17T14:30:00Z",
};

const GLASSDOOR_SOURCE: CitationSource = {
  url: "https://glassdoor.co.uk/Reviews/Meridian-Tech",
  domain: "glassdoor.co.uk",
  title: "Meridian Tech Reviews — Glassdoor",
  type: "review-platform",
  frequency: 15,
  lastSeen: "2025-01-18T08:00:00Z",
};

const WIKIPEDIA_SOURCE: CitationSource = {
  url: "https://en.wikipedia.org/wiki/Meridian_Tech",
  domain: "wikipedia.org",
  title: "Meridian Tech — Wikipedia",
  type: "wiki",
  frequency: 9,
  lastSeen: "2025-01-16T11:00:00Z",
};

const LINKEDIN_SOURCE: CitationSource = {
  url: "https://linkedin.com/company/meridian-tech",
  domain: "linkedin.com",
  title: "Meridian Tech — LinkedIn",
  type: "social-media",
  frequency: 7,
  lastSeen: "2025-01-17T16:00:00Z",
};

const TECHCRUNCH_SOURCE: CitationSource = {
  url: "https://techcrunch.com/2024/11/meridian-tech-series-b",
  domain: "techcrunch.com",
  title: "Meridian Tech Raises Series B — TechCrunch",
  type: "news",
  frequency: 4,
  lastSeen: "2025-01-15T10:00:00Z",
};

const INDEED_SOURCE: CitationSource = {
  url: "https://indeed.co.uk/cmp/Meridian-Tech/reviews",
  domain: "indeed.co.uk",
  title: "Meridian Tech Reviews — Indeed",
  type: "review-platform",
  frequency: 6,
  lastSeen: "2025-01-17T09:00:00Z",
};

const ALL_SOURCES: CitationSource[] = [
  REDDIT_SOURCE,
  GLASSDOOR_SOURCE,
  CAREERS_SOURCE,
  MAIN_SITE_SOURCE,
  WIKIPEDIA_SOURCE,
  LINKEDIN_SOURCE,
  INDEED_SOURCE,
  TECHCRUNCH_SOURCE,
];

const MOCK_REPORT: CompanyCitationReport = {
  companyDomain: "meridiantech.com",
  companyName: "Meridian Tech",
  modelCitations: [
    {
      modelId: "chatgpt",
      citations: [REDDIT_SOURCE, GLASSDOOR_SOURCE, CAREERS_SOURCE, WIKIPEDIA_SOURCE],
      totalCitations: 4,
      employerControlledPct: 25,
      topSource: REDDIT_SOURCE,
    },
    {
      modelId: "google-ai",
      citations: [CAREERS_SOURCE, GLASSDOOR_SOURCE, LINKEDIN_SOURCE, MAIN_SITE_SOURCE],
      totalCitations: 4,
      employerControlledPct: 50,
      topSource: CAREERS_SOURCE,
    },
    {
      modelId: "perplexity",
      citations: [REDDIT_SOURCE, WIKIPEDIA_SOURCE, TECHCRUNCH_SOURCE, GLASSDOOR_SOURCE, CAREERS_SOURCE],
      totalCitations: 5,
      employerControlledPct: 20,
      topSource: REDDIT_SOURCE,
    },
    {
      modelId: "copilot",
      citations: [GLASSDOOR_SOURCE, CAREERS_SOURCE, INDEED_SOURCE],
      totalCitations: 3,
      employerControlledPct: 33,
      topSource: GLASSDOOR_SOURCE,
    },
    {
      modelId: "claude",
      citations: [CAREERS_SOURCE, MAIN_SITE_SOURCE, GLASSDOOR_SOURCE, REDDIT_SOURCE],
      totalCitations: 4,
      employerControlledPct: 50,
      topSource: CAREERS_SOURCE,
    },
    {
      modelId: "meta-ai",
      citations: [REDDIT_SOURCE, LINKEDIN_SOURCE, WIKIPEDIA_SOURCE],
      totalCitations: 3,
      employerControlledPct: 0,
      topSource: REDDIT_SOURCE,
    },
  ],
  allSources: ALL_SOURCES,
  employerControlledPct: 30,
  topUncontrolledSource: REDDIT_SOURCE,
  generatedAt: "2025-01-18T10:00:00Z",
};

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function TypeBadge({ type }: { type: CitationSource["type"] }) {
  const config: Record<CitationSource["type"], { label: string; className: string }> = {
    "employer-controlled": {
      label: "Controlled",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    "review-platform": {
      label: "Review",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    "social-media": {
      label: "Social",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    news: {
      label: "News",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    wiki: {
      label: "Wiki",
      className: "bg-red-50 text-red-700 border-red-200",
    },
    forum: {
      label: "Forum",
      className: "bg-red-50 text-red-700 border-red-200",
    },
    other: {
      label: "Other",
      className: "bg-neutral-50 text-neutral-600 border-neutral-200",
    },
  };

  const c = config[type];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${c.className}`}
    >
      {c.label}
    </span>
  );
}

function ProgressRing({
  percentage,
  size = 40,
  strokeWidth = 3,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e5e5"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={percentage >= 50 ? "#10b981" : percentage >= 25 ? "#f59e0b" : "#ef4444"}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[10px] font-bold fill-neutral-950"
      >
        {percentage}%
      </text>
    </svg>
  );
}

function sourceColor(type: CitationSource["type"]): string {
  if (type === "employer-controlled") return "border-l-emerald-500";
  if (type === "review-platform" || type === "social-media") return "border-l-amber-500";
  return "border-l-red-500";
}

/* ------------------------------------------------------------------ */
/* Model citation card                                                 */
/* ------------------------------------------------------------------ */

function ModelCitationCard({ mc }: { mc: ModelCitation }) {
  const meta = MODEL_META[mc.modelId];
  const top3 = mc.citations.slice(0, 3);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3">
        <Image
          src={meta.logo}
          alt={meta.label}
          width={24}
          height={24}
          className="shrink-0"
        />
        <span className="text-sm font-semibold text-neutral-950">
          {meta.label}
        </span>
        <span className="ml-auto text-xs text-neutral-400">
          {mc.totalCitations} citations
        </span>
      </div>

      {/* Top sources */}
      <div className="divide-y divide-neutral-50 px-4">
        {top3.map((src) => (
          <div
            key={src.url}
            className={`flex items-center gap-3 py-2.5 border-l-2 pl-3 ${sourceColor(src.type)}`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-neutral-950 truncate">
                {src.domain}
              </p>
              <p className="text-[10px] text-neutral-400 truncate">{src.title}</p>
            </div>
            <TypeBadge type={src.type} />
            <span className="text-xs font-semibold tabular-nums text-neutral-500">
              {src.frequency}×
            </span>
          </div>
        ))}
      </div>

      {/* Footer: controlled % */}
      <div className="flex items-center gap-3 border-t border-neutral-100 px-4 py-3">
        <ProgressRing percentage={mc.employerControlledPct} />
        <div>
          <p className="text-xs font-medium text-neutral-950">
            {mc.employerControlledPct}% controlled
          </p>
          <p className="text-[10px] text-neutral-400">
            of citations from your domain
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Source table                                                         */
/* ------------------------------------------------------------------ */

function SourceTable({
  sources,
  modelCitations,
  topUncontrolled,
}: {
  sources: CitationSource[];
  modelCitations: ModelCitation[];
  topUncontrolled: CitationSource;
}) {
  const [expanded, setExpanded] = useState(false);
  const displayed = expanded ? sources : sources.slice(0, 6);

  function modelsCiting(src: CitationSource): string[] {
    return modelCitations
      .filter((mc) => mc.citations.some((c) => c.domain === src.domain))
      .map((mc) => MODEL_META[mc.modelId].label);
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      <div className="border-b border-neutral-100 px-5 py-3.5">
        <h3 className="text-sm font-semibold text-neutral-950">
          All citation sources
        </h3>
        <p className="text-xs text-neutral-400 mt-0.5">
          Every source AI models reference, sorted by frequency
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/50">
              <th className="py-2.5 px-5 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Domain
              </th>
              <th className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Type
              </th>
              <th className="py-2.5 px-4 text-center text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Times Cited
              </th>
              <th className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Models Citing
              </th>
              <th className="py-2.5 px-5 text-right text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((src) => {
              const isControlled = src.type === "employer-controlled";
              const isTopUncontrolled = src.domain === topUncontrolled.domain;
              const models = modelsCiting(src);

              return (
                <tr
                  key={src.url}
                  className={`border-b border-neutral-50 last:border-0 ${
                    isTopUncontrolled ? "bg-red-50/50" : ""
                  }`}
                >
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2">
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-neutral-950 hover:underline flex items-center gap-1"
                      >
                        {src.domain}
                        <ExternalLink className="h-3 w-3 text-neutral-300" />
                      </a>
                    </div>
                    {isTopUncontrolled && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                        <span className="text-[10px] text-red-600 font-medium">
                          This Reddit thread is cited more than your own careers page
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <TypeBadge type={src.type} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm font-semibold tabular-nums text-neutral-950">
                      {src.frequency}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {models.map((m) => (
                        <span
                          key={m}
                          className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-5 text-right">
                    {isControlled ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Controlled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[10px] font-semibold text-red-700">
                        Uncontrolled
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sources.length > 6 && (
        <div className="border-t border-neutral-100 px-5 py-3 text-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            {expanded ? "Show less" : `Show all ${sources.length} sources`}
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

interface CitationMapProps {
  report?: CompanyCitationReport;
}

export default function CitationMap({ report = MOCK_REPORT }: CitationMapProps) {
  const controlledPct = report.employerControlledPct;
  const uncontrolledPct = 100 - controlledPct;

  return (
    <div className="space-y-8">
      {/* ── Overview bar ────────────────────────────── */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-950 mb-2">
          Citation Control
        </h2>
        <p className="text-sm text-neutral-600 mb-5">
          <span className="font-semibold text-neutral-950">{controlledPct}%</span> of
          AI citations come from sources you control.{" "}
          <span className="font-semibold text-neutral-950">{uncontrolledPct}%</span>{" "}
          come from Reddit, Wikipedia, and forums.
        </p>

        {/* Proportional bar */}
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${controlledPct}%` }}
          />
          <div
            className="bg-red-400 transition-all duration-500"
            style={{ width: `${uncontrolledPct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Employer-controlled ({controlledPct}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
            Uncontrolled ({uncontrolledPct}%)
          </span>
        </div>
      </div>

      {/* ── Per-model breakdown ─────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-950 mb-4">
          Per-model citation breakdown
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {report.modelCitations.map((mc) => (
            <ModelCitationCard key={mc.modelId} mc={mc} />
          ))}
        </div>
      </div>

      {/* ── Source table ────────────────────────────── */}
      <SourceTable
        sources={report.allSources}
        modelCitations={report.modelCitations}
        topUncontrolled={report.topUncontrolledSource}
      />

      {/* ── CTA ─────────────────────────────────────── */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-950 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <h3 className="text-[15px] font-semibold text-white mb-1">
            Take control of your citations
          </h3>
          <p className="text-sm text-neutral-400">
            Install the OpenRole pixel to serve verified data directly to AI models —
            replace Reddit threads and outdated Glassdoor reviews with your own facts.
          </p>
        </div>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-950 hover:bg-neutral-100 transition-colors shrink-0"
        >
          Install the OpenRole pixel
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
