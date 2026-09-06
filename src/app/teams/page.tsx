import Link from "next/link";
import { requireApproved } from "@/lib/supabase/auth";

export default async function TeamsPage() {
  const { supabase } = await requireApproved();

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, description")
    .order("name");

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Teams</h1>
        <Link href="/dashboard" className="text-sm underline">
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {teams?.map((team) => (
          <Link
            key={team.id}
            href={`/teams/${team.id}`}
            className="rounded-md border border-gray-200 p-3 text-sm hover:bg-gray-50"
          >
            <p className="font-medium">{team.name}</p>
            {team.description && (
              <p className="text-gray-500">{team.description}</p>
            )}
          </Link>
        ))}
        {teams?.length === 0 && (
          <p className="text-sm text-gray-500">No teams yet.</p>
        )}
      </div>
    </div>
  );
}
