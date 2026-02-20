/**
 * @module lib/hooks/use-audit
 * Module implementation for use-audit.ts.
 */

"use client";

import { useState, useCallback } from "react";

import type { WebsiteCheckResult } from "@/lib/audit/website-checks";

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
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [isRerunning, setIsRerunning] = useState(false);
  const isLoading = state === "running";

  const runAudit = useCallback(async (input: string) => {
    const normalizedInput = input.trim();

    setState("running");
    setError(null);
    setResult(null);
    setOriginalUrl(normalizedInput);
    setIsRerunning(false);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedInput }),
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

  const rerunWithCareersUrl = useCallback(
    async (careersUrl: string) => {
      if (!originalUrl) {
        return;
      }

      const normalizedCareersUrl = careersUrl.trim();
      setIsRerunning(true);
      setError(null);

      try {
        const response = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: originalUrl,
            careersUrl: normalizedCareersUrl,
          }),
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
        throw err instanceof Error ? err : new Error(message);
      } finally {
        setIsRerunning(false);
      }
    },
    [originalUrl],
  );

  const reset = useCallback(() => {
    setState("idle");
    setResult(null);
    setError(null);
    setOriginalUrl(null);
    setIsRerunning(false);
  }, []);

  return {
    state,
    isLoading,
    isRerunning,
    result,
    error,
    runAudit,
    rerunWithCareersUrl,
    reset,
  };
}
