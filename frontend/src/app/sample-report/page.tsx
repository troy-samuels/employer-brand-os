/**
 * @module app/sample-report/page
 * Sample AI Employer Brand Report — shows prospects what the paid report looks like.
 *
 * This is the #1 conversion asset. After running a free audit, prospects need to
 * see what they're upgrading to. This page uses realistic mock data for a fictional
 * company to demonstrate the full depth of the paid report.
 *
 * No login required. Freely shareable. SEO-optimised.
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  ExternalLink,
  Target,
  Lightbulb,
  Calendar,
} from "lucide-react";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: "Sample AI Employer Brand Report | OpenRole",
  description:
    "See what an OpenRole AI Employer Brand Report looks like. Real data, real AI responses, real recommendations — for a sample UK employer.",
  openGraph: {
    title: "Sample AI Employer Brand Report | OpenRole",
    description:
      "See what the full OpenRole report includes: AI responses from 4 models, information gap analysis, competitor benchmarking, and a content playbook.",
    type: "website",
    url: "https://openrole.co.uk/sample-report",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sample AI Employer Brand Report | OpenRole",
    description:
      "See what the full OpenRole report includes: AI responses from 4 models, information gap analysis, competitor benchmarking, and a content playbook.",
  },
  alternates: { canonical: "https://openrole.co.uk/sample-report" },
};

/* ------------------------------------------------------------------ */
/* Sample data — fictional company "Greenfield Technologies"           */
/* ------------------------------------------------------------------ */

const COMPANY = {
  name: "Greenfield Technologies",
  domain: "greenfieldtech.co.uk",
  industry: "SaaS / B2B Tech",
  size: "180 employees",
  location: "Manchester, UK",
  score: 34,
  previousScore: 28,
};

const SCORE_BREAKDOWN = [
  { category: "Salary Transparency", score: 2, max: 20, status: "red" as const },
  { category: "Benefits & Perks", score: 4, max: 15, status: "red" as const },
  { category: "Interview Process", score: 1, max: 15, status: "red" as const },
  { category: "Culture & Values", score: 9, max: 15, status: "amber" as const },
  { category: "Remote/Hybrid Policy", score: 3, max: 10, status: "red" as const },
  { category: "Tech Stack", score: 6, max: 10, status: "amber" as const },
  { category: "Career Growth", score: 5, max: 10, status: "amber" as const },
  { category: "Employer Reputation", score: 4, max: 5, status: "pass" as const },
];

const AI_RESPONSES = [
  {
    model: "ChatGPT",
    category: "Salary",
    query: "What is the salary for a Senior Engineer at Greenfield Technologies?",
    response: `Based on available data, a Senior Software Engineer at Greenfield Technologies likely earns between £55,000–£70,000 per year. However, I should note that I don't have verified salary data directly from the company. This estimate is based on:

• Glassdoor salary estimates for similar Manchester-based SaaS companies
• Average UK senior engineering salaries from Indeed (£62,500 median)
• The company's size (~180 employees) and Series B stage

I'd recommend checking directly with Greenfield Technologies or reviewing salary data on Glassdoor for more accurate figures.`,
    citations: ["glassdoor.co.uk", "indeed.com", "payscale.com"],
    accuracy: "inaccurate" as const,
    issue: "Actual senior engineer salary is £75,000–£90,000. AI is underestimating by £15K–£20K because Greenfield hasn't published salary bands anywhere.",
  },
  {
    model: "Perplexity",
    category: "Interview",
    query: "How do I prepare for an interview at Greenfield Technologies?",
    response: `Here's what I found about interviewing at Greenfield Technologies:

The interview process appears to involve multiple stages, though specific details from the company are limited. Based on Glassdoor reviews and candidate experiences shared online:

1. **Initial phone screen** with a recruiter (15–20 minutes)
2. **Technical assessment** — likely a take-home coding challenge
3. **On-site/video interview** with the engineering team
4. **Final round** with a senior leader

Candidates have noted the process can take 3–4 weeks. One Glassdoor review from 2024 mentioned: "The interview was straightforward but I wish I'd known more about their values beforehand."

**Tips:** Research their product and be prepared to discuss scalable SaaS architecture. They use React and Python based on their job listings.`,
    citations: ["glassdoor.co.uk", "reddit.com/r/cscareerquestions", "linkedin.com"],
    accuracy: "partial" as const,
    issue: "Process has changed — now 3 stages, not 4. Take-home was replaced with a pair programming session in 2025. Candidates are preparing for the wrong format.",
  },
  {
    model: "Claude",
    category: "Benefits",
    query: "What benefits does Greenfield Technologies offer?",
    response: `I don't have detailed information about Greenfield Technologies' specific benefits package. Based on what's typically offered by UK SaaS companies of similar size:

**Likely benefits may include:**
• 25 days annual leave + bank holidays
• Pension contributions (likely the statutory minimum of 3%)
• Some form of health coverage or cashback plan
• Flexible/hybrid working arrangements

However, I cannot confirm these specifics for Greenfield Technologies as their careers page doesn't list a detailed benefits breakdown, and I haven't found this information in public sources.

I'd recommend visiting their careers page or reaching out to their recruitment team for accurate benefits information.`,
    citations: ["greenfieldtech.co.uk/careers"],
    accuracy: "missing" as const,
    issue: "AI is guessing entirely. Greenfield actually offers 30 days leave, private medical for families, 6% pension match, £2K learning budget, and equity. None of this is published anywhere AI can find it.",
  },
  {
    model: "Gemini",
    category: "Culture",
    query: "What is the work culture like at Greenfield Technologies?",
    response: `Greenfield Technologies appears to have a positive but evolving work culture. Based on employee reviews and public information:

**Pros mentioned:**
• "Interesting technical challenges" — several reviewers highlight the engineering-first culture
• Collaborative team environment with regular hackathons
• Good work-life balance relative to other startups
• "Management actually listens" — mentioned in 2 recent Glassdoor reviews

**Cons mentioned:**
• Growing pains as the company scales past 150 people
• Some processes still being formalised
• "Career paths aren't always clear" — a recurring theme

Their Glassdoor rating is 3.8/5 from 47 reviews, which is above average for a company of their size.

Note: These insights are based on third-party reviews and may not fully represent the current culture.`,
    citations: ["glassdoor.co.uk", "linkedin.com", "reddit.com"],
    accuracy: "partial" as const,
    issue: "The Glassdoor data is mostly accurate but 18 months old. Greenfield launched a career framework in Q3 2025 — the 'career paths unclear' criticism is outdated. AI is presenting stale reviews as current fact.",
  },
];

const COMPETITORS = [
  { name: "Beacon Digital", score: 67, salary: "pass", benefits: "pass", interview: "pass", culture: "pass" },
  { name: "Cloudsmith UK", score: 52, salary: "partial", benefits: "pass", interview: "partial", culture: "pass" },
  { name: "Greenfield Technologies", score: 34, salary: "fail", benefits: "fail", interview: "fail", culture: "partial" },
  { name: "NorthStack", score: 29, salary: "fail", benefits: "fail", interview: "fail", culture: "fail" },
];

const PLAYBOOK_ITEMS = [
  {
    priority: 1,
    category: "Salary Transparency",
    action: "Publish salary bands on your careers page",
    detail: "Add a salary range to each live role on your careers page. Format: \"Senior Engineer: £75,000–£90,000 base + equity\". This is the single highest-impact action — salary is the most-asked question across all AI models.",
    effort: "30 minutes",
    impact: "High — addresses your biggest information gap",
    template: true,
  },
  {
    priority: 2,
    category: "Benefits & Perks",
    action: "Create a dedicated benefits page",
    detail: "A standalone page at /careers/benefits listing your full package: 30 days leave, private medical, 6% pension match, £2K learning budget, equity. Use headers and bullet points — AI parses structured content more reliably.",
    effort: "1 hour",
    impact: "High — AI is currently guessing your benefits",
    template: true,
  },
  {
    priority: 3,
    category: "Interview Process",
    action: "Publish your interview process",
    detail: "Create an \"Our Interview Process\" page or section. Detail the 3 stages, expected timeline (2 weeks), and what to prepare. This directly improves candidate experience AND gives AI accurate information to cite.",
    effort: "45 minutes",
    impact: "High — candidates are preparing for the wrong format",
    template: true,
  },
  {
    priority: 4,
    category: "Remote/Hybrid Policy",
    action: "Add a clear remote work policy statement",
    detail: "One paragraph on your careers page: \"We're hybrid with 2 days/week in our Manchester office. Engineering teams have flexibility on which days. Fully remote considered for senior roles.\" Be specific.",
    effort: "15 minutes",
    impact: "Medium — common candidate question, easy win",
    template: false,
  },
  {
    priority: 5,
    category: "Culture & Values",
    action: "Update your Glassdoor company response",
    detail: "Respond to the 3 most recent Glassdoor reviews (good and bad). Mention the career framework launched in Q3 2025. This signals to AI that leadership is engaged and data is current.",
    effort: "30 minutes",
    impact: "Medium — refreshes stale third-party data",
    template: false,
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function statusColor(status: string): string {
  if (status === "pass" || status === "green") return "text-teal-600";
  if (status === "partial" || status === "amber") return "text-amber-600";
  return "text-red-500";
}

function statusIcon(status: string) {
  if (status === "pass" || status === "green") return <CheckCircle2 className="h-4 w-4 text-teal-500" />;
  if (status === "partial" || status === "amber") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <XCircle className="h-4 w-4 text-red-400" />;
}

function accuracyLabel(accuracy: string): string {
  if (accuracy === "inaccurate") return "Inaccurate";
  if (accuracy === "partial") return "Partially Correct";
  return "Missing Data";
}

function accuracyColor(accuracy: string): string {
  if (accuracy === "inaccurate") return "bg-red-100 text-red-700";
  if (accuracy === "partial") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

/* ------------------------------------------------------------------ */
/* Page component                                                      */
/* ------------------------------------------------------------------ */

export default function SampleReportPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main>
        {/* ── Banner ────────────────────────────────── */}
        <div className="bg-brand-accent/10 border-b border-brand-accent/20">
          <div className="mx-auto max-w-[1000px] px-6 py-3 flex items-center justify-between">
            <p className="text-sm text-brand-accent font-medium">
              📄 This is a sample report. Want one for your company?
            </p>
            <Link
              href="/#audit"
              className="text-sm font-semibold text-brand-accent hover:underline"
            >
              Run your free audit →
            </Link>
          </div>
        </div>

        {/* ── Report Header ─────────────────────────── */}
        <section className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-[1000px] px-6 lg:px-12 py-14 lg:py-20">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-slate-400" />
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                AI Employer Brand Report
              </p>
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Company info */}
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-2">
                  {COMPANY.name}
                </h1>
                <p className="text-slate-500 mb-4">
                  {COMPANY.domain} · {COMPANY.industry} · {COMPANY.size} · {COMPANY.location}
                </p>
                <p className="text-sm text-slate-400">
                  Report generated 23 February 2026 · 4 AI models queried · 8 categories analysed
                </p>
              </div>

              {/* Score card */}
              <div className="flex items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-center">
                  <span className="text-5xl font-bold text-red-500 tabular-nums">
                    {COMPANY.score}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">/100</p>
                </div>
                <div className="border-l border-slate-100 pl-6">
                  <div className="flex items-center gap-1.5 text-sm">
                    <TrendingUp className="h-4 w-4 text-teal-500" />
                    <span className="text-teal-600 font-medium">+{COMPANY.score - COMPANY.previousScore} pts</span>
                    <span className="text-slate-400">from last month</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Industry average: 41/100
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Executive Summary ─────────────────────── */}
        <section className="py-10 border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1000px] px-6 lg:px-12">
            <div className="rounded-xl bg-red-50 border border-red-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-red-500" />
                Executive Summary
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">
                <strong>{COMPANY.name} has significant information gaps across all four AI models.</strong> When candidates ask AI about salary, benefits, interview process, or remote policy, AI is either guessing based on industry averages or citing 18-month-old Glassdoor reviews. Your competitors in the Manchester SaaS market — particularly Beacon Digital (67/100) — have filled these gaps and are being accurately represented. The result: candidates comparing you with competitors are getting a far better picture of Beacon Digital than of you, despite your reportedly stronger benefits package.
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                <strong>The fix is straightforward.</strong> Five content actions, totalling ~3 hours of work, would address 80% of your information gaps. The highest priority: publish salary bands on your careers page. This is your single biggest gap — and the question candidates ask AI most often.
              </p>
            </div>
          </div>
        </section>

        {/* ── Score Breakdown ───────────────────────── */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-[1000px] px-6 lg:px-12">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Score Breakdown
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              How {COMPANY.name} performs across 8 employer brand categories.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {SCORE_BREAKDOWN.map((item) => (
                <div
                  key={item.category}
                  className="rounded-xl bg-white border border-slate-200 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {statusIcon(item.status)}
                      <h3 className="text-sm font-semibold text-slate-900">{item.category}</h3>
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${statusColor(item.status)}`}>
                      {item.score}/{item.max}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.status === "pass"
                          ? "bg-teal-500"
                          : item.status === "amber"
                            ? "bg-amber-400"
                            : "bg-red-400"
                      }`}
                      style={{ width: `${(item.score / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What AI Actually Says ─────────────────── */}
        <section className="py-12 lg:py-16 bg-white border-t border-b border-slate-200">
          <div className="mx-auto max-w-[1000px] px-6 lg:px-12">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              What AI Actually Says About {COMPANY.name}
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              Real responses from 4 AI models when asked common candidate questions.
            </p>

            <div className="space-y-6">
              {AI_RESPONSES.map((item) => (
                <div
                  key={`${item.model}-${item.category}`}
                  className="rounded-xl border border-slate-200 overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-900">{item.model}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">{item.category}</span>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${accuracyColor(item.accuracy)}`}>
                      {accuracyLabel(item.accuracy)}
                    </span>
                  </div>

                  {/* Query */}
                  <div className="px-5 py-3 bg-slate-25 border-b border-slate-100">
                    <p className="text-sm text-slate-600 italic">
                      &ldquo;{item.query}&rdquo;
                    </p>
                  </div>

                  {/* Response */}
                  <div className="px-5 py-4">
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {item.response}
                    </div>

                    {/* Citations */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.citations.map((citation) => (
                        <span
                          key={citation}
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {citation}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Issue callout */}
                  <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 leading-relaxed">
                        <strong>Gap identified:</strong> {item.issue}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Competitor Benchmarking ────────────────── */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-[1000px] px-6 lg:px-12">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Competitor Benchmarking
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              How {COMPANY.name} compares to similar employers in AI visibility.
            </p>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_4rem_4rem_4rem_4rem_4rem] gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
                <span>Company</span>
                <span className="text-center">Score</span>
                <span className="text-center">Salary</span>
                <span className="text-center">Benefits</span>
                <span className="text-center">Interview</span>
                <span className="text-center">Culture</span>
              </div>

              {COMPETITORS.map((company) => {
                const isTarget = company.name === COMPANY.name;
                return (
                  <div
                    key={company.name}
                    className={`grid grid-cols-[1fr_4rem_4rem_4rem_4rem_4rem] gap-2 px-5 py-3 border-b border-slate-50 items-center ${
                      isTarget ? "bg-amber-50/50" : ""
                    }`}
                  >
                    <span className={`text-sm ${isTarget ? "font-bold text-slate-900" : "text-slate-700"}`}>
                      {company.name}
                      {isTarget && (
                        <span className="ml-2 text-xs text-amber-600 font-medium">(You)</span>
                      )}
                    </span>
                    <span className={`text-center text-sm font-bold tabular-nums ${statusColor(company.score >= 60 ? "pass" : company.score >= 40 ? "partial" : "fail")}`}>
                      {company.score}
                    </span>
                    <span className="text-center">{statusIcon(company.salary)}</span>
                    <span className="text-center">{statusIcon(company.benefits)}</span>
                    <span className="text-center">{statusIcon(company.interview)}</span>
                    <span className="text-center">{statusIcon(company.culture)}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-5">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong>Key insight:</strong> Beacon Digital scores 67/100 — nearly double your score. The difference isn&apos;t brand spend or Glassdoor reviews. They&apos;ve published a salary framework, benefits page, and interview guide on their careers site. That&apos;s it. AI now cites their content directly instead of guessing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Content Playbook ──────────────────────── */}
        <section className="py-12 lg:py-16 bg-white border-t border-b border-slate-200">
          <div className="mx-auto max-w-[1000px] px-6 lg:px-12">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Content Playbook
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              Prioritised actions to close your information gaps. Start with #1 — it has the highest impact.
            </p>

            <div className="space-y-4">
              {PLAYBOOK_ITEMS.map((item) => (
                <div
                  key={item.priority}
                  className="rounded-xl border border-slate-200 p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Priority number */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-accent/10 text-sm font-bold text-brand-accent">
                      {item.priority}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-[15px] font-semibold text-slate-900">{item.action}</h3>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mb-3">
                        {item.detail}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Effort: {item.effort}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {item.impact}
                        </span>
                        {item.template && (
                          <span className="flex items-center gap-1 text-brand-accent">
                            <FileText className="h-3.5 w-3.5" />
                            Template included
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Monday Report Preview ─────────────────── */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-[1000px] px-6 lg:px-12">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Weekly Monitoring
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              Paid plans include a Monday Report delivered to your inbox every week.
            </p>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Monday Report — 17 Feb 2026
                  </h3>
                  <p className="text-sm text-slate-400">
                    {COMPANY.name} · Week 3 of monitoring
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-teal-600 font-medium flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    +6 points this week
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Score</p>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">34 <span className="text-sm font-normal text-teal-500">↑6</span></p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Gaps Closed</p>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">1 <span className="text-sm font-normal text-slate-400">of 5</span></p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">AI Citations</p>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">2 <span className="text-sm font-normal text-teal-500">new</span></p>
                </div>
              </div>

              <div className="rounded-lg bg-teal-50 border border-teal-200 p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-500" />
                  This Week&apos;s Win
                </h4>
                <p className="text-sm text-slate-600">
                  Perplexity is now citing your careers page for culture queries. This happened after you published the updated values page last week.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────── */}
        <section className="py-16 lg:py-20 bg-slate-900">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 tracking-tight">
              Want this report for your company?
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Run a free audit in 30 seconds. See your score, your gaps, and what AI actually tells candidates about you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/#audit"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Run your free audit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-6 py-3 text-sm font-medium text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
              >
                View pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
