-- Allow ClubVerse as a news source alongside youtube/instagram/facebook/manual.
alter table public.news_articles drop constraint news_articles_source_platform_check;
alter table public.news_articles add constraint news_articles_source_platform_check
  check (source_platform in ('youtube', 'instagram', 'facebook', 'clubverse', 'manual'));

alter table public.social_ingest_log drop constraint social_ingest_log_platform_check;
alter table public.social_ingest_log add constraint social_ingest_log_platform_check
  check (platform in ('youtube', 'instagram', 'facebook', 'clubverse'));
