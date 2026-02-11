/**
 * @module components/landing/testimonials
 * Module implementation for testimonials.tsx.
 */

/**
 * Before/After Comparison — replaces fictional testimonials.
 * Shows what AI says about a company now vs. after Rankwell.
 */
export default function BeforeAfter() {
  return (
    <section id="testimonials" className="py-24 lg:py-32 bg-neutral-950 relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-accent/5 rounded-full blur-3xl" />
      <div className="relative max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="mb-14 lg:mb-16">
          <p className="overline text-brand-accent-light mb-3">The difference</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-white max-w-xl tracking-tight">
            What candidates see — before and after
          </h2>
          <p className="text-neutral-400 mt-3 max-w-xl">
            A candidate asks ChatGPT about working at a mid-size tech company. Here&apos;s
            what changes when Rankwell is active.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Before */}
          <div className="rounded-xl border border-status-critical/20 bg-status-critical-light p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 bg-status-critical rounded-full" />
              <span className="text-xs font-semibold text-status-critical uppercase tracking-wide">
                Without Rankwell
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-neutral-200">
                <p className="text-xs text-neutral-500 mb-1.5 font-medium">Salary estimate</p>
                <p className="text-neutral-950 font-semibold">£55,000 – £68,000</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Source: Glassdoor (2023), 4 submissions
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-neutral-200">
                <p className="text-xs text-neutral-500 mb-1.5 font-medium">Work policy</p>
                <p className="text-neutral-950">&ldquo;Limited remote options based on recent reviews&rdquo;</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Source: Reddit thread, Feb 2024
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-neutral-200">
                <p className="text-xs text-neutral-500 mb-1.5 font-medium">Benefits</p>
                <p className="text-neutral-600 italic">No specific benefits data available</p>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="rounded-xl border border-status-verified/20 bg-status-verified-light p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 bg-status-verified rounded-full" />
              <span className="text-xs font-semibold text-status-verified uppercase tracking-wide">
                With Rankwell
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-neutral-200">
                <p className="text-xs text-neutral-500 mb-1.5 font-medium">Verified salary range</p>
                <p className="text-neutral-950 font-semibold">£75,000 – £95,000</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-status-verified-light border border-status-verified/20 rounded-full">
                    <span className="w-1.5 h-1.5 bg-status-verified rounded-full" />
                    <span className="text-[10px] font-semibold text-status-verified">Verified 2 days ago</span>
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-neutral-200">
                <p className="text-xs text-neutral-500 mb-1.5 font-medium">Work policy</p>
                <p className="text-neutral-950">Remote-first, with optional London office 2 days/week</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-status-verified-light border border-status-verified/20 rounded-full">
                    <span className="w-1.5 h-1.5 bg-status-verified rounded-full" />
                    <span className="text-[10px] font-semibold text-status-verified">Employer verified</span>
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-neutral-200">
                <p className="text-xs text-neutral-500 mb-1.5 font-medium">Benefits</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {["Private healthcare", "£2k learning budget", "30 days holiday", "Enhanced parental leave"].map((b) => (
                    <span key={b} className="px-2.5 py-1 bg-neutral-100 text-neutral-800 text-xs rounded-md">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
