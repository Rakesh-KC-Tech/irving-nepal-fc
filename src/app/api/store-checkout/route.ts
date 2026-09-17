import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { findKit, findGear } from "@/lib/store-catalog";

// The store lives on the static marketing site (irvingnepalfc.com), which
// has no backend of its own, so its checkout button calls this endpoint
// cross-origin and gets redirected to Stripe's hosted checkout page.
const STORE_ORIGIN = process.env.STORE_SITE_URL ?? "https://irvingnepalfc.com";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": STORE_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type CartLine = {
  type: "kit" | "gear";
  id: string;
  size?: string;
  qty: number;
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const items: CartLine[] | undefined = body?.items;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "Cart is empty" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const line_items: {
    price_data: {
      currency: string;
      unit_amount: number;
      product_data: { name: string; description?: string };
    };
    quantity: number;
  }[] = [];

  for (const item of items) {
    const qty = Math.max(1, Math.min(20, Math.floor(Number(item.qty) || 1)));

    if (item.type === "kit") {
      const kit = findKit(item.id);
      if (!kit) {
        return NextResponse.json(
          { error: `Unknown kit: ${item.id}` },
          { status: 400, headers: CORS_HEADERS },
        );
      }
      if (!item.size || !kit.sizes.includes(item.size as (typeof kit.sizes)[number])) {
        return NextResponse.json(
          { error: `Invalid size for ${kit.name}` },
          { status: 400, headers: CORS_HEADERS },
        );
      }
      line_items.push({
        price_data: {
          currency: "usd",
          unit_amount: kit.priceCents,
          product_data: { name: kit.name, description: `Size ${item.size}` },
        },
        quantity: qty,
      });
    } else if (item.type === "gear") {
      const gear = findGear(item.id);
      if (!gear) {
        return NextResponse.json(
          { error: `Unknown item: ${item.id}` },
          { status: 400, headers: CORS_HEADERS },
        );
      }
      line_items.push({
        price_data: {
          currency: "usd",
          unit_amount: gear.priceCents,
          product_data: { name: gear.name },
        },
        quantity: qty,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid item type" },
        { status: 400, headers: CORS_HEADERS },
      );
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    shipping_address_collection: { allowed_countries: ["US"] },
    success_url: `${STORE_ORIGIN}/?store_order=success`,
    cancel_url: `${STORE_ORIGIN}/?store_order=cancelled`,
  });

  return NextResponse.json({ url: session.url }, { headers: CORS_HEADERS });
}
