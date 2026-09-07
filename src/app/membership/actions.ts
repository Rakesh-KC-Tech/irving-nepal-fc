"use server";

import { redirect } from "next/navigation";
import { requireApproved } from "@/lib/supabase/auth";
import { stripe } from "@/lib/stripe";

export async function createCheckoutSession(planId: string) {
  const { supabase, user } = await requireApproved();

  const { data: plan } = await supabase
    .from("membership_plans")
    .select("id, name, description, price_cents")
    .eq("id", planId)
    .eq("active", true)
    .single();

  if (!plan) {
    throw new Error("Plan not found");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: plan.price_cents,
          product_data: {
            name: plan.name,
            description: plan.description ?? undefined,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      profile_id: user.id,
      plan_id: plan.id,
    },
    success_url: `${siteUrl}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/membership`,
  });

  await supabase.from("payments").insert({
    profile_id: user.id,
    plan_id: plan.id,
    stripe_checkout_session_id: session.id,
    amount_cents: plan.price_cents,
    status: "pending",
  });

  redirect(session.url!);
}
