-- LLM response cache for AI audit queries
-- Stores raw LLM responses per company per model, with 24hr TTL logic
-- Prevents redundant API calls and controls OpenRouter spend

create table if not exists public.llm_response_cache (
  id uuid primary key default gen_random_uuid(),
  company_slug text not null,
  company_domain text not null,
  model_id text not null,               -- chatgpt, google-ai, perplexity, etc.
  prompt text not null,
  raw_response text not null,
  claims jsonb not null default '[]'::jsonb,
  score integer not null default 0,
  tokens_used integer,
  latency_ms integer,
  created_at timestamptz not null default now(),

  -- One cached response per company per model
  unique(company_slug, model_id)
);

create index if not exists idx_llm_cache_slug on public.llm_response_cache (company_slug);
create index if not exists idx_llm_cache_created on public.llm_response_cache (created_at);

-- Also add ai_preview column to public_audits for the homepage teaser
alter table public.public_audits
  add column if not exists ai_preview_response text,
  add column if not exists ai_preview_model text default 'chatgpt',
  add column if not exists ai_preview_updated_at timestamptz;

-- RLS: cache is service-role only (no direct client access)
alter table llm_response_cache enable row level security;

-- Service role can do everything (used by API routes)
-- No public policies needed — all access goes through server actions
