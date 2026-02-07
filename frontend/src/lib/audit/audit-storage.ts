import type { AuditResult } from "@/types/audit";

export async function saveAuditResult(result: AuditResult) {
  return { ...result };
}
