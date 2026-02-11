/**
 * @module components/landing/testimonials
 * Before/After comparison — simulated LLM chat interfaces showing
 * what candidates see when they ask AI about a company, with and
 * without Rankwell active. The showpiece section of the landing page.
 */

"use client";

import Image from "next/image";
import { motion } from "framer-motion";

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
// Error / Verified badge components
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
// ChatGPT-style header
// ---------------------------------------------------------------------------

function ChatGPTHeader() {
  return (
    <div className="flex items-center gap-2 px-4 pt-4 pb-2">
      <Image
        src="/logos/chatgpt.svg"
        alt="ChatGPT"
        width={20}
        height={20}
        className="rounded-sm"
      />
      <span className="text-[13px] font-semibold text-neutral-300">
        ChatGPT
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// User message bubble (ChatGPT-style)
// ---------------------------------------------------------------------------

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end px-4 pb-3">
      <div className="max-w-[85%] bg-[#2f2f2f] rounded-2xl rounded-br-md px-4 py-2.5">
        <p className="text-[13px] text-neutral-200 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ChatGPT comparison panels
// ---------------------------------------------------------------------------

function ChatGPTWithout() {
  return (
    <div className="rounded-2xl bg-[#212121] border border-white/[0.06] overflow-hidden shadow-2xl shadow-black/40">
      <ChatGPTHeader />
      <UserMessage text={USER_QUESTION} />

      {/* AI response area */}
      <div className="px-4 pb-5 space-y-3">
        {/* ChatGPT-style avatar + response */}
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#10a37f] flex items-center justify-center mt-0.5">
            <Image
              src="/logos/chatgpt.svg"
              alt=""
              width={16}
              height={16}
              className="brightness-200"
            />
          </div>
          <div className="flex-1 space-y-3 min-w-0">
            <p className="text-[13px] text-neutral-300 leading-relaxed">
              Based on available information, Meridian Tech is a mid-size
              technology company. Here&apos;s what I found:
            </p>

            {/* Salary — wrong */}
            <div className="space-y-1.5">
              <p className="text-[13px] text-neutral-200 leading-relaxed">
                <span className="font-semibold text-white">
                  💰 Salary (Senior Engineer):
                </span>{" "}
                £55,000 – £68,000
              </p>
              <ErrorBadge>Wrong — actual: £75-95K</ErrorBadge>
            </div>

            {/* Remote — wrong */}
            <div className="space-y-1.5">
              <p className="text-[13px] text-neutral-200 leading-relaxed">
                <span className="font-semibold text-white">
                  🏠 Remote Policy:
                </span>{" "}
                Limited remote options based on recent reviews
              </p>
              <ErrorBadge>Outdated</ErrorBadge>
            </div>

            {/* Benefits — missing */}
            <div className="space-y-1.5">
              <p className="text-[13px] text-neutral-300 leading-relaxed italic">
                <span className="font-semibold text-white not-italic">
                  🎁 Benefits:
                </span>{" "}
                No specific benefits data available
              </p>
              <ErrorBadge>No data</ErrorBadge>
            </div>

            {/* Sources */}
            <p className="text-[11px] text-neutral-500 pt-2 border-t border-white/[0.06]">
              Sources: reddit.com/r/ukjobs (2023), glassdoor.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatGPTWith() {
  return (
    <div className="rounded-2xl bg-[#212121] border border-emerald-500/10 overflow-hidden shadow-2xl shadow-emerald-900/10">
      <ChatGPTHeader />
      <UserMessage text={USER_QUESTION} />

      {/* AI response area */}
      <div className="px-4 pb-5 space-y-3">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#10a37f] flex items-center justify-center mt-0.5">
            <Image
              src="/logos/chatgpt.svg"
              alt=""
              width={16}
              height={16}
              className="brightness-200"
            />
          </div>
          <div className="flex-1 space-y-3 min-w-0">
            <p className="text-[13px] text-neutral-300 leading-relaxed">
              Based on verified employer data, here&apos;s the latest on Meridian
              Tech:
            </p>

            {/* Salary — correct */}
            <div className="space-y-1.5">
              <p className="text-[13px] text-neutral-200 leading-relaxed">
                <span className="font-semibold text-white">
                  💰 Salary (Senior Engineer):
                </span>{" "}
                £75,000 – £95,000
              </p>
              <div className="flex flex-wrap gap-1.5">
                <VerifiedBadge>Verified 2 days ago</VerifiedBadge>
              </div>
            </div>

            {/* Remote — correct */}
            <div className="space-y-1.5">
              <p className="text-[13px] text-neutral-200 leading-relaxed">
                <span className="font-semibold text-white">
                  🏠 Remote Policy:
                </span>{" "}
                Remote-first, with optional London office 2 days/week
              </p>
              <VerifiedBadge>Employer confirmed</VerifiedBadge>
            </div>

            {/* Benefits — full */}
            <div className="space-y-1.5">
              <p className="text-[13px] text-neutral-200 leading-relaxed">
                <span className="font-semibold text-white">
                  🎁 Benefits:
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Private healthcare",
                  "£2K learning budget",
                  "30 days holiday",
                  "Enhanced parental leave",
                ].map((b) => (
                  <span
                    key={b}
                    className="px-2 py-0.5 bg-white/[0.06] text-neutral-300 text-[11px] rounded-md"
                  >
                    {b}
                  </span>
                ))}
              </div>
              <VerifiedBadge>Verified</VerifiedBadge>
            </div>

            {/* Sources */}
            <p className="text-[11px] text-neutral-500 pt-2 border-t border-white/[0.06]">
              Sources: meridiantech.com/careers{" "}
              <span className="text-emerald-500">(verified via Rankwell pixel)</span>
            </p>
          </div>
        </div>
      </div>
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
  accentColor?: string;
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
            A candidate asks ChatGPT about working at a mid-size tech company.
            Here&apos;s what changes when Rankwell is active.
          </p>
        </motion.div>

        {/* Main comparison — two ChatGPT interfaces side by side */}
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
