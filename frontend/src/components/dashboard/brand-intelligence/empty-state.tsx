/**
 * @module components/dashboard/brand-intelligence/empty-state
 * Empty state shown to new users before their first monitoring check.
 * Server component.
 */

import Link from "next/link";
import { Card } from "@/components/ui/card";

export function BrandIntelligenceEmptyState() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="overline mb-2">Brand Intelligence</p>
        <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">
          AI Brand Intelligence
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Monitor how AI models represent your company to candidates
        </p>
      </div>

      {/* Empty state card */}
      <Card variant="bordered" padding="lg" className="text-center py-16">
        {/* Icon */}
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-accent-light mb-6">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brand-accent"
          >
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-neutral-950 mb-2">
          Run your first monitoring check
        </h2>
        <p className="text-sm text-neutral-500 max-w-md mx-auto mb-8 leading-relaxed">
          We&apos;ll scan ChatGPT, Claude, Perplexity, and Gemini to see what they
          tell candidates about your company. Your first report takes about 60 seconds.
        </p>

        {/* Steps */}
        <div className="grid gap-4 sm:grid-cols-3 max-w-lg mx-auto mb-8 text-left">
          <div className="rounded-lg border border-neutral-200 p-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent-light text-xs font-bold text-brand-accent mb-2">
              1
            </span>
            <p className="text-xs font-medium text-neutral-950">Add your company</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Set up your company profile and careers page URL</p>
          </div>
          <div className="rounded-lg border border-neutral-200 p-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent-light text-xs font-bold text-brand-accent mb-2">
              2
            </span>
            <p className="text-xs font-medium text-neutral-950">We scan AI models</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">4 models checked across 8 categories</p>
          </div>
          <div className="rounded-lg border border-neutral-200 p-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent-light text-xs font-bold text-brand-accent mb-2">
              3
            </span>
            <p className="text-xs font-medium text-neutral-950">See your report</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Get your AI visibility score and action plan</p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard/facts"
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
        >
          Set up your company profile
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </Card>
    </div>
  );
}
