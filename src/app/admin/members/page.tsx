import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/auth";
import { setMemberStatus, setMembershipExpiration } from "./actions";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gold/15 text-gold",
  approved: "bg-emerald-500/15 text-emerald-300",
  rejected: "bg-crimson/15 text-crimson-2",
  suspended: "bg-white/10 text-mist",
};

export default async function AdminMembersPage() {
  const { supabase } = await requireAdmin();

  const { data: members } = await supabase
    .from("profiles")
    .select(
      "id, full_name, role, status, member_number, membership_expires_at, created_at",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="min-w-0 flex flex-col gap-4">
      <h2 className="text-lg font-medium">Members</h2>

      <div className="min-w-0 overflow-x-auto rounded-md border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase text-mist">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Member No.</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Expires</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members?.map((member) => (
              <tr key={member.id} className="border-t border-line">
                <td className="px-4 py-2">
                  <Link
                    href={`/admin/members/${member.id}`}
                    className="underline"
                  >
                    {member.full_name ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-2 font-mono text-xs">
                  {member.member_number ?? "—"}
                </td>
                <td className="px-4 py-2">{member.role}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[member.status]}`}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <form className="flex items-center gap-1">
                    <input
                      type="date"
                      name="expiresAt"
                      defaultValue={member.membership_expires_at ?? ""}
                      className="bg-paper text-navy rounded border border-line px-1 py-0.5 text-xs"
                     />
                    <button
                      formAction={setMembershipExpiration.bind(
                        null,
                        member.id,
                      )}
                      className="rounded-md border border-line px-2 py-1 text-xs"
                    >
                      Save
                    </button>
                  </form>
                </td>
                <td className="px-4 py-2">
                  {member.role === "admin" ? (
                    <span className="text-xs text-mist-dim">—</span>
                  ) : (
                    <div className="flex gap-2">
                      <form>
                        <button
                          formAction={setMemberStatus.bind(
                            null,
                            member.id,
                            "approved",
                          )}
                          disabled={member.status === "approved"}
                          className="rounded-md border border-line px-2 py-1 text-xs disabled:opacity-40"
                        >
                          Approve
                        </button>
                      </form>
                      <form>
                        <button
                          formAction={setMemberStatus.bind(
                            null,
                            member.id,
                            "rejected",
                          )}
                          disabled={member.status === "rejected"}
                          className="rounded-md border border-line px-2 py-1 text-xs disabled:opacity-40"
                        >
                          Reject
                        </button>
                      </form>
                      <form>
                        <button
                          formAction={setMemberStatus.bind(
                            null,
                            member.id,
                            "suspended",
                          )}
                          disabled={member.status === "suspended"}
                          className="rounded-md border border-line px-2 py-1 text-xs disabled:opacity-40"
                        >
                          Suspend
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
