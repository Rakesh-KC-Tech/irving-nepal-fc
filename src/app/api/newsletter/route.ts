import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Newsletter signup from the static marketing site footer; anonymous, so it
// writes with the service client like /api/contact.
const STORE_ORIGIN = process.env.STORE_SITE_URL ?? "https://irvingnepalfc.com";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": STORE_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (typeof body?.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 201, headers: CORS_HEADERS });
  }

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400, headers: CORS_HEADERS });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({ email });

  // 23505 = already subscribed (unique index on lower(email)). Same friendly
  // result as a first signup so the form never reveals who is on the list.
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500, headers: CORS_HEADERS });
  }

  return NextResponse.json({ ok: true }, { status: 201, headers: CORS_HEADERS });
}
