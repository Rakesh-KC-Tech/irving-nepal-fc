import Link from "next/link";
import { requireApproved } from "@/lib/supabase/auth";
import { createCheckoutSession } from "./actions";

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function MembershipPage() {
  const { supabase, user, profile } = await requireApproved();

  const { data: plans } = await supabase
    .from("membership_plans")
    .select("id, name, description, price_cents")
    .eq("active", true)
    .order("price_cents");

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount_cents, status, created_at, paid_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex w-full min-w-0 min-h-screen max-w-2xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Membership</h1>
        <Link href="/dashboard" className="text-sm underline">
          Back to dashboard
        </Link>
      </div>

      <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-700">
        <p>
          Current expiration:{" "}
          {profile?.membership_expires_at
            ? new Date(profile.membership_expires_at).toLocaleDateString()
            : "—"}
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium uppercase text-gray-500">
          Renew / Pay
        </h2>
        <div className="flex flex-col gap-3">
          {plans?.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between rounded-md border border-gray-200 p-4 text-sm"
            >
              <div>
                <p className="font-medium">{plan.name}</p>
                {plan.description && (
                  <p className="text-gray-500">{plan.description}</p>
                )}
                <p className="mt-1 font-mono">
                  {formatCents(plan.price_cents)}
                </p>
              </div>
              <form>
                <button
                  formAction={createCheckoutSession.bind(null, plan.id)}
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
                >
                  Pay Now
                </button>
              </form>
            </div>
          ))}
          {plans?.length === 0 && (
            <p className="text-sm text-gray-500">
              No membership plans available right now.
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium uppercase text-gray-500">
          Payment History
        </h2>
        <div className="min-w-0 overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments?.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{formatCents(p.amount_cents)}</td>
                  <td className="px-4 py-2 capitalize">{p.status}</td>
                </tr>
              ))}
              {payments?.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-gray-500" colSpan={3}>
                    No payments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
