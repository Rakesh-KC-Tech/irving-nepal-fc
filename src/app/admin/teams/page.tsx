import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/auth";
import { createTeam } from "./actions";

export default async function AdminTeamsPage() {
  const { supabase } = await requireAdmin();

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, description")
    .order("name");

  return (
    <div className="min-w-0 flex flex-col gap-6">
      <h2 className="text-lg font-medium">Teams</h2>

      <div className="flex flex-col gap-2">
        {teams?.map((team) => (
          <Link
            key={team.id}
            href={`/admin/teams/${team.id}`}
            className="rounded-md border border-line p-3 text-sm hover:bg-white/5"
          >
            <p className="font-medium">{team.name}</p>
            {team.description && (
              <p className="text-mist">{team.description}</p>
            )}
          </Link>
        ))}
        {teams?.length === 0 && (
          <p className="text-sm text-mist">No teams yet.</p>
        )}
      </div>

      <form className="flex flex-col gap-3 rounded-md border border-line p-4">
        <h3 className="text-sm font-medium">Create a team</h3>
        <input
          name="name"
          type="text"
          placeholder="Team name"
          required
          className="bg-paper text-navy rounded-md border border-line px-3 py-2 text-sm"
         />
        <input
          name="description"
          type="text"
          placeholder="Description (optional)"
          className="bg-paper text-navy rounded-md border border-line px-3 py-2 text-sm"
         />
        <button
          formAction={createTeam}
          className="rounded-md bg-crimson px-3 py-2 text-sm font-medium text-white"
        >
          Create Team
        </button>
      </form>
    </div>
  );
}
