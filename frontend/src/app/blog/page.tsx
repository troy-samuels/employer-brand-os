/**
 * @module app/blog/page
 * Blog hub — authority content that educates the market and drives SEO.
 * Each article is a deep-dive, not a listicle. Research-backed, data-driven.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

export const metadata: Metadata = {
  title: "Blog | Rankwell — AI Employer Visibility Insights",
  description:
    "Research-backed insights on how AI represents employers. Data from thousands of audits across ChatGPT, Google AI, Perplexity, and more.",
  alternates: { canonical: "https://rankwell.io/blog" },
};

/* ------------------------------------------------------------------ */
/* Blog post registry                                                  */
/* ------------------------------------------------------------------ */

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
  featured?: boolean;
}

const posts: BlogPost[] = [
  {
    slug: "what-ai-tells-candidates-about-your-company",
    title: "What AI tells candidates about your company (and why it's probably wrong)",
    description:
      "We asked 6 AI models about 500 UK employers. 78% of salary estimates were wrong. Here's what we found — and what you can do about it.",
    category: "Research",
    readTime: "8 min",
    date: "2026-02-11",
    featured: true,
  },
  {
    slug: "glassdoor-doesnt-matter-anymore",
    title: "Why your Glassdoor profile doesn't matter anymore",
    description:
      "ChatGPT cites Wikipedia (7.8%) and Reddit (1.8%) when answering questions about employers. Glassdoor? Not even in the top 10. The data shows a fundamental shift in how candidates research companies.",
    category: "Analysis",
    readTime: "6 min",
    date: "2026-02-12",
  },
  {
    slug: "zero-click-candidate",
    title: "The zero-click candidate: how AI is replacing employer research",
    description:
      "60% of Google searches are already zero-click. When AI Overviews appear, only 8% of users click any link. What this means for your careers page, job boards, and recruitment marketing.",
    category: "Trends",
    readTime: "7 min",
    date: "2026-02-13",
  },
  {
    slug: "llms-txt-guide",
    title: "llms.txt: the file every employer needs in 2026",
    description:
      "A practical guide to creating an llms.txt file — the new standard for telling AI models how to represent your company. Step-by-step instructions with templates.",
    category: "Guide",
    readTime: "5 min",
    date: "2026-02-14",
  },
  {
    slug: "ai-hallucinating-salary-data",
    title: "AI is hallucinating your salary data — here's proof",
    description:
      "We compared what ChatGPT, Google AI, and Perplexity say about salaries at 200 companies vs. actual pay data. The gap is alarming — and it's costing employers candidates.",
    category: "Research",
    readTime: "9 min",
    date: "2026-02-15",
  },
  {
    slug: "800-million-weekly-users",
    title: "800 million people use ChatGPT every week. What are they asking about your company?",
    description:
      "The latest data on AI adoption, search displacement, and what it means for employer brands. Including the stat that changes everything: 13.5% of ChatGPT conversations are information-seeking.",
    category: "Data",
    readTime: "6 min",
    date: "2026-02-16",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function BlogPage() {
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main>
        {/* Hero */}
        <section className="bg-white border-b border-neutral-200">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12 py-16 lg:py-20">
            <p className="text-sm font-semibold text-brand-accent mb-3 tracking-wide uppercase">
              Blog
            </p>
            <h1 className="text-3xl lg:text-4xl font-bold text-neutral-950 tracking-tight max-w-2xl">
              Research & insights on AI employer visibility
            </h1>
            <p className="mt-4 text-lg text-neutral-500 max-w-xl">
              Data-driven analysis from thousands of employer audits.
              No fluff, no listicles — just what the numbers say.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
            {/* Featured post */}
            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="group block rounded-2xl bg-white border border-neutral-200 p-8 lg:p-10 mb-8 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center rounded-full bg-brand-accent/10 px-3 py-1 text-xs font-semibold text-brand-accent">
                    {featured.category}
                  </span>
                  <span className="text-xs text-neutral-400">{featured.readTime} read</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-neutral-950 group-hover:text-brand-accent transition-colors max-w-2xl">
                  {featured.title}
                </h2>
                <p className="mt-3 text-neutral-500 leading-relaxed max-w-2xl">
                  {featured.description}
                </p>
                <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-950 group-hover:text-brand-accent transition-colors">
                  Read article
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            )}

            {/* Post grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-2xl bg-white border border-neutral-200 p-6 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                      {post.category}
                    </span>
                    <span className="text-xs text-neutral-400">{post.readTime}</span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-neutral-950 group-hover:text-brand-accent transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-[13px] text-neutral-500 leading-relaxed line-clamp-3">
                    {post.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 lg:py-16 border-t border-neutral-200 bg-white">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-xl font-bold text-neutral-950 mb-3">
              Want to see your own data?
            </h2>
            <p className="text-sm text-neutral-500 mb-6">
              Run a free audit and see exactly what AI tells candidates about your company.
            </p>
            <Link
              href="/#audit"
              className="inline-flex items-center justify-center rounded-xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
            >
              Free audit
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
