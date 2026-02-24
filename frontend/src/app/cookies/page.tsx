/**
 * @module app/cookies/page
 * Cookie policy page — UK PECR compliant.
 */

import type { Metadata } from 'next';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';

/**
 * Exposes exported value(s): metadata.
 */
export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'How OpenRole uses cookies. We only use essential authentication cookies — no tracking or analytics.',
  openGraph: {
    title: 'Cookie Policy | OpenRole',
    description:
      'How OpenRole uses cookies. We only use essential authentication cookies — no tracking or analytics.',
    url: 'https://openrole.co.uk/cookies',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Policy | OpenRole',
    description:
      'How OpenRole uses cookies. We only use essential authentication cookies — no tracking or analytics.',
  },
  alternates: {
    canonical: 'https://openrole.co.uk/cookies',
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Executes CookiesPage.
 * @returns The resulting value.
 */
export default function CookiesPage() {
  const lastUpdated = '9 February 2026';

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
          <p className="overline mb-4">Legal</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Cookie Policy
          </h1>
          <p className="mt-4 text-sm text-slate-500">Last updated: {lastUpdated}</p>

          <div className="mt-14 space-y-10 text-neutral-700 leading-relaxed">
            {/* 1 */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                1. What are cookies?
              </h2>
              <p>
                Cookies are small text files stored on your device by websites you visit. They
                help websites remember your preferences and provide essential functionality like
                keeping you signed in.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                2. How OpenRole uses cookies
              </h2>
              <p>
                OpenRole uses <strong>strictly necessary cookies only</strong>. We do not use
                cookies for analytics, advertising, or tracking. The cookies we use are essential
                for the service to function — specifically, to keep you signed in securely.
              </p>
              <p className="mt-4">
                Under UK PECR regulations, strictly necessary cookies do not require consent
                because they are essential for the service you&apos;ve requested.
              </p>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                3. Cookies we use
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">
                        Cookie Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">
                        Purpose
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">
                        Duration
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-700">
                        sb-*-auth-token
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">
                        Maintains your authentication session with Supabase
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">7 days</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">Essential</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-700">
                        sb-*-auth-token-code-verifier
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">
                        Secures the OAuth authentication flow (PKCE)
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">Session</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">Essential</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-700">
                        cookie-consent
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">
                        Records your acceptance of this cookie policy
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">1 year</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">Essential</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-6 text-sm text-neutral-600">
                <strong>Note:</strong> The <code className="font-mono text-xs">sb-*</code> prefix
                varies based on your Supabase project ID. These cookies are set by Supabase (our
                authentication provider) and are hosted in the EU.
              </p>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                4. Third-party cookies
              </h2>
              <p>
                OpenRole does <strong>not</strong> use third-party cookies. We do not integrate
                Google Analytics, Facebook Pixel, advertising networks, or any other tracking
                services. Your browsing activity on OpenRole is private.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                5. Managing cookies
              </h2>
              <p>
                Because we only use essential cookies, disabling them will prevent you from using
                core features of OpenRole (like staying signed in). However, you can manage or
                delete cookies through your browser settings:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    className="text-teal-700 underline underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chrome
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                    className="text-teal-700 underline underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Firefox
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac"
                    className="text-teal-700 underline underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Safari
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    className="text-teal-700 underline underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Edge
                  </a>
                </li>
              </ul>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                6. Changes to this policy
              </h2>
              <p>
                If we introduce optional (non-essential) cookies in the future, we will update
                this policy and seek your consent before setting them. Material changes will be
                communicated via email to registered users.
              </p>
            </section>

            {/* 7 */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Contact</h2>
              <p>
                Questions about our use of cookies? Contact us at{' '}
                <a
                  href="mailto:privacy@openrole.co.uk"
                  className="text-teal-700 underline underline-offset-2"
                >
                  privacy@openrole.co.uk
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
