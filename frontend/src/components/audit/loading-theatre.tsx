/**
 * @module components/audit/loading-theatre
 * Animated loading theatre for citation-chain audit execution.
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Default loading theatre steps shown while the audit is running.
 */
export const LOADING_THEATRE_STEPS = [
  "Querying ChatGPT...",
  "Querying Claude...",
  "Querying Perplexity...",
  "Mapping Google citation chain...",
  "Detecting entity accuracy...",
  "Calculating Citation Score...",
] as const;

/**
 * Props for the loading theatre component.
 */
export interface LoadingTheatreProps {
  /** Optional override class names for outer container styling. */
  className?: string;
  /** Optional custom step labels. */
  steps?: readonly string[];
  /** Delay between each revealed step in milliseconds. */
  stepDelayMs?: number;
}

const DEFAULT_STEP_DELAY_MS = 1_700;

/**
 * Render a sequential loading feed with progress while citation checks run.
 */
export function LoadingTheatre({
  className,
  steps = LOADING_THEATRE_STEPS,
  stepDelayMs = DEFAULT_STEP_DELAY_MS,
}: LoadingTheatreProps) {
  const resolvedSteps = useMemo(
    () => (steps.length > 0 ? [...steps] : [...LOADING_THEATRE_STEPS]),
    [steps]
  );
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timerIds = resolvedSteps.map((_, index) =>
      window.setTimeout(() => {
        setVisibleCount(index + 1);
      }, (index + 1) * stepDelayMs)
    );

    return () => {
      timerIds.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [resolvedSteps, stepDelayMs]);

  const progress = resolvedSteps.length === 0 ? 0 : Math.min(1, visibleCount / resolvedSteps.length);

  return (
    <section
      className={cn(
        "w-full max-w-3xl rounded-3xl border border-slate-700 bg-slate-800/70 p-6 text-white shadow-2xl backdrop-blur sm:p-8",
        className
      )}
      aria-live="polite"
      data-testid="loading-theatre"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
        Running Audit
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        Building your citation-chain report
      </h2>
      <p className="mt-2 text-sm text-slate-300">
        We are checking how major AI models source employer information.
      </p>

      <div className="mt-6 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-2 rounded-full bg-teal-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <p className="mt-2 text-xs font-medium text-slate-300">{Math.round(progress * 100)}% complete</p>

      <ol className="mt-6 space-y-2" aria-label="Audit progress steps">
        <AnimatePresence initial={false}>
          {resolvedSteps.slice(0, visibleCount).map((step) => (
            <motion.li
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-neutral-100"
            >
              <span className="mr-2" aria-hidden>
                ✅
              </span>
              {step}
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </section>
  );
}
