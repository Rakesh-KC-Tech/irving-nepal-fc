import Image from "next/image";
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
    <div className="mx-auto flex w-full min-w-0 min-h-screen max-w-4xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2 text-2xl font-semibold">
          <Image src="/crest.png" alt="Irving Nepal FC crest" width={32} height={32} />
          Admin
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm underline">
            Back to dashboard
          </Link>
          <form>
            <button
              formAction={signout}
              className="rounded-md border border-line px-3 py-1.5 text-sm"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
      <nav className="flex flex-wrap items-center gap-3 border-b border-line pb-3">
        <Link href="/admin/members" className="text-sm underline">
          Members
        </Link>
        <Link href="/admin/registrations" className="text-sm underline">
          Registrations
        </Link>
        <Link href="/admin/messages" className="text-sm underline">
          Messages
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
        <Link href="/admin/news" className="text-sm underline">
          News
        </Link>
        <Link href="/admin/documents" className="text-sm underline">
          Documents
        </Link>
        <Link href="/admin/plans" className="text-sm underline">
          Plans
        </Link>
        <Link href="/admin/payments" className="text-sm underline">
          Payments
        </Link>
        <Link href="/admin/audit-logs" className="text-sm underline">
          Audit Logs
        </Link>
      </nav>
      {children}
    </div>
  );
}
