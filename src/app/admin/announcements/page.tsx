import { requireAdmin } from "@/lib/supabase/auth";
import { createAnnouncement, deleteAnnouncement } from "./actions";

export default async function AdminAnnouncementsPage() {
  const { supabase } = await requireAdmin();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, body, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="min-w-0 flex flex-col gap-6">
      <h2 className="text-lg font-medium">Announcements</h2>

      <form className="flex flex-col gap-3 rounded-md border border-gray-200 p-4">
        <h3 className="text-sm font-medium">Post an announcement</h3>
        <input
          name="title"
          type="text"
          placeholder="Title"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <textarea
          name="body"
          placeholder="Message"
          required
          rows={4}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          formAction={createAnnouncement}
          className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
        >
          Post
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {announcements?.map((a) => (
          <div key={a.id} className="rounded-md border border-gray-200 p-3 text-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(a.created_at).toLocaleString()}
                </p>
              </div>
              <form>
                <button
                  formAction={deleteAnnouncement.bind(null, a.id)}
                  className="text-xs text-red-600 underline"
                >
                  Delete
                </button>
              </form>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-gray-700">{a.body}</p>
          </div>
        ))}
        {announcements?.length === 0 && (
          <p className="text-sm text-gray-500">No announcements yet.</p>
        )}
      </div>
    </div>
  );
}
