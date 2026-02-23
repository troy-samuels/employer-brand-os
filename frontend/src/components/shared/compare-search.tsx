"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scale, ArrowRight, Loader2 } from "lucide-react";

export function CompareSearch() {
  const router = useRouter();
  const [companyA, setCompanyA] = useState("");
  const [companyB, setCompanyB] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const a = companyA.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const b = companyB.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (!a || !b || a === b) return;

    setLoading(true);
    router.push(`/compare/${a}-vs-${b}`);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="h-5 w-5 text-brand-accent" />
        <h3 className="text-lg font-bold text-slate-900">
          Compare any two companies
        </h3>
      </div>
      <p className="text-sm text-slate-500 mb-5">
        Enter two company slugs to see a head-to-head AI visibility breakdown
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={companyA}
          onChange={(e) => setCompanyA(e.target.value)}
          placeholder="e.g. monzo"
          className="w-full sm:flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          required
        />
        <span className="text-sm font-bold text-slate-300">vs</span>
        <input
          type="text"
          value={companyB}
          onChange={(e) => setCompanyB(e.target.value)}
          placeholder="e.g. revolut"
          className="w-full sm:flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Compare
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>
      <p className="text-xs text-slate-400 mt-3">
        Use the company slug from their profile URL (e.g., openrole.co.uk/company/<strong>monzo</strong>)
      </p>
    </div>
  );
}
