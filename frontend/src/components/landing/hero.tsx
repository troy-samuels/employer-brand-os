import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-neutral-50 py-20 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="max-w-3xl">
          <p className="overline mb-4">The AI reputation problem</p>

          <h1 className="text-4xl lg:text-5xl font-bold text-neutral-950 mb-6 leading-[1.1] tracking-tight">
            AI is telling candidates the wrong things about{" "}
            <span className="text-brand-accent">your company</span>
          </h1>

          <p className="text-lg text-neutral-600 mb-10 max-w-2xl leading-relaxed">
            When someone asks ChatGPT what you pay, it guesses — using old
            Glassdoor reviews and outdated job posts. That guess is costing you
            candidates. BrandOS gives AI the truth, straight from you.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Button variant="primary" size="lg" asChild>
              <Link href="/audit">See your Shadow Salary — free</Link>
            </Button>
            <Button variant="ghost" size="md" asChild>
              <Link href="#how-it-works" className="text-neutral-600">
                How it works →
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-500">
            <span>No signup required</span>
            <span className="hidden sm:inline">·</span>
            <span>Results in 60 seconds</span>
            <span className="hidden sm:inline">·</span>
            <span>See what AI says about you right now</span>
          </div>
        </div>
      </div>
    </section>
  );
}
