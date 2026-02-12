-- Enable RLS on companies table and allow public read access via anon key.
-- This prevents service-role key from being required for autocomplete queries.

alter table public.companies enable row level security;

-- Allow anyone (anon role) to read companies for autocomplete.
create policy "Allow public read access to companies"
  on public.companies
  for select
  using (true);
