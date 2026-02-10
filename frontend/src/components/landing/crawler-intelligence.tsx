/**
 * @module components/landing/crawler-intelligence
 * Landing page section showing AI crawler tracking — which AI bots visit your site,
 * what they read, and where they're blocked. Inspired by Profound's Agent Analytics.
 */

"use client";

import { motion } from "framer-motion";
import { Bot, Eye, ShieldAlert, ArrowRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

interface CrawlerRow {
  name: string;
  org: string;
  visits: number;
  pagesRead: number;
  status: "allowed" | "partial" | "blocked" | "not_crawling";
  note: string;
  logo: string;
}

const MOCK_CRAWLERS: CrawlerRow[] = [
  {
    name: "Google-Extended",
    org: "Google",
    visits: 34,
    pagesRead: 22,
    status: "allowed",
    note: "Full access, read 22 pages",
    logo: "🟢",
  },
  {
    name: "GPTBot",
    org: "OpenAI",
    visits: 12,
    pagesRead: 8,
    status: "partial",
    note: "Blocked by robots.txt on /careers",
    logo: "🟡",
  },
  {
    name: "PerplexityBot",
    org: "Perplexity",
    visits: 8,
    pagesRead: 3,
    status: "allowed",
    note: "Read 3 pages, skipped JS-heavy content",
    logo: "🟢",
  },
  {
    name: "ClaudeBot",
    org: "Anthropic",
    visits: 5,
    pagesRead: 0,
    status: "blocked",
    note: "Blocked entirely by robots.txt",
    logo: "🔴",
  },
  {
    name: "Meta-ExternalAgent",
    org: "Meta",
    visits: 0,
    pagesRead: 0,
    status: "not_crawling",
    note: "Not crawling your domain",
    logo: "⚫",
  },
];

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function StatusDot({ status }: { status: CrawlerRow["status"] }) {
  const colors = {
    allowed: "bg-status-verified",
    partial: "bg-status-warning",
    blocked: "bg-status-critical",
    not_crawling: "bg-neutral-300",
  };

  return (
    <span className={`inline-block h-2 w-2 rounded-full ${colors[status]}`} />
  );
}

function CrawlerTableRow({ crawler, index }: { crawler: CrawlerRow; index: number }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: 0.05 * index }}
      className="border-b border-neutral-100 last:border-0"
    >
      <td className="py-3.5 pr-4">
        <div className="flex items-center gap-2.5">
          <StatusDot status={crawler.status} />
          <div>
            <p className="text-sm font-semibold text-neutral-950">{crawler.name}</p>
            <p className="text-[11px] text-neutral-400">{crawler.org}</p>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4 text-center">
        <span className="text-sm font-semibold tabular-nums text-neutral-950">
          {crawler.visits}
        </span>
      </td>
      <td className="py-3.5 px-4 text-center">
        <span className="text-sm font-semibold tabular-nums text-neutral-950">
          {crawler.pagesRead}
        </span>
      </td>
      <td className="py-3.5 pl-4">
        <span className="text-xs text-neutral-500">{crawler.note}</span>
      </td>
    </motion.tr>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function CrawlerIntelligence() {
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        {/* ── Header ─────────────────────────────────── */}
        <div className="mb-12">
          <div className="mb-3 flex items-center gap-2">
            <Bot className="h-4 w-4 text-brand-accent" />
            <p className="overline">Crawler intelligence</p>
          </div>
          <h2 className="max-w-xl text-3xl font-bold text-neutral-950">
            Know which AI models can read your site
          </h2>
          <p className="mt-3 max-w-xl text-neutral-600">
            AI crawlers visit your site daily to learn about your company.
            See exactly which ones get in — and which ones you&apos;re invisible to.
          </p>
        </div>

        {/* ── Mock dashboard ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl"
        >
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-card overflow-hidden">
            {/* Dashboard chrome */}
            <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/80 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <Eye className="h-4 w-4 text-brand-accent" />
                <p className="text-sm font-semibold text-neutral-950">
                  AI Crawler Activity
                </p>
                <span className="text-xs text-neutral-400">— This week</span>
              </div>
              <span className="inline-flex items-center rounded-full bg-brand-accent-light px-2.5 py-0.5 text-[10px] font-semibold text-brand-accent">
                Growth plan
              </span>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 divide-x divide-neutral-100 border-b border-neutral-100">
              {[
                { label: "Total visits", value: "59" },
                { label: "Pages read", value: "33" },
                { label: "Crawlers blocked", value: "2" },
              ].map((stat) => (
                <div key={stat.label} className="px-5 py-4 text-center">
                  <p className="text-xl font-bold tabular-nums text-neutral-950">{stat.value}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Crawler table */}
            <div className="px-5 py-2 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="py-2.5 pr-4 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                      Crawler
                    </th>
                    <th className="py-2.5 px-4 text-center text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                      Visits
                    </th>
                    <th className="py-2.5 px-4 text-center text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                      Pages
                    </th>
                    <th className="py-2.5 pl-4 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CRAWLERS.map((crawler, i) => (
                    <CrawlerTableRow key={crawler.name} crawler={crawler} index={i} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Alert row */}
            <div className="mx-5 mb-5 mt-3 flex items-center gap-3 rounded-lg bg-status-critical-light px-4 py-3">
              <ShieldAlert className="h-4 w-4 text-status-critical shrink-0" />
              <p className="text-xs text-neutral-700">
                <span className="font-semibold">2 crawlers blocked</span> — you&apos;re invisible to
                ChatGPT on your careers page and completely hidden from Claude.
              </p>
            </div>
          </div>

          {/* Caption */}
          <p className="mt-4 text-center text-xs text-neutral-400">
            Mock preview — actual data available on Growth and Scale plans.
          </p>
        </motion.div>

        {/* ── Bottom CTA ─────────────────────────────── */}
        <div className="mt-10 text-center">
          <a
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-950 hover:text-neutral-700 transition-colors"
          >
            See crawler intelligence on Growth plan
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
