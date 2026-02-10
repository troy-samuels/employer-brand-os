create extension if not exists pgcrypto;

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

alter table public.audit_logs add column if not exists created_at timestamptz not null default now();
alter table public.audit_logs add column if not exists timestamp timestamptz not null default now();
alter table public.audit_logs add column if not exists actor text not null default 'unknown';
alter table public.audit_logs add column if not exists resource text not null default 'unknown';
alter table public.audit_logs add column if not exists result text not null default 'success';
alter table public.audit_logs add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.audit_logs add column if not exists table_name text not null default 'unknown';
alter table public.audit_logs add column if not exists record_id text;
alter table public.audit_logs add column if not exists old_values jsonb;
alter table public.audit_logs add column if not exists new_values jsonb;
alter table public.audit_logs add column if not exists ip_address inet;
alter table public.audit_logs add column if not exists user_agent text;

create index if not exists idx_audit_logs_timestamp
  on public.audit_logs (timestamp desc);

create index if not exists idx_audit_logs_action
  on public.audit_logs (action);

create index if not exists idx_audit_logs_actor
  on public.audit_logs (actor);

create index if not exists idx_audit_logs_resource
  on public.audit_logs (resource);
