/**
 * @module app/faq/page
 * FAQ hub — deep-dive content pages, not accordions.
 * Each question gets its own page for SEO depth. Hub links to all.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

export const metadata: Metadata = {
  title: "FAQ — AI Visibility Questions Answered | Rankwell",
  description:
    "Everything employers need to know about AI visibility, employer brand in LLMs, llms.txt, the Rankwell pixel, and how scoring works.",
  alternates: { canonical: "https://rankwell.io/faq" },
};

interface FaqEntry {
  slug: string;
  question: string;
  summary: string;
  category: string;
}

const faqs: FaqEntry[] = [
  // Understanding the Problem
  {
    slug: "what-is-ai-visibility",
    question: "What is AI visibility and why should employers care?",
    summary:
      "800M people use ChatGPT weekly. When candidates ask AI about your company, the answer shapes their perception — often with wrong information. AI visibility is whether you control that narrative or not.",
    category: "Understanding AI Visibility",
  },
  {
    slug: "what-do-llms-say-about-employers",
    question: "What do AI models actually say about employers?",
    summary:
      "We tested 6 AI models on hundreds of companies. They hallucinate salaries, invent benefits, use outdated policies, and cite Reddit threads as sources. See real examples.",
    category: "Understanding AI Visibility",
  },
  {
    slug: "which-ai-models-matter",
    question: "Which AI models matter for employer brand?",
    summary:
      "ChatGPT (800M users), Google AI Overviews (built into search), Meta AI (1B users in WhatsApp/Instagram), Perplexity, Copilot, and Claude. Each reaches different candidate demographics.",
    category: "Understanding AI Visibility",
  },
  // How Rankwell Works
  {
    slug: "how-scoring-works",
    question: "How does the AI Visibility Score work?",
    summary:
      "Your score (0-100) measures how accurately AI can represent your company. We check 6 dimensions: careers page, structured data, salary transparency, brand reputation, bot access, and AI instructions.",
    category: "How Rankwell Works",
  },
  {
    slug: "what-is-llms-txt",
    question: "What is llms.txt and how do I create one?",
    summary:
      "llms.txt is a file on your website that tells AI models how to describe your company — like robots.txt for your reputation. We explain the format and provide templates.",
    category: "How Rankwell Works",
  },
  {
    slug: "what-is-the-pixel",
    question: "What does the Rankwell pixel do?",
    summary:
      "A lightweight script on your careers page that makes your employer data available to AI crawlers — even if your ATS normally blocks them. Open-source, SRI-verified, GDPR compliant.",
    category: "How Rankwell Works",
  },
  {
    slug: "how-often-are-audits-updated",
    question: "How often is AI monitoring updated?",
    summary:
      "Free audits are point-in-time snapshots. Paid plans include weekly monitoring with a Monday email report showing what changed, your score trend, and specific recommendations.",
    category: "How Rankwell Works",
  },
  // Security & Privacy
  {
    slug: "pixel-security",
    question: "Is the pixel safe to install? What data does it collect?",
    summary:
      "The pixel collects zero personal data. It serves structured employer facts (company info, job listings, benefits) to AI crawlers. Open-source, SRI-verified, SOC 2 aligned infrastructure.",
    category: "Security & Privacy",
  },
  {
    slug: "data-handling",
    question: "How does Rankwell handle our company data?",
    summary:
      "All data encrypted at rest and in transit. EU-hosted infrastructure. GDPR compliant. We only process publicly available website data — nothing behind authentication, nothing private.",
    category: "Security & Privacy",
  },
  // Pricing & Plans
  {
    slug: "free-vs-paid",
    question: "What's included in the free audit vs paid plans?",
    summary:
      "The free audit gives you a full AI Visibility Score with 6 checks. Paid plans add per-LLM response monitoring, weekly reports, hallucination alerts, and tools to fix what's wrong.",
    category: "Pricing & Plans",
  },
  {
    slug: "which-plan-do-i-need",
    question: "Which plan is right for my company?",
    summary:
      "Starter (1-50 employees, 3 LLMs), Growth (51-500, 4 LLMs + weekly reports), Scale (500+, 6 LLMs + competitor benchmarking). Most companies start with Growth.",
    category: "Pricing & Plans",
  },
];

export default function FaqPage() {
  // Group by category
  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main>
        {/* Hero */}
        <section className="bg-white border-b border-neutral-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--neutral-200)_1px,_transparent_0)] [background-size:32px_32px] opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent" />
          <div className="relative mx-auto max-w-3xl px-6 py-20 lg:py-24">
            <div className="flex items-start gap-3 mb-5">
              <HelpCircle className="h-6 w-6 text-brand-accent mt-0.5" />
              <p className="overline">
                FAQ
              </p>
            </div>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-neutral-950 tracking-tight">
              Questions about AI employer visibility
            </h1>
            <p className="mt-5 text-lg text-neutral-500 leading-relaxed">
              Deep-dive answers, not one-liners. Click through for the full
              explanation with examples and evidence.
            </p>
          </div>
        </section>

        {/* FAQ sections */}
        <section className="py-14 lg:py-20">
          <div className="mx-auto max-w-3xl px-6">
            {categories.map((category) => (
              <div key={category} className="mb-12 last:mb-0">
                <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-4">
                  {category}
                </h2>
                <div className="space-y-3">
                  {faqs
                    .filter((f) => f.category === category)
                    .map((faq) => (
                      <Link
                        key={faq.slug}
                        href={`/faq/${faq.slug}`}
                        className="group block rounded-xl bg-white border border-neutral-200 p-5 hover:shadow-card-hover hover:border-neutral-300 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[15px] font-semibold text-neutral-950 group-hover:text-brand-accent transition-colors">
                              {faq.question}
                            </h3>
                            <p className="mt-1.5 text-[13px] text-neutral-500 leading-relaxed">
                              {faq.summary}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-brand-accent transition-colors mt-1 shrink-0" />
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 lg:py-16 border-t border-neutral-200 bg-white">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-xl font-bold text-neutral-950 mb-3">
              Still have questions?
            </h2>
            <p className="text-sm text-neutral-500 mb-6">
              Run a free audit to see exactly what AI says about your company, or get in touch.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/#audit"
                className="inline-flex items-center justify-center rounded-xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
              >
                Free audit
              </Link>
              <a
                href="mailto:hello@rankwell.io"
                className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-950 hover:bg-neutral-200 transition-colors"
              >
                Contact us
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
