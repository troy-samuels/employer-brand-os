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
          {state === "complete" && result && (
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
              <AuditGate />

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
      </main>
    </div>
  );
}
