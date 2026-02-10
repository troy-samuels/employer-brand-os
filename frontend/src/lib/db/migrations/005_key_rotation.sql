alter table public.api_keys
  add column if not exists key_version integer not null default 1;

update public.api_keys
set key_version = 1
where key_version is null;

alter table public.api_keys
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_api_keys_org_version
  on public.api_keys (organization_id, key_version desc);

create index if not exists idx_api_keys_active_expires
  on public.api_keys (organization_id, is_active, expires_at);
