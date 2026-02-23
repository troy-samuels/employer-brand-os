/**
 * @module components/audit/audit-results
 * Renders audit score cards and explanatory insights for each scored category.
 */

"use client";

import { motion } from "framer-motion";
import {
  ChatCircleText,
  TreeStructure,
  CurrencyGbp,
  CurrencyDollar,
  CurrencyEur,
  CurrencyJpy,
  CurrencyInr,
  CurrencyKrw,
  CurrencyCny,
  Briefcase,
  ShieldCheck,
  CurrencyCircleDollar,
  ShieldWarning,
  ArrowSquareOut,
  ChatsCircle,
  CircleNotch,
} from "@phosphor-icons/react";
import { useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";

import type { WebsiteCheckResult, CurrencyCode } from "@/lib/audit/website-checks";
import { ScoreGauge } from "./score-gauge";

interface AuditResultsProps {
  result: WebsiteCheckResult;
  onRerunWithCareersUrl?: (careersUrl: string) => Promise<void> | void;
  isRerunning?: boolean;
}

/* ── Helpers ───────────────────────────────────────── */

type CheckStatus = "pass" | "partial" | "fail";

function getCurrencyIcon(currency: CurrencyCode) {
  switch (currency) {
    case "GBP":
      return <CurrencyGbp size={22} weight="duotone" />;
    case "USD":
    case "CAD":
    case "AUD":
    case "NZD":
    case "HKD":
    case "SGD":
    case "MXN":
      return <CurrencyDollar size={22} weight="duotone" />;
    case "EUR":
      return <CurrencyEur size={22} weight="duotone" />;
    case "JPY":
      return <CurrencyJpy size={22} weight="duotone" />;
    case "INR":
      return <CurrencyInr size={22} weight="duotone" />;
    case "KRW":
      return <CurrencyKrw size={22} weight="duotone" />;
    case "CNY":
      return <CurrencyCny size={22} weight="duotone" />;
    default:
      // For currencies without specific icons, use generic currency icon
      return <CurrencyCircleDollar size={22} weight="duotone" />;
  }
}

function checkStatus(earned: number, max: number): CheckStatus {
  if (earned >= max) return "pass";
  if (earned > 0) return "partial";
  return "fail";
}

/* ── Check card ────────────────────────────────────── */

interface CheckCardProps {
  icon: ReactNode;
  name: string;
  earned: number;
  max: number;
  detail: string;
  index: number;
  isLoading?: boolean;
}

function CheckCard({ icon, name, earned, max, detail, index, isLoading = false }: CheckCardProps) {
  const status = checkStatus(earned, max);
  const isFail = status === "fail";

  const iconColour =
    status === "pass"
      ? "text-status-verified"
      : status === "partial"
        ? "text-status-warning"
        : "text-status-critical";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 * index, ease: "easeOut" }}
      className={`rounded-2xl bg-white p-5 border transition-all duration-300 ${
        isFail
          ? "border-status-critical/15 shadow-[0_2px_12px_rgba(220,38,38,0.08),0_1px_3px_rgba(28,25,23,0.06)]"
          : "border-neutral-100 shadow-card hover:shadow-card-hover hover:border-slate-200"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`mt-1 shrink-0 ${iconColour}`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-4 mb-1.5">
            <h3 className="text-[15px] font-semibold text-slate-900">{name}</h3>
            <div className="flex items-center gap-2 shrink-0">
              {isLoading && <CircleNotch size={14} weight="bold" className="text-slate-400 animate-spin" />}
              <span
                className={`text-sm font-semibold tabular-nums shrink-0 ${
                  status === "pass"
                    ? "text-status-verified"
                    : status === "partial"
                      ? "text-status-warning"
                      : "text-status-critical"
                }`}
              >
                {earned}/{max}
              </span>
            </div>
          </div>
          <p className="text-[13px] leading-relaxed text-slate-500">{detail}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Detail copy ───────────────────────────────────── */

function getContentFormatDetail(r: WebsiteCheckResult): string {
  if (r.scoreBreakdown.contentFormat >= 7)
    return "Your content uses structured formats AI prefers — FAQ patterns, semantic headings, and answer-first paragraphs help AI cite you accurately.";
  if (r.scoreBreakdown.contentFormat >= 4)
    return "Your content has some good structure but could improve. Add FAQ schema, definition lists, and shorter opening paragraphs for better AI citation.";
  if (r.scoreBreakdown.contentFormat > 0)
    return "Limited content structure detected. Add semantic heading hierarchy (h1→h2→h3), FAQ schema, and tables to help AI parse your content.";
  return "No structured content format found. Adding FAQ schema, semantic headings, answer-first paragraphs, and tables would significantly improve AI citation likelihood.";
}

function getJsonldDetail(r: WebsiteCheckResult): string {
  if (r.jsonldSchemasFound.length > 0)
    return `Found ${r.jsonldSchemasFound.join(", ")} schema${r.jsonldSchemasFound.length > 1 ? "s" : ""}. AI uses this to understand your organisation.`;
  return "No structured data on your homepage. AI may guess your company details instead of knowing them.";
}

function getSalaryDetail(r: WebsiteCheckResult): string {
  if (r.hasSalaryData)
    return "Salary information is visible to AI crawlers — candidates asking about pay will get answers.";
  return "No salary data found. When candidates ask AI about your pay, it has nothing to share.";
}

function getCareersDetail(r: WebsiteCheckResult): string {
  if (r.careersPageStatus === "full" && r.careersPageUrl)
    return `Solid careers page at ${r.careersPageUrl} — AI can surface your open roles.`;
  if (r.careersPageStatus === "partial" && r.careersPageUrl) {
    if (r.atsDetected)
      return `Your careers page redirects to an external ATS (${r.atsDetected}) — most AI crawlers can't read this content.`;
    return `Found a careers page at ${r.careersPageUrl}, but it's thin on detail.`;
  }
  if (r.careersPageStatus === "bot_protected")
    return "Your careers page has bot protection — we couldn't read it, and neither can AI crawlers.";
  if (r.careersPageStatus === "none")
    return "Your careers page exists but barely has any content for AI to work with.";
  return "No careers page found. AI can't point candidates to your jobs.";
}

function getBrandReputationDetail(r: WebsiteCheckResult): string {
  const { brandReputation } = r;
  if (brandReputation.sourceCount === 0)
    return "No employer review data found online. AI has nothing to reference when candidates ask what it's like to work here.";
  if (brandReputation.sentiment === "negative")
    return `Found on ${brandReputation.sourceCount} review platform${brandReputation.sourceCount > 1 ? "s" : ""} — and the signals are concerning. AI may be surfacing negative sentiment to candidates.`;
  if (brandReputation.sentiment === "positive")
    return `Found on ${brandReputation.sourceCount} review platform${brandReputation.sourceCount > 1 ? "s" : ""} with positive signals. AI is likely presenting you favourably to candidates.`;
  if (brandReputation.sentiment === "mixed")
    return `Found on ${brandReputation.sourceCount} review platform${brandReputation.sourceCount > 1 ? "s" : ""} with mixed signals. AI may give candidates an inconsistent picture.`;
  return `Found on ${brandReputation.sourceCount} review platform${brandReputation.sourceCount > 1 ? "s" : ""}. AI uses these to form opinions about your employer brand.`;
}

/* ── LLM Teaser (locked preview) ──────────────────── */

const LLM_MODELS = [
  { name: "ChatGPT", logo: "/logos/chatgpt.svg" },
  { name: "Google AI", logo: "/logos/google-ai.svg" },
  { name: "Perplexity", logo: "/logos/perplexity.svg" },
  { name: "Copilot", logo: "/logos/copilot.svg" },
  { name: "Claude", logo: "/logos/claude.svg" },
  { name: "Meta AI", logo: "/logos/meta-ai.svg" },
];

function LlmTeaser({ companyName }: { companyName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.8 }}
      className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-neutral-50/50 p-6 shadow-card"
    >
      <div className="mb-5">
        <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">
          What AI says about {companyName}
        </h3>
        <p className="text-[13px] text-slate-500 leading-relaxed">
          See exactly what each AI model says when candidates ask about working here.
        </p>
      </div>

      <div className="space-y-2.5 mb-5">
        {LLM_MODELS.slice(0, 3).map((model) => (
          <div
            key={model.name}
            className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3"
          >
            <Image src={model.logo} alt={model.name} width={24} height={24} className="shrink-0 rounded" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-neutral-700">{model.name}</p>
              <div className="mt-1 h-3 rounded-full bg-gradient-to-r from-neutral-200 to-neutral-100 w-full" />
              <div className="mt-1 h-3 rounded-full bg-gradient-to-r from-neutral-200 to-neutral-100 w-4/5" />
            </div>
            <span className="text-[11px] font-medium text-slate-400 shrink-0">🔒</span>
          </div>
        ))}
      </div>

      <a
        href="/pricing"
        className="flex items-center justify-center gap-2 rounded-lg bg-brand-accent px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
      >
        See what AI says about you
      </a>

      <p className="text-[11px] text-slate-400 text-center mt-2.5">
        Full reports check {LLM_MODELS.length} AI models. Plans from £149/mo.
      </p>
    </motion.div>
  );
}

/* ── Bot-protection card ──────────────────────────── */

interface BotProtectCardProps {
  blockedUrl: string;
}

function BotProtectCard({ blockedUrl }: BotProtectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5"
    >
      <div className="flex items-start gap-3 mb-4">
        <ShieldWarning size={20} weight="duotone" className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <h4 className="text-[14px] font-semibold text-slate-900">
            Bot protection detected
          </h4>
          <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
            Your careers page at{" "}
            <a
              href={blockedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-700 underline decoration-neutral-300 hover:decoration-neutral-500 transition-colors"
            >
              {new URL(blockedUrl).hostname}
              {new URL(blockedUrl).pathname}
            </a>{" "}
            blocks automated scanners — which means AI crawlers can&apos;t read it either.
            Candidates asking AI about your jobs get nothing.
          </p>
        </div>
      </div>

      <a
        href="/pricing"
        className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
      >
        Fix this with the OpenRole pixel
        <ArrowSquareOut size={15} weight="bold" />
      </a>

      <p className="text-[11px] text-slate-400 text-center mt-2.5 leading-relaxed">
        The pixel runs from your domain, so bot protection doesn&apos;t apply.
        Your careers page becomes visible to every AI model.
      </p>
    </motion.div>
  );
}

function looksLikeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      Boolean(parsed.hostname) &&
      parsed.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

interface CareersUrlPromptCardProps {
  onRerunWithCareersUrl?: (careersUrl: string) => Promise<void> | void;
  isRerunning: boolean;
}

function CareersUrlPromptCard({
  onRerunWithCareersUrl,
  isRerunning,
}: CareersUrlPromptCardProps) {
  const [careersUrl, setCareersUrl] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onRerunWithCareersUrl || isRerunning) {
      return;
    }

    const trimmed = careersUrl.trim();
    if (!looksLikeUrl(trimmed)) {
      setSubmitError("Please enter a valid URL.");
      return;
    }

    setSubmitError(null);
    try {
      await onRerunWithCareersUrl(trimmed);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Re-scan failed. Please check the URL and try again.";
      setSubmitError(message);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-card"
      data-testid="careers-url-prompt"
    >
      <p className="text-[13px] leading-relaxed text-slate-600 mb-4">
        We couldn&apos;t find your careers page. If it&apos;s on a different domain, paste the link
        below.
      </p>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          type="text"
          inputMode="url"
          autoComplete="url"
          value={careersUrl}
          onChange={(event) => {
            setCareersUrl(event.target.value);
            if (submitError) {
              setSubmitError(null);
            }
          }}
          placeholder="e.g. jobs.yourcompany.com/careers"
          disabled={isRerunning}
          className="w-full rounded-xl border border-amber-200 bg-white px-3.5 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 disabled:cursor-not-allowed disabled:bg-amber-50/50"
          aria-label="Careers page URL"
        />
        {submitError && <p className="text-[12px] text-status-critical">{submitError}</p>}
        <button
          type="submit"
          disabled={isRerunning || !onRerunWithCareersUrl}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {isRerunning && <CircleNotch size={14} weight="bold" className="animate-spin" />}
          {isRerunning ? "Re-scanning..." : "Re-scan with careers page"}
        </button>
      </form>
    </motion.div>
  );
}

function getRobotsDetail(r: WebsiteCheckResult): string {
  if (r.robotsTxtStatus === "partial") {
    const parts: string[] = ["Some AI crawlers are blocked, others can access your site."];
    if (r.robotsTxtAllowedBots.length > 0)
      parts.push(`Allowed: ${r.robotsTxtAllowedBots.join(", ")}.`);
    if (r.robotsTxtBlockedBots.length > 0)
      parts.push(`Blocked: ${r.robotsTxtBlockedBots.join(", ")}.`);
    return parts.join(" ");
  }
  if (r.robotsTxtStatus === "blocks" && r.robotsTxtBlockedBots.length > 0)
    return `These AI crawlers are blocked: ${r.robotsTxtBlockedBots.join(", ")}. They can't read your site at all.`;
  if (r.robotsTxtStatus === "allows")
    return "All major AI crawlers can access your site. Your content is fully visible to AI.";
  if (r.robotsTxtStatus === "no_rules")
    return "No AI-specific rules in robots.txt. Crawlers aren't explicitly blocked or allowed.";
  return "No robots.txt found. AI crawlers have no guidance on what they should read.";
}

function getScoreSummary(score: number): string {
  if (score <= 20)
    return "AI is guessing about your company. Candidates are getting unreliable answers.";
  if (score <= 50)
    return "AI has some data, but gaps mean candidates get incomplete answers.";
  if (score <= 75)
    return "AI knows the basics, but your full employer story isn't getting through.";
  return "Your AI presence is strong. Fine-tune it to stay ahead.";
}

/* ── Main ──────────────────────────────────────────── */

/**
 * Displays full audit score breakdown, checks, and follow-up guidance.
 * @param props - Component props containing the finalized audit result.
 * @returns The composed audit results layout.
 */
export function AuditResults({
  result,
  onRerunWithCareersUrl,
  isRerunning = false,
}: AuditResultsProps) {
  const { score, scoreBreakdown, companyName } = result;

  const passed = [
    scoreBreakdown.jsonld,
    scoreBreakdown.robotsTxt,
    scoreBreakdown.careersPage,
    scoreBreakdown.brandReputation,
    scoreBreakdown.salaryData,
    scoreBreakdown.contentFormat,
    scoreBreakdown.llmsTxt,
  ].filter((s) => s > 0).length;

  const scanDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full max-w-lg mx-auto space-y-10" data-testid="audit-results">
      {/* Score */}
      <ScoreGauge score={score} companyName={companyName} />

      {/* Summary pill */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mx-auto w-fit rounded-2xl bg-white px-6 py-3 shadow-[0_1px_6px_rgba(28,25,23,0.06),0_1px_2px_rgba(28,25,23,0.04)]"
      >
        <p className="text-sm text-slate-600 text-center">
          <span className="font-semibold text-slate-900">{passed}</span> of{" "}
          <span className="font-semibold text-slate-900">7</span> checks
          passed
        </p>
      </motion.div>

      {/* Cards */}
      <div className="space-y-3">
        <CheckCard
          icon={<TreeStructure size={22} weight="duotone" />}
          name="Structured Data"
          earned={scoreBreakdown.jsonld}
          max={28}
          detail={getJsonldDetail(result)}
          index={0}
        />
        <CheckCard
          icon={<ShieldCheck size={22} weight="duotone" />}
          name="AI Crawler Access"
          earned={scoreBreakdown.robotsTxt}
          max={17}
          detail={getRobotsDetail(result)}
          index={1}
        />
        <CheckCard
          icon={<Briefcase size={22} weight="duotone" />}
          name="Careers Page"
          earned={scoreBreakdown.careersPage}
          max={17}
          detail={getCareersDetail(result)}
          index={2}
          isLoading={result.careersPageStatus === "not_found" && isRerunning}
        />

        {result.careersPageStatus === "not_found" && (
          <CareersUrlPromptCard
            onRerunWithCareersUrl={onRerunWithCareersUrl}
            isRerunning={isRerunning}
          />
        )}

        {/* Bot-protection conversion card */}
        {result.careersPageStatus === "bot_protected" &&
          result.careersBlockedUrl && (
            <BotProtectCard blockedUrl={result.careersBlockedUrl} />
          )}

        <CheckCard
          icon={<ChatsCircle size={22} weight="duotone" />}
          name="Brand Presence"
          earned={scoreBreakdown.brandReputation}
          max={17}
          detail={getBrandReputationDetail(result)}
          index={3}
        />
        <CheckCard
          icon={getCurrencyIcon(result.detectedCurrency)}
          name="Salary Transparency"
          earned={scoreBreakdown.salaryData}
          max={12}
          detail={getSalaryDetail(result)}
          index={4}
        />
        <CheckCard
          icon={<ChatCircleText size={22} weight="duotone" />}
          name="Content Format"
          earned={scoreBreakdown.contentFormat}
          max={9}
          detail={getContentFormatDetail(result)}
          index={5}
        />
        <CheckCard
          icon={<ChatCircleText size={22} weight="duotone" />}
          name="AI Instructions (llms.txt)"
          earned={0}
          max={0}
          detail="Research shows llms.txt has zero impact on AI citations (Senthor 10M+ requests, SE Ranking 300K domains). Focus on structured data and content format instead."
          index={6}
        />
      </div>

      {/* Score methodology link & timestamp */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="space-y-3 pt-2"
      >
        <p className="text-center text-sm text-slate-500" data-testid="score-summary">
          {getScoreSummary(score)}
        </p>

        <div className="flex items-center justify-center">
          <a
            href="/how-we-score"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            How is this score calculated?
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
        </div>

        <p className="text-center text-xs text-slate-400">
          Scanned on {scanDate}
        </p>
      </motion.div>

      {/* LLM Teaser — locked preview of what AI models say */}
      <LlmTeaser companyName={companyName} />

      {/* Fix It link */}
      {result.companySlug && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="rounded-2xl border border-brand-accent/20 bg-brand-accent-light p-5 text-center"
        >
          <p className="text-sm text-neutral-700 mb-2">
            Want copy-paste fixes for these issues?
          </p>
          <a
            href={`/fix/${result.companySlug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-accent hover:underline"
          >
            Get copy-paste fixes for {companyName} →
          </a>
        </motion.div>
      )}
    </div>
  );
}
