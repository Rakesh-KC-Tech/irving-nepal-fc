import Link from "next/link";
import { requireApproved } from "@/lib/supabase/auth";

export default async function MembershipSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const { supabase } = await requireApproved();

  const { data: payment } = sessionId
    ? await supabase
        .from("payments")
        .select("status, amount_cents")
        .eq("stripe_checkout_session_id", sessionId)
        .single()
    : { data: null };

  const isPaid = payment?.status === "paid";

  return (
    <div className="mx-auto flex w-full min-w-0 min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">
        {isPaid ? "Payment Received" : "Processing Payment…"}
      </h1>
      <p className="text-sm text-mist">
        {isPaid
          ? "Thanks! Your membership has been extended."
          : "We're confirming your payment with Stripe — this page will catch up in a moment. Refresh if it doesn't update."}
      </p>
      <Link
        href="/membership"
        className="rounded-md bg-crimson px-4 py-2 text-sm font-medium text-white"
      >
        Back to Membership
      </Link>
    </div>
  );
}
