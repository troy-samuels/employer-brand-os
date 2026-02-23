/**
 * @module app/company/[slug]/employer-verified-section
 * Display employer-verified facts on public company pages
 */

import { ShieldCheck, DollarSign, Briefcase, Heart } from 'lucide-react';
import type { EmployerFacts } from '@/features/facts/types/employer-facts.types';

interface EmployerVerifiedSectionProps {
  facts: EmployerFacts;
}

/**
 * Employer-verified facts section for company pages
 * Shows structured data provided directly by the employer
 */
export function EmployerVerifiedSection({ facts }: EmployerVerifiedSectionProps) {
  // Don't show if no meaningful data
  const hasData = 
    (facts.salary_bands && facts.salary_bands.length > 0) ||
    (facts.benefits && facts.benefits.length > 0) ||
    facts.remote_policy ||
    facts.culture_description;

  if (!hasData) return null;

  const lastUpdated = facts.updated_at 
    ? new Date(facts.updated_at).toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    : null;

  return (
    <section className="border-y border-teal-200 bg-gradient-to-b from-teal-50/50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-14">
        {/* Header with verified badge */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-teal-600" />
              <h2 className="text-xl font-bold text-slate-900">Employer Verified</h2>
            </div>
            <p className="text-sm text-slate-600">
              This information was provided and verified directly by {facts.company_name}.
              {lastUpdated && <span className="text-slate-400"> · Updated {lastUpdated}</span>}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Salary Information */}
          {facts.salary_bands && facts.salary_bands.length > 0 && (
            <div className="rounded-2xl border border-teal-200 bg-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-teal-50 text-teal-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Salary Ranges</h3>
              </div>
              <div className="space-y-3">
                {facts.salary_bands.slice(0, 5).map((band, index) => {
                  const currency = getCurrencySymbol(band.currency);
                  return (
                    <div key={index} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                      <p className="text-sm font-medium text-slate-900">{band.role}</p>
                      <p className="text-sm text-slate-600 mt-1">
                        {currency}{band.min.toLocaleString()} - {currency}{band.max.toLocaleString()}
                        {band.equity && <span className="text-teal-600 ml-2">+ equity</span>}
                      </p>
                    </div>
                  );
                })}
                {facts.salary_bands.length > 5 && (
                  <p className="text-xs text-slate-400 pt-2">
                    +{facts.salary_bands.length - 5} more roles
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Work Policy */}
          {facts.remote_policy && (
            <div className="rounded-2xl border border-teal-200 bg-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-teal-50 text-teal-600">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Work Policy</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">Remote Work</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {formatRemotePolicy(facts.remote_policy)}
                  </p>
                </div>
                {facts.remote_details && (
                  <p className="text-sm text-slate-600">
                    {facts.remote_details}
                  </p>
                )}
                {facts.flexible_hours && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-sm text-teal-600">✓ Flexible working hours available</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Benefits */}
          {facts.benefits && facts.benefits.length > 0 && (
            <div className="rounded-2xl border border-teal-200 bg-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-teal-50 text-teal-600">
                  <Heart className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Benefits</h3>
              </div>
              <div className="space-y-2">
                {facts.benefits.slice(0, 8).map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-teal-500 mt-0.5">✓</span>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">{benefit.name}</p>
                      {benefit.details && (
                        <p className="text-xs text-slate-500 mt-0.5">{benefit.details}</p>
                      )}
                    </div>
                  </div>
                ))}
                {facts.benefits.length > 8 && (
                  <p className="text-xs text-slate-400 pt-2">
                    +{facts.benefits.length - 8} more benefits
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Culture */}
          {facts.culture_description && (
            <div className="rounded-2xl border border-teal-200 bg-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-teal-50 text-teal-600">
                  <Heart className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Culture</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {facts.culture_description}
              </p>
              {(facts.team_size || facts.founded_year) && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-6 text-xs text-slate-500">
                  {facts.team_size && <span>Team: {facts.team_size}</span>}
                  {facts.founded_year && <span>Founded: {facts.founded_year}</span>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="mt-6 p-4 rounded-lg bg-teal-50/50 border border-teal-100">
          <p className="text-xs text-slate-600">
            <strong className="text-teal-700">Verified data.</strong> This information is maintained by the employer 
            and injected as structured data for AI models via OpenRole.
          </p>
        </div>
      </div>
    </section>
  );
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€',
  };
  return symbols[currency] || currency;
}

function formatRemotePolicy(policy: string): string {
  const formats: Record<string, string> = {
    'fully-remote': 'Fully Remote',
    'hybrid': 'Hybrid',
    'office-first': 'Office First',
    'flexible': 'Flexible',
  };
  return formats[policy] || policy;
}
