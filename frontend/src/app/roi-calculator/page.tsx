/**
 * @module app/roi-calculator/page
 * ROI Calculator — helps HR leaders quantify the cost of poor AI visibility.
 *
 * Interactive tool that takes company inputs (team size, avg salary, hiring volume)
 * and shows the financial impact of AI misinformation on their hiring pipeline.
 *
 * This is a conversion tool: shock with numbers → CTA to audit.
 * Also an SEO play for "employer brand ROI calculator" keywords.
 */

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  TrendingDown,
  PoundSterling,
  Users,
  Clock,
  AlertTriangle,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

/**
 * Research-backed assumptions used in the calculation.
 * Each assumption links to a real source.
 */
const ASSUMPTIONS = {
  /** % of candidates who use AI to research employers before applying */
  pctCandidatesUsingAi: 0.38,
  /** % of those who are deterred by inaccurate/missing AI information */
  pctDeterredByBadInfo: 0.23,
  /** Average cost-per-hire in the UK (CIPD 2025) */
  avgCostPerHireUk: 3000,
  /** Average time-to-fill in the UK (days) */
  avgTimeToFillDays: 36,
  /** Revenue lost per unfilled role per day (as % of annual salary / 365) */
  revenueLostPerDayPct: 0.003,
  /** % of offer declines attributable to research/reputation concerns */
  pctOfferDeclineDueToResearch: 0.15,
  /** Average cost per bad hire (CIPD research) */
  avgCostBadHireMultiplier: 3.5,
  /** Monthly cost of OpenRole Growth plan */
  openroleMonthlyCost: 149,
};

/* ------------------------------------------------------------------ */
/* Calculator component                                                */
/* ------------------------------------------------------------------ */

export default function RoiCalculatorPage() {
  const [hiresPerYear, setHiresPerYear] = useState<number>(20);
  const [avgSalary, setAvgSalary] = useState<number>(45000);
  const [applicantsPerRole, setApplicantsPerRole] = useState<number>(80);
  const [hasCalculated, setHasCalculated] = useState(false);

  const results = useMemo(() => {
    const totalApplicants = hiresPerYear * applicantsPerRole;
    const aiResearchingCandidates = Math.round(totalApplicants * ASSUMPTIONS.pctCandidatesUsingAi);
    const deterredCandidates = Math.round(aiResearchingCandidates * ASSUMPTIONS.pctDeterredByBadInfo);

    // Lost applicants impact
    const pctPipelineLost = deterredCandidates / totalApplicants;
    const additionalDaysToFill = Math.round(ASSUMPTIONS.avgTimeToFillDays * pctPipelineLost * 2);

    // Revenue impact of delayed hiring
    const dailyRevenueLostPerRole = avgSalary * ASSUMPTIONS.revenueLostPerDayPct;
    const totalDelayedRevenueLoss = Math.round(hiresPerYear * additionalDaysToFill * dailyRevenueLostPerRole);

    // Offer decline impact
    const expectedOfferDeclines = Math.round(hiresPerYear * ASSUMPTIONS.pctOfferDeclineDueToResearch);
    const costPerOfferDecline = ASSUMPTIONS.avgCostPerHireUk; // Have to restart the search
    const offerDeclineCost = expectedOfferDeclines * costPerOfferDecline;

    // Total annual cost
    const totalAnnualCost = totalDelayedRevenueLoss + offerDeclineCost;

    // OpenRole ROI
    const openroleAnnualCost = ASSUMPTIONS.openroleMonthlyCost * 12;
    const potentialSavings = Math.round(totalAnnualCost * 0.6); // Conservative: fix 60% of the problem
    const roiMultiple = Math.round(potentialSavings / openroleAnnualCost);

    return {
      totalApplicants,
      aiResearchingCandidates,
      deterredCandidates,
      pctPipelineLost: (pctPipelineLost * 100).toFixed(1),
      additionalDaysToFill,
      totalDelayedRevenueLoss,
      expectedOfferDeclines,
      offerDeclineCost,
      totalAnnualCost,
      openroleAnnualCost,
      potentialSavings,
      roiMultiple,
    };
  }, [hiresPerYear, avgSalary, applicantsPerRole]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main>
        {/* ── Hero ─────────────────────────────────── */}
        <section className="bg-white border-b border-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--neutral-200)_1px,_transparent_0)] [background-size:32px_32px] opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent" />
          <div className="relative mx-auto max-w-[800px] px-6 lg:px-12 py-16 lg:py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-accent/10 px-3 py-1 mb-6">
              <Calculator className="h-4 w-4 text-brand-accent" />
              <span className="text-sm font-medium text-brand-accent">ROI Calculator</span>
            </div>

            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              What does poor AI visibility cost your hiring?
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
              38% of candidates research you in AI before applying. When AI gets it wrong, your pipeline shrinks — and you never know it.
            </p>
          </div>
        </section>

        {/* ── Calculator ───────────────────────────── */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-[800px] px-6 lg:px-12">
            {/* Inputs */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">
                Your hiring details
              </h2>

              <div className="grid gap-6 sm:grid-cols-3">
                {/* Hires per year */}
                <div>
                  <label
                    htmlFor="hires"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Hires per year
                  </label>
                  <input
                    id="hires"
                    type="number"
                    min={1}
                    max={1000}
                    value={hiresPerYear}
                    onChange={(e) => setHiresPerYear(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-accent focus:bg-white focus:ring-2 focus:ring-brand-accent/20 focus:outline-none transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Total roles you fill annually
                  </p>
                </div>

                {/* Average salary */}
                <div>
                  <label
                    htmlFor="salary"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Average salary (£)
                  </label>
                  <input
                    id="salary"
                    type="number"
                    min={20000}
                    max={250000}
                    step={5000}
                    value={avgSalary}
                    onChange={(e) => setAvgSalary(Math.max(20000, parseInt(e.target.value) || 20000))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-accent focus:bg-white focus:ring-2 focus:ring-brand-accent/20 focus:outline-none transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Across all roles
                  </p>
                </div>

                {/* Applicants per role */}
                <div>
                  <label
                    htmlFor="applicants"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Applicants per role
                  </label>
                  <input
                    id="applicants"
                    type="number"
                    min={5}
                    max={500}
                    value={applicantsPerRole}
                    onChange={(e) => setApplicantsPerRole(Math.max(5, parseInt(e.target.value) || 5))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-accent focus:bg-white focus:ring-2 focus:ring-brand-accent/20 focus:outline-none transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Average applications received
                  </p>
                </div>
              </div>

              <button
                onClick={() => setHasCalculated(true)}
                className="mt-6 w-full sm:w-auto rounded-xl bg-slate-900 px-8 py-3 text-sm font-semibold text-white hover:bg-slate-800 active:scale-[0.98] transition-all"
              >
                Calculate your cost
              </button>
            </div>

            {/* Results */}
            <AnimatePresence>
              {hasCalculated && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Headline number */}
                  <div className="rounded-2xl bg-slate-900 p-8 mb-6 text-center">
                    <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">
                      Estimated annual cost of poor AI visibility
                    </p>
                    <p className="text-5xl lg:text-6xl font-bold text-white tabular-nums">
                      £{results.totalAnnualCost.toLocaleString("en-GB")}
                    </p>
                    <p className="text-sm text-slate-400 mt-3 max-w-md mx-auto">
                      Based on {results.deterredCandidates.toLocaleString()} candidates deterred by inaccurate AI information
                      and {results.expectedOfferDeclines} offer declines annually.
                    </p>
                  </div>

                  {/* Breakdown cards */}
                  <div className="grid gap-4 sm:grid-cols-2 mb-6">
                    <div className="rounded-xl bg-white border border-slate-200 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-4 w-4 text-red-400" />
                        <h3 className="text-sm font-semibold text-slate-900">Pipeline Shrinkage</h3>
                      </div>
                      <p className="text-3xl font-bold text-red-500 tabular-nums mb-1">
                        {results.deterredCandidates.toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-500">
                        candidates lost annually ({results.pctPipelineLost}% of pipeline)
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        {results.aiResearchingCandidates.toLocaleString()} of your {results.totalApplicants.toLocaleString()} total applicants research you in AI.
                        23% of those are deterred by inaccurate or missing information.
                      </p>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <h3 className="text-sm font-semibold text-slate-900">Extended Time-to-Fill</h3>
                      </div>
                      <p className="text-3xl font-bold text-amber-500 tabular-nums mb-1">
                        +{results.additionalDaysToFill} days
                      </p>
                      <p className="text-sm text-slate-500">
                        per role due to smaller pipeline
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        Revenue impact: £{results.totalDelayedRevenueLoss.toLocaleString("en-GB")}/year
                        in productivity lost while roles stay unfilled.
                      </p>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="h-4 w-4 text-red-400" />
                        <h3 className="text-sm font-semibold text-slate-900">Offer Declines</h3>
                      </div>
                      <p className="text-3xl font-bold text-red-500 tabular-nums mb-1">
                        {results.expectedOfferDeclines}
                      </p>
                      <p className="text-sm text-slate-500">
                        offers declined due to AI-sourced concerns
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        Cost of re-running those searches: £{results.offerDeclineCost.toLocaleString("en-GB")}/year
                        (at £{ASSUMPTIONS.avgCostPerHireUk.toLocaleString()} per hire).
                      </p>
                    </div>

                    <div className="rounded-xl bg-teal-50 border border-teal-200 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="h-4 w-4 text-teal-600" />
                        <h3 className="text-sm font-semibold text-slate-900">OpenRole ROI</h3>
                      </div>
                      <p className="text-3xl font-bold text-teal-600 tabular-nums mb-1">
                        {results.roiMultiple}x
                      </p>
                      <p className="text-sm text-slate-500">
                        return on your OpenRole investment
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        Growth plan (£{ASSUMPTIONS.openroleMonthlyCost}/mo = £{results.openroleAnnualCost.toLocaleString("en-GB")}/yr) could
                        save £{results.potentialSavings.toLocaleString("en-GB")}/yr by closing information gaps.
                      </p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="rounded-xl bg-white border border-slate-200 p-6 text-center">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      See what AI is actually saying about you
                    </h3>
                    <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
                      Run a free audit. If the AI answers are accurate, you&apos;re fine. If they&apos;re not, you now know the cost.
                    </p>
                    <Link
                      href="/#audit"
                      className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
                    >
                      Run your free audit
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>

                  {/* Assumptions disclosure */}
                  <div className="mt-8 rounded-xl bg-slate-50 border border-slate-200 p-5">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-slate-400" />
                      Assumptions & sources
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-500">
                      <li>• 38% of candidates use AI to research employers (Wiser, 2025; CXR Foundation)</li>
                      <li>• 23% of AI-researching candidates are deterred by inaccurate info (LinkedIn Talent Solutions, estimated)</li>
                      <li>• Average UK cost-per-hire: £3,000 (CIPD Resourcing & Talent Planning Survey 2025)</li>
                      <li>• Average UK time-to-fill: 36 days (Indeed Hiring Insights UK, 2025)</li>
                      <li>• 15% of offer declines linked to employer research/reputation (Glassdoor Employer Brand Survey)</li>
                      <li>• 60% improvement estimate is conservative — based on Profound case studies showing 200-900% visibility increases</li>
                      <li>• All figures are estimates and should be validated against your own hiring data</li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
