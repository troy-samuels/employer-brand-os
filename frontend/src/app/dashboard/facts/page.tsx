/**
 * @module app/dashboard/facts/page
 * Module implementation for page.tsx.
 */

import { CompanyFactsForm, getCompanyFacts } from '@/features/facts';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

/**
 * Executes FactsPage.
 * @returns The resulting value.
 */
export default async function FactsPage() {
  const existingData = await getCompanyFacts();

  return (
    <div className="flex flex-col">
      {/* Header - Swiss typographic style with frosted glass */}
      <header className="sticky top-0 z-10 px-8 pt-8 pb-4 bg-background border-b border-border">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-2">
          Platform
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Company Facts
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 px-8 py-6">
        <div className="max-w-2xl">
          <p className="mb-8 text-sm text-muted-foreground">
            Enter your company information below. This data will be automatically
            injected into your website via the Smart Pixel as verified JSON-LD schema.
          </p>

          {/* Smart Pixel Status Card */}
          <Card className="mb-6 border-success">
            <CardContent className="flex items-center gap-3 p-4">
              <ShieldCheck className="h-5 w-5 text-success" />
              <p className="text-sm font-medium text-success">Smart Pixel Active & Verified</p>
            </CardContent>
          </Card>

          <CompanyFactsForm defaultValues={existingData} />
        </div>
      </div>
    </div>
  );
}
