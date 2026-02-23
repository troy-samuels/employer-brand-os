/**
 * @module components/landing/prompt-intelligence
 * Mock AI chat idle screen styled after Claude — prompts cycle
 * through the input bar as if a candidate is typing questions.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, Mic, AudioLines } from "lucide-react";
import Image from "next/image";

const PROMPTS = [
  "What's the salary for engineers at Stripe?",
  "What's it like to work at Stripe?",
  "What benefits does Stripe offer in London?",
  "Does Stripe allow remote work?",
  "What's the interview process at Stripe?",
  "Is there career growth at Stripe?",
  "What do employees say about Stripe?",
  "Stripe vs Revolut — who pays better?",
];

const TYPE_SPEED = 45;
const ERASE_SPEED = 20;
const PAUSE_AFTER_TYPE = 2200;
const PAUSE_AFTER_ERASE = 400;

export default function PromptIntelligence() {
  const reducedMotion = useReducedMotion();
  const [displayed, setDisplayed] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const indexRef = useRef(0);
  const charRef = useRef(0);
  const phaseRef = useRef<"typing" | "pausing" | "erasing" | "waiting">("typing");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const tick = () => {
      const prompt = PROMPTS[indexRef.current] ?? "";

      if (phaseRef.current === "typing") {
        if (charRef.current < prompt.length) {
          charRef.current += 1;
          setDisplayed(prompt.slice(0, charRef.current));
          setIsTyping(true);
          timerRef.current = setTimeout(tick, TYPE_SPEED + Math.random() * 30);
        } else {
          phaseRef.current = "pausing";
          setIsTyping(false);
          timerRef.current = setTimeout(tick, PAUSE_AFTER_TYPE);
        }
      } else if (phaseRef.current === "pausing") {
        phaseRef.current = "erasing";
        setIsTyping(true);
        timerRef.current = setTimeout(tick, ERASE_SPEED);
      } else if (phaseRef.current === "erasing") {
        if (charRef.current > 0) {
          charRef.current -= 1;
          setDisplayed(prompt.slice(0, charRef.current));
          timerRef.current = setTimeout(tick, ERASE_SPEED);
        } else {
          phaseRef.current = "waiting";
          setIsTyping(false);
          timerRef.current = setTimeout(tick, PAUSE_AFTER_ERASE);
        }
      } else if (phaseRef.current === "waiting") {
        indexRef.current = (indexRef.current + 1) % PROMPTS.length;
        charRef.current = 0;
        phaseRef.current = "typing";
        setIsTyping(true);
        timerRef.current = setTimeout(tick, TYPE_SPEED);
      }
    };

    timerRef.current = setTimeout(tick, 800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [reducedMotion]);

  const visiblePrompt = reducedMotion ? (PROMPTS[0] ?? "") : displayed;
  const isActivelyTyping = reducedMotion ? false : isTyping;
  const showCursor = isActivelyTyping || (!isActivelyTyping && visiblePrompt.length > 0);

  return (
    <section className="py-20 lg:py-24 bg-neutral-50/40">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <motion.h2
          className="text-2xl lg:text-3xl font-medium text-neutral-950 text-center mb-3"
          style={{ letterSpacing: "-0.03em" }}
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >

          Every candidate. Every question. Every AI model.
        </motion.h2>
        <motion.p
          className="text-sm text-neutral-400 text-center mb-12"
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ delay: 0.1 }}
        >
          These are the real prompts used to research employers millions of times a week. Do you know how AI answers them about you?
        </motion.p>

        {/* Mock AI chat — Claude style */}
        <motion.div
          className="mx-auto max-w-md"
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="rounded-2xl border border-neutral-200 bg-[#FAF9F7] overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex flex-col gap-[3px] w-5 h-5 justify-center">
                <span className="w-4 h-[1.5px] bg-neutral-400 rounded-full" />
                <span className="w-3 h-[1.5px] bg-neutral-400 rounded-full" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <span className="text-[14px] font-semibold text-neutral-900">Opus 4.6</span>
                    <svg width="10" height="6" viewBox="0 0 10 6" className="text-neutral-400 mt-0.5">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                  <span className="text-[11px] text-neutral-400">Extended</span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full border-[1.5px] border-neutral-300 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-neutral-700">
                  <path d="M12 2C7.58 2 4 5.58 4 10v10l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2V10c0-4.42-3.58-8-8-8z" stroke="currentColor" strokeWidth="1.6" fill="none" />
                  <circle cx="9" cy="10.5" r="1.25" fill="currentColor" />
                  <circle cx="15" cy="10.5" r="1.25" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Chat body — idle greeting */}
            <div className="flex flex-col items-center justify-center px-6 pt-10 pb-10">
              <Image
                src="/logos/claude-starburst.svg"
                alt=""
                width={44}
                height={44}
                className="opacity-90"
              />
              <h3
                className="mt-5 text-[22px] font-normal text-neutral-900 text-center leading-tight"
                style={{ letterSpacing: "-0.02em", fontFamily: 'Georgia, "Times New Roman", Times, serif' }}
              >
                How can I help you
                <br />
                today?
              </h3>
            </div>

            {/* Input bar */}
            <div className="px-4 pb-4">
              <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                <div className="min-h-[1.5rem] text-[15px] text-neutral-900 mb-3">
                  {visiblePrompt}
                  {showCursor && (
                    <motion.span
                      className="inline-block w-[2px] h-[17px] bg-neutral-900 ml-0.5 align-middle"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                  {!visiblePrompt && !isActivelyTyping && (
                    <span className="text-neutral-400">Ask about any employer...</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Plus className="w-5 h-5 text-neutral-400" />
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-neutral-400" />
                    <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center">
                      <AudioLines className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
