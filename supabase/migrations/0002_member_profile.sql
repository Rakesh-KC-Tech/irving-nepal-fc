-- Member profile details + auto-assigned membership number on approval.

alter table public.profiles
  add column phone text,
  add column date_of_birth date,
  add column emergency_contact_name text,
  add column emergency_contact_phone text,
  add column member_number text unique;

create sequence public.member_number_seq;

-- Extend the existing role/status guard trigger to also assign a
-- membership number the moment a profile's status becomes 'approved'.
-- Combined into one function (rather than a second trigger) so the
-- status is already corrected by the guard above before this check
-- runs — otherwise a member could smuggle status='approved' through
-- long enough for this same statement to hand out a member_number
-- before the guard resets status back down.
create or replace function public.enforce_profile_role_status()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin(auth.uid()) then
    new.role := old.role;
    new.status := old.status;
  end if;

  if new.status = 'approved' and new.member_number is null then
    new.member_number := 'INFC-' || lpad(nextval('public.member_number_seq')::text, 4, '0');
  end if;

  new.updated_at := now();
  return new;
end;
$$;
