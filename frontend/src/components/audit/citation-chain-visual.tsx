/**
 * @module components/audit/citation-chain-visual
 * Two-column visual mapping from Google organic results to AI citations.
 */

"use client";

import { ArrowRight, Link2 } from "lucide-react";
import { useMemo } from "react";

import { Card } from "@/components/ui/card";
import { getCanonicalDomainKey } from "@/lib/citation-chain/source-mapper";
import type {
  CitationChainModelId,
  CitationChainResult,
  GoogleResult,
} from "@/lib/citation-chain/types";
import { cn } from "@/lib/utils";

/**
 * Props for the citation-chain visual component.
 */
export interface CitationChainVisualProps {
  /** Full citation-chain result payload for the selected company. */
  result: CitationChainResult;
  /** Optional class names for the outer wrapper. */
  className?: string;
}

interface VisualRow {
  domain: string;
  key: string;
  googlePosition: number | null;
  title: string;
  snippet: string;
  citedByModels: CitationChainModelId[];
}

const MODEL_LABELS: Record<CitationChainModelId, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  perplexity: "Perplexity",
};

const HIGH_RISK_KEYS = new Set(["glassdoor", "indeed"]);

/**
 * Render a Google-to-AI citation map with connected rows.
 */
export function CitationChainVisual({ result, className }: CitationChainVisualProps) {
  const companyDomainKey = getCanonicalDomainKey(result.companyDomain);
  const rows = useMemo(() => buildVisualRows(result), [result]);

  return (
    <Card
      variant="bordered"
      padding="none"
      className={cn("overflow-hidden rounded-2xl border-slate-200", className)}
      data-testid="citation-chain-visual"
    >
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <h2 className="text-xl font-semibold text-slate-900">Citation Chain Visual</h2>
        <p className="mt-1 text-sm text-slate-600">
          How Google rankings flow into what ChatGPT, Claude, and Perplexity cite.
        </p>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <LegendPill
            className="border-teal-200 bg-teal-50 text-teal-700"
            label="Employer domain"
          />
          <LegendPill
            className="border-red-200 bg-red-50 text-red-700"
            label="Glassdoor / Indeed"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
          No citation links were detected in this run.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 p-4 sm:p-5">
          <div className="hidden grid-cols-[1fr_auto_1fr] gap-4 px-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 md:grid">
            <p>Google organic results</p>
            <p className="text-center">Mapped</p>
            <p className="text-right">AI citations</p>
          </div>

          {rows.map((row) => {
            const tone = getDomainTone(row.key, companyDomainKey);

            return (
              <article key={row.key} className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-4">
                <div className={cn("rounded-xl border p-3", tone.googleCard)}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {row.googlePosition !== null ? `Google #${row.googlePosition}` : "Google rank unavailable"}
                  </p>
                  <p className={cn("mt-1 text-sm font-semibold", tone.domainText)}>{row.domain}</p>
                  <p className="mt-1 text-sm text-slate-700">{row.title}</p>
                  {row.snippet && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">{row.snippet}</p>
                  )}
                </div>

                <div className="hidden items-center justify-center md:flex">
                  <div className={cn("h-px w-12", tone.connectorLine)} />
                  <ArrowRight className={cn("ml-1 h-4 w-4", tone.connectorIcon)} aria-hidden />
                </div>

                <div className={cn("rounded-xl border p-3", tone.aiCard)}>
                  <div className="flex items-center gap-2">
                    <Link2 className={cn("h-4 w-4", tone.domainText)} aria-hidden />
                    <p className={cn("text-sm font-semibold", tone.domainText)}>{row.domain}</p>
                  </div>

                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Cited by AI models
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {row.citedByModels.map((modelId) => (
                      <span
                        key={`${row.key}-${modelId}`}
                        className="rounded-full border border-neutral-300 bg-white px-2 py-0.5 text-xs font-medium text-neutral-700"
                      >
                        {MODEL_LABELS[modelId]}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function buildVisualRows(result: CitationChainResult): VisualRow[] {
  const googleByDomain = new Map<string, GoogleResult>();

  for (const googleResult of result.googleResults) {
    const key = getCanonicalDomainKey(googleResult.domain || googleResult.url);
    if (!key) {
      continue;
    }

    const existing = googleByDomain.get(key);
    if (!existing || googleResult.position < existing.position) {
      googleByDomain.set(key, googleResult);
    }
  }

  const rowsByDomain = new Map<string, VisualRow>();

  for (const mapping of result.sourceMappings) {
    const key = getCanonicalDomainKey(mapping.domain);
    if (!key) {
      continue;
    }

    const googleDetails = googleByDomain.get(key);
    const existingRow = rowsByDomain.get(key);

    if (!existingRow) {
      rowsByDomain.set(key, {
        domain: mapping.domain,
        key,
        googlePosition: mapping.googlePosition,
        title: googleDetails?.title ?? "Source appears in Google results",
        snippet: googleDetails?.snippet ?? "",
        citedByModels: [...mapping.citedByModels],
      });
      continue;
    }

    existingRow.googlePosition =
      existingRow.googlePosition === null
        ? mapping.googlePosition
        : Math.min(existingRow.googlePosition, mapping.googlePosition);

    existingRow.citedByModels = Array.from(
      new Set([...existingRow.citedByModels, ...mapping.citedByModels])
    );
  }

  return Array.from(rowsByDomain.values())
    .sort((left, right) => {
      const leftPosition = left.googlePosition ?? Number.POSITIVE_INFINITY;
      const rightPosition = right.googlePosition ?? Number.POSITIVE_INFINITY;
      if (leftPosition !== rightPosition) {
        return leftPosition - rightPosition;
      }

      if (left.citedByModels.length !== right.citedByModels.length) {
        return right.citedByModels.length - left.citedByModels.length;
      }

      return left.domain.localeCompare(right.domain);
    })
    .slice(0, 12);
}

function getDomainTone(domainKey: string, companyKey: string): {
  googleCard: string;
  aiCard: string;
  domainText: string;
  connectorLine: string;
  connectorIcon: string;
} {
  if (domainKey === companyKey && companyKey) {
    return {
      googleCard: "border-teal-200 bg-teal-50/70",
      aiCard: "border-teal-200 bg-teal-50/70",
      domainText: "text-teal-700",
      connectorLine: "bg-emerald-300",
      connectorIcon: "text-teal-500",
    };
  }

  if (HIGH_RISK_KEYS.has(domainKey)) {
    return {
      googleCard: "border-red-200 bg-red-50/70",
      aiCard: "border-red-200 bg-red-50/70",
      domainText: "text-red-700",
      connectorLine: "bg-red-300",
      connectorIcon: "text-red-500",
    };
  }

  return {
    googleCard: "border-slate-200 bg-white",
    aiCard: "border-slate-200 bg-white",
    domainText: "text-slate-800",
    connectorLine: "bg-neutral-300",
    connectorIcon: "text-slate-400",
  };
}

function LegendPill({ className, label }: { className: string; label: string }) {
  return (
    <span className={cn("rounded-full border px-2.5 py-1 font-semibold", className)}>{label}</span>
  );
}
