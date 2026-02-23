import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://openrole.co.uk"),
  title: {
    default: "OpenRole — Employer Brand Audit | Measure Your Employer Brand Across AI",
    template: "%s | OpenRole",
  },
  description:
    "Run a free employer brand audit across ChatGPT, Claude, Perplexity and Gemini. See your employer brand score, benchmark against competitors, and get a content playbook to improve employer visibility, candidate experience, and recruitment ROI.",
  keywords: [
    "employer brand audit",
    "employer brand score",
    "employer brand measurement",
    "employer branding tools",
    "ai employer branding",
    "employer brand monitoring",
    "how to improve employer branding",
    "employer branding strategy",
    "employer brand ROI",
    "candidate experience",
    "employer visibility",
  ],
  authors: [{ name: "OpenRole" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://openrole.co.uk",
    siteName: "OpenRole",
    title: "OpenRole — Employer Brand Audit | Measure Your Employer Brand Across AI",
    description:
      "Run a free employer brand audit across ChatGPT, Claude, Perplexity and Gemini. See your employer brand score, benchmark against competitors, and get a content playbook to improve employer visibility, candidate experience, and recruitment ROI.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "OpenRole — Measure your employer brand across AI search",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenRole — Employer Brand Audit | Measure Your Employer Brand Across AI",
    description:
      "Run a free employer brand audit across ChatGPT, Claude, Perplexity and Gemini. See your employer brand score, benchmark against competitors, and get a content playbook to improve employer visibility, candidate experience, and recruitment ROI.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: "https://openrole.co.uk",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-openrole-csp-nonce") ?? "";

  return (
    <html lang="en">
      <head>
        <meta name="csp-nonce" content={nonce} />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Grain texture overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: "url('/noise.svg')", backgroundRepeat: "repeat" }}
        />
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
