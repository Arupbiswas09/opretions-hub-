-- On signup: create organization + profile (Phase 1)
-- Expects auth.users.raw_user_meta_data: org_name, full_name (optional)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  org_nm text;
  disp text;
begin
  org_nm := coalesce(nullif(trim(new.raw_user_meta_data->>'org_name'), ''), 'Workspace');
  disp := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    split_part(new.email, '@', 1)
  );

  insert into public.organizations (name)
  values (org_nm)
  returning id into new_org_id;

  insert into public.profiles (id, org_id, display_name, role)
  values (new.id, new_org_id, disp, 'admin');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

comment on function public.handle_new_user() is 'Bootstrap org + profile for new Supabase Auth users';
