-- Foundation schema: member profiles with role/status, kept in sync with auth.users.

create type public.member_role as enum ('member', 'admin');
create type public.member_status as enum ('pending', 'approved', 'rejected', 'suspended');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.member_role not null default 'member',
  status public.member_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper used by RLS policies (defined security definer to avoid recursive
-- profiles lookups triggering RLS on themselves).
create function public.is_admin(user_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  );
$$;

-- Prevent members from promoting themselves or changing their own status;
-- only an admin (or the trigger/service role) may change role/status.
create function public.enforce_profile_role_status()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- auth.uid() is null when the statement runs outside a logged-in request
  -- (SQL Editor, service_role key, migrations) — trust those unconditionally
  -- and only block a regular authenticated member from self-promoting.
  if auth.uid() is not null and not public.is_admin(auth.uid()) then
    new.role := old.role;
    new.status := old.status;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_before_update
  before update on public.profiles
  for each row execute function public.enforce_profile_role_status();

alter table public.profiles enable row level security;

create policy "profiles: individuals can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: admins can view all profiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

create policy "profiles: individuals can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles: admins can update all profiles"
  on public.profiles for update
  using (public.is_admin(auth.uid()));
