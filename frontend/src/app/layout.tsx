import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rankwell.io"),
  title: {
    default: "Rankwell — Take Back Your Reputation from AI",
    template: "%s | Rankwell",
  },
  description:
    "AI is telling candidates the wrong things about your company. Rankwell gives you verified employer data that AI agents trust — so you control the narrative.",
  keywords: [
    "employer brand",
    "AI visibility",
    "ChatGPT",
    "employer reputation",
    "structured data",
    "JSON-LD",
    "AI citations",
    "employer SEO",
  ],
  authors: [{ name: "Rankwell" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://rankwell.io",
    siteName: "Rankwell",
    title: "Rankwell — Take Back Your Reputation from AI",
    description:
      "AI is telling candidates the wrong things about your company. Rankwell gives you verified employer data that AI agents trust — so you control the narrative.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Rankwell — Is AI telling the truth about your company?",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rankwell — Take Back Your Reputation from AI",
    description:
      "AI is telling candidates the wrong things about your company. Rankwell gives you verified employer data that AI agents trust — so you control the narrative.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: "https://rankwell.io",
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
  const nonce = (await headers()).get("x-rankwell-csp-nonce") ?? "";

  return (
    <html lang="en">
      <head>
        <meta name="csp-nonce" content={nonce} />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased" nonce={nonce}>
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
