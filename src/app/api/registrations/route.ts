import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// The "Join The Club" form lives on the static marketing site, which has
// no backend of its own, so it posts here cross-origin. There's no logged
// -in user at this point (that's the whole point of the form), so this
// writes with the service client, same as the Stripe webhook does.
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

  const firstName = typeof body?.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body?.lastName === "string" ? body.lastName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const dateOfBirth = typeof body?.dateOfBirth === "string" ? body.dateOfBirth : "";
  const plan = typeof body?.plan === "string" ? body.plan.trim() : "";
  const preferredPosition = typeof body?.preferredPosition === "string" ? body.preferredPosition.trim() : null;
  const notes = typeof body?.notes === "string" ? body.notes.trim() : null;

  if (!firstName || !lastName || !phone || !dateOfBirth || !plan) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400, headers: CORS_HEADERS },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("registrations").insert({
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    date_of_birth: dateOfBirth,
    plan,
    preferred_position: preferredPosition || null,
    notes: notes || null,
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to save registration" },
      { status: 500, headers: CORS_HEADERS },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201, headers: CORS_HEADERS });
}
