/**
 * @module lib/audit/report-generator
 * Module implementation for report-generator.ts.
 */

import type { AuditResult } from "@/types/audit";

function escapePdfText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdfBuffer(auditResult: AuditResult) {
  const lines: Array<{ text: string; size?: number; spacing?: number }> = [
    { text: "OpenRole AI Visibility Report", size: 18, spacing: 24 },
    { text: `Company: ${auditResult.company_name}` },
    { text: `Domain: ${auditResult.company_domain}` },
    { text: `Generated: ${new Date().toLocaleDateString("en-US")}`, spacing: 20 },
    { text: "Scores", size: 14, spacing: 22 },
    { text: `Overall: ${auditResult.overall_score.toFixed(1)}` },
    { text: `Technical: ${auditResult.technical_score.toFixed(1)}` },
    { text: `AI Visibility: ${auditResult.ai_visibility_score.toFixed(1)}` },
    { text: `Compliance: ${auditResult.compliance_score.toFixed(1)}` },
    { text: `Competitive: ${auditResult.competitive_score.toFixed(1)}`, spacing: 20 },
    { text: "Top recommendations", size: 14, spacing: 22 },
    ...auditResult.recommendations.slice(0, 3).map((rec, index) => ({
      text: `${index + 1}. ${rec.title} (${rec.impact} impact)`,
    })),
  ];

  const contentLines: string[] = [];
  contentLines.push("BT");
  let currentFontSize = 12;
  const titleLine = lines[0];
  currentFontSize = titleLine.size ?? currentFontSize;
  contentLines.push(`/F1 ${currentFontSize} Tf`);
  contentLines.push(`72 760 Td (${escapePdfText(titleLine.text)}) Tj`);

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.size && line.size !== currentFontSize) {
      currentFontSize = line.size;
      contentLines.push(`/F1 ${currentFontSize} Tf`);
    }
    const spacing = line.spacing ?? 16;
    contentLines.push(`0 -${spacing} Td (${escapePdfText(line.text)}) Tj`);
  }
  contentLines.push("ET");

  const contentStream = contentLines.join("\n");
  const contentLength = Buffer.byteLength(contentStream, "utf8");

  const objects = [
    { id: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { id: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    {
      id: 3,
      body:
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] " +
        "/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    },
    {
      id: 4,
      body: `<< /Length ${contentLength} >>\nstream\n${contentStream}\nendstream`,
    },
    { id: 5, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>" },
  ];

  const header = "%PDF-1.4\n";
  const offsets: number[] = [];
  let cursor = Buffer.byteLength(header, "utf8");

  const objectStrings = objects.map((obj) => {
    const objectString = `${obj.id} 0 obj\n${obj.body}\nendobj\n`;
    offsets.push(cursor);
    cursor += Buffer.byteLength(objectString, "utf8");
    return objectString;
  });

  const xrefStart = cursor;
  const xrefLines = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
  ];

  offsets.forEach((offset) => {
    xrefLines.push(`${offset.toString().padStart(10, "0")} 00000 n `);
  });

  const xref = `${xrefLines.join("\n")}\n`;
  const trailer =
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n` +
    `startxref\n${xrefStart}\n%%EOF\n`;

  const pdf = header + objectStrings.join("") + xref + trailer;
  return Buffer.from(pdf, "utf8");
}

/**
 * Executes generateAuditPDF.
 * @param auditResult - auditResult input.
 * @returns The resulting value.
 */
export async function generateAuditPDF(auditResult: AuditResult) {
  const pdfBuffer = buildPdfBuffer(auditResult);
  const base64 = pdfBuffer.toString("base64");
  return `data:application/pdf;base64,${base64}`;
}
