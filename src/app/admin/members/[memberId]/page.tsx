import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const { supabase } = await requireAdmin();

  const { data: member } = await supabase
    .from("profiles")
    .select(
      "id, full_name, role, status, member_number, membership_expires_at, phone, date_of_birth, emergency_contact_name, emergency_contact_phone, created_at",
    )
    .eq("id", memberId)
    .single();

  if (!member) {
    notFound();
  }

  const { data: teams } = await supabase
    .from("team_members")
    .select("jersey_number, position, teams(id, name)")
    .eq("profile_id", memberId);

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount_cents, status, created_at, paid_at")
    .eq("profile_id", memberId)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{member.full_name ?? "—"}</h2>
        <Link href="/admin/members" className="text-sm underline">
          All members
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-md border border-gray-200 p-4 text-sm">
        <p>Member No.: {member.member_number ?? "—"}</p>
        <p>Role: {member.role}</p>
        <p>Status: {member.status}</p>
        <p>
          Expires:{" "}
          {member.membership_expires_at
            ? new Date(member.membership_expires_at).toLocaleDateString()
            : "—"}
        </p>
        <p>Phone: {member.phone ?? "—"}</p>
        <p>
          Date of birth:{" "}
          {member.date_of_birth
            ? new Date(member.date_of_birth).toLocaleDateString()
            : "—"}
        </p>
        <p>Emergency contact: {member.emergency_contact_name ?? "—"}</p>
        <p>Emergency phone: {member.emergency_contact_phone ?? "—"}</p>
        <p>
          Member since: {new Date(member.created_at).toLocaleDateString()}
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium uppercase text-gray-500">
          Teams
        </h3>
        <div className="flex flex-col gap-2">
          {teams?.map((t, i) => (
            <div
              key={i}
              className="rounded-md border border-gray-200 p-3 text-sm"
            >
              {(t.teams as unknown as { name: string })?.name}
              {t.position ? ` — ${t.position}` : ""}
              {t.jersey_number ? ` #${t.jersey_number}` : ""}
            </div>
          ))}
          {teams?.length === 0 && (
            <p className="text-sm text-gray-500">Not on any team.</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium uppercase text-gray-500">
          Payment History
        </h3>
        <div className="overflow-hidden rounded-md border border-gray-200">
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
