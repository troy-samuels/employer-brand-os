export async function sendAuditEmail(
  email: string,
  payload: { companyName: string; auditId: string; pdfUrl?: string; score: number }
) {
  return { email, ...payload, sent: true };
}
