-- Add explicit per-key domain allowlist for Smart Pixel enforcement.

alter table if exists public.api_keys
  add column if not exists allowed_domains text[] not null default '{}'::text[];

-- Backfill from organization website for existing keys that do not yet define domains.
update public.api_keys as k
set allowed_domains = array[
  lower(split_part(split_part(regexp_replace(o.website, '^https?://', ''), '/', 1), ':', 1)),
  '*.' || lower(split_part(split_part(regexp_replace(o.website, '^https?://', ''), '/', 1), ':', 1))
]
from public.organizations as o
where k.organization_id = o.id
  and coalesce(array_length(k.allowed_domains, 1), 0) = 0
  and o.website is not null
  and o.website <> '';

create index if not exists idx_api_keys_allowed_domains_gin
  on public.api_keys using gin (allowed_domains);
