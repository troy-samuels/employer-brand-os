/**
 * @module components/shared/header
 * Module implementation for header.tsx.
 */

import Link from "next/link";

/**
 * Executes Header.
 * @returns The resulting value.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 lg:px-12 py-4">
        <Link href="/" className="text-lg font-bold text-neutral-950 tracking-tight">
          Rankwell
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/how-we-score"
            className="text-neutral-500 hover:text-neutral-950 transition-colors"
          >
            How we score
          </Link>
          <Link
            href="/security"
            className="text-neutral-500 hover:text-neutral-950 transition-colors"
          >
            Security
          </Link>
          <Link
            href="/#audit"
            className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
          >
            Free audit
          </Link>
        </nav>
      </div>
    </header>
  );
}
