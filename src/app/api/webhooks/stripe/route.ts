import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const profileId = session.metadata?.profile_id;
    const registrationId = session.metadata?.registration_id;

    if (registrationId) {
      const supabase = createServiceClient();

      let stripeInvoiceId: string | null = null;
      let invoiceUrl: string | null = null;
      if (session.invoice) {
        const invoice = await stripe.invoices.retrieve(session.invoice as string);
        stripeInvoiceId = invoice.id ?? null;
        invoiceUrl = invoice.hosted_invoice_url ?? null;
      }

      await supabase
        .from("registrations")
        .update({
          payment_status: "paid",
          paid_at: new Date().toISOString(),
          stripe_invoice_id: stripeInvoiceId,
          invoice_url: invoiceUrl,
        })
        .eq("id", registrationId)
        .eq("stripe_checkout_session_id", session.id);
    }

    if (profileId) {
      const supabase = createServiceClient();

      await supabase
        .from("payments")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq("stripe_checkout_session_id", session.id);

      // Extend from today, or from the current expiry if it's still in
      // the future, so renewing early doesn't lose remaining time.
      const { data: profile } = await supabase
        .from("profiles")
        .select("membership_expires_at")
        .eq("id", profileId)
        .single();

      const currentExpiry = profile?.membership_expires_at
        ? new Date(profile.membership_expires_at)
        : null;
      const base =
        currentExpiry && currentExpiry.getTime() > Date.now()
          ? currentExpiry
          : new Date();
      const newExpiry = new Date(base);
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);

      await supabase
        .from("profiles")
        .update({
          membership_expires_at: newExpiry.toISOString().slice(0, 10),
        })
        .eq("id", profileId);
    }
  }

  return NextResponse.json({ received: true });
}
