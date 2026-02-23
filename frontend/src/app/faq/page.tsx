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
import { generateFAQSchema, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "FAQ — AI Employer Visibility Questions Answered",
  description:
    "Everything employers need to know about AI employer visibility, information gaps, content playbooks, and how OpenRole helps you control what AI tells your candidates.",
  openGraph: {
    title: "FAQ — AI Employer Visibility Questions Answered | OpenRole",
    description:
      "Everything employers need to know about AI employer visibility, information gaps, content playbooks, and how OpenRole helps you control what AI tells your candidates.",
    url: "https://openrole.co.uk/faq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — AI Employer Visibility Questions Answered | OpenRole",
    description:
      "Everything employers need to know about AI employer visibility, information gaps, content playbooks, and how OpenRole helps you control what AI tells your candidates.",
  },
  alternates: { canonical: "https://openrole.co.uk/faq" },
};

interface FaqEntry {
  slug: string;
  question: string;
  summary: string;
  category: string;
}

const faqs: FaqEntry[] = [
  // Understanding AI Visibility
  {
    slug: "what-is-ai-visibility",
    question: "What is AI visibility and why should employers care?",
    summary:
      "AI visibility measures how accurately AI models represent your company to job seekers. 800M people use ChatGPT weekly — when candidates ask about you, AI answers instantly. If that answer is wrong, they move on. You never know they were interested.",
    category: "Understanding AI Visibility",
  },
  {
    slug: "what-do-llms-say-about-employers",
    question: "What do AI models actually say about employers?",
    summary:
      "We tested ChatGPT, Claude, Perplexity and Gemini on hundreds of UK companies. They get salaries wrong by an average of £18K, miss benefits entirely, and cite 2-3 year old data as current fact. See real examples.",
    category: "Understanding AI Visibility",
  },
  {
    slug: "which-ai-models-matter",
    question: "Which AI models matter for employer brand?",
    summary:
      "ChatGPT (800M weekly users), Google AI Overviews, Perplexity, Claude, and Meta AI (1B monthly users in WhatsApp/Instagram). Each cites different sources — only 25% content overlap between platforms.",
    category: "Understanding AI Visibility",
  },
  // How OpenRole Works
  {
    slug: "how-scoring-works",
    question: "How does the AI Visibility Score work?",
    summary:
      "Your score (0-100) measures how well-equipped your digital presence is for AI models to accurately represent your company. We audit 6 dimensions: structured data, AI crawler access, careers page, brand reputation, salary transparency, and content format.",
    category: "How OpenRole Works",
  },
  {
    slug: "what-is-llms-txt",
    question: "Does llms.txt help with AI visibility?",
    summary:
      "llms.txt is a structured file at your domain root that tells AI models how to describe your organisation. Think of it as robots.txt for your reputation. 91% of UK employers don't have one.",
    category: "How OpenRole Works",
  },
  {
    slug: "what-is-the-pixel",
    question: "What does the OpenRole pixel do?",
    summary:
      "The pixel is a lightweight JavaScript snippet (~2KB) that serves structured employer data to AI crawlers visiting your careers page. It makes your company information readable by AI models.",
    category: "How OpenRole Works",
  },
  {
    slug: "how-often-are-audits-updated",
    question: "How often is AI monitoring updated?",
    summary:
      "AI models retrain regularly — what they say about you changes over time. Weekly monitoring catches hallucinations, tracks your optimisation efforts, and alerts you when AI narratives shift.",
    category: "How OpenRole Works",
  },
  // Security & Privacy
  {
    slug: "pixel-security",
    question: "Is the pixel safe to install? What data does it collect?",
    summary:
      "Yes. The pixel collects zero personal data, doesn't track users, and doesn't set cookies. It uses SRI hashes, HMAC signing, and runs on SOC 2 certified infrastructure. Your security team can inspect the open-source code.",
    category: "Security & Privacy",
  },
  {
    slug: "data-handling",
    question: "How does OpenRole handle our company data?",
    summary:
      "We only process publicly available information — your website, careers page, and what AI models say publicly about your company. All data encrypted at rest and in transit. EU-hosted infrastructure. GDPR compliant.",
    category: "Security & Privacy",
  },
  // Pricing & Plans
  {
    slug: "free-vs-paid",
    question: "What's included free vs paid?",
    summary:
      "The free audit gives you a full AI scan with gap summary. Paid plans add weekly monitoring, the full Information Gap Report with content templates, competitor benchmarking, and the Content Playbook.",
    category: "Pricing & Plans",
  },
  {
    slug: "which-plan-do-i-need",
    question: "Which plan is right for my company?",
    summary:
      "Starter (£49/mo) if you want to monitor and get templates. Growth (£149/mo) if you're actively hiring and want the full Content Playbook plus competitor intel. Scale (£399/mo) for done-for-you content drafts and board reporting.",
    category: "Pricing & Plans",
  },
];

export default function FaqPage() {
  // Group by category
  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  // Generate FAQ schema from all FAQs
  const faqSchema = generateFAQSchema(
    faqs.map((f) => ({
      question: f.question,
      answer: f.summary,
    }))
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd data={faqSchema} />
      <Header />

      <main>
        {/* Hero */}
        <section className="bg-white border-b border-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--neutral-200)_1px,_transparent_0)] [background-size:32px_32px] opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent" />
          <div className="relative mx-auto max-w-3xl px-6 py-20 lg:py-24">
            <div className="flex items-start gap-3 mb-5">
              <HelpCircle className="h-6 w-6 text-brand-accent mt-0.5" />
              <p className="overline">FAQ</p>
            </div>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 tracking-tight">
              Questions about AI employer visibility
            </h1>
            <p className="mt-5 text-lg text-slate-500 leading-relaxed">
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
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
                  {category}
                </h2>
                <div className="space-y-3">
                  {faqs
                    .filter((f) => f.category === category)
                    .map((faq) => (
                      <Link
                        key={faq.slug}
                        href={`/faq/${faq.slug}`}
                        className="group block rounded-xl bg-white border border-slate-200 p-5 hover:shadow-card-hover hover:border-neutral-300 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[15px] font-semibold text-slate-900 group-hover:text-brand-accent transition-colors">
                              {faq.question}
                            </h3>
                            <p className="mt-1.5 text-[13px] text-slate-500 leading-relaxed">
                              {faq.summary}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-accent transition-colors mt-1 shrink-0" />
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 lg:py-16 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Still have questions?
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Run a free audit to see exactly what AI says about your company,
              or get in touch.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/#audit"
                className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
              >
                Free audit
              </Link>
              <a
                href="mailto:hello@openrole.co.uk"
                className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-neutral-200 transition-colors"
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
