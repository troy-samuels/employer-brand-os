/**
 * @module components/landing/monitor-preview
 * Monday report with 3D tilt card and glassmorphism.
 */

"use client";

import { useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { TrendingUp } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Sparkline                                                           */
/* ------------------------------------------------------------------ */

const TREND = [41, 48, 52, 55, 58, 64, 72];

function Sparkline() {
  const max = Math.max(...TREND);
  const min = Math.min(...TREND);
  const range = max - min || 1;
  const h = 32;
  const w = 100;

  const points = TREND.map((v, i) => {
    const x = (i / (TREND.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-24" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-brand-accent"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 3D Tilt Card                                                        */
/* ------------------------------------------------------------------ */

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 20,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      x.set((e.clientX - rect.left) / rect.width - 0.5);
      y.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="[perspective:800px]"
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function MonitorPreview() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-[1000px] px-6 lg:px-12">
        <div className="grid gap-12 lg:gap-20 lg:grid-cols-2 items-center">
          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <h2
              className="text-3xl lg:text-4xl font-medium text-neutral-950 mb-4"
              style={{ letterSpacing: "-0.03em" }}
            >
              Know where you stand.
              <br />
              Every Monday.
            </h2>
            <p className="text-neutral-400 leading-relaxed max-w-sm">
              A weekly email with your AI reputation score, what changed,
              and exactly what to fix next.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              {[
                { src: "/logos/chatgpt-mono.svg", name: "ChatGPT" },
                { src: "/logos/perplexity-mono.svg", name: "Perplexity" },
                { src: "/logos/claude-mono.svg", name: "Claude" },
                { src: "/logos/gemini-mono.svg", name: "Gemini" },
              ].map((model) => (
                <div key={model.name} className="flex items-center gap-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={model.src}
                    alt={model.name}
                    className="h-4 w-4 text-neutral-400"
                    style={{ opacity: 0.45 }}
                  />
                  <span className="text-xs text-neutral-400">{model.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — 3D tilt score card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          >
            <TiltCard>
              <div className="rounded-2xl bg-neutral-900/90 backdrop-blur-xl border border-white/10 p-8 lg:p-10 shadow-2xl shadow-black/20">
                {/* Email meta */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="h-2 w-2 rounded-full bg-brand-accent" />
                  <span className="text-xs text-neutral-500 font-medium">
                    OpenRole · Monday 9:00 AM
                  </span>
                </div>

                {/* Score */}
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-5xl font-medium text-white tabular-nums" style={{ letterSpacing: "-0.03em" }}>
                      72
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-400">+8</span>
                      <span className="text-xs text-neutral-500">from last week</span>
                    </div>
                  </div>
                  <Sparkline />
                </div>

                {/* Key changes */}
                <div className="space-y-3 border-t border-white/10 pt-5">
                  {[
                    { dot: "bg-emerald-400", text: "Salary corrected to £75-95K" },
                    { dot: "bg-emerald-400", text: "Benefits now cited by AI" },
                    { dot: "bg-neutral-600", text: "Remote policy still unclear" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2.5">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${item.dot}`} />
                      <span className="text-sm text-neutral-400">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
