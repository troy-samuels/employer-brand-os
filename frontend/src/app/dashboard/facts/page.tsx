import { CompanyFactsForm } from './company-facts-form';
import { getCompanyFacts } from '@/features/facts/actions/save-facts';

export default async function FactsPage() {
  const existingData = await getCompanyFacts();

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
        <h1 className="text-lg font-semibold text-foreground">Company Facts</h1>
      </header>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <p className="mb-6 text-sm text-muted-foreground">
            Enter your company information below. This data will be automatically
            injected into your website via the Smart Pixel as verified JSON-LD schema.
          </p>

          <CompanyFactsForm defaultValues={existingData} />
        </div>
      </div>
    </div>
  );
}
