/**
 * @module components/audit/llm-results
 * Displays what all major AI models say about a company.
 * Shows real responses with claim categorisation and citations.
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { ComprehensiveLlmAudit, LlmAuditResult, LlmClaim } from "@/types/llm-audit";

/* ── Model metadata ──────────────────────────────── */

const MODEL_META: Record<
  string,
  { name: string; logo: string; colour: string; description: string }
> = {
  chatgpt: {
    name: "ChatGPT",
    logo: "/logos/chatgpt.svg",
    colour: "border-l-emerald-500",
    description: "Most-used AI assistant globally",
  },
  "google-ai": {
    name: "Google AI",
    logo: "/logos/google-ai.svg",
    colour: "border-l-blue-500",
    description: "Appears in Google search results",
  },
  perplexity: {
    name: "Perplexity",
    logo: "/logos/perplexity.svg",
    colour: "border-l-teal-500",
    description: "Research-focused AI with citations",
  },
  copilot: {
    name: "Microsoft Copilot",
    logo: "/logos/copilot.svg",
    colour: "border-l-sky-500",
    description: "Built into Bing, Edge, Windows & Office",
  },
  claude: {
    name: "Claude",
    logo: "/logos/claude.svg",
    colour: "border-l-orange-500",
    description: "Popular with professional users",
  },
  "meta-ai": {
    name: "Meta AI",
    logo: "/logos/meta-ai.svg",
    colour: "border-l-indigo-500",
    description: "WhatsApp, Instagram & Facebook",
  },
};

/* ── Accuracy badge ──────────────────────────────── */

function AccuracyBadge({ accuracy }: { accuracy: string }) {
  const styles: Record<string, string> = {
    accurate: "bg-emerald-50 text-emerald-700 border-emerald-200",
    outdated: "bg-amber-50 text-amber-700 border-amber-200",
    missing: "bg-red-50 text-red-700 border-red-200",
    hallucinated: "bg-red-50 text-red-700 border-red-200",
    inaccurate: "bg-red-50 text-red-700 border-red-200",
    unverifiable: "bg-slate-50 text-slate-500 border-slate-200",
  };

  const labels: Record<string, string> = {
    accurate: "✓ Verified",
    outdated: "⚠ Outdated",
    missing: "✕ Missing data",
    hallucinated: "✕ Hallucinated",
    inaccurate: "✕ Inaccurate",
    unverifiable: "? Unverifiable",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${styles[accuracy] ?? styles.unverifiable}`}
    >
      {labels[accuracy] ?? accuracy}
    </span>
  );
}

/* ── Citation list ───────────────────────────────── */

function Citations({ urls }: { urls: string[] }) {
  if (!urls.length) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
        Sources cited
      </p>
      <div className="flex flex-wrap gap-1.5">
        {urls.map((url, i) => {
          let hostname = url;
          try {
            hostname = new URL(url).hostname.replace("www.", "");
          } catch { /* keep raw */ }

          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              <span className="text-[10px] text-slate-400">[{i + 1}]</span>
              {hostname}
            </a>
          );
        })}
      </div>
    </div>
  );
}

/* ── Claim row ───────────────────────────────────── */

function ClaimRow({ claim }: { claim: LlmClaim }) {
  return (
    <div className="flex items-start gap-2 py-2">
      <div className="shrink-0 mt-0.5">
        <AccuracyBadge accuracy={claim.accuracy} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-slate-600 leading-relaxed">
          {claim.llmStatement}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5 capitalize">
          {claim.category.replace(/_/g, " ")}
          {claim.severity === "critical" && (
            <span className="ml-1 text-red-500 font-semibold">· Critical</span>
          )}
        </p>
      </div>
    </div>
  );
}

/* ── Single model card ───────────────────────────── */

function ModelCard({ result }: { result: LlmAuditResult }) {
  const [expanded, setExpanded] = useState(false);
  const meta = MODEL_META[result.modelId] ?? {
    name: result.modelId,
    logo: "/logos/chatgpt.svg",
    colour: "border-l-slate-400",
    description: "",
  };

  // Extract inline citations (e.g., [1], [2]) from Perplexity responses
  const citations = result.citations ?? [];

  // Show first 3 claims, rest on expand
  const visibleClaims = expanded ? result.claims : result.claims.slice(0, 3);
  const hasMore = result.claims.length > 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-slate-200 bg-white overflow-hidden border-l-4 ${meta.colour}`}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={meta.logo}
            alt={meta.name}
            width={28}
            height={28}
            className="rounded-lg"
          />
          <div>
            <h4 className="text-[14px] font-semibold text-slate-900">
              {meta.name}
            </h4>
            <p className="text-[11px] text-slate-400">{meta.description}</p>
          </div>
        </div>

        {/* Score pill */}
        <div
          className={`rounded-full px-3 py-1 text-[12px] font-bold ${
            result.score >= 60
              ? "bg-emerald-50 text-emerald-700"
              : result.score >= 35
                ? "bg-amber-50 text-amber-700"
                : "bg-red-50 text-red-700"
          }`}
        >
          {result.score}/100
        </div>
      </div>

      {/* Response text */}
      <div className="px-5 pb-2">
        <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-line">
          {result.rawResponse.length > 500 && !expanded
            ? result.rawResponse.slice(0, 500) + "…"
            : result.rawResponse}
        </p>
      </div>

      {/* Claims breakdown */}
      {result.claims.length > 0 && (
        <div className="px-5 pb-2">
          <div className="border-t border-slate-100 pt-2 mt-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Claim analysis
            </p>
            <div className="divide-y divide-slate-50">
              <AnimatePresence>
                {visibleClaims.map((claim, i) => (
                  <ClaimRow key={i} claim={claim} />
                ))}
              </AnimatePresence>
            </div>
            {hasMore && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[12px] font-medium text-brand-accent hover:underline mt-1 mb-1"
              >
                {expanded
                  ? "Show less"
                  : `Show ${result.claims.length - 3} more claims`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Citations */}
      {citations.length > 0 && (
        <div className="px-5 pb-4">
          <Citations urls={citations} />
        </div>
      )}

      {/* Summary bar */}
      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-4 text-[11px] text-slate-500">
        {result.accurateCount > 0 && (
          <span className="text-emerald-600">
            ✓ {result.accurateCount} verified
          </span>
        )}
        {result.unverifiableCount > 0 && (
          <span>? {result.unverifiableCount} unverifiable</span>
        )}
        {result.inaccurateCount > 0 && (
          <span className="text-red-600">
            ✕ {result.inaccurateCount} inaccurate/outdated
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main component ──────────────────────────────── */

interface LlmResultsProps {
  llmAudit: ComprehensiveLlmAudit;
  companyName: string;
}

export function LlmResults({ llmAudit, companyName }: LlmResultsProps) {
  const activeResults = llmAudit.modelResults.filter(
    (r) => !r.locked && r.rawResponse.length > 0
  );

  if (activeResults.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="space-y-4"
    >
      {/* Section header */}
      <div className="text-center mb-2">
        <h3 className="text-[17px] font-semibold text-slate-900">
          What AI tells candidates about {companyName}
        </h3>
        <p className="text-[13px] text-slate-500 mt-1">
          We asked {activeResults.length} AI models about working here.{" "}
          {llmAudit.overallScore < 50
            ? "Most are guessing."
            : "Some have real data."}
        </p>
      </div>

      {/* Overall score */}
      <div className="flex items-center justify-center gap-3 py-3">
        <div
          className={`text-[32px] font-bold tabular-nums ${
            llmAudit.overallScore >= 60
              ? "text-emerald-600"
              : llmAudit.overallScore >= 35
                ? "text-amber-600"
                : "text-red-600"
          }`}
        >
          {llmAudit.overallScore}
        </div>
        <div className="text-left">
          <p className="text-[13px] font-semibold text-slate-700">
            AI Accuracy Score
          </p>
          <p className="text-[11px] text-slate-400">
            Across {activeResults.length} models · Higher is better
          </p>
        </div>
      </div>

      {/* Top risks */}
      {llmAudit.topRisks.length > 0 && (
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
          <p className="text-[11px] font-semibold text-red-600 uppercase tracking-wider mb-2">
            Top risks
          </p>
          <ul className="space-y-1.5">
            {llmAudit.topRisks.map((risk, i) => (
              <li
                key={i}
                className="text-[12px] text-red-700 leading-relaxed flex items-start gap-2"
              >
                <span className="shrink-0 mt-1 w-1 h-1 rounded-full bg-red-400" />
                {risk.length > 150 ? risk.slice(0, 150) + "…" : risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Model cards */}
      <div className="space-y-3">
        {activeResults.map((result, i) => (
          <motion.div
            key={result.modelId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
          >
            <ModelCard result={result} />
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-brand-accent/20 bg-gradient-to-b from-brand-accent/5 to-transparent p-5 text-center">
        <p className="text-[14px] font-semibold text-slate-800 mb-1">
          Want to fix what AI says about you?
        </p>
        <p className="text-[12px] text-slate-500 mb-3">
          Get a content playbook, weekly monitoring, and competitor benchmarks.
        </p>
        <a
          href="/pricing"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          See plans from £49/mo
        </a>
      </div>
    </motion.div>
  );
}
