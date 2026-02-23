-- Score history table for tracking AI visibility score changes over time.
-- Each row represents a score snapshot at a point in time.
-- Used for trendline charts on company pages and retention dashboards.

create table if not exists public.score_history (
  id uuid primary key default gen_random_uuid(),
  company_slug text not null,
  company_domain text not null,
  score integer not null,
  score_breakdown jsonb not null default '{}'::jsonb,
  has_llms_txt boolean not null default false,
  has_jsonld boolean not null default false,
  has_salary_data boolean not null default false,
  careers_page_status text not null default 'none',
  robots_txt_status text not null default 'not_found',
  -- Change tracking
  previous_score integer,
  score_delta integer generated always as (score - coalesce(previous_score, score)) stored,
  -- Source of this snapshot
  source text not null default 'audit', -- 'audit' | 'monitor' | 'manual'
  created_at timestamptz not null default now()
);

-- Indexes for efficient querying
create index if not exists idx_score_history_slug_created
  on public.score_history (company_slug, created_at desc);
create index if not exists idx_score_history_domain
  on public.score_history (company_domain);
create index if not exists idx_score_history_created
  on public.score_history (created_at desc);

-- Deduplicate: only store one snapshot per company per day
-- Use date_trunc which is immutable for 'day' with timestamptz
create unique index if not exists idx_score_history_slug_date
  on public.score_history (company_slug, cast(timezone('UTC', created_at) as date));

-- Nominations table for the "Nominate a Company" feature
create table if not exists public.nominations (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  nominator_email text,
  status text not null default 'pending', -- 'pending' | 'audited' | 'rejected'
  created_at timestamptz not null default now()
);

create index if not exists idx_nominations_domain
  on public.nominations (domain);
create index if not exists idx_nominations_status
  on public.nominations (status);
