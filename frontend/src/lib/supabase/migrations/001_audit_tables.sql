-- Audit tool database tables (Phase 1 + Phase 2)
-- Source: AUDIT_TOOL_SPEC.md (Database Tables section)

create extension if not exists pgcrypto;

-- Phase 1 results (every audit, no gate)
create table if not exists public.audit_website_checks (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  company_slug text not null,
  website_url text,
  industry text,
  size_band text,
  hq_location text,
  has_llms_txt boolean default false,
  llms_txt_has_employment boolean default false,
  has_jsonld boolean default false,
  jsonld_schemas_found text[] default '{}',
  has_salary_data boolean default false,
  careers_page_crawlable text default 'not_found',
  careers_page_url text,
  robots_txt_ai_policy text default 'not_found',
  robots_txt_blocked_bots text[] default '{}',
  ai_readiness_score integer default 0,
  source_ip_hash text,
  created_at timestamptz default now()
);

create index if not exists idx_website_checks_slug
  on public.audit_website_checks(company_slug);

create index if not exists idx_website_checks_industry
  on public.audit_website_checks(industry);

create index if not exists idx_website_checks_created
  on public.audit_website_checks(created_at desc);

-- Phase 2 results (email-gated)
create table if not exists public.audit_ai_responses (
  id uuid primary key default gen_random_uuid(),
  company_slug text not null,
  lead_email text not null,
  lead_email_domain text not null,
  queries_run jsonb not null default '[]',
  responses jsonb not null default '[]',
  extracted_salaries jsonb default '{}',
  extracted_benefits jsonb default '{}',
  extracted_sentiment jsonb default '{}',
  shadow_salary_gap numeric,
  consistency_score numeric,
  ai_confidence_level numeric,
  sources_cited jsonb default '[]',
  cached boolean default false,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

create index if not exists idx_ai_responses_slug
  on public.audit_ai_responses(company_slug);

create index if not exists idx_ai_responses_email_domain
  on public.audit_ai_responses(lead_email_domain);

create index if not exists idx_ai_responses_expires
  on public.audit_ai_responses(expires_at);
