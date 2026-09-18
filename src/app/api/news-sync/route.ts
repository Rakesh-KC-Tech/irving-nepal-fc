import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { slugify } from "@/lib/news";
import { fetchLatestYoutubeVideos } from "@/lib/news-ingest/youtube";
import { rewriteAsArticle } from "@/lib/news-ingest/rewrite";

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

  return NextResponse.json({ results });
}
