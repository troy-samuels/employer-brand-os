"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAudit } from "@/lib/hooks/use-audit";

/**
 * Legacy audit form — kept for backwards compatibility.
 * The new homepage uses AuditInput directly.
 */
export default function AuditForm({ showResults = true }: { showResults?: boolean }) {
  const { state, result, error, runAudit } = useAudit();
  const [domain, setDomain] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    await runAudit(domain.trim());
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-2xl mx-auto px-4">
        <Card variant="elevated" padding="lg">
          <h2 className="text-3xl font-bold text-center mb-8">
            Free AI Employment Visibility Audit
          </h2>

          <form onSubmit={onSubmit} className="space-y-6">
            <Input
              label="Company Website or Name"
              placeholder="example.com or Acme Corp"
              value={domain}
              onValueChange={setDomain}
              required
            />

            {error && (
              <div className="rounded-lg bg-error-light px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              loading={state === "running"}
              className="w-full"
            >
              {state === "running" ? "Analysing..." : "Start Free Analysis"}
            </Button>
          </form>
        </Card>

        {showResults && result && (
          <div className="mt-10">
            <p className="text-center text-lg font-semibold">
              Score: {result.score}/100
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
