import { NextResponse } from "next/server";
import { getMembers, ClubverseError } from "@/lib/clubverse";

// Public feed used only to match the marketing site's curated roster to a
// real ClubVerse photo by name. Deliberately returns just name + photoUrl —
// never role, position, join date, or (obviously) email/phone — even though
// this key isn't scoped for contact info anyway.
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
    const data = await getMembers({ limit: 200 });
    const members = data.members
      .filter((m) => m.photoUrl)
      .map((m) => ({ name: m.name, photoUrl: m.photoUrl }));
    return NextResponse.json({ members }, { headers: CORS_HEADERS });
  } catch (err) {
    const status = err instanceof ClubverseError ? err.status : 500;
    return NextResponse.json({ error: "Failed to load members" }, { status, headers: CORS_HEADERS });
  }
}
