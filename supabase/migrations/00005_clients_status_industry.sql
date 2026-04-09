-- Client segmentation for list filters and sorting (UI)
alter table public.clients
  add column if not exists status text not null default 'Active',
  add column if not exists industry text not null default '';

comment on column public.clients.status is 'Active | Onboarding | Inactive | Archived';
comment on column public.clients.industry is 'Industry label; empty means unspecified in UI';
