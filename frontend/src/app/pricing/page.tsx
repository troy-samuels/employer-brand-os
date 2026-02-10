/**
 * @module app/pricing/page
 * Standalone pricing page — size-based tiers with annual toggle.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Building2, Users, Zap, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const plans = [
  {
    name: "Starter",
    audience: "1–50 employees",
    icon: Zap,
    monthlyPrice: 49,
    annualPrice: 39,
    description: "See how AI represents you and start fixing it.",
    features: [
      "AI Visibility Score audit",
      "Pixel installation (1 domain)",
      "Employer facts dashboard",
      "Hosted verification page",
      "Monthly reputation snapshot",
    ],
    cta: "Get started",
    href: "/signup?plan=starter",
  },
  {
    name: "Growth",
    audience: "51–500 employees",
    icon: Users,
    monthlyPrice: 149,
    annualPrice: 119,
    description: "Weekly monitoring, compliance, and hallucination alerts.",
    features: [
      "Everything in Starter",
      "Weekly Monday Report",
      "Up to 5 locations",
      "Salary transparency compliance",
      "Hallucination alerts",
      "AI response correction",
    ],
    cta: "Get started",
    href: "/signup?plan=growth",
    highlighted: true,
  },
  {
    name: "Scale",
    audience: "500+ employees",
    icon: Building2,
    monthlyPrice: 399,
    annualPrice: 319,
    description: "Full AI reputation control with competitor intelligence.",
    features: [
      "Everything in Growth",
      "Unlimited locations",
      "Competitor benchmarking",
      "Advanced sanitisation rules",
      "Priority crawl requests",
      "Dedicated onboarding",
    ],
    cta: "Get started",
    href: "/signup?plan=scale",
  },
];

const enterprise = {
  name: "Enterprise",
  audience: "2,000+ employees or multi-brand",
  icon: Shield,
  features: [
    "Everything in Scale",
    "White-label verification pages",
    "Custom ATS/HRIS integrations",
    "Dedicated account manager",
    "SLA on AI accuracy",
    "Custom reporting & data exports",
  ],
};

const faqs = [
  {
    q: "What counts as an employee?",
    a: "Full-time and part-time headcount on your careers page or public profiles. Contractors aren't included. We trust your self-reported number — we're not auditing your payroll.",
  },
  {
    q: "Can I start with the free audit?",
    a: "Absolutely. Run as many free audits as you like — no signup required. When you're ready to fix what the audit finds, pick a plan.",
  },
  {
    q: "What happens if I grow past my plan's employee range?",
    a: "We'll let you know and move you up at the start of your next billing cycle. No surprise charges mid-month.",
  },
  {
    q: "Is there a contract or minimum commitment?",
    a: "Monthly plans cancel anytime. Annual plans are paid upfront with a 20% discount. No lock-in beyond what you've paid for.",
  },
  {
    q: "Do you offer agency or recruitment consultancy pricing?",
    a: "Yes — if you manage employer brands for multiple clients, we offer wholesale pricing from £99/month per location. Get in touch.",
  },
  {
    q: "What AI models does Rankwell monitor?",
    a: "We currently track ChatGPT, Claude, Perplexity, Google AI Overviews, and Microsoft Copilot. New models are added as they gain adoption.",
  },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main>
        {/* ── Hero ───────────────────────────────────── */}
        <section className="bg-white border-b border-neutral-200">
          <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20 text-center">
            <p className="text-sm font-semibold text-brand-accent mb-3 tracking-wide uppercase">
              Pricing
            </p>
            <h1 className="text-3xl lg:text-4xl font-bold text-neutral-950 tracking-tight">
              Cheaper than one bad hire
            </h1>
            <p className="mt-4 text-lg text-neutral-500 max-w-xl mx-auto leading-relaxed">
              Plans scale with your company. The free audit is always free.
              When you&apos;re ready to fix what it finds, pick the tier that
              fits.
            </p>

            {/* ── Billing toggle ─────────────────────── */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-neutral-100 p-1">
              <button
                onClick={() => setAnnual(false)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  !annual
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  annual
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                Annual
                <span className="ml-1.5 text-xs font-semibold text-emerald-600">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ── Free audit banner ──────────────────────── */}
        <section className="border-b border-neutral-200 bg-neutral-950">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                Free forever
              </span>
              <span className="text-sm text-neutral-300">
                AI Visibility Score audit — no signup, no credit card
              </span>
            </div>
            <Link
              href="/#audit"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-neutral-300 transition-colors"
            >
              Run your free audit
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* ── Plan cards ─────────────────────────────── */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => {
                const price = annual ? plan.annualPrice : plan.monthlyPrice;
                const Icon = plan.icon;

                return (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={`relative rounded-2xl bg-white p-6 lg:p-8 border ${
                      plan.highlighted
                        ? "border-brand-accent border-t-2 shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
                        : "border-neutral-200"
                    }`}
                  >
                    {plan.highlighted && (
                      <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-brand-accent px-3 py-1 text-xs font-semibold text-white">
                        Most popular
                      </span>
                    )}

                    <div className="mb-6">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-neutral-100">
                          <Icon className="h-4 w-4 text-neutral-600" strokeWidth={2} />
                        </div>
                        <h3 className="text-base font-semibold text-neutral-950">
                          {plan.name}
                        </h3>
                      </div>

                      <p className="text-xs font-medium text-neutral-400 mb-4">
                        {plan.audience}
                      </p>

                      <div className="flex items-baseline gap-1">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={price}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.2 }}
                            className="text-3xl font-bold text-neutral-950 tabular-nums"
                          >
                            £{price}
                          </motion.span>
                        </AnimatePresence>
                        <span className="text-neutral-500 text-sm">/month</span>
                      </div>

                      {annual && (
                        <p className="text-xs text-neutral-400 mt-1">
                          Billed annually (£{price * 12}/year)
                        </p>
                      )}

                      <p className="text-neutral-600 text-sm mt-3 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm text-neutral-600"
                        >
                          <Check
                            className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0"
                            strokeWidth={2}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={plan.href}
                      className={`flex items-center justify-center w-full rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                        plan.highlighted
                          ? "bg-neutral-950 text-white hover:bg-neutral-800"
                          : "bg-neutral-100 text-neutral-950 hover:bg-neutral-200"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* ── Enterprise row ────────────────────── */}
            <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-neutral-100">
                      <Shield className="h-4 w-4 text-neutral-600" strokeWidth={2} />
                    </div>
                    <h3 className="text-base font-semibold text-neutral-950">
                      {enterprise.name}
                    </h3>
                    <span className="text-xs font-medium text-neutral-400">
                      {enterprise.audience}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 max-w-lg">
                    For organisations that need custom integrations, dedicated
                    support, and SLA-backed accuracy guarantees.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <ul className="flex flex-wrap gap-x-4 gap-y-1">
                    {enterprise.features.slice(1, 4).map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-1.5 text-xs text-neutral-500"
                      >
                        <Check className="h-3 w-3 text-emerald-500 shrink-0" strokeWidth={2} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="mailto:hello@rankwell.io"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-100 px-5 py-3 text-sm font-semibold text-neutral-950 hover:bg-neutral-200 transition-colors shrink-0"
                  >
                    Talk to us
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* ── Agency callout ─────────────────────── */}
            <div className="mt-4 text-center">
              <p className="text-sm text-neutral-500">
                Recruitment agency or consultancy?{" "}
                <a
                  href="mailto:hello@rankwell.io"
                  className="text-brand-accent hover:underline font-medium"
                >
                  Ask about wholesale pricing
                </a>{" "}
                — from £99/month per client.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────── */}
        <section className="border-t border-neutral-200 bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-2xl px-6">
            <h2 className="text-2xl font-bold text-neutral-950 mb-10">
              Frequently asked questions
            </h2>

            <dl className="space-y-8">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <dt className="text-[15px] font-semibold text-neutral-950 mb-2">
                    {faq.q}
                  </dt>
                  <dd className="text-sm leading-relaxed text-neutral-500">
                    {faq.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Bottom CTA ─────────────────────────────── */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-2xl px-6">
            <div className="rounded-2xl bg-neutral-950 p-8 lg:p-12 text-center">
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-3">
                Not sure yet? Start with the free audit.
              </h2>
              <p className="text-sm text-neutral-400 mb-6 max-w-md mx-auto">
                See exactly what AI gets wrong about your company.
                No signup, no credit card, takes 30 seconds.
              </p>
              <Link
                href="/#audit"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-neutral-950 hover:bg-neutral-100 transition-colors"
              >
                Run your free audit
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
