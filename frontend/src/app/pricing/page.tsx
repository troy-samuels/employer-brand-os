/**
 * @module app/pricing/page
 * Pricing page — Flat two-tier (Free + Pro) + Enterprise
 * Legal-compliant framing: "maximize probability", never "guarantee"
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  Zap,
  Building2,
  Shield,
  Lock,
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

const freePlan = {
  name: "Free",
  icon: Zap,
  audience: "See what AI says about you",
  description:
    "Unlimited AI visibility audits across ChatGPT, Claude, Perplexity and Gemini. No signup, no credit card.",
  features: [
    "Unlimited AI visibility audits",
    "PDF audit report download",
    "Basic llms.txt generator",
    "Employer Schema generator",
    "Company scorecard page",
    "Badge for your website",
  ],
  cta: "Run your free audit",
  href: "/#audit",
};

const proPlan = {
  name: "Pro",
  icon: Building2,
  monthlyPrice: 79,
  annualPrice: 59,
  audience: "For employers who want to influence what AI says",
  description:
    "The complete toolkit. Monitoring, content, competitors, integrations — everything you need to take control of your AI employer brand.",
  features: [
    "Everything in Free",
    "Employer questionnaire (self-serve data input)",
    "Auto-generated AEO content (llms.txt, Schema.org, Markdown)",
    "Embeddable JS snippet for careers page",
    "AI monitoring dashboard (weekly score tracking)",
    "Competitor displacement reports (3 competitors)",
    "Brand defence alerts (negative third-party content)",
    "Content playbook with templates",
    "ATS integration (Greenhouse, Lever, Ashby)",
    "Proof tracking (before/after case studies)",
    "Email support",
  ],
  badge: "🔒 Founding rate — £79/mo locked forever (normally £99/mo). First 20 customers only.",
  cta: "Start 14-day trial",
  href: "/signup?plan=pro",
  monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? null,
  annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL ?? null,
};

const enterprise = {
  name: "Enterprise",
  icon: Shield,
  audience: "Multi-brand or custom requirements",
  price: "From £800/month",
  description:
    "For large organisations that need multi-brand support, API access, and SLA-backed service.",
  features: [
    "Everything in Pro",
    "Unlimited competitors",
    "Multi-brand/division support",
    "API access",
    "Custom branded reports",
    "Dedicated account management",
    "SSO/SAML",
    "SLA",
    "Quarterly strategy calls",
    "Priority support",
  ],
  cta: "Book a demo",
};

/** What employers already spend — used for price anchoring */
const anchors = [
  {
    name: "Glassdoor Employer Branding",
    cost: "£5,000 – £15,000/year",
    note: "Review management for one platform. No AI monitoring.",
  },
  {
    name: "LinkedIn Talent Insights",
    cost: "£8,000 – £15,000/year",
    note: "Candidate sourcing. Doesn't influence AI narratives.",
  },
  {
    name: "Employer Brand Agency",
    cost: "£15,000 – £50,000/project",
    note: "One-off. No ongoing monitoring or content system.",
  },
  {
    name: "OpenRole Pro",
    cost: "£708/year",
    note: "Weekly AI monitoring + content playbook across 4 models.",
    highlight: true,
  },
];

const faqs = [
  {
    q: "What's included in the free plan?",
    a: "Unlimited AI visibility audits across ChatGPT, Claude, Perplexity and Gemini. You see the actual AI responses about your company, a gap summary showing what AI can't answer, and your overall score. You also get access to basic tools like llms.txt and Schema.org generators. No signup needed for audits.",
  },
  {
    q: "What does Pro add?",
    a: "Pro gives you everything you need to actually change what AI says about you: the embeddable snippet for your careers page, weekly monitoring across all 4 models, competitor displacement reports, the content playbook, ATS integration, brand defence alerts, and proof tracking. It's the full toolkit — no add-ons, no upsells.",
  },
  {
    q: "Can I upgrade or downgrade later?",
    a: "Yes. Upgrade from Free to Pro at any time — your account transitions immediately. Downgrades take effect on your next billing cycle.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes — 14-day money-back guarantee on all Pro subscriptions. If you're not satisfied within the first 14 days, we'll refund you in full. No questions asked.",
  },
  {
    q: "What's the founding member rate?",
    a: "The first 20 Pro customers get £79/mo locked in forever. That's the price you pay as long as you remain a customer — even when we raise prices to £99/mo for new signups. It's our way of rewarding early adopters who help us refine the product.",
  },
  {
    q: "How does the embeddable snippet work?",
    a: "It's a simple JavaScript snippet you add to your careers page. It injects machine-readable data (Schema.org + llms.txt) directly into your page so AI models can discover and cite it. Takes 2 minutes to install. No visual changes to your page.",
  },
  {
    q: "Will this actually change what AI says about us?",
    a: "We build the optimal machine-readable data infrastructure to maximize the probability that AI models represent your employer brand accurately, using your verified data instead of third-party rumours. We can't control AI outputs directly — no one can — but when you publish clear, specific, dated content on your domain answering the questions candidates ask, AI finds it and cites it. We've seen companies shift from Glassdoor-sourced answers to careers-page-sourced answers within 2–4 weeks of publishing.",
  },
  {
    q: "Is there a limit on company size or employees?",
    a: "No. Pro works for companies of any size — from 5-person startups to 500-person scale-ups. If you're an enterprise (1,000+ employees) and need multi-brand support, API access, or SSO, get in touch about our Enterprise plan.",
  },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  const proPrice = annual ? proPlan.annualPrice : proPlan.monthlyPrice;
  const proPriceId = annual
    ? (proPlan.annualPriceId ?? proPlan.monthlyPriceId)
    : proPlan.monthlyPriceId;

  const productSchema = generateProductSchema({
    name: `${SITE_NAME} — AI Employer Visibility Platform`,
    description:
      "Maximize the probability that AI tells candidates the truth about your company. One plan, everything included.",
    url: `${BASE_URL}/pricing`,
    offers: [
      { name: "Free Plan", price: "0", priceCurrency: "GBP" },
      { name: "Pro Plan", price: "79", priceCurrency: "GBP" },
      { name: "Enterprise Plan", price: "800", priceCurrency: "GBP" },
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
            <p className="overline mb-4">Pricing</p>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 tracking-tight">
              One plan. Everything included.
            </h1>
            <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
              Free audits forever. Pro when you&apos;re ready to take control.
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
                  Save 25%
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
                AI Employer Audit — see what 4 models say about you. No signup,
                no credit card.
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
          <div className="mx-auto max-w-[900px] px-6 lg:px-12">
            <div className="grid gap-8 md:grid-cols-2 items-start">
              {/* ── Free card ─────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative rounded-2xl bg-white p-7 lg:p-8 border border-slate-200 hover:shadow-card-hover hover:border-neutral-300 transition-all duration-300"
              >
                <div className="mb-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100">
                      <Zap className="h-4 w-4 text-slate-600" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {freePlan.name}
                      </h3>
                      <p className="text-xs text-slate-400">{freePlan.audience}</p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">Free</span>
                    <span className="text-slate-500 text-sm">forever</span>
                  </div>

                  <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                    {freePlan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {freePlan.features.map((feature) => (
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
                  href={freePlan.href}
                  className="flex items-center justify-center w-full rounded-xl px-4 py-3 text-sm font-semibold bg-slate-100 text-slate-900 hover:bg-neutral-200 transition-all duration-200"
                >
                  {freePlan.cta}
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </motion.div>

              {/* ── Pro card ──────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut", delay: 0.08 }}
                className="relative rounded-2xl bg-white p-7 lg:p-8 border border-brand-accent ring-1 ring-brand-accent/20 shadow-elevated md:scale-[1.03] transition-all duration-300"
              >
                <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-brand-accent px-3 py-1 text-xs font-semibold text-white">
                  Everything you need
                </span>

                <div className="mb-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100">
                      <Building2
                        className="h-4 w-4 text-slate-600"
                        strokeWidth={2}
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {proPlan.name}
                      </h3>
                      <p className="text-xs text-slate-400">{proPlan.audience}</p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1">
                    {annual &&
                      proPlan.monthlyPrice > proPlan.annualPrice && (
                        <span className="text-lg text-slate-400 line-through tabular-nums mr-1">
                          £{proPlan.monthlyPrice}
                        </span>
                      )}
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={proPrice}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="text-3xl font-bold text-slate-900 tabular-nums"
                      >
                        £{proPrice}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-slate-500 text-sm">/month</span>
                  </div>

                  {annual && (
                    <p className="text-xs text-slate-400 mt-1">
                      Billed annually (£{proPrice * 12}/year)
                    </p>
                  )}
                  {!annual && proPlan.annualPrice < proPlan.monthlyPrice && (
                    <p className="text-xs text-teal-600 mt-1">
                      £{proPlan.annualPrice}/mo when billed annually
                    </p>
                  )}

                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-teal-50 border border-teal-100 px-3 py-2">
                    <Lock className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-teal-700 leading-relaxed">
                      {proPlan.badge}
                    </p>
                  </div>

                  <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                    {proPlan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {proPlan.features.map((feature) => (
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

                {proPriceId ? (
                  <CheckoutButton
                    priceId={proPriceId}
                    label={proPlan.cta}
                    highlighted
                  />
                ) : (
                  <Link
                    href={proPlan.href}
                    className="flex items-center justify-center w-full rounded-xl px-4 py-3 text-sm font-semibold bg-brand-accent text-white hover:bg-brand-accent-hover shadow-md shadow-brand-accent/20 transition-all duration-200"
                  >
                    {proPlan.cta}
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Link>
                )}
              </motion.div>
            </div>

            {/* ── Enterprise row ────────────────────── */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100">
                      <Shield
                        className="h-4 w-4 text-slate-600"
                        strokeWidth={2}
                      />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {enterprise.name}
                    </h3>
                    <span className="text-xs font-medium text-slate-400">
                      {enterprise.audience}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 max-w-lg mb-4">
                    {enterprise.description}
                  </p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-bold text-slate-900">
                      {enterprise.price}
                    </span>
                    <span className="text-sm text-slate-500">(billed annually)</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <ul className="flex flex-wrap gap-x-4 gap-y-1">
                    {enterprise.features.slice(1, 4).map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-1.5 text-xs text-slate-500"
                      >
                        <Check
                          className="h-3 w-3 text-teal-500 shrink-0"
                          strokeWidth={2}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="mailto:hello@openrole.co.uk?subject=Enterprise%20plan%20enquiry"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shrink-0"
                  >
                    {enterprise.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Competitor price anchoring ──────────────── */}
        <section className="border-t border-slate-200 bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="overline mb-4">For context</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight mb-3">
              What employers currently pay for employer brand management
            </h2>
            <p className="text-sm text-slate-500 mb-10 max-w-lg mx-auto">
              These tools manage reviews and job distribution — none of them monitor or
              influence what AI tells your candidates.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {anchors.map((anchor) => (
                <div
                  key={anchor.name}
                  className={`rounded-xl border p-5 text-left transition-all ${
                    anchor.highlight
                      ? "border-teal-200 bg-teal-50/50 ring-1 ring-teal-100"
                      : "border-slate-200 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p
                      className={`text-sm font-semibold ${
                        anchor.highlight ? "text-teal-700" : "text-slate-900"
                      }`}
                    >
                      {anchor.name}
                    </p>
                    {anchor.highlight && (
                      <span className="inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                        OpenRole
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xl font-bold tabular-nums mb-1 ${
                      anchor.highlight ? "text-teal-600" : "text-slate-900"
                    }`}
                  >
                    {anchor.cost}
                  </p>
                  <p className="text-xs text-slate-500">{anchor.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ROI Calculator ──────────────────────────── */}
        <section className="border-t border-slate-200 bg-slate-50 py-16">
          <div className="mx-auto max-w-2xl px-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                If OpenRole helps you hire just ONE candidate faster, the ROI is:
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                <div className="rounded-lg bg-teal-50 border border-teal-100 p-5">
                  <p className="text-sm font-medium text-teal-700 mb-1">
                    Senior Engineer
                  </p>
                  <p className="text-3xl font-bold text-teal-600 mb-1">21x ROI</p>
                  <p className="text-xs text-slate-500">
                    £15K avg agency fee saved
                  </p>
                </div>
                <div className="rounded-lg bg-teal-50 border border-teal-100 p-5">
                  <p className="text-sm font-medium text-teal-700 mb-1">
                    Mid-level role
                  </p>
                  <p className="text-3xl font-bold text-teal-600 mb-1">11x ROI</p>
                  <p className="text-xs text-slate-500">
                    £8K avg agency fee saved
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                OpenRole Pro costs £708/year. Most companies pay more than that for a
                single LinkedIn Recruiter seat.
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
                See what AI gets wrong about your company. No signup, no credit
                card, takes 30 seconds.
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
