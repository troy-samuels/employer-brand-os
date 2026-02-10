/**
 * @module lib/hooks/use-audit
 * Module implementation for use-audit.ts.
 */

"use client";

import { useState, useCallback } from "react";

import type { WebsiteCheckResult } from "@/lib/audit/website-checks";
import type { ClientCrawlResult } from "@/lib/audit/client-crawl";

/**
 * Defines the AuditState contract.
 */
export type AuditState = "idle" | "running" | "complete";

/**
 * Executes useAudit.
 * @returns The resulting value.
 */
export function useAudit() {
  const [state, setState] = useState<AuditState>("idle");
  const [result, setResult] = useState<WebsiteCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAssisting, setIsAssisting] = useState(false);
  const isLoading = state === "running";

  const runAudit = useCallback(async (input: string) => {
    setState("running");
    setError(null);
    setResult(null);
    setIsAssisting(false);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error ?? `Audit failed (${response.status})`);
      }

      const data = (await response.json()) as WebsiteCheckResult;
      setResult(data);
      setState("complete");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Audit failed";
      setError(message);
      setState("idle");
    }
  }, []);

  /** Submit client-side HTML for a bot-protected page and merge into results */
  const submitClientHtml = useCallback(
    async (html: string, url: string) => {
      if (!result) return;

      setIsAssisting(true);

      try {
        const response = await fetch("/api/audit/client-crawl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html, url, domain: result.domain }),
        });

        if (!response.ok) {
          setIsAssisting(false);
          return;
        }

        const crawlResult = (await response.json()) as { data: ClientCrawlResult };
        const update = crawlResult.data;

        // Merge the client-crawl results into the existing audit
        setResult((prev) => {
          if (!prev) return prev;

          const newBreakdown = {
            ...prev.scoreBreakdown,
            careersPage: Math.max(prev.scoreBreakdown.careersPage, update.scoreUpdates.careersPage),
            salaryData: Math.max(prev.scoreBreakdown.salaryData, update.scoreUpdates.salaryData),
            jsonld: Math.max(prev.scoreBreakdown.jsonld, update.scoreUpdates.jsonld),
          };

          const newScore =
            newBreakdown.llmsTxt +
            newBreakdown.jsonld +
            newBreakdown.salaryData +
            newBreakdown.careersPage +
            newBreakdown.robotsTxt;

          return {
            ...prev,
            careersPageStatus: update.careersPageStatus,
            careersPageUrl: update.careersPageUrl,
            careersBlockedUrl: null,
            hasSalaryData: prev.hasSalaryData || update.hasSalaryData,
            salaryConfidence:
              update.salaryConfidence !== "none" ? update.salaryConfidence : prev.salaryConfidence,
            detectedCurrency: update.detectedCurrency ?? prev.detectedCurrency,
            hasJsonld: prev.hasJsonld || update.hasJsonld,
            jsonldSchemasFound: Array.from(
              new Set([...prev.jsonldSchemasFound, ...update.jsonldSchemasFound]),
            ),
            score: newScore,
            scoreBreakdown: newBreakdown,
          };
        });
      } finally {
        setIsAssisting(false);
      }
    },
    [result],
  );

  const reset = useCallback(() => {
    setState("idle");
    setResult(null);
    setError(null);
    setIsAssisting(false);
  }, []);

  return { state, isLoading, isAssisting, result, error, runAudit, submitClientHtml, reset };
}
