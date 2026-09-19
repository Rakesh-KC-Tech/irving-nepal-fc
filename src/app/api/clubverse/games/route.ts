import { NextRequest, NextResponse } from "next/server";
import { getGames, ClubverseError } from "@/lib/clubverse";

// Public feed of recent results + upcoming fixtures, pulled live from
// ClubVerse, for the static marketing site to render.
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
  const recent = Math.min(50, Math.max(1, Number(searchParams.get("recent")) || 6));
  const upcoming = Math.min(50, Math.max(1, Number(searchParams.get("upcoming")) || 6));

  try {
    const data = await getGames({ recent, upcoming });
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (err) {
    const status = err instanceof ClubverseError ? err.status : 500;
    return NextResponse.json({ error: "Failed to load games" }, { status, headers: CORS_HEADERS });
  }
}
