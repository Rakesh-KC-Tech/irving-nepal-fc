import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";
import { addPlayer, removePlayer } from "../actions";

export default async function AdminTeamRosterPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { supabase } = await requireAdmin();

  const { data: team } = await supabase
    .from("teams")
    .select("id, name")
    .eq("id", teamId)
    .single();

  if (!team) {
    notFound();
  }

  const { data: roster } = await supabase
    .from("team_members")
    .select("profile_id, jersey_number, position, profiles(full_name)")
    .eq("team_id", teamId);

  const rosterIds = roster?.map((r) => r.profile_id) ?? [];

  const { data: availableProfiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("status", "approved")
    .order("full_name");

  const addable = availableProfiles?.filter((p) => !rosterIds.includes(p.id));

  const addPlayerWithTeam = addPlayer.bind(null, teamId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{team.name} — Roster</h2>
        <Link href="/admin/teams" className="text-sm underline">
          All teams
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Number</th>
              <th className="px-4 py-2">Position</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roster?.map((member) => (
              <tr key={member.profile_id} className="border-t border-gray-200">
                <td className="px-4 py-2">
                  {(member.profiles as unknown as { full_name: string | null })
                    ?.full_name ?? "—"}
                </td>
                <td className="px-4 py-2">{member.jersey_number ?? "—"}</td>
                <td className="px-4 py-2">{member.position ?? "—"}</td>
                <td className="px-4 py-2">
                  <form>
                    <button
                      formAction={removePlayer.bind(
                        null,
                        teamId,
                        member.profile_id,
                      )}
                      className="text-xs text-red-600 underline"
                    >
                      Remove
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {roster?.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-gray-500" colSpan={4}>
                  No players on this team yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form className="flex flex-col gap-3 rounded-md border border-gray-200 p-4">
        <h3 className="text-sm font-medium">Add a player</h3>
        <select
          name="profileId"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Select a member…</option>
          {addable?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name ?? p.id}
            </option>
          ))}
        </select>
        <div className="flex gap-3">
          <input
            name="jerseyNumber"
            type="number"
            placeholder="Number"
            className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            name="position"
            type="text"
            placeholder="Position"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          formAction={addPlayerWithTeam}
          className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
        >
          Add to Roster
        </button>
      </form>
    </div>
  );
}
