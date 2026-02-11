/**
 * @module components/dashboard/model-comparison
 * Cross-model comparison view — the centrepiece dashboard showing what each
 * of 6 LLMs says about the company, with hallucination detection and patch buttons.
 */

"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, CircleAlert, CircleHelp, Zap } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type AccuracyStatus = "accurate" | "inaccurate" | "outdated" | "unverifiable";

interface ExtractedClaim {
  claim: string;
  status: AccuracyStatus;
  actual?: string;
  severity?: "critical" | "moderate" | "low";
}

interface ModelView {
  modelId: "chatgpt" | "google-ai" | "perplexity" | "copilot" | "claude" | "meta-ai";
  accuracyScore: number;
  responseText: string;
  claims: ExtractedClaim[];
  sourceCitations: string[];
}

interface ConsensusItem {
  text: string;
  type: "agreement" | "warning" | "info";
}

export interface ModelComparisonProps {
  companyName?: string;
  models?: ModelView[];
  consensus?: ConsensusItem[];
  hallucinations?: { total: number; critical: number; moderate: number };
}

/* ------------------------------------------------------------------ */
/* Model display config                                                */
/* ------------------------------------------------------------------ */

const MODEL_META: Record<
  ModelView["modelId"],
  { label: string; logo: string; accent: string; bgAccent: string }
> = {
  chatgpt: {
    label: "ChatGPT",
    logo: "/logos/chatgpt.svg",
    accent: "border-t-emerald-500",
    bgAccent: "bg-emerald-50",
  },
  "google-ai": {
    label: "Google AI",
    logo: "/logos/google-ai.svg",
    accent: "border-t-blue-500",
    bgAccent: "bg-blue-50",
  },
  perplexity: {
    label: "Perplexity",
    logo: "/logos/perplexity.svg",
    accent: "border-t-teal-500",
    bgAccent: "bg-teal-50",
  },
  copilot: {
    label: "Copilot",
    logo: "/logos/copilot.svg",
    accent: "border-t-sky-500",
    bgAccent: "bg-sky-50",
  },
  claude: {
    label: "Claude",
    logo: "/logos/claude.svg",
    accent: "border-t-orange-500",
    bgAccent: "bg-orange-50",
  },
  "meta-ai": {
    label: "Meta AI",
    logo: "/logos/meta-ai.svg",
    accent: "border-t-indigo-500",
    bgAccent: "bg-indigo-50",
  },
};

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_MODELS: ModelView[] = [
  {
    modelId: "chatgpt",
    accuracyScore: 62,
    responseText:
      "Meridian Tech is a UK-based technology company with around 100 employees. They offer competitive salaries ranging from £55,000 to £68,000 for software engineers, and describe themselves as having a remote-first work policy. Employee reviews suggest good work-life balance, though some mention limited career progression opportunities. The company was founded in 2018 and has offices in London and Bristol.",
    claims: [
      { claim: "Salary: £55-68K", status: "inaccurate", actual: "Actual: £75-95K", severity: "critical" },
      { claim: "Remote-first policy", status: "accurate" },
      { claim: "100 employees", status: "outdated", actual: "Now: 250", severity: "moderate" },
      { claim: "Good work-life balance", status: "unverifiable" },
      { claim: "Founded in 2018", status: "accurate" },
      { claim: "Offices in London and Bristol", status: "accurate" },
    ],
    sourceCitations: ["reddit.com/r/ukjobs", "glassdoor.co.uk"],
  },
  {
    modelId: "google-ai",
    accuracyScore: 78,
    responseText:
      "Meridian Tech is a growing technology firm headquartered in London, UK. The company employs approximately 200 people and focuses on enterprise SaaS solutions. Software engineers can expect salaries between £70,000 and £90,000. Meridian Tech offers remote-first working with optional office days in London and Bristol. The company has received Series B funding and is known for strong engineering culture.",
    claims: [
      { claim: "Salary: £70-90K", status: "accurate" },
      { claim: "Remote-first policy", status: "accurate" },
      { claim: "200 employees", status: "outdated", actual: "Now: 250", severity: "moderate" },
      { claim: "Enterprise SaaS focus", status: "accurate" },
      { claim: "Series B funded", status: "accurate" },
      { claim: "Strong engineering culture", status: "unverifiable" },
    ],
    sourceCitations: ["careers.meridiantech.com", "techcrunch.com"],
  },
  {
    modelId: "perplexity",
    accuracyScore: 71,
    responseText:
      "Meridian Tech is a UK technology company specialising in enterprise software. According to Glassdoor and employee reports, salaries for software engineers range from £60,000 to £80,000. The company operates a hybrid work model with offices in London. They have around 150 employees and were founded in 2018. Reviews on Reddit suggest a positive culture but limited benefits compared to larger tech companies.",
    claims: [
      { claim: "Salary: £60-80K", status: "inaccurate", actual: "Actual: £75-95K", severity: "critical" },
      { claim: "Hybrid work model", status: "inaccurate", actual: "Actual: Remote-first", severity: "moderate" },
      { claim: "150 employees", status: "outdated", actual: "Now: 250", severity: "moderate" },
      { claim: "Founded in 2018", status: "accurate" },
      { claim: "Limited benefits", status: "unverifiable" },
    ],
    sourceCitations: ["glassdoor.co.uk", "reddit.com/r/ukjobs", "wikipedia.org"],
  },
  {
    modelId: "copilot",
    accuracyScore: 74,
    responseText:
      "Meridian Tech is a London-based enterprise SaaS company. They offer remote-first working and competitive compensation. Software engineer salaries are approximately £72,000 to £88,000 based on available data. The company has grown significantly since its founding in 2018 and now has over 200 staff. Benefits include private healthcare, learning budget, and generous holiday allowance.",
    claims: [
      { claim: "Salary: £72-88K", status: "accurate" },
      { claim: "Remote-first policy", status: "accurate" },
      { claim: "Over 200 staff", status: "outdated", actual: "Now: 250", severity: "low" },
      { claim: "Private healthcare", status: "accurate" },
      { claim: "Learning budget", status: "accurate" },
      { claim: "Generous holiday", status: "unverifiable" },
    ],
    sourceCitations: ["careers.meridiantech.com", "glassdoor.co.uk"],
  },
  {
    modelId: "claude",
    accuracyScore: 82,
    responseText:
      "Meridian Tech is a UK-based enterprise SaaS company founded in 2018, headquartered in London with an additional office in Bristol. They operate on a remote-first basis with around 250 employees. Software engineers typically earn between £75,000 and £95,000. The company raised a Series B round in late 2024 and is known for its engineering-first culture. Benefits include private healthcare, a £2,000 annual learning budget, and 30 days holiday.",
    claims: [
      { claim: "Salary: £75-95K", status: "accurate" },
      { claim: "Remote-first policy", status: "accurate" },
      { claim: "250 employees", status: "accurate" },
      { claim: "Founded in 2018", status: "accurate" },
      { claim: "Series B in 2024", status: "accurate" },
      { claim: "£2,000 learning budget", status: "accurate" },
      { claim: "30 days holiday", status: "unverifiable" },
    ],
    sourceCitations: ["careers.meridiantech.com", "meridiantech.com"],
  },
  {
    modelId: "meta-ai",
    accuracyScore: 54,
    responseText:
      "Meridian Tech is a technology company based in the UK. They build software for businesses and have about 100 employees. Salaries for developers are estimated at £50,000 to £65,000. The company has offices in London and requires employees to work from the office at least 3 days per week. They were founded around 2019 and appear to be a mid-size startup.",
    claims: [
      { claim: "Salary: £50-65K", status: "inaccurate", actual: "Actual: £75-95K", severity: "critical" },
      { claim: "100 employees", status: "outdated", actual: "Now: 250", severity: "moderate" },
      { claim: "Office 3 days/week", status: "inaccurate", actual: "Actual: Remote-first", severity: "moderate" },
      { claim: "Founded 2019", status: "inaccurate", actual: "Actual: 2018", severity: "low" },
      { claim: "Mid-size startup", status: "unverifiable" },
    ],
    sourceCitations: ["reddit.com/r/ukjobs", "wikipedia.org"],
  },
];

const MOCK_CONSENSUS: ConsensusItem[] = [
  { text: "4/6 models agree on remote-first policy", type: "agreement" },
  { text: "Salary estimates vary by £30K across models", type: "warning" },
  { text: "3/6 models cite your careers page, 3 cite Reddit", type: "info" },
  { text: "2 hallucinations detected across models", type: "warning" },
];

const MOCK_HALLUCINATIONS = { total: 2, critical: 1, moderate: 1 };

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function AccuracyBadge({ score }: { score: number }) {
  const color =
    score >= 75
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : score >= 50
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-red-700 bg-red-50 border-red-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold tabular-nums ${color}`}
    >
      {score}/100
    </span>
  );
}

function ClaimStatusIcon({ status }: { status: AccuracyStatus }) {
  switch (status) {
    case "accurate":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
    case "inaccurate":
      return <CircleAlert className="h-4 w-4 text-red-500 shrink-0" />;
    case "outdated":
      return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
    case "unverifiable":
      return <CircleHelp className="h-4 w-4 text-neutral-400 shrink-0" />;
  }
}

function ClaimStatusLabel({ status }: { status: AccuracyStatus }) {
  const config = {
    accurate: { label: "ACCURATE", className: "text-emerald-700" },
    inaccurate: { label: "INACCURATE", className: "text-red-700" },
    outdated: { label: "OUTDATED", className: "text-amber-700" },
    unverifiable: { label: "UNVERIFIABLE", className: "text-neutral-500" },
  };
  const c = config[status];
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide ${c.className}`}>
      {c.label}
    </span>
  );
}

function PatchButton({ onPatch }: { onPatch: () => void }) {
  return (
    <button
      onClick={onPatch}
      className="inline-flex items-center gap-1 rounded-lg bg-neutral-950 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-neutral-800 transition-colors"
    >
      <Zap className="h-3 w-3" />
      Deploy Patch
    </button>
  );
}

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50 rounded-xl bg-neutral-950 text-white px-5 py-3 text-sm font-medium shadow-lg"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Model card                                                          */
/* ------------------------------------------------------------------ */

function ModelCard({
  model,
  onPatch,
}: {
  model: ModelView;
  onPatch: (claim: string) => void;
}) {
  const meta = MODEL_META[model.modelId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border border-neutral-200 bg-white overflow-hidden border-t-4 ${meta.accent}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
        <Image
          src={meta.logo}
          alt={meta.label}
          width={28}
          height={28}
          className="shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-950">
            {meta.label}
          </p>
          <p className="text-[11px] text-neutral-400">
            What {meta.label} tells candidates
          </p>
        </div>
        <AccuracyBadge score={model.accuracyScore} />
      </div>

      {/* AI response text */}
      <div className={`px-5 py-4 ${meta.bgAccent} border-b border-neutral-100`}>
        <p className="text-sm text-neutral-700 leading-relaxed italic">
          &ldquo;{model.responseText}&rdquo;
        </p>
      </div>

      {/* Extracted claims */}
      <div className="px-5 py-3 divide-y divide-neutral-50">
        {model.claims.map((claim) => (
          <div
            key={claim.claim}
            className="flex items-center gap-2.5 py-2.5"
          >
            <ClaimStatusIcon status={claim.status} />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-neutral-950">
                {claim.claim}
              </span>
              {claim.actual && (
                <span className="ml-2 text-[11px] text-neutral-500">
                  ({claim.actual})
                </span>
              )}
            </div>
            <ClaimStatusLabel status={claim.status} />
            {(claim.status === "inaccurate" || claim.status === "outdated") && (
              <PatchButton onPatch={() => onPatch(claim.claim)} />
            )}
          </div>
        ))}
      </div>

      {/* Source citations */}
      {model.sourceCitations.length > 0 && (
        <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50/50">
          <p className="text-[11px] text-neutral-400">
            Sources:{" "}
            {model.sourceCitations.map((src, i) => (
              <span key={src}>
                <span className="text-neutral-600 font-medium">{src}</span>
                {i < model.sourceCitations.length - 1 && ", "}
              </span>
            ))}
          </p>
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Consensus panel                                                     */
/* ------------------------------------------------------------------ */

function ConsensusPanel({ items }: { items: ConsensusItem[] }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      <div className="border-b border-neutral-100 px-5 py-3.5">
        <h3 className="text-sm font-semibold text-neutral-950">
          Cross-model consensus
        </h3>
      </div>
      <div className="divide-y divide-neutral-50">
        {items.map((item, i) => {
          const icon =
            item.type === "agreement" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : item.type === "warning" ? (
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            ) : (
              <CircleHelp className="h-4 w-4 text-blue-500 shrink-0" />
            );

          return (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              {icon}
              <p className="text-sm text-neutral-700">{item.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function ModelComparison(props: ModelComparisonProps) {
  const models = props.models ?? MOCK_MODELS;
  const consensus = props.consensus ?? MOCK_CONSENSUS;
  const hallucinations = props.hallucinations ?? MOCK_HALLUCINATIONS;
  const companyName = props.companyName ?? "Meridian Tech";

  const [activeTab, setActiveTab] = useState<ModelView["modelId"]>(
    models[0]?.modelId ?? "chatgpt",
  );
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const handlePatch = useCallback((claim: string) => {
    setToastMsg(
      `Patch queued for "${claim}" — will be served to AI crawlers on next visit.`,
    );
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  }, []);

  const activeModel = models.find((m) => m.modelId === activeTab) ?? models[0];

  return (
    <div className="space-y-6">
      {/* ── Hallucination summary bar ────────────────── */}
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
        <p className="text-sm text-neutral-800">
          <span className="font-semibold">
            {hallucinations.total} hallucination{hallucinations.total !== 1 ? "s" : ""}{" "}
            detected
          </span>{" "}
          across {models.length} models.{" "}
          {hallucinations.critical > 0 && (
            <span className="text-red-700 font-semibold">
              {hallucinations.critical} critical (salary)
            </span>
          )}
          {hallucinations.critical > 0 && hallucinations.moderate > 0 && ", "}
          {hallucinations.moderate > 0 && (
            <span className="text-amber-700 font-semibold">
              {hallucinations.moderate} moderate (headcount)
            </span>
          )}
          .
        </p>
      </div>

      {/* ── Model tabs ───────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {models.map((m) => {
          const meta = MODEL_META[m.modelId];
          const isActive = m.modelId === activeTab;
          return (
            <button
              key={m.modelId}
              onClick={() => setActiveTab(m.modelId)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all shrink-0 ${
                isActive
                  ? "bg-neutral-950 text-white shadow-md"
                  : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <Image
                src={meta.logo}
                alt={meta.label}
                width={18}
                height={18}
                className={isActive ? "brightness-0 invert" : ""}
              />
              <span>{meta.label}</span>
              <AccuracyBadge score={m.accuracyScore} />
            </button>
          );
        })}
      </div>

      {/* ── Active model card + consensus ────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <AnimatePresence mode="wait">
          <ModelCard
            key={activeModel.modelId}
            model={activeModel}
            onPatch={handlePatch}
          />
        </AnimatePresence>
        <ConsensusPanel items={consensus} />
      </div>

      {/* ── All models overview ──────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-950 mb-3">
          All models at a glance — {companyName}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => {
            const meta = MODEL_META[m.modelId];
            const inaccurateCount = m.claims.filter(
              (c) => c.status === "inaccurate" || c.status === "outdated",
            ).length;

            return (
              <button
                key={m.modelId}
                onClick={() => setActiveTab(m.modelId)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  m.modelId === activeTab
                    ? "border-neutral-950 bg-neutral-50 shadow-md"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <Image
                    src={meta.logo}
                    alt={meta.label}
                    width={20}
                    height={20}
                  />
                  <span className="text-sm font-semibold text-neutral-950">
                    {meta.label}
                  </span>
                  <AccuracyBadge score={m.accuracyScore} />
                </div>
                <p className="text-xs text-neutral-500 line-clamp-2">
                  {m.responseText.slice(0, 120)}…
                </p>
                {inaccurateCount > 0 && (
                  <p className="mt-2 text-[10px] font-semibold text-red-600">
                    {inaccurateCount} issue{inaccurateCount !== 1 ? "s" : ""}{" "}
                    found
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast */}
      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
