"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatCompanyName } from "@/lib/utils/company-names";

interface ZeroScoreCompany {
  company_name: string;
  company_slug: string;
  company_domain: string;
}

export function ZeroScoreSection({ companies }: { companies: ZeroScoreCompany[] }) {
  const [expanded, setExpanded] = useState(false);

  if (companies.length === 0) return null;

  return (
    <div className="mt-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mx-auto group"
      >
        <span className="font-medium">
          {companies.length} {companies.length === 1 ? "company" : "companies"} not yet scored
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 group-hover:text-slate-600" />
        ) : (
          <ChevronDown className="h-4 w-4 group-hover:text-slate-600" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-100 bg-slate-50/80">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Not yet scored — these companies need more data to generate a meaningful score
            </p>
          </div>
          <div className="divide-y divide-neutral-50">
            {companies.map((company) => (
              <Link
                key={company.company_slug}
                href={`/company/${company.company_slug}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-600 truncate group-hover:text-slate-900 transition-colors">
                    {formatCompanyName(company.company_name, company.company_slug)}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{company.company_domain}</p>
                </div>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full shrink-0 ml-4">
                  0/100
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
