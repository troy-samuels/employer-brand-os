/**
 * @module components/landing/evidence-bar
 * Evidence bar — social proof section with data points, sample report link,
 * and ROI calculator link. Positioned between features and pricing to
 * bridge the gap from "I understand the problem" to "I want to buy."
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Calculator } from "lucide-react";

const spring = { type: "spring" as const, stiffness: 200, damping: 20 };

const CASE_STUDIES = [
  {
    stat: "0% → 11%",
    label: "AI visibility in 2 weeks",
    detail: "One blog post. One employer. Published targeted content on their careers page — AI started citing it within 14 days.",
    source: "1840&Co via Profound",
  },
  {
    stat: "3.2% → 22.2%",
    label: "AI visibility with copy rewrite",
    detail: "Ramp rewrote their website copy to answer candidate questions directly. 7x increase in AI citations.",
    source: "Ramp via Profound",
  },
  {
    stat: "68%",
    label: "of UK employers have salary gaps",
    detail: "We audited 340+ UK employers. Over two-thirds have no machine-readable salary data for AI to cite.",
    source: "OpenRole audit data",
  },
];

export default function EvidenceBar() {
  return (
    <section className="py-20 lg:py-28 bg-slate-50 border-t border-b border-slate-200">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12">
        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={spring}
        >
          <h2
            className="text-3xl lg:text-4xl font-medium text-neutral-950 mb-4"
            style={{ letterSpacing: "-0.03em" }}
          >
            The evidence is clear
          </h2>
          <p className="text-neutral-400 max-w-lg mx-auto">
            Companies that publish targeted employer content see measurable shifts in AI citation patterns — within weeks, not months.
          </p>
        </motion.div>

        {/* Case study cards */}
        <div className="grid gap-5 md:grid-cols-3 mb-12">
          {CASE_STUDIES.map((study, i) => (
            <motion.div
              key={study.stat}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ ...spring, delay: i * 0.1 }}
              className="rounded-2xl bg-white border border-neutral-100 p-6"
            >
              <p className="text-3xl font-bold text-brand-accent mb-1 tabular-nums">
                {study.stat}
              </p>
              <p className="text-sm font-semibold text-neutral-950 mb-3">
                {study.label}
              </p>
              <p className="text-sm text-neutral-400 leading-relaxed mb-3">
                {study.detail}
              </p>
              <p className="text-xs text-neutral-300">
                Source: {study.source}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Action cards */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Sample report card */}
          <Link
            href="/sample-report"
            className="group rounded-2xl bg-white border border-neutral-100 p-6 hover:border-neutral-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-accent/10">
                <FileText className="h-5 w-5 text-brand-accent" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-950 mb-1 group-hover:text-brand-accent transition-colors">
                  See a sample report
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed mb-3">
                  What does a full AI Employer Brand Report look like? See real AI responses, gap analysis, competitor benchmarking, and a content playbook — all for a sample company.
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-accent">
                  View sample report
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>

          {/* ROI calculator card */}
          <Link
            href="/roi-calculator"
            className="group rounded-2xl bg-white border border-neutral-100 p-6 hover:border-neutral-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                <Calculator className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-950 mb-1 group-hover:text-brand-accent transition-colors">
                  Calculate your cost
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed mb-3">
                  How much is poor AI visibility costing your hiring? Enter your team size and salary range — we&apos;ll show you the annual impact on your pipeline.
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-accent">
                  Try the ROI calculator
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
