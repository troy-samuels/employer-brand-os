-- Task 1: Company autocomplete source table.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text not null,
  industry text,
  employee_count integer,
  created_at timestamptz not null default now()
);

create index if not exists companies_name_trgm_idx
  on public.companies using gin (name gin_trgm_ops);
