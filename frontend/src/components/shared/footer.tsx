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
    <footer className="border-t border-slate-200 bg-slate-900">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12 py-12 pb-28 sm:pb-12 lg:pb-16 text-sm">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Left */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="font-bold text-white text-lg tracking-tight">
              OpenRole
            </Link>
            <span className="text-slate-400 max-w-xs leading-relaxed">
              Verified employer data for the AI age. Control what AI tells candidates about your company.
            </span>
          </div>

          {/* Right — nav links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-slate-400">
            <Link
              href="/how-we-score"
              className="hover:text-white transition-colors duration-200"
            >
              How we score
            </Link>
            <Link
              href="/pricing"
              className="hover:text-white transition-colors duration-200"
            >
              Pricing
            </Link>
            <Link
              href="/security"
              className="hover:text-white transition-colors duration-200"
            >
              Security
            </Link>
            <Link
              href="/privacy"
              className="hover:text-white transition-colors duration-200"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-white transition-colors duration-200"
            >
              Terms
            </Link>
            <Link
              href="/dpa"
              className="hover:text-white transition-colors duration-200"
            >
              DPA
            </Link>
            <a
              href="mailto:hello@openrole.co.uk"
              className="hover:text-white transition-colors duration-200"
            >
              Contact
            </a>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-slate-700 text-slate-500 text-xs">
          © 2026 OpenRole. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
