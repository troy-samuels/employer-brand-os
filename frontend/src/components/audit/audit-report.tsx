/**
 * @module components/audit/audit-report
 * Module implementation for audit-report.tsx.
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AuditResult } from "@/types/audit";

interface AuditReportProps {
  result: AuditResult;
}

/**
 * Executes AuditReport.
 * @param param1 - param1 input.
 * @returns The resulting value.
 */
export function AuditReport({ result }: AuditReportProps) {
  return (
    <Card variant="bordered" padding="lg">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Priority Recommendations</h3>
            <p className="text-sm text-gray-500">
              Actionable fixes to improve AI visibility in 24 hours.
            </p>
          </div>
          {result.pdf_report_url && (
            <a
              href={result.pdf_report_url}
              download={`rankwell-audit-${result.company_domain}.pdf`}
              className="text-sm font-medium text-brand-primary hover:underline"
            >
              Download PDF
            </a>
          )}
        </div>

        <div className="space-y-4">
          {result.recommendations.map((rec) => (
            <div
              key={rec.id}
              className="flex flex-col gap-2 rounded-lg border border-gray-200 px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    rec.impact === "high"
                      ? "error"
                      : rec.impact === "medium"
                        ? "warning"
                        : "success"
                  }
                >
                  {rec.impact.toUpperCase()} IMPACT
                </Badge>
                <h4 className="text-sm font-semibold text-gray-900">{rec.title}</h4>
              </div>
              <p className="text-sm text-gray-600">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
