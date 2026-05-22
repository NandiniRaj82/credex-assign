-- StackLens Supabase Schema
-- Run this in the Supabase SQL editor or via supabase db push

-- ---------------------------------------------------------------------------
-- AUDITS TABLE
-- Stores every completed audit. Public-facing data only (no PII).
-- The slug is used in shareable URLs.
-- ---------------------------------------------------------------------------
create table if not exists audits (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  -- Sanitized form data: tools, team size, use case. NO email, NO company name.
  form_data   jsonb not null,
  -- Full audit result including per-tool breakdown and totals
  result      jsonb not null,
  created_at  timestamptz default now()
);

-- Index for fast slug lookups (used on every results page load)
create index if not exists audits_slug_idx on audits (slug);

-- ---------------------------------------------------------------------------
-- LEADS TABLE
-- Stores email capture after audit is shown. References the audit.
-- ---------------------------------------------------------------------------
create table if not exists leads (
  id              uuid primary key default gen_random_uuid(),
  audit_id        uuid references audits(id) on delete set null,
  email           text not null,
  company         text,
  role            text,
  team_size       int,
  monthly_savings numeric(10, 2),
  -- True when monthly savings > $500 — triggers Credex follow-up
  high_value      boolean default false,
  -- Tracks email delivery status
  email_sent      boolean default false,
  created_at      timestamptz default now()
);

-- Index for deduplication queries
create index if not exists leads_email_idx on leads (email);

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Audits are publicly readable (for shareable URLs).
-- Leads are only readable by authenticated service role (backend API only).
-- ---------------------------------------------------------------------------
alter table audits enable row level security;
alter table leads enable row level security;

-- Allow public read on audits (shareable URLs work without auth)
create policy "audits_public_read"
  on audits for select
  to anon
  using (true);

-- Allow service role to insert audits
create policy "audits_service_insert"
  on audits for insert
  to service_role
  with check (true);

-- Leads: service role only (no public access to email data)
create policy "leads_service_all"
  on leads for all
  to service_role
  using (true)
  with check (true);
