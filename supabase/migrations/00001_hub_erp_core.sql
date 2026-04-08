-- Operations Hub — core ERP schema (Phase 0)
-- Run via Supabase SQL editor or `supabase db push` after linking project.
-- RLS: users access rows where org_id matches their profile.

create extension if not exists "pgcrypto";

-- ─── updated_at trigger ─────────────────────────────────────
create or replace function public.hub_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── organizations & profiles ──────────────────────────────
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organizations_updated_at
  before update on public.organizations
  for each row execute procedure public.hub_set_updated_at();

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  org_id uuid references public.organizations (id) on delete set null,
  role text not null default 'member'
    check (role in ('admin', 'manager', 'member', 'viewer')),
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.hub_set_updated_at();

-- ─── template: org-scoped tables ─────────────────────────────
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  billing_address jsonb,
  payment_terms text,
  account_manager_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger clients_updated_at before update on public.clients for each row execute procedure public.hub_set_updated_at();

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  company text,
  tags text[] default '{}',
  notes text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger contacts_updated_at before update on public.contacts for each row execute procedure public.hub_set_updated_at();

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  client_id uuid references public.clients (id),
  value numeric(14,2),
  stage text not null default 'lead',
  owner_id uuid references public.profiles (id),
  close_date date,
  probability int,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger deals_updated_at before update on public.deals for each row execute procedure public.hub_set_updated_at();

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  deal_id uuid references public.deals (id),
  title text not null,
  status text not null default 'draft',
  value numeric(14,2),
  sent_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger proposals_updated_at before update on public.proposals for each row execute procedure public.hub_set_updated_at();

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid references public.clients (id),
  deal_id uuid references public.deals (id),
  title text not null,
  status text not null default 'draft',
  value numeric(14,2),
  signed_date date,
  pdf_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger contracts_updated_at before update on public.contracts for each row execute procedure public.hub_set_updated_at();

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid references public.clients (id),
  name text not null,
  description text,
  status text not null default 'active',
  start_date date,
  end_date date,
  budget_hours numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger projects_updated_at before update on public.projects for each row execute procedure public.hub_set_updated_at();

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid references public.projects (id),
  title text not null,
  description text,
  assignee_id uuid references public.profiles (id),
  status text not null default 'todo',
  priority text not null default 'medium',
  due_date date,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger tasks_updated_at before update on public.tasks for each row execute procedure public.hub_set_updated_at();

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid references public.projects (id),
  title text not null,
  description text,
  type text not null default 'bug',
  priority text not null default 'medium',
  status text not null default 'open',
  reporter_id uuid references public.profiles (id),
  assignee_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger issues_updated_at before update on public.issues for each row execute procedure public.hub_set_updated_at();

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  type text not null,
  requester_id uuid references public.profiles (id),
  status text not null default 'pending',
  payload jsonb default '{}',
  amount numeric(14,2),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger approvals_updated_at before update on public.approvals for each row execute procedure public.hub_set_updated_at();

create table if not exists public.timesheets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  person_id uuid references public.profiles (id),
  project_id uuid references public.projects (id),
  week_start date not null,
  status text not null default 'draft',
  total_hours numeric(8,2),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger timesheets_updated_at before update on public.timesheets for each row execute procedure public.hub_set_updated_at();

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  timesheet_id uuid references public.timesheets (id) on delete cascade,
  entry_date date not null,
  hours numeric(6,2) not null,
  description text,
  billable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger time_entries_updated_at before update on public.time_entries for each row execute procedure public.hub_set_updated_at();

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  department text,
  role text,
  employment_type text,
  status text not null default 'active',
  manager_id uuid references public.people (id),
  start_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger people_updated_at before update on public.people for each row execute procedure public.hub_set_updated_at();

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  department text,
  location text,
  employment_type text,
  status text not null default 'open',
  posted_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger jobs_updated_at before update on public.jobs for each row execute procedure public.hub_set_updated_at();

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  job_id uuid references public.jobs (id),
  full_name text not null,
  email text,
  stage text not null default 'applied',
  source text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger candidates_updated_at before update on public.candidates for each row execute procedure public.hub_set_updated_at();

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  referrer_id uuid references public.profiles (id),
  candidate_name text,
  job_id uuid references public.jobs (id),
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger referrals_updated_at before update on public.referrals for each row execute procedure public.hub_set_updated_at();

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid references public.clients (id),
  number text,
  status text not null default 'draft',
  issue_date date,
  due_date date,
  subtotal numeric(14,2),
  tax numeric(14,2),
  total numeric(14,2),
  line_items jsonb default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger invoices_updated_at before update on public.invoices for each row execute procedure public.hub_set_updated_at();

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  description text not null,
  amount numeric(14,2) not null,
  category text,
  person_id uuid references public.profiles (id),
  project_id uuid references public.projects (id),
  receipt_path text,
  status text not null default 'submitted',
  expense_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger expenses_updated_at before update on public.expenses for each row execute procedure public.hub_set_updated_at();

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  sender_id uuid references public.profiles (id),
  recipient_ids uuid[] default '{}',
  body text not null,
  thread_id uuid,
  read_by uuid[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger messages_updated_at before update on public.messages for each row execute procedure public.hub_set_updated_at();

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references public.profiles (id),
  title text not null,
  body text,
  read_at timestamptz,
  entity_type text,
  entity_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger notifications_updated_at before update on public.notifications for each row execute procedure public.hub_set_updated_at();

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  fields jsonb not null default '[]',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger forms_updated_at before update on public.forms for each row execute procedure public.hub_set_updated_at();

create table if not exists public.form_responses (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  form_id uuid not null references public.forms (id) on delete cascade,
  values jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger form_responses_updated_at before update on public.form_responses for each row execute procedure public.hub_set_updated_at();

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  duration_minutes int,
  location text,
  notes text,
  attendee_ids uuid[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger meetings_updated_at before update on public.meetings for each row execute procedure public.hub_set_updated_at();

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  subject text not null,
  description text,
  requester_id uuid references public.profiles (id),
  priority text not null default 'normal',
  status text not null default 'open',
  assigned_to_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger support_tickets_updated_at before update on public.support_tickets for each row execute procedure public.hub_set_updated_at();

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references public.profiles (id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.error_logs (
  id uuid primary key default gen_random_uuid(),
  route text,
  error_message text,
  stack text,
  user_id uuid,
  created_at timestamptz not null default now()
);

-- ─── RLS ─────────────────────────────────────────────────────
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.proposals enable row level security;
alter table public.contracts enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.issues enable row level security;
alter table public.approvals enable row level security;
alter table public.timesheets enable row level security;
alter table public.time_entries enable row level security;
alter table public.people enable row level security;
alter table public.jobs enable row level security;
alter table public.candidates enable row level security;
alter table public.referrals enable row level security;
alter table public.invoices enable row level security;
alter table public.expenses enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.forms enable row level security;
alter table public.form_responses enable row level security;
alter table public.meetings enable row level security;
alter table public.support_tickets enable row level security;
alter table public.activity_log enable row level security;

-- Helper: current user's org_id
create or replace function public.hub_current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.profiles where id = auth.uid() limit 1;
$$;

-- organizations: members read their org
create policy org_read on public.organizations for select
  using (id = public.hub_current_org_id());

-- profiles
create policy profiles_self_select on public.profiles for select using (auth.uid() = id);
create policy profiles_self_insert on public.profiles for insert with check (auth.uid() = id);
create policy profiles_self_update on public.profiles for update using (auth.uid() = id);
create policy profiles_org_select on public.profiles for select
  using (org_id = public.hub_current_org_id());

-- Generic org policy for business tables (read/write same org)
create policy clients_org on public.clients for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy contacts_org on public.contacts for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy deals_org on public.deals for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy proposals_org on public.proposals for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy contracts_org on public.contracts for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy projects_org on public.projects for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy tasks_org on public.tasks for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy issues_org on public.issues for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy approvals_org on public.approvals for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy timesheets_org on public.timesheets for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy time_entries_org on public.time_entries for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy people_org on public.people for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy jobs_org on public.jobs for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy candidates_org on public.candidates for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy referrals_org on public.referrals for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy invoices_org on public.invoices for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy expenses_org on public.expenses for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy messages_org on public.messages for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy notifications_org on public.notifications for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy forms_org on public.forms for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy form_responses_org on public.form_responses for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy meetings_org on public.meetings for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy support_tickets_org on public.support_tickets for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

create policy activity_log_org on public.activity_log for all
  using (org_id = public.hub_current_org_id())
  with check (org_id = public.hub_current_org_id());

-- error_logs: no user policy (service role only) — optional read for admins later

-- Realtime (enable in Supabase Dashboard): tasks, approvals, notifications, messages

comment on table public.organizations is 'Operations Hub tenant';
comment on table public.profiles is 'Links auth.users to org + role';
