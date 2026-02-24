import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/shared/cookie-consent";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://openrole.co.uk"),
  title: {
    default: "OpenRole — Inject Machine-Readable Employer Data | AI Cites Your Facts",
    template: "%s | OpenRole",
  },
  description:
    "OpenRole injects machine-readable employer data into your existing website so AI cites your verified facts instead of third-party rumours. See what ChatGPT, Perplexity and Google AI say about you right now, then deploy structured data to increase the likelihood AI represents your employer brand accurately.",
  keywords: [
    "rag employer data",
    "machine-readable employer data",
    "ai employer visibility",
    "structured employer data",
    "llms.txt",
    "employer brand ai",
    "chatgpt employer branding",
    "perplexity employer data",
    "google ai employer brand",
    "employer data injection",
    "ai cites employer facts",
  ],
  authors: [{ name: "OpenRole" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://openrole.co.uk",
    siteName: "OpenRole",
    title: "OpenRole — Inject Machine-Readable Employer Data | AI Cites Your Facts",
    description:
      "OpenRole injects machine-readable employer data into your existing website so AI cites your verified facts instead of third-party rumours. See what ChatGPT, Perplexity and Google AI say about you, then deploy structured data on your domain.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "OpenRole — Inject machine-readable employer data so AI cites your facts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenRole — Inject Machine-Readable Employer Data | AI Cites Your Facts",
    description:
      "OpenRole injects machine-readable employer data into your existing website so AI cites your verified facts instead of third-party rumours. See what ChatGPT, Perplexity and Google AI say about you, then deploy structured data on your domain.",
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
        <link rel="alternate" type="application/rss+xml" title="OpenRole Blog" href="/feed.xml" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Grain texture overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: "url('/noise.svg')", backgroundRepeat: "repeat" }}
        />
        {children}
        <Toaster position="bottom-right" />
        <CookieConsent />
      </body>
    </html>
  );
}
