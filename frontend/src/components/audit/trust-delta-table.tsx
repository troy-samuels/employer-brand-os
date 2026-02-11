/**
 * @module components/audit/trust-delta-table
 * Visual trust-delta table comparing AI claims with company reality.
 */

"use client";

import { Info } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DeltaItem } from "@/lib/citation-chain/trust-delta";
import { cn } from "@/lib/utils";

interface TrustDeltaTableProps {
  /** Trust-delta rows returned by `calculateTrustDelta`. */
  items: DeltaItem[];
  /** Optional class override for container layout. */
  className?: string;
}

const UNKNOWN_REALITY_TOOLTIP = "Publish this data to close the gap";

/**
 * Render a trust-delta table with category, AI claim, reality and gap columns.
 */
export function TrustDeltaTable({ items, className }: TrustDeltaTableProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white shadow-sm",
        className
      )}
      data-testid="trust-delta-table"
    >
      <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-neutral-950">Trust Delta</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Where AI statements differ from published employer data.
        </p>
      </div>

      <Table className="min-w-[760px]">
        <TableHeader className="bg-neutral-50">
          <TableRow>
            <TableHead className="w-[18%]">Category</TableHead>
            <TableHead className="w-[36%]">AI Says</TableHead>
            <TableHead className="w-[24%]">Reality</TableHead>
            <TableHead className="w-[22%]">Delta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const deltaToneClass = getDeltaToneClass(item.delta);
            const showUnknownReality = item.reality === null;

            return (
              <TableRow key={item.category} className="align-top">
                <TableCell className="font-medium text-neutral-900">{item.category}</TableCell>

                <TableCell>
                  <p className="text-sm leading-relaxed text-neutral-700">{item.aiSays}</p>
                  <p className="mt-2 text-xs text-neutral-500">
                    Source: {item.source} | Confidence: {item.confidence}
                  </p>
                </TableCell>

                <TableCell>
                  {showUnknownReality ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-md border border-dashed border-neutral-300 px-2.5 py-1 text-xs font-semibold text-neutral-500"
                      title={UNKNOWN_REALITY_TOOLTIP}
                      aria-label={UNKNOWN_REALITY_TOOLTIP}
                    >
                      ?
                      <Info className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  ) : (
                    <span className="text-sm text-neutral-700">{item.reality}</span>
                  )}
                </TableCell>

                <TableCell>
                  {item.delta ? (
                    <span className={cn("text-sm font-semibold", deltaToneClass)}>{item.delta}</span>
                  ) : (
                    <span className="text-sm text-neutral-400">Awaiting published data</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}

function getDeltaToneClass(delta: string | null): string {
  if (!delta) {
    return "text-neutral-400";
  }

  if (/^-/u.test(delta)) {
    return "text-red-600";
  }

  if (/^matches/iu.test(delta)) {
    return "text-emerald-600";
  }

  return "text-amber-600";
}
