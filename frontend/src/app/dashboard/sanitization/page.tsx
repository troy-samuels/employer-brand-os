import { getMappings } from '@/features/sanitization/actions/sanitization-actions';
import { MappingsTable } from './mappings-table';
import { AddMappingButton } from './add-mapping-button';

export default async function SanitizationPage() {
  const { mappings, total } = await getMappings();

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Sanitization Engine
          </h1>
          <p className="text-xs text-muted-foreground">
            Translate internal ATS codes to public job titles
          </p>
        </div>
        <AddMappingButton />
      </header>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          {/* Description */}
          <div className="mb-6 rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-medium text-foreground mb-2">
              How it works
            </h2>
            <p className="text-sm text-muted-foreground">
              Map your internal job codes (like <code className="bg-muted px-1 rounded">L4-Eng-NY</code>) to
              public-friendly titles (like <code className="bg-muted px-1 rounded">Senior Software Engineer</code>).
              The Smart Pixel will automatically sanitize job data before it reaches AI agents,
              keeping internal codes private while ensuring public data is pristine.
            </p>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-2xl font-semibold text-foreground">{total}</p>
              <p className="text-xs text-muted-foreground">Total Mappings</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-2xl font-semibold text-green-600">
                {mappings.filter((m) => m.is_active).length}
              </p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-2xl font-semibold text-amber-600">
                {mappings.filter((m) => !m.is_active).length}
              </p>
              <p className="text-xs text-muted-foreground">Inactive</p>
            </div>
          </div>

          {/* Mappings Table */}
          <MappingsTable mappings={mappings} />
        </div>
      </div>
    </div>
  );
}
