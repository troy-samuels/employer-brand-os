/**
 * @module components/shared/footer
 * Module implementation for footer.tsx.
 */

import Link from "next/link";

/**
 * Executes Footer.
 * @returns The resulting value.
 */
export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12 py-8 text-sm text-neutral-500">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Left */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Link href="/" className="font-semibold text-neutral-950">
                Rankwell
              </Link>
              <span>© 2026</span>
            </div>
            <span>Verified employer data for the AI age</span>
          </div>

          {/* Right — nav links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/how-we-score"
              className="hover:text-neutral-950 transition-colors"
            >
              How we score
            </Link>
            <Link
              href="/pricing"
              className="hover:text-neutral-950 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/security"
              className="hover:text-neutral-950 transition-colors"
            >
              Security
            </Link>
            <Link
              href="/privacy"
              className="hover:text-neutral-950 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-neutral-950 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/dpa"
              className="hover:text-neutral-950 transition-colors"
            >
              DPA
            </Link>
            <a
              href="mailto:hello@rankwell.io"
              className="hover:text-neutral-950 transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
