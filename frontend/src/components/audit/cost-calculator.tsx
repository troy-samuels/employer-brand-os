/**
 * @module components/audit/cost-calculator
 * Interactive cost-of-misinformation calculator for audit outcomes.
 */

"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  calculateMisinformationCost,
  DEFAULT_ACTIVE_ROLES,
  DEFAULT_COST_PER_HIRE_GBP,
  DEFAULT_MONTHLY_VIEWS,
  deriveHallucinationRate,
  formatGbpCurrency,
  formatRoiMultiple,
  OPENROLE_PRO_MONTHLY_PRICE_GBP,
  type DeltaItem,
} from "@/lib/citation-chain/trust-delta";
import { cn } from "@/lib/utils";

interface CostCalculatorProps {
  /** Trust-delta rows used to derive hallucination rate. */
  deltaItems: DeltaItem[];
  /** Optional class override for layout integration. */
  className?: string;
}

/**
 * Render an editable calculator showing estimated monthly misinformation cost.
 */
export function CostCalculator({ deltaItems, className }: CostCalculatorProps) {
  const [activeRoles, setActiveRoles] = useState<number>(DEFAULT_ACTIVE_ROLES);
  const [monthlyViews, setMonthlyViews] = useState<number>(DEFAULT_MONTHLY_VIEWS);
  const [costPerHire, setCostPerHire] = useState<number>(DEFAULT_COST_PER_HIRE_GBP);

  const hallucinationRate = useMemo(
    () => deriveHallucinationRate(deltaItems),
    [deltaItems]
  );

  const costEstimate = useMemo(
    () => calculateMisinformationCost({
      activeRoles,
      monthlyViews,
      costPerHire,
      hallucinationRate,
    }),
    [activeRoles, monthlyViews, costPerHire, hallucinationRate]
  );

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6",
        className
      )}
      data-testid="cost-calculator"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Cost Of Misinformation</h2>
        <p className="text-sm text-slate-600">
          Hallucination rate from this audit: {hallucinationRate.toFixed(1)}%
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input
          type="number"
          min={0}
          value={activeRoles}
          onChange={(event) => setActiveRoles(parseInputNumber(event.target.value))}
          label="Active roles"
          inputMode="numeric"
        />

        <Input
          type="number"
          min={0}
          value={monthlyViews}
          onChange={(event) => setMonthlyViews(parseInputNumber(event.target.value))}
          label="Monthly AI-assisted job views"
          inputMode="numeric"
        />

        <Input
          type="number"
          min={0}
          value={costPerHire}
          onChange={(event) => setCostPerHire(parseInputNumber(event.target.value))}
          label="Average cost-per-hire"
          inputMode="numeric"
        />
      </div>

      <div className="mt-6 rounded-xl bg-slate-900 px-5 py-6 text-white">
        <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {formatGbpCurrency(costEstimate.monthlyWastedSpend)}
        </p>
        <p className="mt-1 text-sm text-slate-300">
          / month in estimated wasted recruiting spend
        </p>
        <p className="mt-4 text-sm font-medium text-neutral-100">
          OpenRole Pro: {formatGbpCurrency(OPENROLE_PRO_MONTHLY_PRICE_GBP)}/month — ROI:{" "}
          {formatRoiMultiple(costEstimate.roi)}
        </p>
      </div>
    </section>
  );
}

function parseInputNumber(rawValue: string): number {
  if (!rawValue.trim()) {
    return 0;
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.round(parsed);
}
