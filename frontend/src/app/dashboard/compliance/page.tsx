import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SAMPLE_AUDIT_RESULT } from "@/lib/utils/constants";

export default function CompliancePage() {
  return (
    <Card variant="bordered" padding="lg">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Pay Transparency Compliance
      </h2>
      <div className="space-y-4">
        {SAMPLE_AUDIT_RESULT.compliance_violations.map((violation) => (
          <div
            key={violation.law_reference}
            className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {violation.jurisdiction}
              </p>
              <p className="text-xs text-gray-500">{violation.law_reference}</p>
            </div>
            <Badge variant={violation.status === "compliant" ? "success" : "warning"}>
              {violation.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
