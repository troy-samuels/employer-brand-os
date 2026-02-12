/**
 * @module components/landing/cta
 * Floating dock CTA — fixed pill at bottom of viewport.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past the hero (400px)
      setVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <Link
            href="/#audit"
            className="flex items-center gap-3 rounded-full bg-neutral-950/90 backdrop-blur-2xl border border-white/10 px-6 py-3 shadow-2xl shadow-black/30 hover:bg-neutral-950 transition-colors duration-200"
          >
            <span className="text-sm text-neutral-300">
              See what AI says about your company
            </span>
            <span className="rounded-full bg-brand-accent px-4 py-1.5 text-xs font-semibold text-white">
              Free audit
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
