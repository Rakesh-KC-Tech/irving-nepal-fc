import { NextResponse } from "next/server";
import { getClub, ClubverseError } from "@/lib/clubverse";

// Public club profile + membership plan (fee amounts, period, benefits),
// pulled live from ClubVerse, for the static marketing site to render —
// e.g. on the Join page, so dues don't need to be hand-updated in two places.
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
    const data = await getClub();
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (err) {
    const status = err instanceof ClubverseError ? err.status : 500;
    const detail = err instanceof ClubverseError ? { code: err.code, message: err.message } : { message: String(err) };
    return NextResponse.json({ error: "Failed to load club info", detail }, { status, headers: CORS_HEADERS });
  }
}
