-- Payment tracking for registrations. A registrant has no profile yet at
-- submission time (that only exists after admin conversion), so payment
-- state lives directly on the registration row instead of the profile-
-- scoped payments table.
alter table public.registrations
  add column amount_cents integer,
  add column stripe_checkout_session_id text unique,
  add column payment_status text not null default 'unpaid',
  add column paid_at timestamptz;
