import Link from "next/link";
import { requireApproved } from "@/lib/supabase/auth";

export default async function AnnouncementsPage() {
  const { supabase, user } = await requireApproved();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, body, created_at")
    .order("created_at", { ascending: false });

  // Visiting this page marks everything currently listed as read.
  if (announcements && announcements.length > 0) {
    await supabase.from("announcement_reads").upsert(
      announcements.map((a) => ({
        announcement_id: a.id,
        profile_id: user.id,
        read_at: new Date().toISOString(),
      })),
    );
  }

  return (
    <div className="mx-auto flex w-full min-w-0 min-h-screen max-w-2xl flex-col gap-4 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Announcements</h1>
        <Link href="/dashboard" className="text-sm underline">
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {announcements?.map((a) => (
          <div
            key={a.id}
            className="rounded-md border border-line p-4 text-sm"
          >
            <p className="font-medium">{a.title}</p>
            <p className="text-xs text-mist">
              {new Date(a.created_at).toLocaleString()}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-mist">{a.body}</p>
          </div>
        ))}
        {announcements?.length === 0 && (
          <p className="text-sm text-mist">No announcements yet.</p>
        )}
      </div>
    </div>
  );
}
