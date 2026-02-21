import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Employer Schema Generator — JSON-LD for AI Visibility | OpenRole",
  description:
    "Generate Organization, JobPosting, FAQ, and EmployerAggregateRating JSON-LD schema for your careers page. Help AI understand your employer brand in seconds.",
  openGraph: {
    title: "Employer Schema Generator | OpenRole",
    description:
      "Generate Organization, JobPosting, FAQ, and EmployerAggregateRating JSON-LD schema for your careers page. Help AI understand your employer brand in seconds.",
  },
  alternates: { canonical: "https://openrole.co.uk/tools/employer-schema" },
};

export default function EmployerSchemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
