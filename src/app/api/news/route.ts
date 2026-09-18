import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Public, read-only feed of published news for the static marketing site
// (irvingnepalfc.com), which has no backend of its own and fetches this
// cross-origin to render its News page and homepage "Latest News" section.
const STORE_ORIGIN = process.env.STORE_SITE_URL ?? "https://irvingnepalfc.com";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": STORE_ORIGIN,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(24, Math.max(1, Number(searchParams.get("limit")) || 6));
  const category = searchParams.get("category");

  const supabase = await createClient();
  let query = supabase
    .from("news_articles")
    .select("slug, headline, category, excerpt, featured_image_url, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (category) query = query.eq("category", category);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to load news" }, { status: 500, headers: CORS_HEADERS });
  }

  const articles = (data ?? []).map((a) => ({
    ...a,
    url: `https://portal.irvingnepalfc.com/news/${a.slug}`,
  }));

  return NextResponse.json({ articles }, { headers: CORS_HEADERS });
}
