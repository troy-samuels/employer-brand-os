/**
 * @module app/dashboard/facts/page
 * Comprehensive employer facts questionnaire page
 */

import { EmployerQuestionnaire } from '@/features/facts';
import { getEmployerFacts, getCompanyInfo } from '@/features/facts/actions/get-employer-facts';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Employer Facts Dashboard Page
 * Self-serve questionnaire for employer data collection + AEO content generation
 */
export default async function FactsPage() {
  const [existingData, companyInfo] = await Promise.all([
    getEmployerFacts(),
    getCompanyInfo(),
  ]);

  if (!companyInfo) {
    return (
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 px-8 pt-8 pb-4 bg-background border-b border-border">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-2">
            Platform
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Company Facts
          </h1>
        </header>

        <div className="flex-1 px-8 py-6">
          <div className="max-w-2xl">
            <Card className="border-destructive">
              <CardContent className="p-6">
                <p className="text-sm text-destructive">
                  Company information not found. Please complete your profile first.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const isPublished = existingData?.published || false;

  return (
    <div className="flex flex-col">
      {/* Header - Swiss typographic style with frosted glass */}
      <header className="sticky top-0 z-10 px-8 pt-8 pb-4 bg-background border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-2">
              Platform
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Employer Facts Questionnaire
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Fill in your company information once. We'll auto-generate llms.txt, Schema.org JSON-LD, 
              and Markdown content that AI models can ingest. No playbooks to execute — we do it for you.
            </p>
          </div>

          {isPublished && (
            <div className="flex gap-2">
              <Link href={`/api/employer-facts/download/llms-txt?slug=${companyInfo.slug}`}>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  llms.txt
                </Button>
              </Link>
              <Link href={`/api/employer-facts/download/schema?slug=${companyInfo.slug}`}>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Schema
                </Button>
              </Link>
              <Link href={`/api/employer-facts/download/markdown?slug=${companyInfo.slug}`}>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Markdown
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-8 py-6">
        {/* Status Card */}
        {isPublished ? (
          <Card className="mb-6 border-success">
            <CardContent className="flex items-center gap-3 p-4">
              <ShieldCheck className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium text-success">Facts Published & Verified</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your employer data is live and being served to AI models. Download AEO content above.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border-warning">
            <CardContent className="flex items-center gap-3 p-4">
              <ShieldCheck className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-medium text-warning">Draft Mode</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete the questionnaire and publish to generate AEO content.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questionnaire */}
        <EmployerQuestionnaire
          defaultValues={existingData}
          companySlug={companyInfo.slug}
          companyName={companyInfo.name}
        />
      </div>
    </div>
  );
}
