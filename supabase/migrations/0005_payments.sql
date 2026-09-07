-- Money: membership plans, Stripe payments, receipts.

create table public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_cents int not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid references public.membership_plans (id),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  amount_cents int not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.membership_plans enable row level security;
alter table public.payments enable row level security;

create policy "plans: approved members can view active" on public.membership_plans
  for select using (active and public.is_approved(auth.uid()));
create policy "plans: admins manage" on public.membership_plans
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "payments: members view own" on public.payments
  for select using (auth.uid() = profile_id);
create policy "payments: admins view all" on public.payments
  for select using (public.is_admin(auth.uid()));

-- A member may create their OWN payment row, but only in 'pending' state
-- (right after starting a Stripe Checkout session, before Stripe confirms
-- anything). There is deliberately no UPDATE policy for regular users —
-- flipping a row to 'paid' only ever happens via the Stripe webhook using
-- the service_role key (bypasses RLS), so this table always reflects what
-- Stripe actually recorded, never something a client could fabricate.
create policy "payments: members insert own pending" on public.payments
  for insert with check (auth.uid() = profile_id and status = 'pending');

insert into public.membership_plans (name, description, price_cents) values
  ('Annual Membership', 'One year of Irving Nepal FC membership.', 15000);
