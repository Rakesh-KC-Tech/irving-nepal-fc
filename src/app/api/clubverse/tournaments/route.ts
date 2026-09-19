import { NextResponse } from "next/server";
import { getTournaments, ClubverseError } from "@/lib/clubverse";

// Public tournament career history (titles, record, per-tournament results),
// pulled live from ClubVerse, for the static marketing site to render.
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
  try {
    const data = await getTournaments();
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (err) {
    const status = err instanceof ClubverseError ? err.status : 500;
    return NextResponse.json({ error: "Failed to load tournaments" }, { status, headers: CORS_HEADERS });
  }
}
