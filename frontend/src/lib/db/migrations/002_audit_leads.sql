create table if not exists audit_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_domain text not null,
  company_slug text,
  score integer,
  created_at timestamptz default now()
);

create index if not exists idx_audit_leads_email on audit_leads(email);
create index if not exists idx_audit_leads_domain on audit_leads(email_domain);
create index if not exists idx_audit_leads_created on audit_leads(created_at desc);
