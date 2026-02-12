/**
 * @module components/audit/audit-report
 * Full audit report layout for citation-chain analysis results.
 */

"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useState, type FormEvent, type ReactNode } from "react";

import { CitationChainVisual } from "@/components/audit/citation-chain-visual";
import { CitationScoreHero } from "@/components/audit/citation-score-hero";
import { CompanySearch } from "@/components/audit/company-search";
import { CostCalculator } from "@/components/audit/cost-calculator";
import { EntityConfusionAlert } from "@/components/audit/entity-confusion-alert";
import { SourceGapMatrix } from "@/components/audit/source-gap-matrix";
import { TrustDeltaTable } from "@/components/audit/trust-delta-table";
import type { EntityConfusionResult } from "@/lib/citation-chain/entity-detection";
import type { GapAnalysis } from "@/lib/citation-chain/gap-analysis";
import type { CitationChainResult } from "@/lib/citation-chain/types";
import type { TrustDeltaResult } from "@/lib/citation-chain/trust-delta";
import { cn } from "@/lib/utils";

/**
 * Combined payload required to render the full audit report page.
 */
export interface AuditReportData {
  /** Core citation-chain output. */
  citationChain: CitationChainResult;
  /** Category-level source-gap analysis. */
  gapAnalysis: GapAnalysis;
  /** Entity confusion findings from model responses. */
  entityConfusion: EntityConfusionResult;
  /** Trust-delta comparison and hallucination rate. */
  trustDelta: TrustDeltaResult;
}

/**
 * Props for the audit report layout component.
 */
export interface AuditReportProps {
  /** Current report slug used for lead attribution and share URLs. */
  slug: string;
  /** Fully computed report data. */
  data: AuditReportData;
  /** Optional extra class names for outer wrapper styling. */
  className?: string;
}

const CONSUMER_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate whether an email looks like a work email address.
 */
export function isWorkEmail(email: string): boolean {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(trimmed)) {
    return false;
  }

  const domain = trimmed.split("@")[1];
  if (!domain) {
    return false;
  }

  return !CONSUMER_EMAIL_DOMAINS.has(domain);
}

/**
 * Render the full citation-chain audit report with all required sections.
 */
export function AuditReport({ slug, data, className }: AuditReportProps) {
  const router = useRouter();

  const handleRunAnotherAudit = useCallback(
    (companyInput: string) => {
      const companyDomain = normaliseDomain(companyInput);
      if (!companyDomain) {
        return;
      }

      const nextSlug = createAuditSlug(companyDomain);
      const companyName = formatCompanyName(companyDomain);
      const query = new URLSearchParams({
        domain: companyDomain,
        name: companyName,
      });

      router.push(`/audit/${nextSlug}?${query.toString()}`);
    },
    [router]
  );

  return (
    <article className={cn("bg-slate-900", className)} data-testid="audit-report">
      <RevealSection className="bg-gradient-to-b from-neutral-950 to-neutral-900 py-14 sm:py-16">
        <CitationScoreHero
          companyName={data.citationChain.companyName}
          citationScore={data.citationChain.citationScore}
        />
      </RevealSection>

      <RevealSection className="bg-slate-100 py-14 text-slate-900 sm:py-16">
        <CitationChainVisual result={data.citationChain} />
      </RevealSection>

      <RevealSection className="bg-slate-800 py-14 sm:py-16">
        <SourceGapMatrix analysis={data.gapAnalysis} />
      </RevealSection>

      {data.entityConfusion.isConfused && (
        <RevealSection className="bg-slate-50 py-14 text-slate-900 sm:py-16">
          <EntityConfusionAlert result={data.entityConfusion} />
        </RevealSection>
      )}

      <RevealSection className="bg-slate-800 py-14 sm:py-16">
        <div className="overflow-x-auto">
          <TrustDeltaTable items={data.trustDelta.items} />
        </div>
      </RevealSection>

      <RevealSection className="bg-slate-100 py-14 text-slate-900 sm:py-16">
        <CostCalculator deltaItems={data.trustDelta.items} />
      </RevealSection>

      <RevealSection className="bg-gradient-to-b from-neutral-900 to-black py-14 sm:py-16">
        <div className="space-y-8">
          <EmailGateCta companySlug={slug} score={data.citationChain.citationScore} />

          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 sm:p-6">
            <h3 className="text-base font-semibold text-white sm:text-lg">Run another audit</h3>
            <p className="mt-1 text-sm text-slate-300">
              Search for another employer to compare how AI sources its data.
            </p>
            <div className="mt-4">
              <CompanySearch onSubmit={handleRunAnotherAudit} />
            </div>
          </div>
        </div>
      </RevealSection>
    </article>
  );
}

function RevealSection({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={className}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </motion.section>
  );
}

function EmailGateCta({ companySlug, score }: { companySlug: string; score: number }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    if (!isWorkEmail(trimmedEmail)) {
      setError("Please enter a valid work email address.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/audit/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          companySlug,
          score: Math.round(score),
        }),
      });

      const payload = await safeReadJson<{ error?: string }>(response);
      if (!response.ok) {
        setError(payload.error ?? "Unable to submit your details. Please try again.");
        return;
      }

      setIsSubmitted(true);
      setEmail("");
    } catch {
      setError("Unable to submit your details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-white/10 p-5 text-white shadow-xl sm:p-6">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Want the full fix playbook? Enter your work email
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        Receive a practical, prioritised plan to shift AI citations towards your owned employer
        sources.
      </p>

      {isSubmitted ? (
        <p className="mt-4 rounded-xl border border-emerald-300/40 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
          Thanks. Your full fix playbook is on the way.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            placeholder="you@company.com"
            autoComplete="email"
            className="w-full rounded-xl border border-white/20 bg-white/95 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
            aria-label="Work email"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Sending..." : "Send playbook"}
          </button>
        </form>
      )}

      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

      <p className="mt-3 text-xs text-slate-400">We only use your email for this report follow-up.</p>
    </div>
  );
}

async function safeReadJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

function normaliseDomain(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) {
    return "";
  }

  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(candidate).hostname.replace(/^www\./i, "");
  } catch {
    const fallbackDomain = trimmed.split("/")[0] ?? "";
    return fallbackDomain.replace(/^www\./i, "");
  }
}

function createAuditSlug(companyDomain: string): string {
  const baseDomain = companyDomain.replace(/^www\./i, "");
  const primary = baseDomain.split(".")[0] ?? baseDomain;

  return primary
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatCompanyName(companyDomain: string): string {
  const primary = (companyDomain.split(".")[0] ?? companyDomain).replace(/[-_]+/g, " ").trim();
  if (!primary) {
    return "Employer";
  }

  return primary
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
