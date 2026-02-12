/**
 * @module components/audit/audit-progress
 * Displays animated progress feedback while an audit request is running.
 */

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { WebsiteCheckResult } from "@/lib/audit/website-checks";

const CHECK_LABELS = [
  { key: "llmsTxt" as const, label: "AI instructions" },
  { key: "jsonld" as const, label: "Structured data" },
  { key: "salaryData" as const, label: "Salary info" },
  { key: "careersPage" as const, label: "Careers page" },
  { key: "robotsTxt" as const, label: "Bot access" },
];

interface AuditProgressProps {
  result: WebsiteCheckResult | null;
  isRunning: boolean;
}

/**
 * Shows audit scan progress text and completion summary.
 * @param props - Component props containing current run state and result.
 * @returns The progress UI for in-flight or completed audits.
 */
export function AuditProgress({ result, isRunning }: AuditProgressProps) {
  const [activeLabel, setActiveLabel] = useState(CHECK_LABELS[0]?.label ?? "");

  useEffect(() => {
    if (!isRunning || result) return;
    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % CHECK_LABELS.length;
      setActiveLabel(CHECK_LABELS[idx]?.label ?? "");
    }, 800);
    return () => clearInterval(timer);
  }, [isRunning, result]);

  // Scanning
  if (isRunning && !result) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="text-center space-y-4"
      >
        {/* Simple dot pulse */}
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-neutral-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={activeLabel}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-slate-400"
          >
            Checking {activeLabel}…
          </motion.p>
        </AnimatePresence>
      </motion.div>
    );
  }

  if (!result) return null;

  const passed = CHECK_LABELS.filter(
    (c) => (result.scoreBreakdown[c.key] ?? 0) > 0,
  ).length;
  const total = CHECK_LABELS.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center"
    >
      <p className="text-sm text-slate-500">
        <span className="font-semibold text-slate-900">{passed}</span> of{" "}
        <span className="font-semibold text-slate-900">{total}</span> checks
        passed
      </p>
    </motion.div>
  );
}
