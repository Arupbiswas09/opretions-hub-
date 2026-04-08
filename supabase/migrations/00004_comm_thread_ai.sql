-- Per-user AI thread cache: summary + inferred tone for Communication smart reply

create table if not exists public.comm_thread_ai (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  thread_key text not null,
  summary text not null default '',
  tone text not null default 'professional'
    check (tone in ('professional', 'friendly', 'concise', 'detailed')),
  message_fingerprint text not null default '',
  updated_at timestamptz not null default now(),
  unique (org_id, user_id, thread_key)
);

create index if not exists comm_thread_ai_user_thread_idx
  on public.comm_thread_ai (user_id, thread_key);

create trigger comm_thread_ai_updated_at
  before update on public.comm_thread_ai
  for each row execute procedure public.hub_set_updated_at();

alter table public.comm_thread_ai enable row level security;

create policy comm_thread_ai_select_own
  on public.comm_thread_ai for select
  using (auth.uid() = user_id);

create policy comm_thread_ai_insert_own
  on public.comm_thread_ai for insert
  with check (auth.uid() = user_id);

create policy comm_thread_ai_update_own
  on public.comm_thread_ai for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy comm_thread_ai_delete_own
  on public.comm_thread_ai for delete
  using (auth.uid() = user_id);
