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
import { BASE_URL, SITE_NAME, generateProductSchema, JsonLd } from "@/lib/seo";

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
    llmCount: 3,
    llmNames: "ChatGPT, Google AI, Perplexity",
    features: [
      "AI Visibility Score audit",
      "3 LLM reputation checks",
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
    llmCount: 4,
    llmNames: "+ Microsoft Copilot",
    features: [
      "Everything in Starter",
      "4 LLM reputation checks",
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
    llmCount: 6,
    llmNames: "+ Claude, Meta AI",
    features: [
      "Everything in Growth",
      "6 LLM reputation checks — full coverage",
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
    q: "What AI models does OpenRole monitor?",
    a: "Starter covers ChatGPT, Google AI Overviews, and Perplexity — the three highest-reach models for candidate research. Growth adds Microsoft Copilot. Scale covers all six including Claude and Meta AI. We add new models as they gain adoption.",
  },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  const productSchema = generateProductSchema({
    name: `${SITE_NAME} — AI Employer Visibility Platform`,
    description:
      "Control what AI tells candidates about your company. Weekly monitoring, hallucination alerts, and tools to fix your AI employer reputation.",
    url: `${BASE_URL}/pricing`,
    offers: [
      { name: "Starter Plan", price: "49", priceCurrency: "GBP" },
      { name: "Growth Plan", price: "149", priceCurrency: "GBP" },
      { name: "Scale Plan", price: "399", priceCurrency: "GBP" },
    ],
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd data={productSchema} />
      <Header />

      <main>
        {/* ── Hero ───────────────────────────────────── */}
        <section className="bg-white border-b border-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--neutral-200)_1px,_transparent_0)] [background-size:40px_40px] opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent" />
          <div className="relative mx-auto max-w-3xl px-6 py-20 lg:py-24 text-center">
            <p className="overline mb-4">
              Pricing
            </p>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 tracking-tight">
              Cheaper than one bad hire
            </h1>
            <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
              Plans scale with your company. The free audit is always free.
              When you&apos;re ready to fix what it finds, pick the tier that
              fits.
            </p>

            {/* ── Billing toggle ─────────────────────── */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-slate-100 p-1">
              <button
                onClick={() => setAnnual(false)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  !annual
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-neutral-700"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  annual
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-neutral-700"
                }`}
              >
                Annual
                <span className="ml-1.5 text-xs font-semibold text-teal-600">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ── Free audit banner ──────────────────────── */}
        <section className="border-b border-slate-200 bg-slate-900">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center rounded-full bg-teal-600/20 px-3 py-1 text-xs font-semibold text-teal-400">
                Free forever
              </span>
              <span className="text-sm text-slate-300">
                AI Visibility Score audit — no signup, no credit card
              </span>
            </div>
            <Link
              href="/#audit"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-slate-300 transition-colors"
            >
              Run your free audit
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* ── Plan cards ─────────────────────────────── */}
        <section className="py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
            <div className="grid gap-6 md:grid-cols-3 items-start">
              {plans.map((plan) => {
                const price = annual ? plan.annualPrice : plan.monthlyPrice;
                const Icon = plan.icon;

                return (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={`relative rounded-2xl bg-white p-7 lg:p-8 border transition-all duration-300 ${
                      plan.highlighted
                        ? "border-brand-accent ring-1 ring-brand-accent/20 shadow-elevated md:scale-[1.03]"
                        : "border-slate-200 hover:shadow-card-hover hover:border-neutral-300"
                    }`}
                  >
                    {plan.highlighted && (
                      <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-brand-accent px-3 py-1 text-xs font-semibold text-white">
                        Most popular
                      </span>
                    )}

                    <div className="mb-6">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100">
                          <Icon className="h-4 w-4 text-slate-600" strokeWidth={2} />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900">
                          {plan.name}
                        </h3>
                      </div>

                      <p className="text-xs font-medium text-slate-400 mb-4">
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
                            className="text-3xl font-bold text-slate-900 tabular-nums"
                          >
                            £{price}
                          </motion.span>
                        </AnimatePresence>
                        <span className="text-slate-500 text-sm">/month</span>
                      </div>

                      {annual && (
                        <p className="text-xs text-slate-400 mt-1">
                          Billed annually (£{price * 12}/year)
                        </p>
                      )}

                      <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm text-slate-600"
                        >
                          <Check
                            className="h-4 w-4 text-teal-500 mt-0.5 shrink-0"
                            strokeWidth={2}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={plan.href}
                      className={`flex items-center justify-center w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                        plan.highlighted
                          ? "bg-brand-accent text-white hover:bg-brand-accent-hover shadow-md shadow-brand-accent/20"
                          : "bg-slate-100 text-slate-900 hover:bg-neutral-200"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* ── Enterprise row ────────────────────── */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100">
                      <Shield className="h-4 w-4 text-slate-600" strokeWidth={2} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {enterprise.name}
                    </h3>
                    <span className="text-xs font-medium text-slate-400">
                      {enterprise.audience}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 max-w-lg">
                    For organisations that need custom integrations, dedicated
                    support, and SLA-backed accuracy guarantees.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <ul className="flex flex-wrap gap-x-4 gap-y-1">
                    {enterprise.features.slice(1, 4).map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-1.5 text-xs text-slate-500"
                      >
                        <Check className="h-3 w-3 text-teal-500 shrink-0" strokeWidth={2} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="mailto:hello@openrole.co.uk"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-neutral-200 transition-colors shrink-0"
                  >
                    Talk to us
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* ── Agency callout ─────────────────────── */}
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-500">
                Recruitment agency or consultancy?{" "}
                <a
                  href="mailto:hello@openrole.co.uk"
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
        <section className="border-t border-slate-200 bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-2xl px-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-12 tracking-tight">
              Frequently asked questions
            </h2>

            <dl className="space-y-8">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <dt className="text-[15px] font-semibold text-slate-900 mb-2">
                    {faq.q}
                  </dt>
                  <dd className="text-sm leading-relaxed text-slate-500">
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
            <div className="rounded-2xl bg-slate-900 p-8 lg:p-12 text-center">
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-3">
                Not sure yet? Start with the free audit.
              </h2>
              <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
                See exactly what AI gets wrong about your company.
                No signup, no credit card, takes 30 seconds.
              </p>
              <Link
                href="/#audit"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
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
