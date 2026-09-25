-- Lets a Match Updates article link back to the exact ClubverseGame it
-- reports on, so the article page can point visitors to that match's real
-- card (crest, score, venue, Watch link) on the marketing site's Fixtures
-- & Calendar page instead of only linking out to ClubVerse's own site.
alter table public.news_articles
  add column source_game_id text;
