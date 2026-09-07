import { requireAdmin } from "@/lib/supabase/auth";

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-200 text-gray-700",
};

export default async function AdminPaymentsPage() {
  const { supabase } = await requireAdmin();

  const { data: payments } = await supabase
    .from("payments")
    .select(
      "id, amount_cents, status, created_at, paid_at, profiles(full_name), membership_plans(name)",
    )
    .order("created_at", { ascending: false });

  const totalRevenueCents =
    payments
      ?.filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount_cents, 0) ?? 0;

  return (
    <div className="min-w-0 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Payments</h2>
        <p className="text-sm text-gray-500">
          Total revenue: {formatCents(totalRevenueCents)}
        </p>
      </div>

      <div className="min-w-0 overflow-x-auto rounded-md border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Member</th>
              <th className="px-4 py-2">Plan</th>
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
                <td className="px-4 py-2">
                  {(p.profiles as unknown as { full_name: string | null })
                    ?.full_name ?? "—"}
                </td>
                <td className="px-4 py-2">
                  {(p.membership_plans as unknown as { name: string })
                    ?.name ?? "—"}
                </td>
                <td className="px-4 py-2">{formatCents(p.amount_cents)}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[p.status] ?? ""}`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {payments?.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-gray-500" colSpan={5}>
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
