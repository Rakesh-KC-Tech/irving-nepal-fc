-- Admin: audit log for consequential admin actions. Append-only (no
-- update/delete policy) so the trail can't be edited after the fact.

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null,
  target_type text,
  target_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

create policy "audit_logs: admins can view" on public.audit_logs
  for select using (public.is_admin(auth.uid()));
create policy "audit_logs: admins can insert" on public.audit_logs
  for insert with check (public.is_admin(auth.uid()));
