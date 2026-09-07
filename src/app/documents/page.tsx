import Link from "next/link";
import { requireApproved } from "@/lib/supabase/auth";

export default async function DocumentsPage() {
  const { supabase } = await requireApproved();

  const { data: documents } = await supabase
    .from("documents")
    .select("id, title, description, url, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex w-full min-w-0 min-h-screen max-w-2xl flex-col gap-4 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <Link href="/dashboard" className="text-sm underline">
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {documents?.map((d) => (
          <a
            key={d.id}
            href={d.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-gray-200 p-3 text-sm hover:bg-gray-50"
          >
            <p className="font-medium underline">{d.title}</p>
            {d.description && (
              <p className="text-gray-500">{d.description}</p>
            )}
          </a>
        ))}
        {documents?.length === 0 && (
          <p className="text-sm text-gray-500">No documents yet.</p>
        )}
      </div>
    </div>
  );
}
