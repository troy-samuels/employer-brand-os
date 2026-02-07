import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";

export default function PixelPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Install the BrandOS Smart Pixel
            </h1>
            <p className="text-lg text-gray-600">
              Deploy verified JSON-LD schema in minutes. No IT tickets required.
            </p>
          </div>

          <Card variant="elevated" padding="lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Copy-paste the script
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Paste this snippet into your site header or Google Tag Manager.
            </p>
            <pre className="rounded-lg bg-gray-900 text-gray-100 p-4 text-xs overflow-x-auto mb-6">
{`<script src="https://cdn.brandos.com/pixel/brandos-pixel.js"
  data-brandos-company-id="company_123"
  data-brandos-pixel-id="px_demo_123"
  async></script>`}
            </pre>
            <Button variant="primary" size="md">View Integration Guide</Button>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
