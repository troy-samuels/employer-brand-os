/**
 * @module app/dpa/page
 * Module implementation for page.tsx.
 */

import type { Metadata } from 'next';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';

/**
 * Exposes exported value(s): metadata.
 */
export const metadata: Metadata = {
  title: 'Data Processing Agreement',
  description:
    'Standard Data Processing Agreement for Rankwell enterprise customers. GDPR Article 28 compliant.',
  openGraph: {
    title: 'Data Processing Agreement | Rankwell',
    description:
      'Standard Data Processing Agreement for Rankwell enterprise customers. GDPR Article 28 compliant.',
    url: 'https://rankwell.io/dpa',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data Processing Agreement | Rankwell',
    description:
      'Standard Data Processing Agreement for Rankwell enterprise customers. GDPR Article 28 compliant.',
  },
  alternates: {
    canonical: 'https://rankwell.io/dpa',
    },
  robots: {
    index: false,
    follow: true,
  },
};

/**
 * Executes DpaPage.
 * @returns The resulting value.
 */
export default function DpaPage() {
  const lastUpdated = '9 February 2026';

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <p className="overline mb-4">Legal</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Data Processing Agreement
        </h1>
        <p className="mt-4 text-sm text-slate-500">
          Last updated: {lastUpdated}
        </p>
        <p className="mt-6 text-slate-600 leading-relaxed">
          This Data Processing Agreement (&ldquo;DPA&rdquo;) forms part of the
          agreement between Rankwell (&ldquo;Processor&rdquo;) and the
          organisation using Rankwell services (&ldquo;Controller&rdquo;), in
          accordance with GDPR Article 28 and the UK Data Protection Act 2018.
        </p>

        <div className="mt-14 space-y-10 text-neutral-700 leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              1. Scope &amp; purpose
            </h2>
            <p>
              Rankwell processes personal data on behalf of the Controller solely
              for the purpose of providing employer brand audit and optimisation
              services, including:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Generating employer brand audit reports</li>
              <li>
                Operating the Rankwell pixel to serve structured employer data
              </li>
              <li>Providing verified employer profile pages</li>
              <li>Delivering AI visibility metrics and monitoring</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              2. Categories of data
            </h2>
            <div className="overflow-hidden rounded-xl border border-slate-200 mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 text-left font-medium text-slate-900">
                      Category
                    </th>
                    <th className="px-5 py-3 text-left font-medium text-slate-900">
                      Data subjects
                    </th>
                    <th className="px-5 py-3 text-left font-medium text-slate-900">
                      Retention
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  <tr>
                    <td className="px-5 py-3 text-slate-900">
                      Work email addresses
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      Controller employees
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      Account lifetime
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 text-slate-900">
                      Company &amp; domain data
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      Controller organisation
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      Account lifetime
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 text-slate-900">
                      Audit results &amp; scores
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      Controller organisation
                    </td>
                    <td className="px-5 py-3 text-slate-600">12 months</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 text-slate-900">
                      API access logs
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      Controller systems
                    </td>
                    <td className="px-5 py-3 text-slate-600">30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              No special category data (Article 9) is processed. The Rankwell
              pixel does not process any personal data of website visitors.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              3. Processor obligations
            </h2>
            <p>Rankwell shall:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                Process personal data only on documented instructions from the
                Controller, unless required by law
              </li>
              <li>
                Ensure all personnel processing data are bound by confidentiality
                obligations
              </li>
              <li>
                Implement appropriate technical and organisational security
                measures (see{' '}
                <a
                  href="/security"
                  className="text-teal-700 underline underline-offset-2"
                >
                  Security page
                </a>
                )
              </li>
              <li>
                Not engage additional sub-processors without prior written
                consent of the Controller (30 days&apos; notice for changes)
              </li>
              <li>
                Assist the Controller in responding to data subject rights
                requests within 48 hours
              </li>
              <li>
                Notify the Controller of any personal data breach without undue
                delay, and in any event within 24 hours of becoming aware
              </li>
              <li>
                Delete or return all personal data upon termination of services,
                at the Controller&apos;s choice
              </li>
              <li>
                Make available all information necessary to demonstrate
                compliance with GDPR Article 28, and allow for audits
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              4. Security measures
            </h2>
            <p>
              Rankwell implements the following technical and organisational
              measures:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
              <li>Row Level Security on all database tables</li>
              <li>API key hashing (bcrypt) — full keys never stored</li>
              <li>HMAC-SHA256 request signing for pixel communication</li>
              <li>Rate limiting on all endpoints</li>
              <li>Comprehensive audit logging</li>
              <li>
                Infrastructure hosted on SOC 2 Type II certified providers
                (Supabase, Vercel)
              </li>
              <li>EU data residency (London region)</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              5. Sub-processors
            </h2>
            <p>
              The Controller authorises the following sub-processors at the date
              of this agreement:
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-200 mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 text-left font-medium text-slate-900">
                      Sub-processor
                    </th>
                    <th className="px-5 py-3 text-left font-medium text-slate-900">
                      Purpose
                    </th>
                    <th className="px-5 py-3 text-left font-medium text-slate-900">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  <tr>
                    <td className="px-5 py-3 text-slate-900">
                      Supabase Inc.
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      Database &amp; authentication
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      EU (London)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 text-slate-900">Vercel Inc.</td>
                    <td className="px-5 py-3 text-slate-600">
                      Application hosting
                    </td>
                    <td className="px-5 py-3 text-slate-600">Global edge</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              6. Data transfers
            </h2>
            <p>
              All data at rest is stored in the EU (London region). Application
              delivery uses Vercel&apos;s global edge network, which may process
              requests in non-EU locations. No personal data is cached or stored
              at edge locations — all persistent storage remains in the EU.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              7. Breach notification
            </h2>
            <p>
              In the event of a personal data breach, Rankwell shall notify the
              Controller within 24 hours, providing:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Nature of the breach and categories of data affected</li>
              <li>Approximate number of data subjects affected</li>
              <li>Likely consequences of the breach</li>
              <li>Measures taken or proposed to address the breach</li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              8. Termination
            </h2>
            <p>
              Upon termination of the agreement, Rankwell shall, at the
              Controller&apos;s choice, delete or return all personal data within
              30 days. Proof of deletion will be provided upon request. Backup
              copies are purged within 90 days of termination.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              9. Governing law
            </h2>
            <p>
              This DPA is governed by the laws of England and Wales. For
              Controllers in the EU, the provisions of GDPR take precedence in
              the event of conflict.
            </p>
          </section>

          {/* Contact */}
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="font-semibold text-slate-900 mb-2">
              Request a signed DPA
            </h2>
            <p className="text-sm text-slate-600">
              Enterprise customers requiring a signed copy of this DPA, or
              custom amendments, should contact{' '}
              <a
                href="mailto:privacy@rankwell.io"
                className="text-teal-700 underline underline-offset-2"
              >
                privacy@rankwell.io
              </a>
              . We typically return signed agreements within 2 business days.
            </p>
          </section>
        </div>
      </div>
    </main>
    <Footer />
    </div>
  );
}
