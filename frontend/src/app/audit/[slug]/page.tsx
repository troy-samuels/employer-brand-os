/**
 * @module app/audit/[slug]/page
 * Client-rendered audit report page that fetches citation-chain data.
 */

"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AuditReport, type AuditReportData } from "@/components/audit/audit-report";
import { LoadingTheatre } from "@/components/audit/loading-theatre";

/**
 * Minimum time to show loading theatre. Ensures the animation plays long enough
 * to feel intentional, but doesn't artificially delay fast or failed responses.
 * Applied only on success; errors surface immediately.
 */
const MIN_LOADING_TIME_MS = 4_000;

interface AuditApiError {
  error?: string;
}

type PageState =
  | { status: "loading" }
  | { status: "success"; data: AuditReportData }
  | { status: "error"; message: string };

/**
 * Render the citation-chain report page for a company slug.
 */
export default function AuditSlugPage() {
  const params = useParams<{ slug: string | string[] }>();
  const searchParams = useSearchParams();

  const slug = useMemo(() => {
    const rawSlug = params.slug;
    if (Array.isArray(rawSlug)) {
      return rawSlug[0] ?? "";
    }
    return rawSlug ?? "";
  }, [params.slug]);

  const explicitName = searchParams.get("name");
  const explicitDomain = searchParams.get("domain");

  const companyName = useMemo(() => deriveCompanyName(slug, explicitName), [slug, explicitName]);
  const companyDomain = useMemo(
    () => deriveCompanyDomain(slug, explicitDomain),
    [slug, explicitDomain]
  );

  const [pageState, setPageState] = useState<PageState>({ status: "loading" });
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    if (!slug) {
      setPageState({ status: "error", message: "Invalid audit URL." });
      return;
    }

    let isMounted = true;
    const abortController = new AbortController();

    const runAudit = async () => {
      setPageState({ status: "loading" });
      const startedAt = Date.now();

      try {
        const response = await fetch("/api/audit/citation-chain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyName,
            companyDomain,
          }),
          signal: abortController.signal,
        });

        const payload = await safeReadJson<AuditReportData & AuditApiError>(response);

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load this audit report.");
        }

        if (!isAuditReportData(payload)) {
          throw new Error("Received an incomplete audit response.");
        }

        // Only pad loading time on success so the animation feels intentional.
        const elapsedMs = Date.now() - startedAt;
        if (elapsedMs < MIN_LOADING_TIME_MS) {
          await sleep(MIN_LOADING_TIME_MS - elapsedMs);
        }

        if (isMounted) {
          setPageState({ status: "success", data: payload });
        }
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }

        const message = error instanceof Error
          ? error.message
          : "Unable to load this audit report.";

        if (isMounted) {
          setPageState({ status: "error", message });
        }
      }
    };

    void runAudit();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [slug, companyName, companyDomain, refreshCount]);

  if (pageState.status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-10 sm:px-6">
        <LoadingTheatre />
      </main>
    );
  }

  if (pageState.status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-10 sm:px-6">
        <section className="w-full max-w-xl rounded-2xl border border-white/15 bg-neutral-900 p-6 text-white sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Audit report unavailable</h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-300">{pageState.message}</p>
          <button
            type="button"
            onClick={() => setRefreshCount((current) => current + 1)}
            className="mt-5 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-300"
          >
            Retry audit
          </button>
        </section>
      </main>
    );
  }

  return <AuditReport slug={slug} data={pageState.data} />;
}

function isAuditReportData(payload: unknown): payload is AuditReportData {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const record = payload as Partial<AuditReportData>;
  return Boolean(
    record.citationChain
      && record.gapAnalysis
      && record.entityConfusion
      && record.trustDelta
  );
}

function deriveCompanyName(slug: string, explicitName: string | null): string {
  if (explicitName && explicitName.trim()) {
    return explicitName.trim();
  }

  return slug
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ") || "Employer";
}

function deriveCompanyDomain(slug: string, explicitDomain: string | null): string {
  if (explicitDomain && explicitDomain.trim()) {
    return normaliseDomain(explicitDomain);
  }

  const cleanedSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");

  return cleanedSlug ? `${cleanedSlug}.com` : "example-company.com";
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

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

async function safeReadJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

function sleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}
