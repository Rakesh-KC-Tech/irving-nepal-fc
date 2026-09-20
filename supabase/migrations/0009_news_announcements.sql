-- Lets an admin flag a published article as an important, site-wide
-- announcement (shown as a popup/banner on the marketing site), separate
-- from its category — a "Tournaments" or "Sponsors" article can still be
-- announcement-worthy without changing what category it's filed under.
alter table public.news_articles
  add column is_announcement boolean not null default false;

create index news_articles_announcement_idx
  on public.news_articles (is_announcement, published_at desc)
  where is_announcement = true and status = 'published';
