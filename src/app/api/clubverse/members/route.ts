import { NextResponse } from "next/server";
import { getMembers, ClubverseError } from "@/lib/clubverse";

// Public feed of the club directory: name, photo, board/member role, and
// playing position. Deliberately never returns join date or contact info
// (email/phone) — this key isn't even scoped for those, but the route
// stays minimal on purpose regardless.
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
    const members = data.members.map((m) => ({
      name: m.name,
      photoUrl: m.photoUrl,
      role: m.role,
      position: m.position,
    }));
    return NextResponse.json({ members, total: data.total }, { headers: CORS_HEADERS });
  } catch (err) {
    const status = err instanceof ClubverseError ? err.status : 500;
    return NextResponse.json({ error: "Failed to load members" }, { status, headers: CORS_HEADERS });
  }
}
