import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// The contact form lives on the static marketing site (no backend of its
// own), so it posts here cross-origin; no logged-in user, so this writes
// with the service client, same as /api/registrations.
const STORE_ORIGIN = process.env.STORE_SITE_URL ?? "https://irvingnepalfc.com";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": STORE_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBJECTS = ["General Inquiry", "Sponsorship", "Player Registration", "Academy / Youth", "Press / Media"];

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  // Hidden field real visitors never see or fill in; bots usually do. Pretend
  // success so they don't learn to adapt.
  if (typeof body?.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 201, headers: CORS_HEADERS });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!name || !message) {
    return NextResponse.json({ error: "Name and message are required" }, { status: 400, headers: CORS_HEADERS });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400, headers: CORS_HEADERS });
  }
  if (!SUBJECTS.includes(subject)) {
    return NextResponse.json({ error: "Invalid subject" }, { status: 400, headers: CORS_HEADERS });
  }
  if (name.length > 120 || email.length > 254 || message.length > 5000) {
    return NextResponse.json({ error: "Message is too long" }, { status: 400, headers: CORS_HEADERS });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("contact_messages").insert({ name, email, subject, message });

  if (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500, headers: CORS_HEADERS });
  }

  return NextResponse.json({ ok: true }, { status: 201, headers: CORS_HEADERS });
}
