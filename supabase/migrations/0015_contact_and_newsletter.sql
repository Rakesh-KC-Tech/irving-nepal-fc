-- Public contact-form messages and newsletter signups from the marketing
-- site. Both come from anonymous visitors, so (like registrations) inserts
-- only happen through the service_role key in the /api/contact and
-- /api/newsletter routes; admins read and manage them from the portal.
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'replied', 'archived')),
  created_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- One row per address regardless of capitalization.
create unique index newsletter_subscribers_email_idx
  on public.newsletter_subscribers (lower(email));

alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;

create policy "contact_messages: admins can view all"
  on public.contact_messages for select
  using (public.is_admin(auth.uid()));
create policy "contact_messages: admins can update"
  on public.contact_messages for update
  using (public.is_admin(auth.uid()));

create policy "newsletter_subscribers: admins can view all"
  on public.newsletter_subscribers for select
  using (public.is_admin(auth.uid()));
create policy "newsletter_subscribers: admins can update"
  on public.newsletter_subscribers for update
  using (public.is_admin(auth.uid()));
