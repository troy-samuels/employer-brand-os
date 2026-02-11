/**
 * @module components/dashboard/crawler-dashboard
 * AI crawler activity dashboard — shows which bots visit the site,
 * what they read, and whether any are blocked.
 */

"use client";

import Image from "next/image";
import { ShieldAlert, ArrowRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface CrawlerBot {
  botName: string;
  parentCompany: string;
  logo: string;
  visits: number;
  pagesRead: number;
  lastVisited: string | null;
  status: "reading" | "blocked" | "not-visiting";
  couldRead: boolean;
}

export interface DailyVisits {
  day: string;
  visits: number;
}

export interface CrawlerDashboardProps {
  totalVisits?: number;
  pagesRead?: number;
  botsBlocked?: number;
  dataServed?: number;
  bots?: CrawlerBot[];
  timeline?: DailyVisits[];
}

/* ------------------------------------------------------------------ */
/* Bot → logo mapping                                                  */
/* ------------------------------------------------------------------ */

const BOT_CONFIG: Record<
  string,
  { parentCompany: string; logo: string; label: string }
> = {
  GPTBot: {
    parentCompany: "OpenAI",
    logo: "/logos/chatgpt.svg",
    label: "GPTBot",
  },
  ClaudeBot: {
    parentCompany: "Anthropic",
    logo: "/logos/claude.svg",
    label: "ClaudeBot",
  },
  PerplexityBot: {
    parentCompany: "Perplexity",
    logo: "/logos/perplexity.svg",
    label: "PerplexityBot",
  },
  GoogleOther: {
    parentCompany: "Google",
    logo: "/logos/google-ai.svg",
    label: "Google-Extended",
  },
  "Meta-ExternalAgent": {
    parentCompany: "Meta",
    logo: "/logos/meta-ai.svg",
    label: "Meta-ExternalAgent",
  },
  Bytespider: {
    parentCompany: "Microsoft / ByteDance",
    logo: "/logos/copilot.svg",
    label: "Bytespider",
  },
};

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_BOTS: CrawlerBot[] = [
  {
    botName: "GPTBot",
    parentCompany: "OpenAI",
    logo: "/logos/chatgpt.svg",
    visits: 47,
    pagesRead: 32,
    lastVisited: "2025-01-18T08:14:00Z",
    status: "reading",
    couldRead: true,
  },
  {
    botName: "ClaudeBot",
    parentCompany: "Anthropic",
    logo: "/logos/claude.svg",
    visits: 3,
    pagesRead: 0,
    lastVisited: "2025-01-17T22:40:00Z",
    status: "blocked",
    couldRead: false,
  },
  {
    botName: "PerplexityBot",
    parentCompany: "Perplexity",
    logo: "/logos/perplexity.svg",
    visits: 28,
    pagesRead: 19,
    lastVisited: "2025-01-18T06:33:00Z",
    status: "reading",
    couldRead: true,
  },
  {
    botName: "GoogleOther",
    parentCompany: "Google",
    logo: "/logos/google-ai.svg",
    visits: 63,
    pagesRead: 45,
    lastVisited: "2025-01-18T09:01:00Z",
    status: "reading",
    couldRead: true,
  },
  {
    botName: "Meta-ExternalAgent",
    parentCompany: "Meta",
    logo: "/logos/meta-ai.svg",
    visits: 0,
    pagesRead: 0,
    lastVisited: null,
    status: "not-visiting",
    couldRead: true,
  },
  {
    botName: "Bytespider",
    parentCompany: "Microsoft / ByteDance",
    logo: "/logos/copilot.svg",
    visits: 12,
    pagesRead: 8,
    lastVisited: "2025-01-17T15:22:00Z",
    status: "reading",
    couldRead: true,
  },
];

const MOCK_TIMELINE: DailyVisits[] = [
  { day: "Mon", visits: 18 },
  { day: "Tue", visits: 24 },
  { day: "Wed", visits: 31 },
  { day: "Thu", visits: 22 },
  { day: "Fri", visits: 27 },
  { day: "Sat", visits: 14 },
  { day: "Sun", visits: 17 },
];

const MOCK_DEFAULTS: Required<CrawlerDashboardProps> = {
  totalVisits: 153,
  pagesRead: 104,
  botsBlocked: 1,
  dataServed: 89,
  bots: MOCK_BOTS,
  timeline: MOCK_TIMELINE,
};

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-5 py-4 text-center">
      <p className="text-2xl font-bold tabular-nums text-neutral-950">
        {value}
      </p>
      <p className="text-[11px] text-neutral-400 mt-0.5">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: CrawlerBot["status"] }) {
  const config = {
    reading: {
      label: "Reading your site",
      dot: "bg-emerald-500",
      text: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    blocked: {
      label: "Blocked",
      dot: "bg-red-500",
      text: "text-red-700",
      bg: "bg-red-50",
    },
    "not-visiting": {
      label: "Not visiting",
      dot: "bg-neutral-300",
      text: "text-neutral-500",
      bg: "bg-neutral-50",
    },
  };

  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${c.bg} ${c.text}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function BotCard({ bot }: { bot: CrawlerBot }) {
  const lastVisitedLabel = bot.lastVisited
    ? new Date(bot.lastVisited).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-3 mb-3">
        <Image
          src={bot.logo}
          alt={bot.botName}
          width={28}
          height={28}
          className="shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-950">
            {bot.botName}
          </p>
          <p className="text-[11px] text-neutral-400">{bot.parentCompany}</p>
        </div>
        <StatusBadge status={bot.status} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-bold tabular-nums text-neutral-950">
            {bot.visits}
          </p>
          <p className="text-[10px] text-neutral-400">Visits</p>
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums text-neutral-950">
            {bot.pagesRead}
          </p>
          <p className="text-[10px] text-neutral-400">Pages read</p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-neutral-600 mt-1">
            {lastVisitedLabel}
          </p>
          <p className="text-[10px] text-neutral-400">Last visit</p>
        </div>
      </div>

      {bot.status === "blocked" && (
        <a
          href="/dashboard/compliance"
          className="mt-3 flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
        >
          Unblock this crawler
          <ArrowRight className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

function MiniBarChart({ timeline }: { timeline: DailyVisits[] }) {
  const max = Math.max(...timeline.map((d) => d.visits), 1);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-neutral-950 mb-4">
        Weekly crawler activity
      </h3>
      <div className="flex items-end gap-2 h-24">
        {timeline.map((d) => {
          const height = (d.visits / max) * 100;
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium tabular-nums text-neutral-500">
                {d.visits}
              </span>
              <div
                className="w-full rounded-t bg-neutral-950 transition-all duration-300"
                style={{ height: `${height}%`, minHeight: 2 }}
              />
              <span className="text-[10px] text-neutral-400">{d.day}</span>
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

export default function CrawlerDashboard(props: CrawlerDashboardProps) {
  const totalVisits = props.totalVisits ?? MOCK_DEFAULTS.totalVisits;
  const pagesRead = props.pagesRead ?? MOCK_DEFAULTS.pagesRead;
  const botsBlocked = props.botsBlocked ?? MOCK_DEFAULTS.botsBlocked;
  const dataServed = props.dataServed ?? MOCK_DEFAULTS.dataServed;
  const bots = props.bots ?? MOCK_DEFAULTS.bots;
  const timeline = props.timeline ?? MOCK_DEFAULTS.timeline;

  const blockedBots = bots.filter((b) => b.status === "blocked");

  return (
    <div className="space-y-6">
      {/* ── Alert: blocked bots ──────────────────────── */}
      {blockedBots.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            {blockedBots.map((bot) => (
              <p key={bot.botName} className="text-sm text-neutral-800">
                <span className="font-semibold">{bot.botName}</span> is blocked
                by your robots.txt —{" "}
                {BOT_CONFIG[bot.botName]?.parentCompany ?? bot.parentCompany}{" "}
                users can&apos;t get accurate info about you.
              </p>
            ))}
            <a
              href="/dashboard/compliance"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800"
            >
              Fix robots.txt
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* ── Summary stats ────────────────────────────── */}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <div className="border-b border-neutral-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-neutral-950">
            Crawler Activity — This Week
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-neutral-100">
          <StatCard label="Total visits" value={totalVisits} />
          <StatCard label="Pages read" value={pagesRead} />
          <StatCard label="Bots blocked" value={botsBlocked} />
          <StatCard label="Data served" value={dataServed} />
        </div>
      </div>

      {/* ── Per-bot cards ────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-950 mb-4">
          Bot breakdown
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <BotCard key={bot.botName} bot={bot} />
          ))}
        </div>
      </div>

      {/* ── Timeline ─────────────────────────────────── */}
      <MiniBarChart timeline={timeline} />
    </div>
  );
}
