import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-family-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-family-mono",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-family-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rankwell.io"),
  title: "Rankwell — Take Back Your Reputation from AI",
  description: "AI is telling candidates the wrong things about your company. Rankwell gives you verified employer data that AI agents trust — so you control the narrative.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-background font-sans antialiased ${jakarta.variable} ${jetbrains.variable} ${instrumentSerif.variable}`}>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
