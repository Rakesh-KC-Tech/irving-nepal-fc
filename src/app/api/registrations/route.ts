import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { stripe } from "@/lib/stripe";
import { getClub } from "@/lib/clubverse";

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

  // Pricing comes from ClubVerse (live), not a hardcoded number, so a fee
  // change there is reflected here automatically like everywhere else.
  let amountCents: number;
  try {
    const { club } = await getClub();
    const dollars =
      plan === "Membership"
        ? club.membershipPlan.feeAmount
        : plan === "Student Membership"
          ? club.membershipPlan.studentFeeAmount
          : null;
    if (dollars == null) {
      return NextResponse.json(
        { error: "Unknown plan" },
        { status: 400, headers: CORS_HEADERS },
      );
    }
    amountCents = Math.round(dollars * 100);
  } catch {
    return NextResponse.json(
      { error: "Unable to determine plan pricing right now" },
      { status: 503, headers: CORS_HEADERS },
    );
  }

  const supabase = createServiceClient();
  const { data: registration, error } = await supabase
    .from("registrations")
    .insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      date_of_birth: dateOfBirth,
      plan,
      preferred_position: preferredPosition || null,
      notes: notes || null,
      amount_cents: amountCents,
    })
    .select("id")
    .single();

  if (error || !registration) {
    return NextResponse.json(
      { error: "Failed to save registration" },
      { status: 500, headers: CORS_HEADERS },
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    invoice_creation: { enabled: true },
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: `${plan} — Irving Nepal FC`,
            description: `${firstName} ${lastName}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { registration_id: registration.id },
    success_url: `${STORE_ORIGIN}/?registration=success`,
    cancel_url: `${STORE_ORIGIN}/?registration=cancelled`,
  });

  await supabase
    .from("registrations")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", registration.id);

  return NextResponse.json(
    { ok: true, checkoutUrl: session.url },
    { status: 201, headers: CORS_HEADERS },
  );
}
