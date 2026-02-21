/**
 * @module app/privacy/page
 * Module implementation for page.tsx.
 */

import type { Metadata } from 'next';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';

/**
 * Exposes exported value(s): metadata.
 */
export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How OpenRole collects, uses, and protects your data. GDPR and UK DPA 2018 compliant.',
  openGraph: {
    title: 'Privacy Policy | OpenRole',
    description:
      'How OpenRole collects, uses, and protects your data. GDPR and UK DPA 2018 compliant.',
    url: 'https://openrole.co.uk/privacy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | OpenRole',
    description:
      'How OpenRole collects, uses, and protects your data. GDPR and UK DPA 2018 compliant.',
  },
  alternates: {
    canonical: 'https://openrole.co.uk/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Executes PrivacyPage.
 * @returns The resulting value.
 */
export default function PrivacyPage() {
  const lastUpdated = '9 February 2026';

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <p className="overline mb-4">Legal</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-slate-500">
          Last updated: {lastUpdated}
        </p>

        <div className="mt-14 space-y-10 text-neutral-700 leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              1. Who we are
            </h2>
            <p>
              OpenRole (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;)
              operates the website openrole.co.uk and provides employer brand audit
              and optimisation services. We are the data controller for the
              personal data described in this policy.
            </p>
            <p className="mt-2">
              Contact:{' '}
              <a
                href="mailto:privacy@openrole.co.uk"
                className="text-teal-700 underline underline-offset-2"
              >
                privacy@openrole.co.uk
              </a>
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              2. Data we collect
            </h2>

            <h3 className="font-medium text-slate-900 mt-4 mb-2">
              2.1 When you run an audit
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Company name and website URL</li>
              <li>Work email address</li>
              <li>IP address (for rate limiting only, not stored long-term)</li>
              <li>
                Publicly available employer data scraped from your website and
                job listings
              </li>
            </ul>

            <h3 className="font-medium text-slate-900 mt-4 mb-2">
              2.2 When you install the pixel
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                API key identifier (hashed — we never store the full key)
              </li>
              <li>Domain where the pixel is installed</li>
              <li>
                Pixel load events (timestamp, page URL — no visitor data)
              </li>
            </ul>
            <p className="mt-2 text-sm">
              <strong>The pixel does not collect any visitor data.</strong> It
              does not set cookies, track users, or collect personally
              identifiable information from your website visitors.
            </p>

            <h3 className="font-medium text-slate-900 mt-4 mb-2">
              2.3 When you visit our website
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Basic server logs (IP address, user agent, pages visited) —
                retained for 30 days
              </li>
              <li>
                No third-party analytics, no advertising trackers, no cookies
                for marketing
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              3. How we use your data
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To generate and deliver your employer brand audit report</li>
              <li>
                To provide the OpenRole pixel service and AI visibility metrics
              </li>
              <li>To communicate with you about your account and audit results</li>
              <li>To detect and prevent abuse, fraud, and security incidents</li>
              <li>
                To improve our scoring methodology and service quality
                (aggregated, anonymised data only)
              </li>
            </ul>
            <p className="mt-2">
              We do <strong>not</strong> sell your data. We do{' '}
              <strong>not</strong> share it with third parties for marketing
              purposes. We do <strong>not</strong> use it to build advertising
              profiles.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              4. Legal basis for processing
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Contract performance:</strong> Processing your audit
                request and delivering results
              </li>
              <li>
                <strong>Legitimate interest:</strong> Security monitoring, fraud
                prevention, service improvement
              </li>
              <li>
                <strong>Consent:</strong> Marketing communications (opt-in only,
                easy unsubscribe)
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              5. Data retention
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Audit results:</strong> 12 months from date of audit
              </li>
              <li>
                <strong>Account data:</strong> Until you request deletion
              </li>
              <li>
                <strong>Pixel analytics:</strong> 90-day rolling window
              </li>
              <li>
                <strong>API &amp; security logs:</strong> 30 days
              </li>
              <li>
                <strong>Rate limiting data:</strong> Session only (not persisted)
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              6. Where your data is stored
            </h2>
            <p>
              All data is stored in the European Union (London region) on
              Supabase infrastructure. Our application is served globally via
              Vercel&apos;s edge network, but data at rest remains within the EU.
            </p>
            <p className="mt-2">
              Both Supabase and Vercel maintain SOC 2 Type II certification and
              GDPR compliance. See our{' '}
              <a
                href="/security"
                className="text-teal-700 underline underline-offset-2"
              >
                Security page
              </a>{' '}
              for details.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              7. Your rights
            </h2>
            <p>Under GDPR and the UK DPA 2018, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                <strong>Access</strong> — request a copy of the personal data we
                hold about you
              </li>
              <li>
                <strong>Rectification</strong> — correct any inaccurate data
              </li>
              <li>
                <strong>Erasure</strong> — request deletion of your data
                (&ldquo;right to be forgotten&rdquo;)
              </li>
              <li>
                <strong>Portability</strong> — receive your data in a structured,
                machine-readable format
              </li>
              <li>
                <strong>Restriction</strong> — limit how we process your data
              </li>
              <li>
                <strong>Objection</strong> — object to processing based on
                legitimate interest
              </li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, email{' '}
              <a
                href="mailto:privacy@openrole.co.uk"
                className="text-teal-700 underline underline-offset-2"
              >
                privacy@openrole.co.uk
              </a>
              . We respond within 30 days. Deletion requests are processed
              within 48 hours.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              8. Sub-processors
            </h2>
            <p>We use the following sub-processors:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                <strong>Supabase Inc.</strong> — database hosting and
                authentication (EU region)
              </li>
              <li>
                <strong>Vercel Inc.</strong> — application hosting and edge
                delivery
              </li>
            </ul>
            <p className="mt-2">
              We will notify existing customers at least 30 days before adding
              new sub-processors. A Data Processing Agreement (DPA) is available
              on request.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              9. Cookies
            </h2>
            <p>
              OpenRole uses only strictly necessary cookies for session
              management. We do not use tracking cookies, analytics cookies, or
              advertising cookies. No cookie banner is required because we do not
              use optional cookies.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              10. Children&apos;s data
            </h2>
            <p>
              OpenRole is a business-to-business service. We do not knowingly
              collect personal data from anyone under 18. If you believe a minor
              has submitted data to us, contact{' '}
              <a
                href="mailto:privacy@openrole.co.uk"
                className="text-teal-700 underline underline-offset-2"
              >
                privacy@openrole.co.uk
              </a>{' '}
              and we will delete it promptly.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              11. Changes to this policy
            </h2>
            <p>
              We may update this policy from time to time. Material changes will
              be communicated via email to registered users at least 14 days
              before taking effect. The &ldquo;last updated&rdquo; date at the
              top of this page will always reflect the current version.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              12. Contact &amp; complaints
            </h2>
            <p>
              For any privacy-related questions or concerns, contact us at{' '}
              <a
                href="mailto:privacy@openrole.co.uk"
                className="text-teal-700 underline underline-offset-2"
              >
                privacy@openrole.co.uk
              </a>
              .
            </p>
            <p className="mt-2">
              If you are not satisfied with our response, you have the right to
              lodge a complaint with the Information Commissioner&apos;s Office
              (ICO) at{' '}
              <a
                href="https://ico.org.uk/make-a-complaint/"
                className="text-teal-700 underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                ico.org.uk
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
