/**
 * @module components/landing/testimonials
 * Before/After comparison — a single ChatGPT-style chat interface that
 * streams responses word-by-word, toggling between Without / With Rankwell.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  EllipsisVertical,
  Mic,
  AudioLines,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type Mode = "without" | "with";

const USER_QUESTION =
  "What's it like to work for Meridian Tech? What's the salary for a senior engineer?";

/** Average ms per word when streaming. */
const STREAM_SPEED_MS = 40;

/** Pause (ms) before streaming starts (simulates "thinking"). */
const THINKING_DELAY_MS = 1800;

// ---------------------------------------------------------------------------
// Response tokens — each token is a "word" or inline element
// ---------------------------------------------------------------------------

interface Token {
  text: string;
  className?: string;
}

const WITHOUT_TOKENS: Token[] = tokensFrom([
  { text: "Here's a general picture of " },
  { text: "Meridian Tech", className: "font-semibold text-neutral-900" },
  { text: " based on employee reviews:\n\n" },
  { text: "👩‍💼 Culture\n", className: "font-semibold text-neutral-900" },
  { text: "• Described as " },
  { text: "\"decent work culture\"", className: "italic" },
  { text: " with mixed management experiences. " },
  { text: "Glassdoor", className: "inline-flex items-center ml-1 px-1.5 py-0.5 bg-neutral-100 rounded-full text-[10px] text-neutral-500 font-medium" },
  { text: "\n" },
  { text: "• Compensation described as " },
  { text: "\"average\"", className: "italic" },
  { text: " — not exceptional. " },
  { text: "Glassdoor", className: "inline-flex items-center ml-1 px-1.5 py-0.5 bg-neutral-100 rounded-full text-[10px] text-neutral-500 font-medium" },
  { text: "\n\n" },
  { text: "💰 Senior Engineer Salary\n", className: "font-semibold text-neutral-900" },
  { text: "• Estimated: " },
  { text: "£55,000 – £68,000", className: "font-semibold text-neutral-900" },
  { text: " based on aggregated data. " },
  { text: "Glassdoor", className: "inline-flex items-center ml-1 px-1.5 py-0.5 bg-neutral-100 rounded-full text-[10px] text-neutral-500 font-medium" },
  { text: " " },
  { text: "Indeed", className: "inline-flex items-center ml-1 px-1.5 py-0.5 bg-neutral-100 rounded-full text-[10px] text-neutral-500 font-medium" },
  { text: "\n\n" },
  { text: "❌ £20K below actual range", className: "text-[11px] px-2 py-1 bg-red-50 border border-red-200 rounded-lg text-red-600 font-medium inline-block" },
  { text: "  " },
  { text: "❌ No verified sources", className: "text-[11px] px-2 py-1 bg-red-50 border border-red-200 rounded-lg text-red-600 font-medium inline-block" },
]);

const WITH_TOKENS: Token[] = tokensFrom([
  { text: "Here's a detailed overview of " },
  { text: "Meridian Tech", className: "font-semibold text-neutral-900" },
  { text: " based on verified employer data:\n\n" },
  { text: "👩‍💼 Culture\n", className: "font-semibold text-neutral-900" },
  { text: "• " },
  { text: "Remote-first", className: "font-semibold text-neutral-900" },
  { text: " with optional London office. Strong autonomy, transparent leadership. " },
  { text: "✓ meridiantech.com", className: "inline-flex items-center ml-1 px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] text-emerald-600 font-medium" },
  { text: "\n" },
  { text: "• Benefits: " },
  { text: "private healthcare, £2K learning budget, 30 days holiday", className: "font-semibold text-neutral-900" },
  { text: ". " },
  { text: "✓ meridiantech.com", className: "inline-flex items-center ml-1 px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] text-emerald-600 font-medium" },
  { text: "\n\n" },
  { text: "💰 Senior Engineer Salary\n", className: "font-semibold text-neutral-900" },
  { text: "• Published range: " },
  { text: "£75,000 – £95,000", className: "font-semibold text-neutral-900" },
  { text: " base + equity + bonus. " },
  { text: "✓ meridiantech.com/careers", className: "inline-flex items-center ml-1 px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] text-emerald-600 font-medium" },
  { text: "\n\n" },
  { text: "✓ Verified 2 days ago", className: "text-[11px] px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 font-medium inline-block" },
  { text: "  " },
  { text: "✓ Employer confirmed", className: "text-[11px] px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 font-medium inline-block" },
]);

/** Split compound tokens into individual words for streaming. */
function tokensFrom(raw: Token[]): Token[] {
  const result: Token[] = [];
  for (const t of raw) {
    // If token has special className (badge/pill), keep it atomic
    if (t.className && t.className.length > 30) {
      result.push(t);
      continue;
    }
    // Otherwise split by spaces to stream word-by-word
    const words = t.text.split(/( )/);
    for (const w of words) {
      if (w === "") continue;
      result.push({ text: w, className: t.className });
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Thinking dots animation
// ---------------------------------------------------------------------------

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-4">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-neutral-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Streaming response component
// ---------------------------------------------------------------------------

function StreamingResponse({
  tokens,
  onComplete,
}: {
  tokens: Token[];
  onComplete?: () => void;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    if (visibleCount >= tokens.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return;
    }

    const timer = setTimeout(() => {
      // Stream 1-3 tokens at a time for natural feel
      const step = Math.random() > 0.7 ? 2 : 1;
      setVisibleCount((c) => Math.min(c + step, tokens.length));
    }, STREAM_SPEED_MS + Math.random() * 30);

    return () => clearTimeout(timer);
  }, [visibleCount, tokens, onComplete]);

  return (
    <div className="px-4 pb-4">
      <p className="text-[13.5px] text-neutral-700 leading-relaxed whitespace-pre-wrap">
        {tokens.slice(0, visibleCount).map((t, i) => (
          <span key={i} className={t.className}>
            {t.text}
          </span>
        ))}
        {visibleCount < tokens.length && (
          <motion.span
            className="inline-block w-[2px] h-[14px] bg-neutral-900 ml-0.5 align-middle"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ChatGPT chrome
// ---------------------------------------------------------------------------

function ChatGPTHeader() {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-[3px] w-5 h-5 justify-center">
          <span className="w-4 h-[1.5px] bg-neutral-400 rounded-full" />
          <span className="w-3 h-[1.5px] bg-neutral-400 rounded-full" />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[14px] font-semibold text-neutral-900">ChatGPT</span>
          <span className="text-[14px] text-neutral-400">5.2</span>
          <ChevronDown className="w-3 h-3 text-neutral-400 ml-0.5" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Pencil className="w-[18px] h-[18px] text-neutral-400" />
        <EllipsisVertical className="w-[18px] h-[18px] text-neutral-400" />
      </div>
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end px-4 py-3">
      <div className="max-w-[80%] bg-neutral-100 rounded-[20px] px-4 py-2.5">
        <p className="text-[14px] text-neutral-900 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function ChatGPTInputBar() {
  return (
    <div className="px-3 py-3 border-t border-neutral-100">
      <div className="flex items-center gap-2 bg-neutral-100 rounded-full px-4 py-2.5">
        <Plus className="w-5 h-5 text-neutral-400 shrink-0" />
        <span className="flex-1 text-[14px] text-neutral-400">
          Ask anything
        </span>
        <Mic className="w-5 h-5 text-neutral-400 shrink-0" />
        <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center shrink-0">
          <AudioLines className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function BeforeAfter() {
  const [mode, setMode] = useState<Mode>("without");
  const [phase, setPhase] = useState<"idle" | "thinking" | "streaming" | "done">("idle");
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const tokens = mode === "without" ? WITHOUT_TOKENS : WITH_TOKENS;
  const tokensKey = tokens.map((token) => token.text).join("|");

  // Start animation when section enters viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true);
          setPhase("thinking");
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasBeenVisible]);

  // Thinking → streaming transition
  useEffect(() => {
    if (phase !== "thinking") return;
    const timer = setTimeout(() => setPhase("streaming"), THINKING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleToggle = useCallback(
    (next: Mode) => {
      if (next === mode) return;
      setMode(next);
      setPhase("thinking");
    },
    [mode]
  );

  const handleStreamComplete = useCallback(() => {
    setPhase("done");
  }, []);

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden"
    >
      <div className="relative max-w-[1200px] mx-auto px-6 lg:px-12">
        {/* Section header */}
        <motion.div
          className="mb-14 lg:mb-16"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <p className="overline text-brand-accent mb-3">
            The difference
          </p>
          <h2 className="text-3xl lg:text-4xl font-medium text-neutral-950 max-w-2xl" style={{ letterSpacing: "-0.03em" }}>
            What candidates see when they ask AI about you
          </h2>
          <p className="text-neutral-400 mt-3 max-w-xl">
            A candidate asks ChatGPT about working at your company.
            Here&apos;s what changes when Rankwell is active.
          </p>
        </motion.div>

        {/* Toggle tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => handleToggle("without")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200",
              mode === "without"
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-neutral-50 text-neutral-400 border border-neutral-200 hover:text-neutral-600"
            )}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                mode === "without" ? "bg-red-500" : "bg-neutral-300"
              )}
            />
            Without Rankwell
          </button>
          <button
            onClick={() => handleToggle("with")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200",
              mode === "with"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-neutral-50 text-neutral-400 border border-neutral-200 hover:text-neutral-600"
            )}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                mode === "with" ? "bg-emerald-500" : "bg-neutral-300"
              )}
            />
            With Rankwell
          </button>
        </div>

        {/* ChatGPT interface — single panel */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div
            className={cn(
              "rounded-2xl bg-white overflow-hidden transition-all duration-500",
              mode === "with"
                ? "border border-emerald-200"
                : "border border-neutral-200"
            )}
          >
            <ChatGPTHeader />
            <UserMessage text={USER_QUESTION} />

            {/* Response area */}
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <div key="idle" className="h-10" />
              )}
              {phase === "thinking" && (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ThinkingDots />
                </motion.div>
              )}
              {(phase === "streaming" || phase === "done") && (
                <motion.div
                  key={`stream-${mode}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <StreamingResponse
                    key={tokensKey}
                    tokens={tokens}
                    onComplete={handleStreamComplete}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <ChatGPTInputBar />
          </div>
        </motion.div>

        {/* Hint text after streaming completes */}
        <AnimatePresence>
          {phase === "done" && mode === "without" && (
            <motion.p
              className="text-center text-sm text-neutral-500 mt-6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              Now tap{" "}
              <button
                onClick={() => handleToggle("with")}
                className="text-emerald-600 font-semibold hover:underline"
              >
                With Rankwell
              </button>{" "}
              to see the difference →
            </motion.p>
          )}
          {phase === "done" && mode === "with" && (
            <motion.p
              className="text-center text-sm text-emerald-600/70 mt-6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              Verified data. Correct salary. Your story — told by AI. ✓
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
