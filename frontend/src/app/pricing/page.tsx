/**
 * @module app/pricing/page
 * Pricing page — Four tiers: Control / Compete / Command / Enterprise
 * Annual-first display. Monthly carries 20% premium + setup fee.
 * Clean, minimal design with generous whitespace.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  Shield,
  Lock,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import {
  CheckoutButton,
  ContactSalesButton,
} from "@/components/pricing/checkout-button";
import { BASE_URL, SITE_NAME, generateProductSchema, JsonLd } from "@/lib/seo";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const plans = [
  {
    name: "Control",
    monthlyPrice: 149,
    annualPrice: 119,
    subtitle: "Monitor & start fixing",
    features: [
      "Weekly monitoring across 4 AI models",
      "Auto-generated AEO content",
      "Embeddable JS snippet",
      "Content playbook",
      "Brand defence alerts",
      "1 competitor benchmark",
    ],
    cta: "Start free trial",
    href: "/signup?plan=control",
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CONTROL ?? null,
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CONTROL_ANNUAL ?? null,
  },
  {
    name: "Compete",
    monthlyPrice: 299,
    annualPrice: 239,
    subtitle: "Outmanoeuvre your talent competitors",
    features: [
      "Everything in Control",
      "5 competitor benchmarks",
      "Displacement reports",
      "ATS integration",
      "Proof tracking",
      "Custom branded reports",
    ],
    foundingRate: 199,
    cta: "Start free trial",
    href: "/signup?plan=compete",
    highlighted: true,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COMPETE ?? null,
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COMPETE_ANNUAL ?? null,
  },
  {
    name: "Command",
    monthlyPrice: 599,
    annualPrice: 479,
    subtitle: "Full ownership + strategic support",
    features: [
      "Everything in Compete",
      "Unlimited competitors",
      "API access",
      "Dedicated account manager",
      "Quarterly strategy calls",
      "Early access to new features",
    ],
    cta: "Start free trial",
    href: "/signup?plan=command",
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COMMAND ?? null,
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COMMAND_ANNUAL ?? null,
  },
];

const enterpriseFeatures = [
  "Multi-brand/division support",
  "SSO/SAML",
  "Custom SLA",
  "Dedicated infrastructure",
  "Named support engineer",
];

const anchors = [
  { name: "Glassdoor Employer Branding", cost: "£5K – £15K/yr" },
  { name: "LinkedIn Talent Insights", cost: "£8K – £15K/yr" },
  { name: "Employer Brand Agency", cost: "£15K – £50K/project" },
];

const faqs = [
  {
    q: "Which plan is right for my company?",
    a: "Control is for companies getting started — you get the full monitoring and content toolkit. Compete adds competitive intelligence, ATS integration, and proof tracking for serious TA teams. Command is for companies where employer brand is a board-level priority.",
  },
  {
    q: "What's the founding member rate?",
    a: "The first 20 Compete customers get £199/mo locked forever — a 33% discount on the standard £299/mo. You keep this rate as long as you remain a customer.",
  },
  {
    q: "Why annual billing?",
    a: "AI models take 2–4 weeks to crawl and index your data. Annual billing gives the system time to work and saves you 20%. Monthly is available with a one-time £250 implementation fee.",
  },
  {
    q: "Do you offer refunds?",
    a: "14-day money-back guarantee on all plans. No questions asked.",
  },
  {
    q: "Will this actually change what AI says about us?",
    a: "We build the optimal data infrastructure to maximize the probability that AI represents your employer brand accurately. When you publish clear, specific content on your domain, AI finds it and cites it. Companies typically see shifts within 2–4 weeks.",
  },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  const productSchema = generateProductSchema({
    name: `${SITE_NAME} — AI Employer Visibility Platform`,
    description:
      "Take control of what AI tells your candidates. Plans from £149/mo.",
    url: `${BASE_URL}/pricing`,
    offers: [
      { name: "Free Plan", price: "0", priceCurrency: "GBP" },
      { name: "Control Plan", price: "149", priceCurrency: "GBP" },
      { name: "Compete Plan", price: "299", priceCurrency: "GBP" },
      { name: "Command Plan", price: "599", priceCurrency: "GBP" },
      { name: "Enterprise Plan", price: "1500", priceCurrency: "GBP" },
    ],
  });

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={productSchema} />
      <Header />

      <main>
        {/* ── Hero ───────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-3xl px-6 pt-24 pb-16 lg:pt-32 lg:pb-20 text-center">
            <h1
              className="text-4xl lg:text-5xl font-medium text-neutral-950"
              style={{ letterSpacing: "-0.03em" }}
            >
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-neutral-400 max-w-md mx-auto text-[15px] leading-relaxed">
              Free audits forever. Paid plans when you&apos;re ready to take control.
            </p>

            {/* ── Billing toggle ─────────────────────── */}
            <div className="mt-10 inline-flex items-center rounded-full bg-neutral-100 p-1">
              <button
                onClick={() => setAnnual(true)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                  annual
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                Annual
                <span className="ml-1.5 text-xs font-semibold text-teal-600">
                  –20%
                </span>
              </button>
              <button
                onClick={() => setAnnual(false)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                  !annual
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </section>

        {/* ── Plan cards ─────────────────────────────── */}
        <section className="pb-24 lg:pb-32">
          <div className="mx-auto max-w-[1080px] px-6 lg:px-12">
            <div className="grid gap-5 lg:grid-cols-3">
              {plans.map((plan, i) => {
                const price = annual ? plan.annualPrice : plan.monthlyPrice;
                const priceId = annual
                  ? (plan.annualPriceId ?? plan.monthlyPriceId)
                  : plan.monthlyPriceId;

                return (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: i * 0.05 }}
                    className={`relative rounded-2xl p-8 transition-all duration-300 ${
                      plan.highlighted
                        ? "bg-neutral-950 text-white ring-1 ring-white/10"
                        : "bg-neutral-50 text-neutral-950 border border-neutral-200/60"
                    }`}
                  >
                    {plan.highlighted && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-accent px-4 py-1 text-[11px] font-semibold text-white tracking-wide">
                        Most popular
                      </span>
                    )}

                    {/* Header */}
                    <div className="mb-8">
                      <p className={`text-sm font-semibold ${
                        plan.highlighted ? "text-white" : "text-neutral-950"
                      }`}>
                        {plan.name}
                      </p>
                      <p className={`text-xs mt-0.5 ${
                        plan.highlighted ? "text-neutral-400" : "text-neutral-400"
                      }`}>
                        {plan.subtitle}
                      </p>

                      <div className="mt-5 flex items-baseline gap-1">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={price}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.15 }}
                            className={`text-4xl font-medium tabular-nums ${
                              plan.highlighted ? "text-white" : "text-neutral-950"
                            }`}
                            style={{ letterSpacing: "-0.03em" }}
                          >
                            £{price}
                          </motion.span>
                        </AnimatePresence>
                        <span className={`text-sm ${
                          plan.highlighted ? "text-neutral-500" : "text-neutral-400"
                        }`}>
                          /mo
                        </span>
                      </div>

                      {annual ? (
                        <p className={`text-xs mt-1.5 ${
                          plan.highlighted ? "text-neutral-500" : "text-neutral-400"
                        }`}>
                          £{price * 12}/yr · billed annually
                        </p>
                      ) : (
                        <p className="text-xs mt-1.5 text-teal-500">
                          £{plan.annualPrice}/mo billed annually · save 20%
                        </p>
                      )}

                      {plan.foundingRate && (
                        <div className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2.5 ${
                          plan.highlighted
                            ? "bg-white/[0.06] border border-white/[0.08]"
                            : "bg-teal-50 border border-teal-100"
                        }`}>
                          <Lock className={`h-3 w-3 shrink-0 ${
                            plan.highlighted ? "text-teal-400" : "text-teal-600"
                          }`} />
                          <p className={`text-[11px] leading-snug ${
                            plan.highlighted ? "text-neutral-300" : "text-teal-700"
                          }`}>
                            Founding rate: <strong>£{plan.foundingRate}/mo</strong> locked forever · first 20 only
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className={`flex items-center gap-2.5 text-[13px] ${
                            plan.highlighted ? "text-neutral-300" : "text-neutral-500"
                          }`}
                        >
                          <Check
                            className={`h-3.5 w-3.5 shrink-0 ${
                              plan.highlighted ? "text-teal-400" : "text-neutral-300"
                            }`}
                            strokeWidth={2.5}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {priceId ? (
                      <CheckoutButton
                        priceId={priceId}
                        label={plan.cta}
                        highlighted={plan.highlighted}
                      />
                    ) : (
                      <Link
                        href={plan.href}
                        className={`flex items-center justify-center w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                          plan.highlighted
                            ? "bg-white text-neutral-950 hover:bg-neutral-100"
                            : "bg-neutral-950 text-white hover:bg-neutral-800"
                        }`}
                      >
                        {plan.cta}
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* ── Monthly note ───────────────────────── */}
            <AnimatePresence>
              {!annual && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 flex items-center gap-3 rounded-xl bg-neutral-50 border border-neutral-200/60 px-5 py-3.5">
                    <Info className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                    <p className="text-xs text-neutral-400">
                      Monthly plans include a one-time £250 implementation fee.
                      Annual plans include implementation free and save 20%.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Enterprise row ────────────────────── */}
            <div className="mt-5 rounded-2xl bg-neutral-50 border border-neutral-200/60 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-sm font-semibold text-neutral-950">Enterprise</p>
                    <span className="text-xs text-neutral-400">
                      Multi-brand · SSO · SLA
                    </span>
                  </div>
                  <p className="text-[13px] text-neutral-400 max-w-md">
                    For large organisations that need multi-brand support,
                    custom SLAs, and dedicated infrastructure.
                  </p>
                  <p className="mt-3 text-2xl font-medium text-neutral-950" style={{ letterSpacing: "-0.03em" }}>
                    From £1,500<span className="text-sm font-normal text-neutral-400">/mo</span>
                  </p>
                </div>

                <a
                  href="mailto:hello@openrole.co.uk?subject=Enterprise%20plan%20enquiry"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors shrink-0"
                >
                  Book a demo
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* ── Free audit note ────────────────────── */}
            <div className="mt-5 text-center">
              <Link
                href="/#audit"
                className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-950 transition-colors"
              >
                Or start with a free audit — unlimited, no signup needed
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Price anchoring (compact) ──────────────── */}
        <section className="border-t border-neutral-100 py-20 lg:py-24">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-300 mb-4">
              For context
            </p>
            <h2
              className="text-2xl lg:text-3xl font-medium text-neutral-950 mb-12"
              style={{ letterSpacing: "-0.03em" }}
            >
              What employers currently pay
            </h2>

            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              {anchors.map((a) => (
                <div key={a.name} className="text-center">
                  <p className="text-xl font-medium text-neutral-950 tabular-nums">{a.cost}</p>
                  <p className="text-xs text-neutral-400 mt-1">{a.name}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-teal-50 border border-teal-100 py-4 px-6 inline-block">
              <p className="text-xl font-medium text-teal-700 tabular-nums">
                OpenRole Compete: £2,868/yr
              </p>
              <p className="text-xs text-teal-600 mt-1">
                AI monitoring + content playbook + competitor intelligence. Ongoing.
              </p>
            </div>
          </div>
        </section>

        {/* ── ROI ─────────────────────────────────────── */}
        <section className="border-t border-neutral-100 py-20 lg:py-24 bg-neutral-50">
          <div className="mx-auto max-w-xl px-6 text-center">
            <h2
              className="text-2xl font-medium text-neutral-950 mb-8"
              style={{ letterSpacing: "-0.03em" }}
            >
              Save one hire from a competitor&nbsp;=&nbsp;ROI
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl bg-white border border-neutral-200/60 p-6">
                <p className="text-3xl font-medium text-neutral-950">5×</p>
                <p className="text-xs text-neutral-400 mt-1">Senior engineer · £15K agency fee saved</p>
              </div>
              <div className="rounded-xl bg-white border border-neutral-200/60 p-6">
                <p className="text-3xl font-medium text-neutral-950">3×</p>
                <p className="text-xs text-neutral-400 mt-1">Mid-level role · £8K agency fee saved</p>
              </div>
            </div>
            <p className="text-xs text-neutral-400">
              Compete costs £2,868/yr. One saved hire pays for 5 years.
            </p>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────── */}
        <section className="border-t border-neutral-100 py-20 lg:py-24">
          <div className="mx-auto max-w-xl px-6">
            <h2
              className="text-2xl font-medium text-neutral-950 mb-12"
              style={{ letterSpacing: "-0.03em" }}
            >
              Questions
            </h2>

            <dl className="space-y-10">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <dt className="text-sm font-semibold text-neutral-950 mb-2">
                    {faq.q}
                  </dt>
                  <dd className="text-[13px] leading-relaxed text-neutral-400">
                    {faq.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Bottom CTA ─────────────────────────────── */}
        <section className="border-t border-neutral-100 py-20 lg:py-24 bg-neutral-950">
          <div className="mx-auto max-w-md px-6 text-center">
            <h2 className="text-xl font-medium text-white mb-3">
              Start with a free audit
            </h2>
            <p className="text-sm text-neutral-500 mb-8">
              See what AI gets wrong about your company. No signup, no credit card.
            </p>
            <Link
              href="/#audit"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-neutral-950 hover:bg-neutral-100 transition-colors"
            >
              Run your free audit
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
