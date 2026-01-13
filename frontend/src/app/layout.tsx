import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "BrandOS - AI Employer Brand Platform",
  description: "Control your employer brand. Ensure AI agents receive accurate information about your company.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-background font-sans antialiased ${inter.variable}`}>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
