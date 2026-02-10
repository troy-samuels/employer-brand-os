-- Migration 006: monitor_checks table
-- Stores weekly AI reputation check results for drift detection and trend analysis.

create table if not exists monitor_checks (
  id            uuid        primary key default gen_random_uuid(),
  company_slug  text        not null,
  check_data    jsonb       not null default '{}'::jsonb,
  score         integer     not null default 0,
  previous_score integer,
  changes       jsonb       not null default '[]'::jsonb,
  created_at    timestamptz not null default now()
);

-- Efficient lookups: latest checks per company (trend queries)
create index if not exists idx_monitor_checks_slug_created
  on monitor_checks (company_slug, created_at desc);

-- Fast filtering by score range (e.g. "find all companies below 40")
create index if not exists idx_monitor_checks_score
  on monitor_checks (score);
