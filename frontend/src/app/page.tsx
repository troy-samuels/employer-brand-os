"use client";

import { motion, AnimatePresence } from "framer-motion";

import { AuditInput } from "@/components/audit/audit-input";
import { AuditProgress } from "@/components/audit/audit-progress";
import { AuditResults } from "@/components/audit/audit-results";
import { AuditGate } from "@/components/audit/audit-gate";
import { useAudit } from "@/lib/hooks/use-audit";

export default function Home() {
  const { state, isLoading, result, error, runAudit, reset } = useAudit();

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="flex flex-col items-center px-6 py-20 lg:py-32">
        {/* ── Headline ───────────────────────────────── */}
        <AnimatePresence mode="wait">
          {state !== "complete" && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="text-center mb-12 max-w-xl"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-950 leading-tight tracking-tight mb-3">
                Is AI telling the truth
                <br />
                <span className="text-brand-accent">about your company?</span>
              </h1>
              <p className="text-base text-neutral-500">
                Find out in 15 seconds. Completely free.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Input ──────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {state === "idle" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-lg"
            >
              <AuditInput onSubmit={runAudit} isLoading={isLoading} />
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-sm text-status-critical text-center"
                >
                  {error}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Scanning ───────────────────────────────── */}
        <AnimatePresence mode="wait">
          {state === "running" && (
            <motion.div
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AuditProgress result={null} isRunning={true} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results ────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {state === "complete" && result && result.status === "success" && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-lg mx-auto space-y-10"
            >
              {/* Score + cards */}
              <AuditResults result={result} />

              {/* Email capture */}
              <AuditGate score={result.score} companySlug={result.companySlug} />

              {/* Reset */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center pb-6"
              >
                <button
                  onClick={reset}
                  className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  Scan another company
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error states ───────────────────────────── */}
        <AnimatePresence mode="wait">
          {state === "complete" && result && result.status !== "success" && (
            <motion.div
              key="error-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-lg mx-auto space-y-6"
            >
              <div className="rounded-2xl bg-white p-7 shadow-[0_2px_16px_rgba(28,25,23,0.06),0_1px_4px_rgba(28,25,23,0.04)] space-y-4">
                {result.status === "no_website" && (
                  <>
                    <h2 className="text-lg font-semibold text-neutral-950">
                      No website found for {result.companyName}
                    </h2>
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      This means AI has zero verified data about you as an employer.
                      The good news: you can fix that by creating a verified AI profile.
                    </p>
                  </>
                )}
                {result.status === "unreachable" && (
                  <>
                    <h2 className="text-lg font-semibold text-neutral-950">
                      We couldn&apos;t reach {result.domain}
                    </h2>
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      Your site may be blocking external access, or it could be temporarily down.
                      Try entering the full URL directly.
                    </p>
                  </>
                )}
                {result.status === "empty" && (
                  <>
                    <h2 className="text-lg font-semibold text-neutral-950">
                      We found {result.domain} but it returned no content
                    </h2>
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      Your site may require JavaScript to render — which means AI crawlers
                      can&apos;t read it either.
                    </p>
                  </>
                )}
              </div>

              {/* CTA */}
              <AuditGate score={0} />

              {/* Reset */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center pb-6"
              >
                <button
                  onClick={reset}
                  className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  Scan another company
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
