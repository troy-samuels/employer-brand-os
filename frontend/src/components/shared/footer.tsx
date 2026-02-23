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
              Inject machine-readable employer data. AI cites your facts, not rumours.
            </span>
          </div>

          {/* Right — nav columns */}
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            {/* Product */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Product</p>
              <nav className="flex flex-col gap-2 text-slate-400">
                <Link href="/#audit" className="hover:text-white transition-colors duration-200">Free Audit</Link>
                <Link href="/sample-report" className="hover:text-white transition-colors duration-200">Sample Report</Link>
                <Link href="/uk-index" className="hover:text-white transition-colors duration-200">UK Index</Link>
                <Link href="/roi-calculator" className="hover:text-white transition-colors duration-200">ROI Calculator</Link>
                <Link href="/pricing" className="hover:text-white transition-colors duration-200">Pricing</Link>
              </nav>
            </div>

            {/* Resources */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Resources</p>
              <nav className="flex flex-col gap-2 text-slate-400">
                <Link href="/blog" className="hover:text-white transition-colors duration-200">Blog</Link>
                <Link href="/how-we-score" className="hover:text-white transition-colors duration-200">How We Score</Link>
                <Link href="/faq" className="hover:text-white transition-colors duration-200">FAQ</Link>
                <a href="mailto:hello@openrole.co.uk" className="hover:text-white transition-colors duration-200">Contact</a>
              </nav>
            </div>

            {/* Legal */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Legal</p>
              <nav className="flex flex-col gap-2 text-slate-400">
                <Link href="/security" className="hover:text-white transition-colors duration-200">Security</Link>
                <Link href="/privacy" className="hover:text-white transition-colors duration-200">Privacy</Link>
                <Link href="/terms" className="hover:text-white transition-colors duration-200">Terms</Link>
                <Link href="/dpa" className="hover:text-white transition-colors duration-200">DPA</Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-slate-700 text-slate-500 text-xs">
          © 2026 OpenRole. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
