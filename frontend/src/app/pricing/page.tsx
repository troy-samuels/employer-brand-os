/**
 * @module app/pricing/page
 * Pricing page — Four tiers: Control / Compete / Command / Enterprise
 * Annual-first display. Monthly carries a 20% premium + setup fee.
 * Legal-compliant framing: "maximize probability", never "guarantee"
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  Zap,
  Eye,
  Swords,
  Crown,
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

const plans = [
  {
    name: "Control",
    icon: Eye,
    monthlyPrice: 149,
    annualPrice: 119,
    audience: "See what's happening and start fixing it",
    description:
      "The foundation. Get your AI employer brand data live, start monitoring, and close your first gaps.",
    features: [
      "Everything in Free",
      "Employer questionnaire (self-serve data input)",
      "Auto-generated AEO content (llms.txt, Schema.org, Markdown)",
      "Embeddable JS snippet for careers page",
      "Weekly monitoring across 4 AI models",
      "Content playbook with templates",
      "Brand defence alerts",
      "1 competitor benchmark",
      "Email reports",
      "Email support",
    ],
    cta: "Start 14-day trial",
    href: "/signup?plan=control",
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CONTROL ?? null,
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CONTROL_ANNUAL ?? null,
  },
  {
    name: "Compete",
    icon: Swords,
    monthlyPrice: 299,
    annualPrice: 239,
    audience: "Outmanoeuvre your talent competitors",
    description:
      "Competitive intelligence, ATS integration, and proof tracking. The complete weapon for serious TA teams.",
    features: [
      "Everything in Control",
      "5 competitor benchmarks + displacement reports",
      "ATS integration (Greenhouse, Lever, Ashby)",
      "Proof tracking (before/after case studies)",
      "Custom branded reports (for board/leadership)",
      "Priority support",
    ],
    badge: "🔒 Founding rate — £199/mo locked forever (normally £299/mo). First 20 customers only.",
    cta: "Start 14-day trial",
    href: "/signup?plan=compete",
    highlighted: true,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COMPETE ?? null,
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COMPETE_ANNUAL ?? null,
  },
  {
    name: "Command",
    icon: Crown,
    monthlyPrice: 599,
    annualPrice: 479,
    audience: "Own your AI employer brand completely",
    description:
      "Unlimited scope, API access, dedicated account manager, and strategic guidance for companies where employer brand is a board-level priority.",
    features: [
      "Everything in Compete",
      "Unlimited competitor benchmarks",
      "API access (Snowflake, Tableau, internal dashboards)",
      "Dedicated account manager",
      "Quarterly strategy calls",
      "Custom integrations",
      "Early access to new features",
    ],
    cta: "Start 14-day trial",
    href: "/signup?plan=command",
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COMMAND ?? null,
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COMMAND_ANNUAL ?? null,
  },
];

const enterprise = {
  name: "Enterprise",
  icon: Shield,
  audience: "Multi-brand organisations with compliance requirements",
  price: "From £1,500/month",
  annualNote: "£18,000/year",
  description:
    "For large organisations that need multi-brand support, SSO, custom SLAs, and dedicated infrastructure.",
  features: [
    "Everything in Command",
    "Multi-brand/division support",
    "SSO/SAML",
    "Custom SLA",
    "Dedicated infrastructure",
    "Custom MSA",
    "Quarterly business reviews",
    "Named support engineer",
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
    name: "OpenRole Compete",
    cost: "£2,868/year",
    note: "Weekly AI monitoring + content playbook + competitor intelligence. Ongoing.",
    highlight: true,
  },
];

const faqs = [
  {
    q: "What's included in the free plan?",
    a: "Unlimited AI visibility audits across ChatGPT, Claude, Perplexity and Gemini. You see the actual AI responses about your company, a gap summary showing what AI can't answer, and your overall score. You also get access to basic tools like llms.txt and Schema.org generators. No signup needed for audits.",
  },
  {
    q: "Which plan is right for my company?",
    a: "Control (£149/mo) is for companies getting started with AI employer branding — you get the full monitoring and content toolkit. Compete (£299/mo) is our most popular plan — it adds competitive intelligence, ATS integration, and proof tracking for serious talent acquisition teams. Command (£599/mo) is for companies where employer brand is a board-level priority and you need API access, a dedicated account manager, and unlimited scope.",
  },
  {
    q: "What's the founding member rate?",
    a: "The first 20 Compete plan customers get £199/mo locked in forever — that's a 33% discount on the standard £299/mo price. You keep this rate as long as you remain a customer, even when we raise prices for new signups. It's our way of rewarding early adopters who help us refine the product.",
  },
  {
    q: "Why do you recommend annual billing?",
    a: "AI models take time to crawl and index your new employer data. Results typically appear within 2–4 weeks, but the full impact builds over months. Annual billing gives the system time to work and saves you 20%. Monthly billing is available but carries a higher rate and a one-time implementation fee to cover onboarding costs.",
  },
  {
    q: "Is there an implementation fee?",
    a: "Annual plans include implementation at no extra cost. Monthly plans carry a one-time £250 implementation fee to cover onboarding, snippet installation support, and initial content setup. This ensures we can deliver value even if you're evaluating on a shorter timeline.",
  },
  {
    q: "Can I upgrade or downgrade later?",
    a: "Yes. Upgrades take effect immediately — you only pay the prorated difference. Downgrades take effect at the end of your current billing cycle.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes — 14-day money-back guarantee on all paid plans. If you're not satisfied within the first 14 days, we'll refund you in full. No questions asked.",
  },
  {
    q: "How does the embeddable snippet work?",
    a: "It's a simple JavaScript snippet you add to your careers page. It injects machine-readable data (Schema.org + llms.txt) directly into your page so AI models can discover and cite it. Takes 2 minutes to install. No visual changes to your page.",
  },
  {
    q: "Will this actually change what AI says about us?",
    a: "We build the optimal machine-readable data infrastructure to maximize the probability that AI models represent your employer brand accurately, using your verified data instead of third-party rumours. We can't control AI outputs directly — no one can — but when you publish clear, specific, dated content on your domain answering the questions candidates ask, AI finds it and cites it. We've seen companies shift from Glassdoor-sourced answers to careers-page-sourced answers within 2–4 weeks of publishing.",
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
      "Take control of what AI tells your candidates. Plans from £149/mo for monitoring to £599/mo for full command.",
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
              Take control of what AI tells your candidates
            </h1>
            <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
              Free audits forever. Paid plans to monitor, compete, and command your AI employer brand.
            </p>

            {/* ── Billing toggle ─────────────────────── */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-slate-100 p-1">
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
            </div>

            {!annual && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-xs text-slate-400"
              >
                Monthly plans include a one-time £250 implementation fee
              </motion.p>
            )}
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
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
              {plans.map((plan, i) => {
                const price = annual ? plan.annualPrice : plan.monthlyPrice;
                const priceId = annual
                  ? (plan.annualPriceId ?? plan.monthlyPriceId)
                  : plan.monthlyPriceId;
                const Icon = plan.icon;

                return (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut", delay: i * 0.06 }}
                    className={`relative rounded-2xl bg-white p-7 lg:p-8 border transition-all duration-300 ${
                      plan.highlighted
                        ? "border-brand-accent ring-1 ring-brand-accent/20 shadow-elevated lg:scale-[1.03]"
                        : "border-slate-200 hover:shadow-card-hover hover:border-neutral-300"
                    }`}
                  >
                    {plan.highlighted && (
                      <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-brand-accent px-3 py-1 text-xs font-semibold text-white">
                        Most popular
                      </span>
                    )}

                    <div className="mb-6">
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className={`flex items-center justify-center h-8 w-8 rounded-lg ${
                          plan.highlighted ? "bg-brand-accent/10" : "bg-slate-100"
                        }`}>
                          <Icon
                            className={`h-4 w-4 ${plan.highlighted ? "text-brand-accent" : "text-slate-600"}`}
                            strokeWidth={2}
                          />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">
                            {plan.name}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {plan.audience}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-1">
                        {!annual && (
                          <span className="text-lg text-slate-400 line-through tabular-nums mr-1">
                            £{plan.monthlyPrice}
                          </span>
                        )}
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
                        <span className="text-slate-500 text-sm">/mo</span>
                      </div>

                      {annual ? (
                        <p className="text-xs text-slate-400 mt-1">
                          Billed annually (£{price * 12}/yr)
                        </p>
                      ) : (
                        <p className="text-xs text-teal-600 mt-1">
                          £{plan.annualPrice}/mo when billed annually — save 20%
                        </p>
                      )}

                      {plan.badge && (
                        <div className="mt-3 flex items-start gap-2 rounded-lg bg-teal-50 border border-teal-100 px-3 py-2">
                          <Lock className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
                          <p className="text-xs text-teal-700 leading-relaxed">
                            {plan.badge}
                          </p>
                        </div>
                      )}

                      <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <ul className="space-y-2.5 mb-6">
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
                            ? "bg-brand-accent text-white hover:bg-brand-accent-hover shadow-md shadow-brand-accent/20"
                            : "bg-slate-100 text-slate-900 hover:bg-neutral-200"
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
                    <span className="text-sm text-slate-500">({enterprise.annualNote}/yr, billed annually)</span>
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

            {/* ── Monthly implementation note ────────── */}
            {!annual && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-100 px-5 py-4"
              >
                <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Monthly plans include a one-time £250 implementation fee
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Covers onboarding, snippet installation support, and initial content setup.
                    Annual plans include implementation at no extra cost and save you 20%.
                  </p>
                </div>
              </motion.div>
            )}
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
                If OpenRole saves you from losing just ONE candidate to a competitor:
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                <div className="rounded-lg bg-teal-50 border border-teal-100 p-5">
                  <p className="text-sm font-medium text-teal-700 mb-1">
                    Senior Engineer
                  </p>
                  <p className="text-3xl font-bold text-teal-600 mb-1">5x ROI</p>
                  <p className="text-xs text-slate-500">
                    £15K avg agency fee saved
                  </p>
                </div>
                <div className="rounded-lg bg-teal-50 border border-teal-100 p-5">
                  <p className="text-sm font-medium text-teal-700 mb-1">
                    Mid-level role
                  </p>
                  <p className="text-3xl font-bold text-teal-600 mb-1">3x ROI</p>
                  <p className="text-xs text-slate-500">
                    £8K avg agency fee saved
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                OpenRole Compete costs £2,868/year. The standard agency fee for a single
                senior hire is £15,000. The maths speaks for itself.
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
