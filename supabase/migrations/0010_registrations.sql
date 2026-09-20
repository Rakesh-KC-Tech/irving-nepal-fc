-- Public "Join The Club" registrations from the marketing site. These come
-- from anonymous visitors (no auth.users account yet), so unlike payments
-- there's no profile_id to scope RLS to — inserts happen only via the
-- service_role key from the /api/registrations route, same as the Stripe
-- webhook writes to payments/profiles.
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  date_of_birth date not null,
  plan text not null,
  preferred_position text,
  notes text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.registrations enable row level security;

create policy "registrations: admins can view all"
  on public.registrations for select
  using (public.is_admin(auth.uid()));

create policy "registrations: admins can update"
  on public.registrations for update
  using (public.is_admin(auth.uid()));
