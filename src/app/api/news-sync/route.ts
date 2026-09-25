import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { slugify } from "@/lib/news";
import { fetchLatestYoutubeVideos } from "@/lib/news-ingest/youtube";
import { rewriteAsArticle } from "@/lib/news-ingest/rewrite";
import { getGames, getTournaments } from "@/lib/clubverse";
import { buildMatchReport } from "@/lib/news-ingest/clubverse-news";
import { generateMatchGraphic, uploadMatchGraphic } from "@/lib/news-ingest/match-graphic";

// Triggered by Vercel Cron (see vercel.json). Pulls the latest posts from
// each connected official account, skips anything already logged in
// social_ingest_log (dedup), rewrites genuinely newsworthy ones into a
// draft article for an admin to review and publish — nothing is
// auto-published.
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const results: { platform: string; externalId: string; outcome: string }[] = [];

  const youtubeApiKey = process.env.YOUTUBE_API_KEY;
  const youtubeChannelId = process.env.YOUTUBE_CHANNEL_ID;

  if (youtubeApiKey && youtubeChannelId) {
    try {
      const videos = await fetchLatestYoutubeVideos(youtubeChannelId, youtubeApiKey, 5);

      for (const video of videos) {
        const { data: existing } = await supabase
          .from("social_ingest_log")
          .select("id")
          .eq("platform", "youtube")
          .eq("external_id", video.externalId)
          .maybeSingle();

        if (existing) {
          results.push({ platform: "youtube", externalId: video.externalId, outcome: "already_processed" });
          continue;
        }

        const rewritten = await rewriteAsArticle({
          platform: "youtube",
          sourceTitle: video.title,
          sourceText: video.description,
          sourceUrl: video.url,
        });

        if (!rewritten) {
          await supabase.from("social_ingest_log").insert({
            platform: "youtube",
            external_id: video.externalId,
            outcome: "error",
            detail: "Rewrite failed or returned invalid data",
            raw_snapshot: video,
          });
          results.push({ platform: "youtube", externalId: video.externalId, outcome: "error" });
          continue;
        }

        if (!rewritten.relevant) {
          await supabase.from("social_ingest_log").insert({
            platform: "youtube",
            external_id: video.externalId,
            outcome: "skipped",
            detail: "Not deemed newsworthy",
            raw_snapshot: video,
          });
          results.push({ platform: "youtube", externalId: video.externalId, outcome: "skipped" });
          continue;
        }

        const { data: article, error: insertError } = await supabase
          .from("news_articles")
          .insert({
            slug: slugify(rewritten.headline),
            headline: rewritten.headline,
            category: rewritten.category,
            excerpt: rewritten.excerpt,
            body: rewritten.body,
            featured_image_url: video.thumbnail,
            tags: rewritten.tags,
            status: "draft",
            source_platform: "youtube",
            source_url: video.url,
          })
          .select("id")
          .single();

        await supabase.from("social_ingest_log").insert({
          platform: "youtube",
          external_id: video.externalId,
          outcome: insertError ? "error" : "drafted",
          article_id: article?.id ?? null,
          detail: insertError ? insertError.message : "Drafted for review",
          raw_snapshot: video,
        });

        results.push({ platform: "youtube", externalId: video.externalId, outcome: insertError ? "error" : "drafted" });
      }
    } catch (err) {
      results.push({ platform: "youtube", externalId: "n/a", outcome: `fetch_error: ${err}` });
    }
  }

  // Instagram/Facebook ingestion requires a Meta Developer App + page
  // access token, which the club needs to set up on their own — wired up
  // once IG_ACCESS_TOKEN / FB_ACCESS_TOKEN are available.

  if (process.env.CLUBVERSE_API_KEY) {
    try {
      const [gamesData, tournamentsData] = await Promise.all([
        getGames({ recent: 20, upcoming: 1 }),
        getTournaments(),
      ]);
      const slugByTournamentId = new Map(
        tournamentsData.career.history.map((t) => [t.tournamentId, t.publicSlug]),
      );

      for (const game of gamesData.recent) {
        if (game.source !== "tournament") continue;

        const { data: existing } = await supabase
          .from("social_ingest_log")
          .select("id")
          .eq("platform", "clubverse")
          .eq("external_id", game.id)
          .maybeSingle();

        if (existing) {
          results.push({ platform: "clubverse", externalId: game.id, outcome: "already_processed" });
          continue;
        }

        const draft = buildMatchReport(game, game.tournamentId ? (slugByTournamentId.get(game.tournamentId) ?? null) : null);

        if (!draft) {
          await supabase.from("social_ingest_log").insert({
            platform: "clubverse",
            external_id: game.id,
            outcome: "skipped",
            detail: "Not a completed, scored tournament match involving the club",
            raw_snapshot: game,
          });
          results.push({ platform: "clubverse", externalId: game.id, outcome: "skipped" });
          continue;
        }

        // A designed final-score graphic (real crests + real score) rather
        // than a fabricated match photo — failure here shouldn't block the
        // article draft itself, just leave it without an image.
        let featuredImageUrl: string | null = null;
        try {
          const graphicBuffer = await generateMatchGraphic(game);
          featuredImageUrl = await uploadMatchGraphic(game.id, graphicBuffer);
        } catch {
          featuredImageUrl = null;
        }

        const { data: article, error: insertError } = await supabase
          .from("news_articles")
          .insert({
            slug: slugify(draft.headline),
            headline: draft.headline,
            category: draft.category,
            excerpt: draft.excerpt,
            body: draft.body,
            featured_image_url: featuredImageUrl,
            tags: draft.tags,
            status: "draft",
            source_platform: "clubverse",
            source_url: draft.sourceUrl,
          })
          .select("id")
          .single();

        await supabase.from("social_ingest_log").insert({
          platform: "clubverse",
          external_id: game.id,
          outcome: insertError ? "error" : "drafted",
          article_id: article?.id ?? null,
          detail: insertError ? insertError.message : "Drafted for review",
          raw_snapshot: game,
        });

        results.push({ platform: "clubverse", externalId: game.id, outcome: insertError ? "error" : "drafted" });
      }
    } catch (err) {
      results.push({ platform: "clubverse", externalId: "n/a", outcome: `fetch_error: ${err}` });
    }
  }

  return NextResponse.json({ results });
}
