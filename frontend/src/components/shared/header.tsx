/**
 * @module components/shared/header
 * Site header with mobile hamburger menu.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/index", label: "Index" },
  { href: "/blog", label: "Blog" },
  { href: "/how-we-score", label: "How we score" },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 lg:px-12 py-3.5">
        <Link href="/" className="text-lg font-bold text-neutral-950 tracking-tight">
          Rankwell
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-neutral-500 hover:text-neutral-950 transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#audit"
            className="rounded-full bg-neutral-950 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 transition-all duration-200 hover:shadow-lg hover:shadow-neutral-950/10"
          >
            Free audit
          </Link>
        </nav>

        {/* Mobile hamburger button */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors duration-200"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-neutral-200/80 bg-white/95 backdrop-blur-xl px-6 pb-6 pt-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#audit"
            onClick={() => setMobileOpen(false)}
            className="block rounded-full bg-neutral-950 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-neutral-800 transition-all duration-200 mt-3"
          >
            Free audit
          </Link>
        </nav>
      )}
    </header>
  );
}
