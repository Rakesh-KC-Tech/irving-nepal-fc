import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// The single most recent published article flagged as a site-wide
// announcement. The marketing site shows this as a popup/banner, once per
// browsing session per article — an admin has to explicitly opt an article
// into this (see is_announcement on news_articles), so routine articles
// never trigger it.
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
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("news_articles")
    .select("id, slug, headline, category, excerpt, featured_image_url, published_at")
    .eq("status", "published")
    .eq("is_announcement", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Failed to load announcement" }, { status: 500, headers: CORS_HEADERS });
  }

  if (!data) {
    return NextResponse.json({ announcement: null }, { headers: CORS_HEADERS });
  }

  return NextResponse.json(
    { announcement: { ...data, url: `https://portal.irvingnepalfc.com/news/${data.slug}` } },
    { headers: CORS_HEADERS },
  );
}
