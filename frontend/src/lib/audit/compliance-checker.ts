import type { ComplianceViolation } from "@/types/audit";

export async function checkCompliance(domain: string): Promise<ComplianceViolation[]> {
  return [
    {
      jurisdiction: "California",
      law_reference: "SB 1162",
      status: "warning",
      detail: `${domain} has 1 role missing salary range disclosures in CA.`,
    },
  ];
}
