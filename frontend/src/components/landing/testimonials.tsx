/**
 * @module components/landing/testimonials
 * Before/After comparison — simulated LLM chat interfaces showing
 * what candidates see when they ask AI about a company, with and
 * without Rankwell active. Closely mimics real ChatGPT 5.2 UI.
 */

"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Pencil, EllipsisVertical, Mic, AudioLines, ChevronDown } from "lucide-react";

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

// ---------------------------------------------------------------------------
// Shared user question
// ---------------------------------------------------------------------------

const USER_QUESTION =
  "What's it like to work at Meridian Tech? What's the salary for a senior engineer?";

// ---------------------------------------------------------------------------
// Source pill component (mimics ChatGPT inline citations)
// ---------------------------------------------------------------------------

function SourcePill({ label, extra }: { label: string; extra?: string }) {
  return (
    <span className="inline-flex items-center gap-1 ml-1.5 px-2 py-0.5 bg-[#2f2f2f] rounded-full text-[10px] text-neutral-400 font-medium whitespace-nowrap align-middle">
      {label}
      {extra && <span className="text-neutral-500">{extra}</span>}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Verified source pill (green tint for "with Rankwell")
// ---------------------------------------------------------------------------

function VerifiedSourcePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 ml-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] text-emerald-400 font-medium whitespace-nowrap align-middle">
      <span>✓</span>
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Error / Verified inline badges
// ---------------------------------------------------------------------------

function ErrorBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/15 border border-red-500/25 rounded-full text-[10px] font-semibold text-red-400 whitespace-nowrap">
      <span>❌</span>
      {children}
    </span>
  );
}

function VerifiedBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/25 rounded-full text-[10px] font-semibold text-emerald-400 whitespace-nowrap">
      <span>✓</span>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// ChatGPT 5.2 header (matches real UI)
// ---------------------------------------------------------------------------

function ChatGPTHeader() {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-[3px] w-5 h-5 justify-center">
          <span className="w-4 h-[1.5px] bg-neutral-400 rounded-full" />
          <span className="w-3 h-[1.5px] bg-neutral-400 rounded-full" />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[14px] font-semibold text-white">ChatGPT</span>
          <span className="text-[14px] text-neutral-500">5.2</span>
          <ChevronDown className="w-3 h-3 text-neutral-500 ml-0.5" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Pencil className="w-[18px] h-[18px] text-neutral-400" />
        <EllipsisVertical className="w-[18px] h-[18px] text-neutral-400" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// User message bubble (right-aligned, ChatGPT style)
// ---------------------------------------------------------------------------

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end px-4 py-3">
      <div className="max-w-[80%] bg-[#303030] rounded-[20px] px-4 py-2.5">
        <p className="text-[14px] text-neutral-100 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ChatGPT bottom input bar
// ---------------------------------------------------------------------------

function ChatGPTInputBar() {
  return (
    <div className="px-3 py-3 border-t border-white/[0.04]">
      <div className="flex items-center gap-2 bg-[#303030] rounded-full px-4 py-2.5">
        <Plus className="w-5 h-5 text-neutral-400 shrink-0" />
        <span className="flex-1 text-[14px] text-neutral-500">Ask anything</span>
        <Mic className="w-5 h-5 text-neutral-400 shrink-0" />
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <AudioLines className="w-4 h-4 text-neutral-300" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WITHOUT Rankwell — ChatGPT panel
// ---------------------------------------------------------------------------

function ChatGPTWithout() {
  return (
    <div className="rounded-2xl bg-[#212121] border border-white/[0.06] overflow-hidden shadow-2xl shadow-black/40 flex flex-col">
      <ChatGPTHeader />
      <UserMessage text={USER_QUESTION} />

      {/* AI response — plain text, no avatar, matches real ChatGPT 5.2 */}
      <div className="px-4 pb-4 flex-1">
        <div className="space-y-4">
          <p className="text-[13.5px] text-neutral-300 leading-relaxed">
            Here&apos;s a general picture of what it&apos;s like working at{" "}
            <strong className="text-white">Meridian Tech</strong> — plus typical
            engineer salaries — based on employee reviews and salary data
            (mostly from anonymous sites like Glassdoor and Indeed):
          </p>

          {/* Section heading — emoji + bold, matches real GPT output */}
          <div>
            <p className="text-[14px] font-semibold text-white mb-2.5">
              👩‍💼 What employees say about working there
            </p>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <span className="text-neutral-500 mt-0.5 shrink-0">•</span>
                <p className="text-[13.5px] text-neutral-300 leading-relaxed">
                  Many employees describe <strong className="text-white">Meridian Tech</strong> as
                  having a <em>decent work culture with good colleagues and knowledgeable
                  peers</em>. Some reviews mention supportive management and a positive team
                  atmosphere.
                  <SourcePill label="Glassdoor" />
                  <span className="ml-2"><ErrorBadge>Unverified</ErrorBadge></span>
                </p>
              </li>
              <li className="flex gap-2">
                <span className="text-neutral-500 mt-0.5 shrink-0">•</span>
                <p className="text-[13.5px] text-neutral-300 leading-relaxed">
                  Compensation and benefits generally get <em>mixed reviews</em> — often
                  described as <em>average or decent</em>, but not exceptional.
                  <SourcePill label="Glassdoor" />
                  <span className="ml-2"><ErrorBadge>Vague</ErrorBadge></span>
                </p>
              </li>
              <li className="flex gap-2">
                <span className="text-neutral-500 mt-0.5 shrink-0">•</span>
                <p className="text-[13.5px] text-neutral-300 leading-relaxed">
                  A few reviews mention more <em>chaotic work environments or weaker
                  management structures</em>, so experiences appear to vary a lot by
                  team or location.
                  <SourcePill label="Indeed" />
                  <span className="ml-2"><ErrorBadge>Damaging</ErrorBadge></span>
                </p>
              </li>
            </ul>
          </div>

          {/* Salary section */}
          <div>
            <p className="text-[14px] font-semibold text-white mb-2.5">
              💰 Senior Engineer salary
            </p>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <span className="text-neutral-500 mt-0.5 shrink-0">•</span>
                <p className="text-[13.5px] text-neutral-300 leading-relaxed">
                  Estimated range: <strong className="text-white">£55,000 – £68,000</strong> based
                  on aggregated data from job boards and anonymous submissions.
                  <SourcePill label="Glassdoor" />
                  <SourcePill label="Indeed" />
                  <span className="ml-2"><ErrorBadge>Wrong — actual: £75-95K</ErrorBadge></span>
                </p>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[11px] text-neutral-500">Show more</span>
          </div>
        </div>
      </div>

      <ChatGPTInputBar />
    </div>
  );
}

// ---------------------------------------------------------------------------
// WITH Rankwell — ChatGPT panel
// ---------------------------------------------------------------------------

function ChatGPTWith() {
  return (
    <div className="rounded-2xl bg-[#212121] border border-emerald-500/10 overflow-hidden shadow-2xl shadow-emerald-900/10 flex flex-col">
      <ChatGPTHeader />
      <UserMessage text={USER_QUESTION} />

      {/* AI response — same structure, verified data */}
      <div className="px-4 pb-4 flex-1">
        <div className="space-y-4">
          <p className="text-[13.5px] text-neutral-300 leading-relaxed">
            Here&apos;s a detailed overview of working at{" "}
            <strong className="text-white">Meridian Tech</strong>, based on
            verified employer data and recent employee insights:
          </p>

          {/* Section heading */}
          <div>
            <p className="text-[14px] font-semibold text-white mb-2.5">
              👩‍💼 What employees say about working there
            </p>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <span className="text-neutral-500 mt-0.5 shrink-0">•</span>
                <p className="text-[13.5px] text-neutral-300 leading-relaxed">
                  Meridian Tech operates a <strong className="text-white">remote-first culture</strong> with
                  optional London office 2 days/week. Employees highlight strong autonomy,
                  transparent leadership, and a collaborative engineering culture.
                  <VerifiedSourcePill label="meridiantech.com" />
                </p>
              </li>
              <li className="flex gap-2">
                <span className="text-neutral-500 mt-0.5 shrink-0">•</span>
                <p className="text-[13.5px] text-neutral-300 leading-relaxed">
                  The company offers a comprehensive benefits package including{" "}
                  <strong className="text-white">private healthcare, £2,000 annual learning budget,
                  30 days holiday</strong>, and enhanced parental leave.
                  <VerifiedSourcePill label="meridiantech.com" />
                </p>
              </li>
              <li className="flex gap-2">
                <span className="text-neutral-500 mt-0.5 shrink-0">•</span>
                <p className="text-[13.5px] text-neutral-300 leading-relaxed">
                  Recent Glassdoor reviews (2024-25) rate the company{" "}
                  <strong className="text-white">4.2/5</strong> with particular praise for
                  engineering leadership and career progression pathways.
                  <VerifiedSourcePill label="meridiantech.com" />
                  <SourcePill label="Glassdoor" />
                </p>
              </li>
            </ul>
          </div>

          {/* Salary section */}
          <div>
            <p className="text-[14px] font-semibold text-white mb-2.5">
              💰 Senior Engineer salary
            </p>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <span className="text-neutral-500 mt-0.5 shrink-0">•</span>
                <p className="text-[13.5px] text-neutral-300 leading-relaxed">
                  Published salary range: <strong className="text-white">£75,000 – £95,000</strong> base,
                  plus equity and annual bonus. The company publishes transparent salary
                  bands on their careers page.
                  <VerifiedSourcePill label="meridiantech.com/careers" />
                  <span className="ml-2"><VerifiedBadge>Verified 2 days ago</VerifiedBadge></span>
                </p>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[11px] text-neutral-500">Show more</span>
          </div>
        </div>
      </div>

      <ChatGPTInputBar />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mini LLM cards (Perplexity, Google AI Overview, Claude)
// ---------------------------------------------------------------------------

interface MiniCardProps {
  logo: string;
  name: string;
  withoutContent: React.ReactNode;
  withContent: React.ReactNode;
  bgClass?: string;
}

function MiniCard({
  logo,
  name,
  withoutContent,
  withContent,
  bgClass = "bg-[#1a1a1a]",
}: MiniCardProps) {
  return (
    <div
      className={`rounded-2xl ${bgClass} border border-white/[0.06] overflow-hidden shadow-xl shadow-black/30 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <Image src={logo} alt={name} width={16} height={16} />
        <span className="text-[12px] font-semibold text-neutral-400">
          {name}
        </span>
      </div>

      {/* Two halves */}
      <div className="grid grid-cols-2 divide-x divide-white/[0.06] flex-1">
        {/* Without */}
        <div className="px-3 py-3 space-y-1.5">
          <span className="text-[9px] font-bold text-red-400/80 uppercase tracking-wider">
            Without
          </span>
          {withoutContent}
        </div>
        {/* With */}
        <div className="px-3 py-3 space-y-1.5">
          <span className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-wider">
            With Rankwell
          </span>
          {withContent}
        </div>
      </div>
    </div>
  );
}

function PerplexityCard() {
  return (
    <MiniCard
      logo="/logos/perplexity.svg"
      name="Perplexity"
      withoutContent={
        <>
          <p className="text-[11px] text-neutral-400 leading-snug">
            Senior Engineer salary at Meridian Tech:
          </p>
          <p className="text-[12px] text-neutral-200 font-semibold">
            £55K – £68K
          </p>
          <p className="text-[9px] text-neutral-500">
            📎 reddit.com/r/ukjobs
          </p>
          <ErrorBadge>Wrong</ErrorBadge>
        </>
      }
      withContent={
        <>
          <p className="text-[11px] text-neutral-400 leading-snug">
            Senior Engineer salary at Meridian Tech:
          </p>
          <p className="text-[12px] text-neutral-200 font-semibold">
            £75K – £95K
          </p>
          <p className="text-[9px] text-neutral-500">
            📎 meridiantech.com
          </p>
          <VerifiedBadge>Verified</VerifiedBadge>
        </>
      }
    />
  );
}

function GoogleAICard() {
  return (
    <MiniCard
      logo="/logos/google-ai.svg"
      name="Google AI Overview"
      bgClass="bg-[#1a1a1a]"
      withoutContent={
        <>
          <div className="bg-[#252525] rounded-lg px-2 py-1.5">
            <p className="text-[11px] text-neutral-400 leading-snug">
              Meridian Tech is a technology company with mixed reviews on
              work-life balance…
            </p>
          </div>
          <ErrorBadge>Outdated</ErrorBadge>
        </>
      }
      withContent={
        <>
          <div className="bg-[#252525] rounded-lg px-2 py-1.5">
            <p className="text-[11px] text-neutral-300 leading-snug">
              Meridian Tech is a remote-first company offering £75-95K for
              senior engineers…
            </p>
          </div>
          <VerifiedBadge>Employer confirmed</VerifiedBadge>
        </>
      }
    />
  );
}

function ClaudeCard() {
  return (
    <MiniCard
      logo="/logos/claude.svg"
      name="Claude"
      withoutContent={
        <>
          <p className="text-[11px] text-neutral-400 leading-snug italic">
            I don&apos;t have specific information about Meridian Tech&apos;s
            benefits package…
          </p>
          <ErrorBadge>No data</ErrorBadge>
        </>
      }
      withContent={
        <>
          <div className="flex flex-wrap gap-1">
            {["Healthcare", "£2K L&D", "30 days PTO", "Parental leave"].map(
              (b) => (
                <span
                  key={b}
                  className="px-1.5 py-0.5 bg-white/[0.06] text-neutral-300 text-[9px] rounded"
                >
                  {b}
                </span>
              )
            )}
          </div>
          <VerifiedBadge>Verified</VerifiedBadge>
        </>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function BeforeAfter() {
  return (
    <section
      id="testimonials"
      className="py-24 lg:py-32 bg-neutral-950 relative overflow-hidden"
    >
      {/* Subtle glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-[300px] h-[300px] bg-emerald-500/[0.03] rounded-full blur-3xl" />
      <div className="absolute top-40 left-0 w-[300px] h-[300px] bg-red-500/[0.03] rounded-full blur-3xl" />

      <motion.div
        className="relative max-w-[1200px] mx-auto px-6 lg:px-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {/* Section header */}
        <motion.div className="mb-14 lg:mb-16" variants={fadeUp}>
          <p className="overline text-brand-accent-light mb-3">
            The difference
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-white max-w-2xl tracking-tight">
            What candidates see when they ask AI about you
          </h2>
          <p className="text-neutral-400 mt-3 max-w-xl">
            A candidate asks ChatGPT about working at your company.
            Here&apos;s what changes when Rankwell is active.
          </p>
        </motion.div>

        {/* Main comparison — two ChatGPT 5.2 interfaces side by side */}
        <div className="grid gap-6 lg:gap-8 md:grid-cols-2 mb-8">
          {/* Without Rankwell */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">
                Without Rankwell
              </span>
            </div>
            <ChatGPTWithout />
          </motion.div>

          {/* With Rankwell */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                With Rankwell
              </span>
            </div>
            <ChatGPTWith />
          </motion.div>
        </div>

        {/* Mini LLM cards row */}
        <motion.div variants={fadeIn}>
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-4 text-center">
            Same story across every AI platform
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <motion.div variants={fadeUp}>
              <PerplexityCard />
            </motion.div>
            <motion.div variants={fadeUp}>
              <GoogleAICard />
            </motion.div>
            <motion.div variants={fadeUp}>
              <ClaudeCard />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
