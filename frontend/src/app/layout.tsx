import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://openrole.co.uk"),
  title: {
    default: "OpenRole — Take Control of What AI Tells Your Candidates",
    template: "%s | OpenRole",
  },
  description:
    "80% of candidates ask AI about you before applying. OpenRole shows you what they hear, finds the information gaps, and gives you the content playbook to take control.",
  keywords: [
    "employer brand AI",
    "AI employer visibility",
    "what does ChatGPT say about employers",
    "AI employer reputation UK",
    "employer brand monitoring",
    "AI candidate research",
    "employer brand audit",
    "AI job search",
  ],
  authors: [{ name: "OpenRole" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://openrole.co.uk",
    siteName: "OpenRole",
    title: "OpenRole — Take Control of What AI Tells Your Candidates",
    description:
      "80% of candidates ask AI about you before applying. OpenRole shows you what they hear, finds the information gaps, and gives you the content playbook to take control.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "OpenRole — Take control of what AI tells your candidates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenRole — Take Control of What AI Tells Your Candidates",
    description:
      "80% of candidates ask AI about you before applying. OpenRole shows you what they hear, finds the information gaps, and gives you the content playbook to take control.",
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
