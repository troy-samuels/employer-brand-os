/**
 * @module components/landing/prompt-intelligence
 * Landing page section showing candidate prompt categories — what job seekers
 * ask AI about employers, with mock AI response previews.
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Lock, Sparkles } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

interface PromptCategory {
  id: string;
  label: string;
  emoji: string;
  query: string;
  mockResponse: string;
}

const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: "salary",
    label: "Salary & Pay",
    emoji: "💰",
    query: '"What is the salary at [Company]?"',
    mockResponse:
      "Based on available data, [Company] typically pays software engineers between £45,000–£70,000, though this may not reflect current ranges. I wasn't able to find published salary bands on their website...",
  },
  {
    id: "culture",
    label: "Culture & Values",
    emoji: "🏢",
    query: '"What\'s it like to work at [Company]?"',
    mockResponse:
      "According to Glassdoor reviews from 2022, employees describe the culture as fast-paced but sometimes disorganised. The company doesn't have a public culture page, so I'm relying on third-party...",
  },
  {
    id: "benefits",
    label: "Benefits",
    emoji: "🎁",
    query: '"[Company] employee benefits"',
    mockResponse:
      "I found limited information about [Company]'s benefits package. Based on similar companies in their industry, they likely offer standard benefits including pension and holiday...",
  },
  {
    id: "remote",
    label: "Remote Policy",
    emoji: "🏠",
    query: '"Does [Company] allow remote work?"',
    mockResponse:
      "I don't have specific information about [Company]'s remote work policy. Their job listings don't specify a work location policy. Based on industry trends...",
  },
  {
    id: "interview",
    label: "Interview Process",
    emoji: "🎯",
    query: '"[Company] interview process"',
    mockResponse:
      "Based on a few Glassdoor reports, the interview process at [Company] appears to involve 2-3 rounds. However, this information may be outdated as the most recent review is from...",
  },
  {
    id: "competitors",
    label: "Competitors",
    emoji: "⚔️",
    query: '"[Company] vs [Competitor] jobs"',
    mockResponse:
      "[Competitor] has more visible employer branding online, including published salary ranges and a comprehensive careers page. [Company]'s online presence is more limited, making direct comparison...",
  },
  {
    id: "reviews",
    label: "Reviews",
    emoji: "⭐",
    query: '"[Company] employee reviews"',
    mockResponse:
      "[Company] has a 3.2/5 rating on Glassdoor based on 47 reviews. Common themes include good work-life balance but limited career progression. Note: these reviews may not reflect current conditions...",
  },
  {
    id: "growth",
    label: "Growth",
    emoji: "📈",
    query: '"Career growth at [Company]"',
    mockResponse:
      "I don't have specific information about career development programmes at [Company]. Their website doesn't mention progression frameworks or learning budgets...",
  },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function PromptIntelligence() {
  const [activeId, setActiveId] = useState<string>("salary");
  const active = PROMPT_CATEGORIES.find((c) => c.id === activeId) ?? PROMPT_CATEGORIES[0];

  return (
    <section className="py-16 lg:py-20 bg-neutral-50">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        {/* ── Header ─────────────────────────────────── */}
        <div className="mb-12">
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-brand-accent" />
            <p className="overline">Prompt intelligence</p>
          </div>
          <h2 className="max-w-xl text-3xl font-bold text-neutral-950">
            What candidates ask AI about you
          </h2>
          <p className="mt-3 max-w-xl text-neutral-600">
            These are the 8 prompt categories that drive employer research in AI models.
            Every week, candidates ask millions of these queries — is AI getting your answers right?
          </p>
        </div>

        {/* ── Interactive prompt grid ─────────────────── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          {/* Left: category pills */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 content-start">
            {PROMPT_CATEGORIES.map((cat) => {
              const isActive = cat.id === activeId;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveId(cat.id)}
                  className={`group relative flex items-center gap-2.5 rounded-xl px-4 py-3.5 text-left text-sm font-medium transition-all ${
                    isActive
                      ? "bg-neutral-950 text-white shadow-card"
                      : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  <span className="text-base">{cat.emoji}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: mock AI response */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-card"
              >
                {/* Query bar */}
                <div className="flex items-center gap-3 border-b border-neutral-100 bg-neutral-50/80 px-5 py-3.5">
                  <Sparkles className="h-4 w-4 text-brand-accent shrink-0" />
                  <p className="text-sm font-medium text-neutral-950 truncate">
                    {active.query}
                  </p>
                </div>

                {/* Response preview (blurred) */}
                <div className="relative p-5">
                  <p className="text-sm leading-relaxed text-neutral-600 blur-[3px] select-none">
                    {active.mockResponse}
                  </p>

                  {/* Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[1px]">
                    <Lock className="h-6 w-6 text-neutral-400 mb-3" />
                    <p className="text-sm font-semibold text-neutral-950 mb-1 text-center px-4">
                      What is AI actually saying?
                    </p>
                    <p className="text-xs text-neutral-500 text-center max-w-xs px-4">
                      Rankwell monitors these prompts weekly and shows you exactly what AI responds.
                    </p>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-neutral-100 bg-neutral-50/50 px-5 py-3 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">
                    Checked across 6 AI models
                  </span>
                  <a
                    href="/#audit"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-accent hover:underline"
                  >
                    Check your company free →
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
