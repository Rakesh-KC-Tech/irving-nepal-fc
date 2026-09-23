-- Stripe auto-generates a proper Invoice (using the account's Branding and
-- Invoice template settings) once a registration's Checkout Session is paid
-- (invoice_creation.enabled on the session — see /api/registrations).
-- These columns let the admin panel link straight to it.
alter table public.registrations
  add column stripe_invoice_id text,
  add column invoice_url text;
