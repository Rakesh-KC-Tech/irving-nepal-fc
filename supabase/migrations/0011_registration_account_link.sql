-- Links a registration to the real portal account created for it, once an
-- admin converts it (see convertRegistrationToAccount in
-- src/app/admin/registrations/actions.ts). Null until conversion happens.
alter table public.registrations
  add column linked_profile_id uuid references public.profiles (id) on delete set null;
