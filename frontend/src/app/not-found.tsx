/**
 * @module app/not-found
 * Custom 404 page with OpenRole branding.
 */

import Link from "next/link";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="mx-auto max-w-md text-center">
          {/* 404 badge */}
          <div className="mb-6 inline-flex items-center rounded-full bg-neutral-100 px-4 py-1.5 text-sm font-medium text-neutral-500">
            404
          </div>

          <h1
            className="mb-4 text-4xl font-medium text-neutral-950 sm:text-5xl"
            style={{ letterSpacing: "-0.03em" }}
          >
            Page not found
          </h1>

          <p className="mb-8 text-lg leading-relaxed text-neutral-400">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            But while you&apos;re here — do you know what AI is telling candidates
            about your company?
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/#audit"
              className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Run a free audit
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
            >
              Back to homepage
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
