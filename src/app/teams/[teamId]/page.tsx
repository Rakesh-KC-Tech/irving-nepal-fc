import Link from "next/link";
import { notFound } from "next/navigation";
import { requireApproved } from "@/lib/supabase/auth";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { supabase } = await requireApproved();

  const { data: team } = await supabase
    .from("teams")
    .select("id, name, description")
    .eq("id", teamId)
    .single();

  if (!team) {
    notFound();
  }

  const { data: roster } = await supabase
    .from("team_members")
    .select("profile_id, jersey_number, position, profiles(full_name)")
    .eq("team_id", teamId);

  const { data: upcoming } = await supabase
    .from("events")
    .select("id, title, type, starts_at")
    .eq("team_id", teamId)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at");

  return (
    <div className="mx-auto flex w-full min-w-0 min-h-screen max-w-2xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{team.name}</h1>
        <Link href="/teams" className="text-sm underline">
          All teams
        </Link>
      </div>
      {team.description && (
        <p className="text-sm text-gray-500">{team.description}</p>
      )}

      <div>
        <h2 className="mb-2 text-sm font-medium uppercase text-gray-500">
          Roster
        </h2>
        <div className="min-w-0 overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-left text-sm">
            <tbody>
              {roster?.map((member) => (
                <tr
                  key={member.profile_id}
                  className="border-t border-gray-100 first:border-t-0"
                >
                  <td className="px-4 py-2">
                    {(
                      member.profiles as unknown as {
                        full_name: string | null;
                      }
                    )?.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {member.position ?? ""}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-500">
                    {member.jersey_number ? `#${member.jersey_number}` : ""}
                  </td>
                </tr>
              ))}
              {roster?.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-gray-500">
                    No players on this team yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium uppercase text-gray-500">
          Upcoming
        </h2>
        <div className="flex flex-col gap-2">
          {upcoming?.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="flex items-center justify-between rounded-md border border-gray-200 p-3 text-sm hover:bg-gray-50"
            >
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-gray-500">
                  {new Date(event.starts_at).toLocaleString()}
                </p>
              </div>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs uppercase">
                {event.type}
              </span>
            </Link>
          ))}
          {upcoming?.length === 0 && (
            <p className="text-sm text-gray-500">Nothing scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );
}
