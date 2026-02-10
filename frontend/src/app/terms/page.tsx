/**
 * @module app/terms/page
 * Module implementation for page.tsx.
 */

import type { Metadata } from 'next';

/**
 * Exposes exported value(s): metadata.
 */
export const metadata: Metadata = {
  title: 'Terms of Service — Rankwell',
  description:
    'Terms and conditions for using Rankwell employer brand audit and optimisation services.',
};

/**
 * Executes TermsPage.
 * @returns The resulting value.
 */
export default function TermsPage() {
  const lastUpdated = '9 February 2026';

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-neutral-500">
          Last updated: {lastUpdated}
        </p>

        <div className="mt-12 space-y-10 text-neutral-700 leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-neutral-950 mb-3">
              1. Agreement
            </h2>
            <p>
              By accessing or using Rankwell (&ldquo;the Service&rdquo;), you
              agree to these Terms of Service. If you are using the Service on
              behalf of an organisation, you represent that you have the
              authority to bind that organisation to these terms.
            </p>
            <p className="mt-2">
              &ldquo;Rankwell&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, and
              &ldquo;our&rdquo; refer to the operator of rankwell.io.
              &ldquo;You&rdquo; and &ldquo;your&rdquo; refer to the individual
              or organisation using the Service.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-neutral-950 mb-3">
              2. The Service
            </h2>
            <p>Rankwell provides:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                Employer brand audits that assess how your company appears to AI
                systems, search engines, and candidates
              </li>
              <li>
                A smart pixel for your careers page that serves structured
                employer data to AI crawlers
              </li>
              <li>
                Verified employer profiles and public audit result pages
              </li>
              <li>
                Ongoing monitoring and optimisation recommendations
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-neutral-950 mb-3">
              3. Accounts &amp; access
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your API
              keys and account credentials. You must notify us immediately at{' '}
              <a
                href="mailto:security@rankwell.io"
                className="text-emerald-700 underline underline-offset-2"
              >
                security@rankwell.io
              </a>{' '}
              if you suspect unauthorised access to your account.
            </p>
            <p className="mt-2">
              We may suspend or terminate accounts that violate these terms, are
              used for fraudulent purposes, or remain inactive for more than 12
              months.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-neutral-950 mb-3">
              4. The Rankwell pixel
            </h2>
            <p>By installing the Rankwell pixel on your website, you:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                Confirm you have the authority to add scripts to the domain
                where the pixel is installed
              </li>
              <li>
                Understand the pixel serves structured employer data (JSON-LD) to
                AI crawlers and search engines
              </li>
              <li>
                Acknowledge the pixel communicates only with Rankwell API
                endpoints
              </li>
              <li>
                May remove the pixel at any time by deleting the embed code from
                your site
              </li>
            </ul>
            <p className="mt-2">
              We guarantee the pixel will not: set cookies, track visitors,
              collect personal data from your site visitors, or modify your page
              content. See our{' '}
              <a
                href="/security"
                className="text-emerald-700 underline underline-offset-2"
              >
                Security page
              </a>{' '}
              for technical details.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-neutral-950 mb-3">
              5. Audit methodology
            </h2>
            <p>
              Audit scores are generated by analysing publicly available
              information about your employer brand, including your website, job
              listings, review platforms, and structured data. Our methodology is
              described on the{' '}
              <a
                href="/how-we-score"
                className="text-emerald-700 underline underline-offset-2"
              >
                How we score
              </a>{' '}
              page.
            </p>
            <p className="mt-2">
              Audit results represent our assessment at the time of the audit.
              Scores may change as your public data changes or as we refine our
              methodology. We do not guarantee specific outcomes from improving
              your score.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-neutral-950 mb-3">
              6. Acceptable use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                Use the Service to audit companies you do not represent or have a
                legitimate business relationship with
              </li>
              <li>
                Reverse-engineer, decompile, or attempt to extract the source
                code of our proprietary scoring algorithms
              </li>
              <li>
                Circumvent rate limits, abuse the API, or attempt to overload
                our infrastructure
              </li>
              <li>
                Misrepresent your audit score, verified status, or Rankwell
                badge
              </li>
              <li>
                Resell, redistribute, or commercially exploit audit results
                without our consent
              </li>
              <li>
                Use the Service for any purpose that violates applicable law
              </li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-neutral-950 mb-3">
              7. Intellectual property
            </h2>
            <p>
              Rankwell, our logo, scoring methodology, and pixel technology are
              our intellectual property. Your audit results and employer data
              remain yours.
            </p>
            <p className="mt-2">
              By using the verified badge or embedding audit results on your
              site, you grant us a limited licence to display your company name
              and logo on your public verification page.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-neutral-950 mb-3">
              8. Pricing &amp; payment
            </h2>
            <p>
              Free audits are provided at our discretion and may be limited in
              scope. Paid plans are billed monthly or annually as stated at the
              time of purchase. Prices may change with 30 days&apos; notice.
            </p>
            <p className="mt-2">
              Refunds are available within 14 days of purchase if you have not
              used the pixel installation or ongoing monitoring features.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-neutral-950 mb-3">
              9. Data processing
            </h2>
            <p>
              We process data in accordance with our{' '}
              <a
                href="/privacy"
                className="text-emerald-700 underline underline-offset-2"
              >
                Privacy Policy
              </a>
              . Enterprise customers requiring a Data Processing Agreement (DPA)
              can request one at{' '}
              <a
                href="mailto:privacy@rankwell.io"
                className="text-emerald-700 underline underline-offset-2"
              >
                privacy@rankwell.io
              </a>
              .
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-semibold text-neutral-950 mb-3">
              10. Availability &amp; support
            </h2>
            <p>
              We aim for 99.9% uptime but do not guarantee uninterrupted
              service. Planned maintenance will be communicated in advance where
              possible. The pixel is designed to fail silently — if our service
              is unavailable, it will not affect your website&apos;s performance
              or functionality.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-semibold text-neutral-950 mb-3">
              11. Limitation of liability
            </h2>
            <p>
              To the maximum extent permitted by law, Rankwell&apos;s total
              liability for any claim arising from your use of the Service is
              limited to the amount you paid us in the 12 months preceding the
              claim, or £100, whichever is greater.
            </p>
            <p className="mt-2">
              We are not liable for indirect, incidental, consequential, or
              punitive damages, including loss of revenue, reputation, or data.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl font-semibold text-neutral-950 mb-3">
              12. Indemnification
            </h2>
            <p>
              You agree to indemnify and hold Rankwell harmless from any claims,
              damages, or expenses arising from your use of the Service,
              violation of these terms, or infringement of any third party&apos;s
              rights.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-xl font-semibold text-neutral-950 mb-3">
              13. Changes to these terms
            </h2>
            <p>
              We may update these terms from time to time. Material changes will
              be communicated via email at least 14 days before taking effect. By
              continuing to use the Service after changes take effect, you accept
              the updated terms.
            </p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="text-xl font-semibold text-neutral-950 mb-3">
              14. Governing law
            </h2>
            <p>
              These terms are governed by the laws of England and Wales. Any
              disputes will be resolved in the courts of England and Wales. If
              you are a consumer in the EU, nothing in these terms affects your
              rights under EU consumer protection law.
            </p>
          </section>

          {/* 15 */}
          <section>
            <h2 className="text-xl font-semibold text-neutral-950 mb-3">
              15. Contact
            </h2>
            <p>
              For questions about these terms, contact us at{' '}
              <a
                href="mailto:hello@rankwell.io"
                className="text-emerald-700 underline underline-offset-2"
              >
                hello@rankwell.io
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
