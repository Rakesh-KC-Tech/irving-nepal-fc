-- Club operations: announcements (+ read tracking), documents, membership expiration.

alter table public.profiles
  add column membership_expires_at date;

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.announcement_reads (
  announcement_id uuid not null references public.announcements (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (announcement_id, profile_id)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text not null,
  uploaded_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;
alter table public.announcement_reads enable row level security;
alter table public.documents enable row level security;

create policy "announcements: approved members can view" on public.announcements
  for select using (public.is_approved(auth.uid()));
create policy "announcements: admins manage" on public.announcements
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "announcement_reads: members manage their own" on public.announcement_reads
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "documents: approved members can view" on public.documents
  for select using (public.is_approved(auth.uid()));
create policy "documents: admins manage" on public.documents
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Extend the profile guard trigger: also protect membership_expires_at
-- from self-editing (same rationale as role/status), and default it to
-- one year out the moment a profile is approved. Admins can still
-- change the date afterward (e.g. to extend/shorten a membership).
create or replace function public.enforce_profile_role_status()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin(auth.uid()) then
    new.role := old.role;
    new.status := old.status;
    new.membership_expires_at := old.membership_expires_at;
  end if;

  if new.status = 'approved' and new.member_number is null then
    new.member_number := 'INFC-' || lpad(nextval('public.member_number_seq')::text, 4, '0');
  end if;

  if new.status = 'approved' and new.membership_expires_at is null then
    new.membership_expires_at := (now() + interval '1 year')::date;
  end if;

  new.updated_at := now();
  return new;
end;
$$;
