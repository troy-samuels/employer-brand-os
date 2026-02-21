import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://openrole.co.uk"),
  title: {
    default: "OpenRole — Take Back Your Reputation from AI",
    template: "%s | OpenRole",
  },
  description:
    "AI is telling candidates the wrong things about your company. OpenRole gives you verified employer data that AI agents trust — so you control the narrative.",
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
  authors: [{ name: "OpenRole" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://openrole.co.uk",
    siteName: "OpenRole",
    title: "OpenRole — Take Back Your Reputation from AI",
    description:
      "AI is telling candidates the wrong things about your company. OpenRole gives you verified employer data that AI agents trust — so you control the narrative.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "OpenRole — Is AI telling the truth about your company?",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenRole — Take Back Your Reputation from AI",
    description:
      "AI is telling candidates the wrong things about your company. OpenRole gives you verified employer data that AI agents trust — so you control the narrative.",
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
