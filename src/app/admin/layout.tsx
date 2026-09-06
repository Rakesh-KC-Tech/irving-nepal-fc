import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/auth";
import { signout } from "../login/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-sm underline">
            Members
          </Link>
          <Link href="/admin/teams" className="text-sm underline">
            Teams
          </Link>
          <Link href="/admin/events" className="text-sm underline">
            Events
          </Link>
          <Link href="/admin/announcements" className="text-sm underline">
            Announcements
          </Link>
          <Link href="/admin/documents" className="text-sm underline">
            Documents
          </Link>
          <Link href="/dashboard" className="text-sm underline">
            Back to dashboard
          </Link>
          <form>
            <button
              formAction={signout}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
