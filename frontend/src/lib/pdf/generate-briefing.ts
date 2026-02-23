/**
 * @module lib/pdf/generate-briefing
 * Generates the "AI Employer Brand Briefing" PDF for a given company slug.
 *
 * Fetches audit data from Supabase, builds risk list, generates a QR code,
 * and renders the React PDF to a Buffer.
 */

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";

import {
  getCompanyAudit,
  getIndustryAvg,
  getPercentile,
  buildChecks,
} from "@/lib/audit/shared";
import { formatCompanyName } from "@/lib/utils/company-names";
import {
  EmployerBriefingDocument,
  type BriefingData,
} from "./employer-briefing";

/**
 * Generate the PDF briefing for a company.
 * Returns null if company not found.
 */
export async function generateBriefingPDF(
  slug: string
): Promise<{ buffer: Buffer; companyName: string } | null> {
  // Fetch audit data
  const audit = await getCompanyAudit(slug);
  if (!audit) return null;

  const companyName = formatCompanyName(audit.company_name, slug);

  // Fetch comparison data in parallel
  const [ukAverage, percentile] = await Promise.all([
    getIndustryAvg(),
    getPercentile(audit.score),
  ]);

  // Build checks and extract top risks (failed first, then partial, max 3)
  const checks = buildChecks(audit);
  const risks = checks
    .filter((c) => c.status === "fail" || c.status === "partial")
    .sort((a, b) => {
      // Failures first, then partials; within each group, by max points (higher = more important)
      if (a.status !== b.status) return a.status === "fail" ? -1 : 1;
      return b.maxPoints - a.maxPoints;
    })
    .slice(0, 3)
    .map((c) => ({
      name: c.name,
      description: c.description,
      status: c.status as "fail" | "partial",
    }));

  // Generate QR code as data URL
  const reportUrl = `https://openrole.co.uk/company/${slug}`;
  let qrCodeDataUrl = "";
  try {
    qrCodeDataUrl = await QRCode.toDataURL(reportUrl, {
      width: 128,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });
  } catch {
    // QR generation failed — continue without it
  }

  // Format date
  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Build briefing data
  const data: BriefingData = {
    companyName,
    companyDomain: audit.company_domain,
    companySlug: slug,
    score: audit.score,
    ukAverage,
    percentile,
    risks,
    generatedDate,
    qrCodeDataUrl,
  };

  // Render PDF to buffer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(EmployerBriefingDocument, { data }) as any;
  const buffer = await renderToBuffer(element);

  return { buffer: Buffer.from(buffer), companyName };
}
