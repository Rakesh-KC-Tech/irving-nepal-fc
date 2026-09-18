-- News & Updates system: articles (manual or auto-drafted from social
-- media), plus a dedup log so the same social post never creates two
-- articles. Articles are publicly readable once published — this is
-- marketing-site content, not a member-only feature.

create table public.news_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  headline text not null,
  category text not null check (category in (
    'Match Updates', 'Club News', 'Team News', 'Tournaments',
    'Events', 'Announcements', 'Community', 'Sponsors'
  )),
  excerpt text not null,
  body text not null,
  featured_image_url text,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  source_platform text check (source_platform in ('youtube', 'instagram', 'facebook', 'manual')),
  source_url text,
  published_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index news_articles_status_published_idx
  on public.news_articles (status, published_at desc);
create index news_articles_category_idx on public.news_articles (category);

-- One row per source post ever seen, so a re-run of the sync job never
-- drafts the same YouTube video / IG post / FB post twice.
create table public.social_ingest_log (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('youtube', 'instagram', 'facebook')),
  external_id text not null,
  outcome text not null check (outcome in ('drafted', 'skipped', 'error')),
  article_id uuid references public.news_articles (id) on delete set null,
  detail text,
  raw_snapshot jsonb,
  processed_at timestamptz not null default now(),
  unique (platform, external_id)
);

alter table public.news_articles enable row level security;
alter table public.social_ingest_log enable row level security;

create policy "news_articles: public can view published" on public.news_articles
  for select using (status = 'published');
create policy "news_articles: admins manage everything" on public.news_articles
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "social_ingest_log: admins view" on public.social_ingest_log
  for select using (public.is_admin(auth.uid()));
-- Inserts/updates come only from the service-role sync job, which
-- bypasses RLS entirely — no policy needed for that path.

create or replace function public.set_news_article_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger news_articles_set_updated_at
  before update on public.news_articles
  for each row execute function public.set_news_article_updated_at();
