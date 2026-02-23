/**
 * @module components/landing/cta
 * Floating dock CTA — fixed pill at bottom of viewport.
 * Hides when interactive sections (testimonials/before-after) are in view
 * to avoid overlapping the chat demo.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let sectionInView = false;

    // Track the testimonials section so we can hide the CTA when it overlaps
    const testimonialsEl = document.getElementById("testimonials");
    let sectionObserver: IntersectionObserver | null = null;

    if (testimonialsEl) {
      sectionObserver = new IntersectionObserver(
        ([entry]) => {
          sectionInView = entry.isIntersecting;
          // Re-evaluate visibility
          setVisible(window.scrollY > 400 && !sectionInView);
        },
        { threshold: 0.05 }
      );
      sectionObserver.observe(testimonialsEl);
    }

    const handleScroll = () => {
      setVisible(window.scrollY > 400 && !sectionInView);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      sectionObserver?.disconnect();
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="fixed left-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:w-auto"
        >
          <Link
            href="/#audit"
            className="flex w-full flex-col items-center gap-3 rounded-2xl bg-neutral-950/90 backdrop-blur-2xl border border-white/10 px-4 py-3 text-center shadow-2xl shadow-black/30 transition-colors duration-200 hover:bg-neutral-950 sm:w-auto sm:flex-row sm:rounded-full sm:px-6 sm:text-left"
          >
            <span className="text-sm text-neutral-300 leading-snug">
              Run your free employer brand audit
            </span>
            <span className="w-full rounded-full bg-brand-accent px-4 py-1.5 text-xs font-semibold text-white sm:w-auto">
              Get your score
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
