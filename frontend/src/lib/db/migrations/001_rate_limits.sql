create table if not exists rate_limits (
  bucket_key text primary key,
  count integer not null default 0,
  expires_at timestamptz not null
);

create index if not exists idx_rate_limits_expires on rate_limits(expires_at);
