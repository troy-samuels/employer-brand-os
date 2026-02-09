import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How We Score Your AI Visibility | Rankwell",
  description:
    "Understand the five checks behind your Rankwell AI Visibility Score — and what each one means for how candidates find you through AI.",
};

const CHECKS = [
  {
    name: "AI Instructions (llms.txt)",
    weight: 25,
    what: "We look for an llms.txt file on your domain — a standardised file that tells AI models how to describe your organisation.",
    why: "Without it, AI invents your employer brand from whatever scraps it can find. With it, you control the narrative directly.",
  },
  {
    name: "Structured Data (JSON-LD)",
    weight: 25,
    what: "We scan your homepage for JSON-LD schema markup — machine-readable facts about your organisation, locations, and roles.",
    why: "Structured data is the language AI agents trust most. It's the difference between AI guessing your details and knowing them.",
  },
  {
    name: "Salary Transparency",
    weight: 20,
    what: "We check whether salary information is visible on your careers or job pages in a format AI crawlers can read.",
    why: '"How much does [company] pay?" is one of the top questions candidates ask AI. If you don\'t publish it, AI either guesses or says nothing.',
  },
  {
    name: "Careers Page",
    weight: 15,
    what: "We look for a careers page and assess whether it has enough content for AI to surface your open roles and culture.",
    why: "Your careers page is the primary source AI uses to answer questions about working at your company. A thin page means thin answers.",
  },
  {
    name: "Bot Access (robots.txt)",
    weight: 15,
    what: "We check your robots.txt to see which AI crawlers are allowed or blocked from reading your site.",
    why: "If you're blocking GPTBot, ClaudeBot, or other AI crawlers, none of the above matters — they can't see your site at all.",
  },
];

export default function HowWeScorePage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <Link
            href="/"
            className="inline-block text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors mb-8"
          >
            ← Back to audit
          </Link>
          <h1 className="text-3xl font-bold text-neutral-950 tracking-tight">
            How we calculate your score
          </h1>
          <p className="mt-4 text-lg text-neutral-500 max-w-xl mx-auto leading-relaxed">
            Your AI Visibility Score is based on five checks that measure how
            well AI models can find, read, and accurately describe your employer
            brand.
          </p>
        </div>
      </div>

      {/* Checks */}
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">
        {CHECKS.map((check) => (
          <div
            key={check.name}
            className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(28,25,23,0.06),0_1px_2px_rgba(28,25,23,0.04)]"
          >
            <div className="flex items-baseline justify-between gap-4 mb-3">
              <h2 className="text-[15px] font-semibold text-neutral-950">
                {check.name}
              </h2>
              <span className="text-sm font-semibold tabular-nums text-neutral-400 shrink-0">
                {check.weight} pts
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-neutral-600 mb-2">
              <span className="font-medium text-neutral-800">What we check: </span>
              {check.what}
            </p>
            <p className="text-[13px] leading-relaxed text-neutral-500">
              <span className="font-medium text-neutral-700">Why it matters: </span>
              {check.why}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="max-w-2xl mx-auto px-6 pb-20">
        <div className="rounded-2xl bg-neutral-950 p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            Ready to fix your score?
          </h2>
          <p className="text-sm text-neutral-400 mb-6 max-w-md mx-auto">
            Rankwell automatically optimises your employer brand for AI — so when
            candidates ask about you, the answers are yours.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-neutral-950 hover:bg-neutral-100 transition-colors"
          >
            Run your free audit
          </Link>
        </div>
      </div>
    </main>
  );
}
