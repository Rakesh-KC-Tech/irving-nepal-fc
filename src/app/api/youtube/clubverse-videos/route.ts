import { NextResponse } from "next/server";
import { fetchLatestYoutubeVideos } from "@/lib/news-ingest/youtube";

// ClubVerse (@clubverseapp) records and uploads full match videos to their
// own YouTube channel — this exposes a lightweight list of their recent
// uploads so the marketing site can match a completed game to a video by
// date/team name, without depending on any of ClubVerse's private data.
const CLUBVERSE_YOUTUBE_CHANNEL_ID = "UCmXKYDgofmgAjr-0xrLlF8A";

export const revalidate = 3600;

const STORE_ORIGIN = process.env.STORE_SITE_URL ?? "https://irvingnepalfc.com";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": STORE_ORIGIN,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ videos: [] }, { headers: CORS_HEADERS });
  }

  try {
    const videos = await fetchLatestYoutubeVideos(CLUBVERSE_YOUTUBE_CHANNEL_ID, apiKey, 50);
    return NextResponse.json(
      {
        videos: videos.map((v) => ({
          videoId: v.externalId,
          title: v.title,
          publishedAt: v.publishedAt,
        })),
      },
      { headers: CORS_HEADERS },
    );
  } catch {
    return NextResponse.json({ videos: [] }, { headers: CORS_HEADERS });
  }
}
