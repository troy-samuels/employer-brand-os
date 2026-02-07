"use client";

import { useState, useCallback } from "react";

import type { WebsiteCheckResult } from "@/lib/audit/website-checks";

export type AuditState = "idle" | "running" | "complete";

export function useAudit() {
  const [state, setState] = useState<AuditState>("idle");
  const [result, setResult] = useState<WebsiteCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isLoading = state === "running";

  const runAudit = useCallback(async (input: string) => {
    setState("running");
    setError(null);
    setResult(null);

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

  const reset = useCallback(() => {
    setState("idle");
    setResult(null);
    setError(null);
  }, []);

  return { state, isLoading, result, error, runAudit, reset };
}
