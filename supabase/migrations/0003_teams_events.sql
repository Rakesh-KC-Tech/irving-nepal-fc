-- Soccer operations: teams, rosters, matches/training, RSVP, attendance, stats.

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  jersey_number int,
  position text,
  joined_at timestamptz not null default now(),
  primary key (team_id, profile_id)
);

create type public.event_type as enum ('match', 'training');
create type public.rsvp_response as enum ('yes', 'no', 'maybe');

create table public.events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  type public.event_type not null,
  title text not null,
  location text,
  starts_at timestamptz not null,
  opponent text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.event_rsvps (
  event_id uuid not null references public.events (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  response public.rsvp_response not null,
  responded_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);

create table public.event_attendance (
  event_id uuid not null references public.events (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  attended boolean not null default false,
  recorded_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);

create table public.event_stats (
  event_id uuid not null references public.events (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  goals int not null default 0,
  assists int not null default 0,
  yellow_cards int not null default 0,
  red_cards int not null default 0,
  primary key (event_id, profile_id)
);

-- Helper for RLS: an approved member can read club data; only admins write it.
create function public.is_approved(user_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and status = 'approved'
  );
$$;

alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.event_attendance enable row level security;
alter table public.event_stats enable row level security;

create policy "teams: approved members can view" on public.teams
  for select using (public.is_approved(auth.uid()));
create policy "teams: admins manage" on public.teams
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "team_members: approved members can view" on public.team_members
  for select using (public.is_approved(auth.uid()));
create policy "team_members: admins manage" on public.team_members
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "events: approved members can view" on public.events
  for select using (public.is_approved(auth.uid()));
create policy "events: admins manage" on public.events
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "event_rsvps: approved members can view all" on public.event_rsvps
  for select using (public.is_approved(auth.uid()));
create policy "event_rsvps: members manage their own" on public.event_rsvps
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "event_rsvps: admins manage all" on public.event_rsvps
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "event_attendance: approved members can view" on public.event_attendance
  for select using (public.is_approved(auth.uid()));
create policy "event_attendance: admins manage" on public.event_attendance
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "event_stats: approved members can view" on public.event_stats
  for select using (public.is_approved(auth.uid()));
create policy "event_stats: admins manage" on public.event_stats
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
