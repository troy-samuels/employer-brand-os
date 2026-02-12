-- Audit + monitoring tables used by the audit funnel and public pages.

create extension if not exists pgcrypto;

-- -------------------------------------------------------------------
-- Audit website checks (Phase 1)
-- -------------------------------------------------------------------
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

-- -------------------------------------------------------------------
-- Audit AI responses (Phase 2 / email gated)
-- -------------------------------------------------------------------
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

-- -------------------------------------------------------------------
-- Public audit summaries (SEO pages)
-- -------------------------------------------------------------------
create table if not exists public.public_audits (
  id uuid primary key default gen_random_uuid(),
  company_domain text not null,
  company_name text not null,
  company_slug text not null unique,
  score integer not null default 0,
  score_breakdown jsonb not null default '{}'::jsonb,
  has_llms_txt boolean not null default false,
  has_jsonld boolean not null default false,
  has_salary_data boolean not null default false,
  careers_page_status text not null default 'none',
  robots_txt_status text not null default 'not_found',
  ats_detected text,
  audit_count integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_public_audits_slug on public.public_audits (company_slug);
create index if not exists idx_public_audits_domain on public.public_audits (company_domain);
create index if not exists idx_public_audits_score on public.public_audits (score desc);

-- Helper function for public audit upserts
create or replace function public.increment_audit_count(slug text)
returns void
language plpgsql
as $$
begin
  update public.public_audits
  set audit_count = audit_count + 1,
      updated_at = now()
  where company_slug = slug;
end;
$$;

-- -------------------------------------------------------------------
-- Audit lead capture
-- -------------------------------------------------------------------
create table if not exists public.audit_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_domain text not null,
  company_slug text,
  score integer,
  created_at timestamptz default now()
);

create index if not exists idx_audit_leads_email on public.audit_leads(email);
create index if not exists idx_audit_leads_domain on public.audit_leads(email_domain);
create index if not exists idx_audit_leads_created on public.audit_leads(created_at desc);

-- -------------------------------------------------------------------
-- Weekly monitoring checks
-- -------------------------------------------------------------------
create table if not exists public.monitor_checks (
  id uuid primary key default gen_random_uuid(),
  company_slug text not null,
  check_data jsonb not null default '{}'::jsonb,
  score integer not null default 0,
  previous_score integer,
  changes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_monitor_checks_slug_created
  on public.monitor_checks (company_slug, created_at desc);
create index if not exists idx_monitor_checks_score
  on public.monitor_checks (score);

-- -------------------------------------------------------------------
-- Crawler visit logs
-- -------------------------------------------------------------------
create table if not exists public.crawler_visits (
  id uuid primary key default gen_random_uuid(),
  company_id text not null,
  bot_name text not null,
  user_agent text not null,
  page_url text not null,
  could_read boolean not null default true,
  response_served boolean not null default false,
  visited_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_crawler_visits_company on public.crawler_visits(company_id);
create index if not exists idx_crawler_visits_bot on public.crawler_visits(bot_name);
create index if not exists idx_crawler_visits_time on public.crawler_visits(visited_at);

-- -------------------------------------------------------------------
-- Audit logs (security trail)
-- -------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  timestamp timestamptz not null default now(),
  action text not null,
  actor text not null default 'unknown',
  resource text not null default 'unknown',
  result text not null default 'success',
  metadata jsonb not null default '{}'::jsonb,
  organization_id uuid references public.organizations(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  table_name text not null default 'unknown',
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text
);

create index if not exists idx_audit_logs_timestamp
  on public.audit_logs (timestamp desc);
create index if not exists idx_audit_logs_action
  on public.audit_logs (action);
create index if not exists idx_audit_logs_actor
  on public.audit_logs (actor);
create index if not exists idx_audit_logs_resource
  on public.audit_logs (resource);
