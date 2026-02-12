/**
 * @module components/landing/hero
 * Landing page hero with company name input and trust signals.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Shield, Zap, BarChart3 } from "lucide-react";

/**
 * Landing page hero section — the first thing visitors see.
 */
export default function Hero() {
  const [companyName, setCompanyName] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim()) {
      const slug = companyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      router.push(`/audit/${slug}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-50/40 via-white to-white" />

      <div className="relative mx-auto max-w-[1100px] px-6 pb-20 pt-32 lg:px-12 lg:pb-28 lg:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          {/* Overline */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            <span className="text-xs font-semibold text-teal-700 tracking-wide">
              AI Employer Reputation Platform
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Is AI telling the truth{" "}
            <span className="relative">
              <span className="relative z-10 text-teal-600">about your company?</span>
              <span className="absolute bottom-1 left-0 z-0 h-3 w-full bg-teal-100/60 lg:bottom-2 lg:h-4" />
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500 lg:text-xl">
            When candidates ask ChatGPT about your company, the answer comes from old Glassdoor reviews — not you. 
            See exactly what AI is saying, and fix it.
          </p>

          {/* Search input */}
          <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your company name"
                className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-36 text-base text-slate-900 shadow-sm transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!companyName.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Run free audit</span>
                <ArrowRight className="h-4 w-4 sm:hidden" />
              </button>
            </div>
          </form>

          {/* Trust signals */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
            <span>No signup required</span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span>Results in 30 seconds</span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span>Completely free</span>
          </div>
        </div>

        {/* Quick value props */}
        <div className="mx-auto mt-20 grid max-w-3xl gap-8 sm:grid-cols-3">
          {[
            {
              icon: BarChart3,
              title: "Citation Score",
              description: "See what % of AI answers come from sources you control vs Glassdoor & Indeed.",
            },
            {
              icon: Shield,
              title: "Entity Protection",
              description: "Find out if AI is confusing your company with similarly-named organisations.",
            },
            {
              icon: Zap,
              title: "Fix Playbook",
              description: "Get a prioritised action plan to take control of your AI employer reputation.",
            },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-teal-600">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
