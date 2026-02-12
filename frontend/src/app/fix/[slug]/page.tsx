/**
 * @module app/fix/[slug]/page
 * Auto-Fix Generator — generates copy-paste-ready fixes based on audit results.
 *
 * After running an audit, employers land here to get actionable fixes:
 * - llms.txt generator
 * - JSON-LD schema markup
 * - Careers page recommendations
 * - robots.txt recommendations
 *
 * Each fix is prioritised by impact and includes a one-click copy button.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Search } from "lucide-react";

import { untypedTable } from "@/lib/supabase/untyped-table";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { FixSections } from "./fix-sections";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export interface StoredAuditResult {
  id: string;
  company_domain: string;
  company_name: string;
  company_slug: string;
  score: number;
  score_breakdown: {
    llmsTxt: number;
    jsonld: number;
    salaryData: number;
    careersPage: number;
    robotsTxt: number;
  };
  has_llms_txt: boolean;
  has_jsonld: boolean;
  has_salary_data: boolean;
  careers_page_status: string;
  robots_txt_status: string;
  ats_detected: string | null;
  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/* Data fetching                                                       */
/* ------------------------------------------------------------------ */

async function getCompanyAudit(slug: string): Promise<StoredAuditResult | null> {
  const { data, error } = await untypedTable("public_audits")
    .select("*")
    .eq("company_slug", slug)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as StoredAuditResult;
}

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const audit = await getCompanyAudit(slug);

  if (!audit) {
    return {
      title: "Fix It — Company Not Found | Rankwell",
      description: "This company hasn't been audited yet.",
    };
  }

  return {
    title: `Fix Your AI Visibility — ${audit.company_name} | Rankwell`,
    description: `Copy-paste fixes to improve ${audit.company_name}'s AI visibility score from ${audit.score}/100. Fix llms.txt, JSON-LD, careers page, and robots.txt issues.`,
    robots: { index: false, follow: true },
  };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function FixPage({ params }: PageProps) {
  const { slug } = await params;
  const audit = await getCompanyAudit(slug);

  if (!audit) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="flex items-center justify-center px-6 py-32">
          <div className="max-w-md text-center">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Company not found
            </h1>
            <p className="text-slate-500 mb-6">
              We haven&apos;t audited this company yet. Run a free audit first.
            </p>
            <Link
              href="/#audit"
              className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              Run a free audit
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const auditDate = new Date(audit.updated_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main>
        {/* ── Hero ──────────────────────────────────── */}
        <section className="bg-white border-b border-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--neutral-200)_1px,_transparent_0)] [background-size:32px_32px] opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent" />
          <div className="relative max-w-3xl mx-auto px-6 py-14 lg:py-20">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center rounded-full bg-brand-accent-light px-3 py-1 text-xs font-semibold text-brand-accent">
                Fix It
              </span>
              <span className="text-xs text-slate-400">
                Score: {audit.score}/100
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Copy-paste fixes for {audit.company_name}
            </h1>
            <p className="text-slate-500 max-w-xl">
              Based on your audit from {auditDate}. Each fix is prioritised by impact —
              start at the top for the biggest score improvement.
            </p>
            <div className="mt-4">
              <Link
                href={`/company/${audit.company_slug}`}
                className="text-sm text-brand-accent hover:underline"
              >
                ← View full audit report
              </Link>
            </div>
          </div>
        </section>

        {/* ── Fix sections (client component for copy buttons) ── */}
        <FixSections audit={audit} />

        {/* ── CTA ───────────────────────────────────── */}
        <section className="bg-white border-t border-slate-200">
          <div className="max-w-3xl mx-auto px-6 py-16 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Want us to handle this?
            </h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Our paid plans include automatic fix implementation, weekly monitoring,
              and AI response correction across 6 models.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              See pricing →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
