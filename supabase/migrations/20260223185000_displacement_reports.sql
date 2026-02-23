-- Displacement reports table
-- Stores cached competitor displacement analysis with 24h TTL
-- Source: displacement feature spec

create table if not exists public.displacement_reports (
  id uuid default gen_random_uuid() primary key,
  company_slug text not null,
  competitor_slug text not null,
  report jsonb not null,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '24 hours'),
  
  -- Ensure unique pairing (order matters: revolut-vs-monzo ≠ monzo-vs-revolut)
  constraint unique_comparison unique (company_slug, competitor_slug)
);

-- Index for lookups by company
create index if not exists idx_displacement_company
  on public.displacement_reports(company_slug);

-- Index for lookups by competitor
create index if not exists idx_displacement_competitor
  on public.displacement_reports(competitor_slug);

-- Index for expiry cleanup (used by scheduled jobs)
create index if not exists idx_displacement_expires
  on public.displacement_reports(expires_at);

-- Comment for documentation
comment on table public.displacement_reports is 
  'Cached displacement reports showing actionable opportunities to beat competitors in AI visibility. TTL: 24 hours.';

comment on column public.displacement_reports.report is
  'Full DisplacementReport JSON structure with opportunities, quick wins, and content briefs.';
