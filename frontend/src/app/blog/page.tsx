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
import { getAllPosts, type BlogPostMetadata } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog | OpenRole — AI Employer Visibility Insights",
  description:
    "Research-backed insights on how AI represents employers. Data from thousands of audits across ChatGPT, Google AI, Perplexity, and more.",
  alternates: { canonical: "https://openrole.co.uk/blog" },
};

/* ------------------------------------------------------------------ */
/* Hardcoded blog posts (legacy)                                       */
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

const hardcodedPosts: BlogPost[] = [
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
  {
    slug: "geo-for-employer-branding",
    title: "GEO for employer branding: the complete guide",
    description:
      "Generative Engine Optimisation is changing how candidates find employers. This guide covers what GEO is, why it matters for talent acquisition, and how to implement it — even if your team has zero SEO experience.",
    category: "Guide",
    readTime: "10 min",
    date: "2026-02-19",
  },
  {
    slug: "ai-employer-brand-score",
    title: "The AI Employer Brand Score: why every HR leader needs one in 2026",
    description:
      "Glassdoor ratings measured human perception. The AI Employer Brand Score measures machine perception — and it's becoming the metric that decides whether candidates ever see your careers page.",
    category: "Analysis",
    readTime: "7 min",
    date: "2026-02-19",
  },
];

/* ------------------------------------------------------------------ */
/* Merge markdown and hardcoded posts                                 */
/* ------------------------------------------------------------------ */

function mergePosts(): BlogPost[] {
  // Get markdown posts
  const markdownPosts = getAllPosts().map((post: BlogPostMetadata) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    category: post.category,
    readTime: post.readTime,
    date: post.date,
    featured: post.featured,
  }));

  // Combine and dedupe (markdown takes precedence over hardcoded)
  const markdownSlugs = new Set(markdownPosts.map((p) => p.slug));
  const nonDuplicateHardcoded = hardcodedPosts.filter(
    (p) => !markdownSlugs.has(p.slug)
  );

  const allPosts = [...markdownPosts, ...nonDuplicateHardcoded];

  // Sort by date (newest first)
  return allPosts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function BlogPage() {
  const posts = mergePosts();
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main>
        {/* Hero */}
        <section className="bg-white border-b border-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--neutral-200)_1px,_transparent_0)] [background-size:32px_32px] opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent" />
          <div className="relative mx-auto max-w-[1200px] px-6 lg:px-12 py-20 lg:py-24">
            <p className="overline mb-4">
              Blog
            </p>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 tracking-tight max-w-2xl">
              Research & insights on AI employer visibility
            </h1>
            <p className="mt-5 text-lg text-slate-500 max-w-xl leading-relaxed">
              Data-driven analysis from thousands of employer audits.
              No fluff, no listicles — just what the numbers say.
            </p>
          </div>
        </section>

        <section className="py-14 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
            {/* Featured post */}
            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="group block rounded-2xl bg-white border border-slate-200 p-8 lg:p-10 mb-8 hover:shadow-elevated hover:border-neutral-300 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center rounded-full bg-brand-accent/10 px-3 py-1 text-xs font-semibold text-brand-accent">
                    {featured.category}
                  </span>
                  <span className="text-xs text-slate-400">{featured.readTime} read</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 group-hover:text-brand-accent transition-colors max-w-2xl">
                  {featured.title}
                </h2>
                <p className="mt-3 text-slate-500 leading-relaxed max-w-2xl">
                  {featured.description}
                </p>
                <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 group-hover:text-brand-accent transition-colors">
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
                  className="group rounded-2xl bg-white border border-slate-200 p-6 hover:shadow-card-hover hover:border-neutral-300 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {post.category}
                    </span>
                    <span className="text-xs text-slate-400">{post.readTime}</span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-slate-900 group-hover:text-brand-accent transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-[13px] text-slate-500 leading-relaxed line-clamp-3">
                    {post.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 lg:py-20 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-3 tracking-tight">
              Want to see your own data?
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Run a free audit and see exactly what AI tells candidates about your company.
            </p>
            <Link
              href="/#audit"
              className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
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
