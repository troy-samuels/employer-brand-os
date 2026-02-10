/**
 * @module components/audit/audit-results
 * Renders audit score cards and explanatory insights for each scored category.
 */

"use client";

import { useState, useCallback } from "react";
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
  Copy,
  CheckCircle,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

import type { WebsiteCheckResult, CurrencyCode } from "@/lib/audit/website-checks";
import { ScoreGauge } from "./score-gauge";

interface AuditResultsProps {
  result: WebsiteCheckResult;
  onSubmitClientHtml?: (html: string, url: string) => Promise<void>;
  isAssisting?: boolean;
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
}

function CheckCard({ icon, name, earned, max, detail, index }: CheckCardProps) {
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
      className={`rounded-2xl bg-white p-5 transition-shadow duration-200 ${
        isFail
          ? "shadow-[0_2px_12px_rgba(220,38,38,0.08),0_1px_3px_rgba(28,25,23,0.06)]"
          : "shadow-[0_1px_4px_rgba(28,25,23,0.06),0_1px_2px_rgba(28,25,23,0.04)] hover:shadow-[0_4px_16px_rgba(28,25,23,0.08),0_2px_4px_rgba(28,25,23,0.04)]"
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
            <h3 className="text-[15px] font-semibold text-neutral-950">{name}</h3>
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
          <p className="text-[13px] leading-relaxed text-neutral-500">{detail}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Detail copy ───────────────────────────────────── */

function getLlmsDetail(r: WebsiteCheckResult): string {
  if (r.hasLlmsTxt && r.llmsTxtHasEmployment)
    return "You have an llms.txt with hiring content — AI models can tell your employer story accurately.";
  if (r.hasLlmsTxt)
    return "You have an llms.txt, but it doesn't mention hiring or culture yet.";
  return "No llms.txt found. AI has no structured instructions about who you are as an employer.";
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

/* ── Bot-protection assist card ────────────────────── */

function generateAssistSnippet(callbackUrl: string, pageUrl: string, domain: string): string {
  return `fetch("${callbackUrl}",{method:"POST",headers:{"Content-Type":"application/json","Origin":location.origin},body:JSON.stringify({html:document.documentElement.outerHTML,url:location.href,domain:"${domain}"})}).then(r=>r.ok?"✅ Sent to Rankwell!":"❌ Error").then(alert)`;
}

interface BotProtectAssistProps {
  blockedUrl: string;
  domain: string;
  onSubmitClientHtml: (html: string, url: string) => Promise<void>;
  isAssisting: boolean;
}

function BotProtectAssist({ blockedUrl, domain, onSubmitClientHtml, isAssisting }: BotProtectAssistProps) {
  const [copied, setCopied] = useState(false);
  const [listening, setListening] = useState(false);

  // For production, this would be the real domain. In dev, use localhost.
  const callbackUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/audit/client-crawl`
    : "/api/audit/client-crawl";

  const snippet = generateAssistSnippet(callbackUrl, blockedUrl, domain);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setListening(true);
      setTimeout(() => setCopied(false), 2000);

      // Open the page in a new tab
      window.open(blockedUrl, "_blank", "noopener");

      // Start listening for the result via polling
      // The user will paste the snippet in the console on that page
      // which will POST to our API. We listen via a message event or polling.
    } catch {
      // Fallback: select the text for manual copy
    }
  }, [snippet, blockedUrl]);

  // Listen for postMessage from the snippet (cross-tab communication)
  // Actually, the snippet POSTs directly to our API. We'll use the
  // onSubmitClientHtml callback that gets triggered when the parent
  // detects the submission via polling or state update.

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
          <h4 className="text-[14px] font-semibold text-neutral-950">
            Bot protection detected
          </h4>
          <p className="text-[13px] text-neutral-500 mt-1 leading-relaxed">
            This page blocks automated scanners. You can help us read it in two clicks.
          </p>
        </div>
      </div>

      {!isAssisting && !listening && (
        <div className="space-y-2.5">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle size={16} weight="bold" />
                Copied — opening page…
              </>
            ) : (
              <>
                <Copy size={16} weight="bold" />
                Copy scanner & open page
              </>
            )}
          </button>
          <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
            Opens the careers page in a new tab. Paste the copied code into your
            browser console (F12 → Console → paste → Enter). Results update automatically.
          </p>
        </div>
      )}

      {(listening || isAssisting) && (
        <div className="flex items-center gap-2.5 py-2">
          <div className="h-4 w-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <p className="text-[13px] text-amber-700 font-medium">
            {isAssisting ? "Analysing submitted page…" : "Waiting for page data…"}
          </p>
        </div>
      )}

      {/* Pixel conversion CTA */}
      <div className="mt-4 pt-3.5 border-t border-amber-200/60">
        <p className="text-[12px] text-neutral-500 leading-relaxed">
          <span className="font-medium text-neutral-700">Want automatic access?</span>{" "}
          Install the Rankwell pixel on your site — it runs from your domain, so bot protection
          doesn&apos;t apply.{" "}
          <a href="/pricing" className="text-brand-accent hover:underline font-medium">
            Learn more →
          </a>
        </p>
      </div>
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
export function AuditResults({ result, onSubmitClientHtml, isAssisting = false }: AuditResultsProps) {
  const { score, scoreBreakdown, companyName } = result;

  const passed = [
    scoreBreakdown.llmsTxt,
    scoreBreakdown.jsonld,
    scoreBreakdown.salaryData,
    scoreBreakdown.careersPage,
    scoreBreakdown.robotsTxt,
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
        <p className="text-sm text-neutral-600 text-center">
          <span className="font-semibold text-neutral-950">{passed}</span> of{" "}
          <span className="font-semibold text-neutral-950">5</span> checks
          passed
        </p>
      </motion.div>

      {/* Cards */}
      <div className="space-y-3">
        <CheckCard
          icon={<ChatCircleText size={22} weight="duotone" />}
          name="AI Instructions"
          earned={scoreBreakdown.llmsTxt}
          max={25}
          detail={getLlmsDetail(result)}
          index={0}
        />
        <CheckCard
          icon={<TreeStructure size={22} weight="duotone" />}
          name="Structured Data"
          earned={scoreBreakdown.jsonld}
          max={25}
          detail={getJsonldDetail(result)}
          index={1}
        />
        <CheckCard
          icon={getCurrencyIcon(result.detectedCurrency)}
          name="Salary Transparency"
          earned={scoreBreakdown.salaryData}
          max={20}
          detail={getSalaryDetail(result)}
          index={2}
        />
        <CheckCard
          icon={<Briefcase size={22} weight="duotone" />}
          name="Careers Page"
          earned={scoreBreakdown.careersPage}
          max={15}
          detail={getCareersDetail(result)}
          index={3}
        />

        {/* Bot-protection assist card */}
        {result.careersPageStatus === "bot_protected" &&
          result.careersBlockedUrl &&
          onSubmitClientHtml && (
            <BotProtectAssist
              blockedUrl={result.careersBlockedUrl}
              domain={result.domain}
              onSubmitClientHtml={onSubmitClientHtml}
              isAssisting={isAssisting}
            />
          )}

        <CheckCard
          icon={<ShieldCheck size={22} weight="duotone" />}
          name="Bot Access"
          earned={scoreBreakdown.robotsTxt}
          max={15}
          detail={getRobotsDetail(result)}
          index={4}
        />
      </div>

      {/* Score methodology link & timestamp */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="space-y-3 pt-2"
      >
        <p className="text-center text-sm text-neutral-500" data-testid="score-summary">
          {getScoreSummary(score)}
        </p>

        <div className="flex items-center justify-center">
          <a
            href="/how-we-score"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-950 transition-colors"
          >
            How is this score calculated?
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
        </div>

        <p className="text-center text-xs text-neutral-400">
          Scanned on {scanDate}
        </p>
      </motion.div>
    </div>
  );
}
