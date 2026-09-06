import Link from "next/link";
import { requireUser } from "@/lib/supabase/auth";
import { signout } from "../login/actions";

const STATUS_MESSAGE: Record<string, string> = {
  pending:
    "Your membership application is awaiting review. An admin will approve your account soon.",
  rejected:
    "Your membership application was not approved. Contact the club if you think this is a mistake.",
  suspended: "Your account has been suspended. Contact the club for details.",
};

export default async function DashboardPage() {
  const { user, profile } = await requireUser();

  const isApproved = profile?.status === "approved";

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <form>
          <button
            formAction={signout}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            Log out
          </button>
        </form>
      </div>

      {!isApproved && (
        <div className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {STATUS_MESSAGE[profile?.status ?? "pending"]}
        </div>
      )}

      <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-700">
        <p>Email: {user.email}</p>
        <p>Role: {profile?.role ?? "member"}</p>
        <p>Status: {profile?.status ?? "pending"}</p>
      </div>

      {isApproved && (
        <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-700">
          Full member area (teams, matches, payments) is coming in later
          steps.
        </div>
      )}

      {profile?.role === "admin" && (
        <Link
          href="/admin"
          className="rounded-md bg-black px-4 py-2 text-center text-sm font-medium text-white"
        >
          Go to Admin Dashboard
        </Link>
      )}
    </div>
  );
}
