import { requireAdmin } from "@/lib/supabase/auth";
import { createDocument, deleteDocument } from "./actions";

export default async function AdminDocumentsPage() {
  const { supabase } = await requireAdmin();

  const { data: documents } = await supabase
    .from("documents")
    .select("id, title, description, url, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="min-w-0 flex flex-col gap-6">
      <h2 className="text-lg font-medium">Documents</h2>

      <form className="flex flex-col gap-3 rounded-md border border-gray-200 p-4">
        <h3 className="text-sm font-medium">Add a document link</h3>
        <input
          name="title"
          type="text"
          placeholder="Title (e.g. Club Bylaws)"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          name="description"
          type="text"
          placeholder="Description (optional)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          name="url"
          type="url"
          placeholder="https://... (Google Drive, PDF link, etc.)"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          formAction={createDocument}
          className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
        >
          Add
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {documents?.map((d) => (
          <div
            key={d.id}
            className="flex items-start justify-between rounded-md border border-gray-200 p-3 text-sm"
          >
            <div>
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline"
              >
                {d.title}
              </a>
              {d.description && (
                <p className="text-gray-500">{d.description}</p>
              )}
            </div>
            <form>
              <button
                formAction={deleteDocument.bind(null, d.id)}
                className="text-xs text-red-600 underline"
              >
                Delete
              </button>
            </form>
          </div>
        ))}
        {documents?.length === 0 && (
          <p className="text-sm text-gray-500">No documents yet.</p>
        )}
      </div>
    </div>
  );
}
