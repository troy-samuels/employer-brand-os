/**
 * @module app/page
 * OpenRole landing page — premium, minimalist design.
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";

import { CompanySearch } from "@/components/audit/company-search";
import { AuditProgress } from "@/components/audit/audit-progress";
import { AuditResults } from "@/components/audit/audit-results";
import { AuditGate } from "@/components/audit/audit-gate";
import ProblemStats from "@/components/landing/problem-stats";
import Features from "@/components/landing/features";
import BeforeAfter from "@/components/landing/testimonials";
import PromptIntelligence from "@/components/landing/prompt-intelligence";
import MonitorPreview from "@/components/landing/monitor-preview";
import EvidenceBar from "@/components/landing/evidence-bar";
import Pricing from "@/components/landing/pricing";
import CTA from "@/components/landing/cta";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { useAudit } from "@/lib/hooks/use-audit";
import {
  BASE_URL,
  SITE_NAME,
  generateOrganizationSchema,
  generateWebsiteSchema,
  JsonLd,
} from "@/lib/seo";

export default function Home() {
  const { state, isLoading, isRerunning, result, error, runAudit, rerunWithCareersUrl, reset } =
    useAudit();

  const organizationSchema = generateOrganizationSchema({
    name: SITE_NAME,
    url: BASE_URL,
    description:
      "OpenRole injects machine-readable employer data into your existing website so AI cites your verified facts instead of third-party rumours. See what AI says about you right now, then deploy structured data to increase the likelihood AI represents your employer brand accurately.",
  });

  const websiteSchema = generateWebsiteSchema({
    name: SITE_NAME,
    url: BASE_URL,
    description: "Free audit shows what AI says about your employer brand right now. We inject machine-readable data into your website so ChatGPT, Perplexity and Google AI cite your facts instead of third-party guesses. Your domain, your authority, your data.",
  });

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <Header />

      <main>
        {/* ── Hero ─────────────────────────────────────── */}
        <section id="audit" className="scroll-mt-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-50/60 via-white to-white" />
          <div className="relative mx-auto flex max-w-[1200px] flex-col items-center px-6 py-24 lg:px-12 lg:py-32">
            {/* Headline */}
            <AnimatePresence mode="wait">
              {state !== "complete" && (
                <motion.div
                  key="hero"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-12 max-w-3xl text-center"
                >
                  <h1 className="mb-5 text-5xl font-medium leading-[1.04] text-neutral-950 sm:text-6xl lg:text-7xl" style={{ letterSpacing: '-0.04em' }}>
                    AI is answering questions about you.
                    <br />
                    <span className="text-brand-accent">Are you feeding it the right data?</span>
                  </h1>
                  <p className="text-lg text-neutral-400 max-w-lg mx-auto">
                    OpenRole injects a machine-readable data layer into your existing website. When ChatGPT, Perplexity or Google AI researches your company, it finds your verified facts — not Glassdoor rumours from 2022.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <AnimatePresence mode="wait">
              {state === "idle" && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="w-full max-w-lg"
                >
                  <CompanySearch onSubmit={runAudit} isLoading={isLoading} />
                  <p className="mt-4 text-center text-xs text-neutral-400">
                    340+ UK employers audited · Average employer brand score: <span className="font-semibold text-neutral-500">32/100</span> · <span className="font-semibold text-status-critical">68%</span> have incomplete employer data in AI search
                  </p>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 text-center text-sm text-status-critical"
                    >
                      {error}
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scanning */}
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

            {/* Results */}
            <AnimatePresence mode="wait">
              {state === "complete" && result && result.status === "success" && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="mx-auto w-full max-w-lg space-y-10"
                >
                  <AuditResults
                    result={result}
                    onRerunWithCareersUrl={rerunWithCareersUrl}
                    isRerunning={isRerunning}
                  />
                  <AuditGate score={result.score} companySlug={result.companySlug} />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="pb-6 text-center"
                  >
                    <button
                      onClick={reset}
                      className="text-sm text-neutral-400 transition-colors hover:text-neutral-600"
                    >
                      Scan another company
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error states */}
            <AnimatePresence mode="wait">
              {state === "complete" && result && result.status !== "success" && (
                <motion.div
                  key="error-state"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mx-auto w-full max-w-lg space-y-6"
                >
                  <div className="space-y-4 rounded-2xl bg-white p-7 shadow-[0_2px_16px_rgba(28,25,23,0.06),0_1px_4px_rgba(28,25,23,0.04)]">
                    {result.status === "no_website" && (
                      <>
                        <h2 className="text-lg font-semibold text-neutral-950">
                          No website found for {result.companyName}
                        </h2>
                        <p className="text-sm leading-relaxed text-neutral-500">
                          This means AI has zero verified data about you as an employer.
                        </p>
                      </>
                    )}
                    {result.status === "unreachable" && (
                      <>
                        <h2 className="text-lg font-semibold text-neutral-950">
                          We couldn&apos;t reach {result.domain}
                        </h2>
                        <p className="text-sm leading-relaxed text-neutral-500">
                          Your site may be blocking external access, or it could be temporarily down.
                        </p>
                      </>
                    )}
                    {result.status === "empty" && (
                      <>
                        <h2 className="text-lg font-semibold text-neutral-950">
                          We found {result.domain} but it returned no content
                        </h2>
                        <p className="text-sm leading-relaxed text-neutral-500">
                          Your site may require JavaScript to render — which means AI crawlers
                          can&apos;t read it either.
                        </p>
                      </>
                    )}
                  </div>
                  <AuditGate score={0} />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="pb-6 text-center"
                  >
                    <button
                      onClick={reset}
                      className="text-sm text-neutral-400 transition-colors hover:text-neutral-600"
                    >
                      Scan another company
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── Sections ────────────────────────────────── */}
        <ProblemStats />
        <Features />
        <BeforeAfter />
        <PromptIntelligence />
        <MonitorPreview />
        <EvidenceBar />
        <Pricing />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
