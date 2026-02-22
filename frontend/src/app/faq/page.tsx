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
  // Understanding the Problem
  {
    slug: "what-does-ai-say-about-employers",
    question: "What does AI actually say about employers?",
    summary:
      "We tested ChatGPT, Claude, Perplexity and Gemini on hundreds of UK companies. They get salaries wrong by an average of £18K, miss benefits entirely, and cite 2-3 year old Glassdoor reviews as current fact. See real examples.",
    category: "Understanding the Problem",
  },
  {
    slug: "why-candidates-use-ai",
    question: "How many candidates use AI to research employers?",
    summary:
      "80% of candidates under 30 use ChatGPT, Claude or Perplexity to research companies before applying. 38% use it as their primary research tool. That AI answer is their first impression — and you didn't get a say in it.",
    category: "Understanding the Problem",
  },
  {
    slug: "what-are-information-gaps",
    question: "What are employer information gaps?",
    summary:
      "Information gaps are specific factual questions AI can't answer about your company — your actual salary bands, specific benefits, remote policy, interview process, tech stack. Glassdoor has opinions, not facts. When AI hits a gap, it guesses. OpenRole finds those gaps.",
    category: "Understanding the Problem",
  },
  // How OpenRole Works
  {
    slug: "how-the-audit-works",
    question: "How does the free audit work?",
    summary:
      "Enter your company name. We query ChatGPT, Claude, Perplexity and Gemini with the exact questions candidates ask. You see the actual AI responses word for word, where they sourced the information, and which questions AI couldn't answer.",
    category: "How OpenRole Works",
  },
  {
    slug: "what-is-the-content-playbook",
    question: "What's in the Content Playbook?",
    summary:
      "For each information gap, you get: what content to publish, where to publish it on your domain, how to format it for AI, and a ready-to-edit template. Most gaps take 20 minutes to fill. We track whether AI starts citing your content.",
    category: "How OpenRole Works",
  },
  {
    slug: "how-long-to-see-results",
    question: "How quickly do AI answers change after publishing content?",
    summary:
      "Typically 2-4 weeks. AI models regularly refresh their knowledge. When you publish specific, dated, well-structured content on your careers page, AI preferences it over vague aggregator data. We track this weekly in your Monday Report.",
    category: "How OpenRole Works",
  },
  {
    slug: "how-scoring-works",
    question: "How does the AI Visibility Score work?",
    summary:
      "Your score (0-100) measures how accurately AI represents your company across 8 factual themes: salary accuracy, benefits completeness, remote policy clarity, interview process transparency, tech stack discoverability, career growth pathways, DEI commitments, and culture specificity.",
    category: "How OpenRole Works",
  },
  // Security & Privacy
  {
    slug: "data-handling",
    question: "How does OpenRole handle our data?",
    summary:
      "We only process publicly available information — your website, careers page, and what AI models say publicly about your company. All data encrypted at rest and in transit. EU-hosted infrastructure. GDPR compliant. We never access anything behind authentication.",
    category: "Security & Privacy",
  },
  {
    slug: "is-it-safe",
    question: "Do we need to install anything?",
    summary:
      "No. OpenRole works entirely from the outside — we query AI models and analyse your public web presence. There's nothing to install, no code snippet, no pixel. Your IT team doesn't need to be involved.",
    category: "Security & Privacy",
  },
  // Pricing & Plans
  {
    slug: "free-vs-paid",
    question: "What's included free vs paid plans?",
    summary:
      "The free audit gives you a full AI scan with gap summary. Paid plans add weekly monitoring, the full Information Gap Report with content templates, competitor benchmarking, and the Content Playbook that tells you exactly what to publish.",
    category: "Pricing & Plans",
  },
  {
    slug: "which-plan",
    question: "Which plan is right for us?",
    summary:
      "Starter (£49/mo) if you want to monitor and get templates. Growth (£149/mo) if you're actively hiring and want the full Content Playbook plus competitor intel. Scale (£399/mo) if you want done-for-you content drafts and board reporting.",
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
