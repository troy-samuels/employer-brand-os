-- Core platform tables required by the app runtime.
-- Focused subset of the full schema to unblock auth, facts, pixel, and sanitization flows.

create extension if not exists pgcrypto;

-- -------------------------------------------------------------------
-- Organizations
-- -------------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  industry text,
  glassdoor_rating numeric(2,1),
  logo_url text,
  website text,
  employee_count integer,
  tier text default 'verify',
  trust_score numeric(3,2) default 0,
  trust_score_updated_at timestamptz,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_organizations_slug on public.organizations (slug);

-- -------------------------------------------------------------------
-- Users (app-level profiles mapped to auth users)
-- -------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique,
  organization_id uuid references public.organizations(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'viewer',
  is_active boolean default true,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_users_auth_id on public.users (auth_id);
create index if not exists idx_users_org on public.users (organization_id);

-- -------------------------------------------------------------------
-- Locations (optional, used by facts and sanitization)
-- -------------------------------------------------------------------
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  location_type text default 'office',
  address_line1 text,
  city text,
  state text,
  postal_code text,
  country text default 'US',
  is_headquarters boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_locations_org on public.locations (organization_id);

-- -------------------------------------------------------------------
-- API Keys (Smart Pixel)
-- -------------------------------------------------------------------
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  key_hash text not null,
  key_prefix text not null,
  allowed_domains text[] not null default '{}'::text[],
  name text,
  scopes jsonb default '[]'::jsonb,
  rate_limit_per_minute integer default 100,
  is_active boolean default true,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now(),
  created_by uuid references public.users(id),
  key_version integer not null default 1,
  updated_at timestamptz default now()
);

create unique index if not exists idx_api_keys_prefix on public.api_keys (key_prefix);
create index if not exists idx_api_keys_org on public.api_keys (organization_id);

-- -------------------------------------------------------------------
-- Pixel Events (audit trail)
-- -------------------------------------------------------------------
create table if not exists public.pixel_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  api_key_id uuid references public.api_keys(id) on delete set null,
  event_type text not null,
  page_url text,
  ip_address inet,
  user_agent text,
  referer text,
  facts_returned integer default 0,
  response_time_ms integer,
  error_message text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_pixel_events_org on public.pixel_events (organization_id);
create index if not exists idx_pixel_events_created on public.pixel_events (created_at desc);

-- -------------------------------------------------------------------
-- Fact categories + definitions
-- -------------------------------------------------------------------
create table if not exists public.fact_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  display_name text not null,
  description text,
  icon text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.fact_definitions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  category_id uuid references public.fact_categories(id) on delete set null,
  name text not null,
  display_name text not null,
  description text,
  data_type text not null default 'text',
  validation_rules jsonb default '{}'::jsonb,
  schema_property text,
  schema_type text,
  include_in_jsonld boolean default true,
  is_required boolean default false,
  is_public boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (organization_id, name)
);

create index if not exists idx_fact_definitions_category on public.fact_definitions (category_id);

-- -------------------------------------------------------------------
-- Employer facts (verified data)
-- -------------------------------------------------------------------
create table if not exists public.employer_facts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  definition_id uuid references public.fact_definitions(id) on delete cascade,
  value jsonb not null,
  job_roles jsonb default '[]'::jsonb,
  effective_date timestamptz,
  effective_end_date timestamptz,
  compliance_tags jsonb default '[]'::jsonb,
  verification_status text default 'unverified',
  verified_at timestamptz,
  verified_by uuid references public.users(id),
  verification_source text,
  include_in_jsonld boolean default true,
  version integer default 1,
  is_current boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references public.users(id),
  updated_by uuid references public.users(id)
);

create index if not exists idx_employer_facts_org on public.employer_facts (organization_id);
create index if not exists idx_employer_facts_definition on public.employer_facts (definition_id);
create index if not exists idx_employer_facts_location on public.employer_facts (location_id);
create index if not exists idx_employer_facts_jsonld on public.employer_facts (include_in_jsonld) where include_in_jsonld = true;

-- -------------------------------------------------------------------
-- Sanitization mappings
-- -------------------------------------------------------------------
create table if not exists public.job_title_mappings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  internal_code text not null,
  public_title text not null,
  job_family text,
  level_indicator text,
  location_id uuid references public.locations(id) on delete set null,
  aliases text[] default '{}'::text[],
  keywords text[] default '{}'::text[],
  pay_transparency_ready boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references public.users(id),
  updated_by uuid references public.users(id),
  unique (organization_id, internal_code)
);

create index if not exists idx_job_title_mappings_org on public.job_title_mappings (organization_id);
create index if not exists idx_job_title_mappings_active on public.job_title_mappings (organization_id, is_active);
