/**
 * @module app/dashboard/ai-intelligence/page
 * AI Intelligence Dashboard — preview page showing Citation Map,
 * Model Comparison, and Crawler Dashboard together.
 */

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import CitationMap from "@/components/dashboard/citation-map";
import ModelComparison from "@/components/dashboard/model-comparison";
import CrawlerDashboard from "@/components/dashboard/crawler-dashboard";

export const metadata = {
  title: "AI Intelligence Dashboard | OpenRole",
  description:
    "See what AI models say about your company, track citations, and monitor AI crawler activity.",
};

export default function AIIntelligencePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-50">
        {/* ── Preview banner ────────────────────────── */}
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12 py-3 text-center">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Dashboard preview</span> — connect
              your account to see live data
            </p>
          </div>
        </div>

        {/* ── Page header ───────────────────────────── */}
        <div className="mx-auto max-w-[1200px] px-6 lg:px-12 pt-12 pb-8">
          <p className="overline mb-2">
            OpenRole
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-950 tracking-tight">
            AI Intelligence Dashboard
          </h1>
          <p className="mt-3 text-sm text-neutral-500 max-w-xl leading-relaxed">
            Monitor how 6 major AI models represent your employer brand — track citations,
            detect hallucinations, and deploy patches.
          </p>
        </div>

        {/* ── Sections ──────────────────────────────── */}
        <div className="mx-auto max-w-[1200px] px-6 lg:px-12 pb-20 space-y-20">
          {/* Section 1: Citation Map */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-neutral-950">
                Citation Map
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Which sources AI models cite when answering questions about your
                company
              </p>
            </div>
            <CitationMap />
          </section>

          {/* Section 2: Model Comparison */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-neutral-950">
                Cross-Model Comparison
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                What each LLM says about your company — with hallucination
                detection
              </p>
            </div>
            <ModelComparison />
          </section>

          {/* Section 3: Crawler Dashboard */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-neutral-950">
                AI Crawler Activity
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Which AI bots visit your site, what they read, and where they
                are blocked
              </p>
            </div>
            <CrawlerDashboard />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
