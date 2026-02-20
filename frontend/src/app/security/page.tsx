/**
 * @module app/security/page
 * Module implementation for page.tsx.
 */

import type { Metadata } from 'next';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';

/**
 * Exposes exported value(s): metadata.
 */
export const metadata: Metadata = {
  title: 'Security',
  description:
    'How Rankwell protects your data. Infrastructure, encryption, compliance, and our commitment to enterprise-grade security.',
  openGraph: {
    title: 'Security | Rankwell',
    description:
      'How Rankwell protects your data. Infrastructure, encryption, compliance, and our commitment to enterprise-grade security.',
    url: 'https://rankwell.io/security',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Security | Rankwell',
    description:
      'How Rankwell protects your data. Infrastructure, encryption, compliance, and our commitment to enterprise-grade security.',
  },
  alternates: {
    canonical: 'https://rankwell.io/security',
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Executes SecurityPage.
 * @returns The resulting value.
 */
export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
      {/* Header */}
      <section className="border-b border-slate-200 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--neutral-200)_1px,_transparent_0)] [background-size:32px_32px] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-6 py-20 sm:py-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
              <svg
                className="h-5 w-5 text-teal-700"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-teal-700 tracking-wide uppercase">
              Trust Centre
            </p>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Security at Rankwell
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-500 max-w-2xl">
            You&apos;re trusting us with your employer brand data. We take that
            seriously. Here&apos;s exactly how we protect it.
          </p>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="border-b border-neutral-100 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Infrastructure
          </h2>
          <p className="text-slate-600 mb-8">
            Built on providers with independently verified security
            certifications.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-1">Vercel</h3>
              <p className="text-sm text-slate-500 mb-3">
                Application hosting &amp; edge network
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">✓</span>
                  SOC 2 Type II certified
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">✓</span>
                  ISO 27001 certified
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">✓</span>
                  GDPR compliant
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">✓</span>
                  Automatic DDoS protection
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-1">Supabase</h3>
              <p className="text-sm text-slate-500 mb-3">
                Database &amp; authentication
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">✓</span>
                  SOC 2 Type II certified
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">✓</span>
                  HIPAA available
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">✓</span>
                  EU data residency (London region)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">✓</span>
                  Row Level Security enforced
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Encryption */}
      <section className="border-b border-neutral-100 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Encryption
          </h2>
          <p className="text-slate-600 mb-8">
            Your data is encrypted everywhere — in transit and at rest.
          </p>

          <div className="space-y-4">
            {[
              {
                title: 'In transit',
                desc: 'All connections use TLS 1.3. We enforce HSTS with a one-year max-age across all subdomains.',
              },
              {
                title: 'At rest',
                desc: 'Database encrypted with AES-256. Backups encrypted with separate keys. Point-in-time recovery enabled.',
              },
              {
                title: 'API keys',
                desc: 'Hashed with bcrypt before storage. Only the key prefix is stored in plaintext for identification. Keys are never logged or exposed in responses.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-lg bg-slate-50 p-5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100">
                  <svg
                    className="h-4 w-4 text-teal-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Pixel */}
      <section className="border-b border-neutral-100 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            The Rankwell Pixel
          </h2>
          <p className="text-slate-600 mb-8">
            When you add our pixel to your careers page, here&apos;s exactly
            what it does — and what it doesn&apos;t.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-6">
              <h3 className="font-semibold text-teal-900 mb-4">
                What the pixel does
              </h3>
              <ul className="space-y-3 text-sm text-teal-700">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  Serves structured employer data (JSON-LD) to AI crawlers
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  Communicates only with Rankwell API endpoints
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  Includes Subresource Integrity (SRI) hash for tamper detection
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  Loads asynchronously — zero impact on page performance
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  Source code is fully inspectable
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/50 p-6">
              <h3 className="font-semibold text-red-900 mb-4">
                What the pixel never does
              </h3>
              <ul className="space-y-3 text-sm text-red-800">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✗</span>
                  Sets cookies or uses local storage
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✗</span>
                  Tracks visitors or collects personal data
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✗</span>
                  Makes requests to third-party domains
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✗</span>
                  Modifies your page content or DOM
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✗</span>
                  Loads external dependencies
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-slate-50 border border-slate-200 p-5">
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">Verify it yourself.</strong>{' '}
              Every version of the pixel includes an SRI hash. You can verify the
              script hasn&apos;t been modified by checking the integrity attribute
              in your embed code against our{' '}
              <a
                href="/api/pixel/v1/integrity"
                className="text-teal-700 underline underline-offset-2"
              >
                integrity endpoint
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Access Control */}
      <section className="border-b border-neutral-100 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Access Control
          </h2>
          <p className="text-slate-600 mb-8">
            Strict boundaries on who can access what.
          </p>

          <div className="space-y-4">
            {[
              {
                title: 'Row Level Security',
                desc: 'Every database query is filtered at the database level. API key holders can only access their own company data. No application-level bypass possible.',
              },
              {
                title: 'API key management',
                desc: 'Keys support rotation with a 24-hour grace period. Old keys expire automatically. Key usage is logged for audit trails.',
              },
              {
                title: 'Request signing',
                desc: 'Pixel-to-API communication uses HMAC-SHA256 request signing with timestamp validation, preventing replay attacks and request tampering.',
              },
              {
                title: 'Rate limiting',
                desc: 'All API endpoints enforce per-IP rate limits. Audit endpoints have stricter limits to prevent abuse. Exceeding limits returns 429 with Retry-After headers.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-lg bg-slate-50 p-5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200">
                  <svg
                    className="h-4 w-4 text-neutral-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="border-b border-neutral-100 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Compliance
          </h2>
          <p className="text-slate-600 mb-8">
            Meeting the standards your legal and procurement teams require.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-6 text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                GDPR
              </div>
              <p className="text-sm text-slate-500">
                EU data protection compliant. Data Processing Agreement
                available on request.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-6 text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                SOC 2
              </div>
              <p className="text-sm text-slate-500">
                Built on SOC 2 Type II certified infrastructure. Own
                certification in progress.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-6 text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                UK DPA
              </div>
              <p className="text-sm text-slate-500">
                UK Data Protection Act 2018 compliant. EU-adequate data handling
                standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Handling */}
      <section className="border-b border-neutral-100 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Data Handling
          </h2>
          <p className="text-slate-600 mb-8">
            Clear rules on what we collect, where it lives, and how long we keep
            it.
          </p>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left font-medium text-slate-900">
                    Data type
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-slate-900">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-slate-900">
                    Retention
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="px-6 py-3 text-slate-900">
                    Company name &amp; domain
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    Audit identification
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    While account active
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-slate-900">
                    Audit results &amp; scores
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    Report generation
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    12 months from audit
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-slate-900">
                    Work email address
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    Audit delivery &amp; account
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    Until deletion requested
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-slate-900">
                    Pixel analytics
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    AI visibility metrics
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    90-day rolling window
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-slate-900">API logs</td>
                  <td className="px-6 py-3 text-slate-600">
                    Security &amp; debugging
                  </td>
                  <td className="px-6 py-3 text-slate-600">30 days</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            We never sell your data. We never share it with third parties for
            marketing. Full deletion available within 48 hours of request.
          </p>
        </div>
      </section>

      {/* Responsible Disclosure */}
      <section className="border-b border-neutral-100 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Responsible Disclosure
          </h2>
          <p className="text-slate-600 mb-6">
            Found a security issue? We want to hear about it.
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-neutral-700 leading-relaxed">
              Email{' '}
              <a
                href="mailto:security@rankwell.io"
                className="font-medium text-teal-700 underline underline-offset-2"
              >
                security@rankwell.io
              </a>{' '}
              with details of the vulnerability. We commit to acknowledging
              reports within 24 hours, providing an initial assessment within 72
              hours, and keeping you informed of our remediation progress. We
              will not take legal action against researchers acting in good
              faith.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-3">
            Questions about security?
          </h2>
          <p className="text-slate-600 mb-6">
            We&apos;re happy to discuss our security practices, provide
            additional documentation, or arrange a call with our team.
          </p>
          <a
            href="mailto:hello@rankwell.io"
            className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-6 py-3 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
          >
            Get in touch
          </a>
        </div>
      </section>
    </main>
    <Footer />
    </div>
  );
}
