import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";
import { recordAttendance, recordStats } from "./actions";

const RSVP_LABEL: Record<string, string> = {
  yes: "Going",
  no: "Not going",
  maybe: "Maybe",
};

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const { supabase } = await requireAdmin();

  const { data: event } = await supabase
    .from("events")
    .select(
      "id, title, type, location, starts_at, opponent, team_id, teams(name)",
    )
    .eq("id", eventId)
    .single();

  if (!event) {
    notFound();
  }

  const isMatch = event.type === "match";

  const { data: roster } = await supabase
    .from("team_members")
    .select("profile_id, profiles(full_name)")
    .eq("team_id", event.team_id);

  const { data: rsvps } = await supabase
    .from("event_rsvps")
    .select("profile_id, response")
    .eq("event_id", eventId);

  const { data: attendance } = await supabase
    .from("event_attendance")
    .select("profile_id, attended")
    .eq("event_id", eventId);

  const { data: stats } = await supabase
    .from("event_stats")
    .select("profile_id, goals, assists, yellow_cards, red_cards")
    .eq("event_id", eventId);

  const rsvpByProfile = new Map(rsvps?.map((r) => [r.profile_id, r.response]));
  const attendanceByProfile = new Map(
    attendance?.map((a) => [a.profile_id, a.attended]),
  );
  const statsByProfile = new Map(stats?.map((s) => [s.profile_id, s]));

  const gridCols = isMatch
    ? "grid-cols-[1.5fr_1fr_auto_auto_auto_auto_auto_auto]"
    : "grid-cols-[1.5fr_1fr_auto_auto]";

  return (
    <div className="min-w-0 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">{event.title}</h2>
          <p className="text-sm text-gray-500">
            {(event.teams as unknown as { name: string })?.name} ·{" "}
            {new Date(event.starts_at).toLocaleString()}
            {event.location ? ` · ${event.location}` : ""}
            {event.opponent ? ` · vs ${event.opponent}` : ""}
          </p>
        </div>
        <Link href="/admin/events" className="text-sm underline">
          All events
        </Link>
      </div>

      <div className="min-w-0 overflow-x-auto rounded-md border border-gray-200">
        <div className={`grid ${gridCols} gap-x-3 gap-y-2 p-3 text-sm`}>
          <div className="text-xs font-medium uppercase text-gray-500">
            Name
          </div>
          <div className="text-xs font-medium uppercase text-gray-500">
            RSVP
          </div>
          <div className="text-xs font-medium uppercase text-gray-500">
            Attended
          </div>
          {isMatch && (
            <>
              <div className="text-xs font-medium uppercase text-gray-500">
                Goals
              </div>
              <div className="text-xs font-medium uppercase text-gray-500">
                Assists
              </div>
              <div className="text-xs font-medium uppercase text-gray-500">
                YC
              </div>
              <div className="text-xs font-medium uppercase text-gray-500">
                RC
              </div>
            </>
          )}
          <div />

          {roster?.map((member) => {
            const stat = statsByProfile.get(member.profile_id);
            return (
              <form
                key={member.profile_id}
                className={`col-span-full grid ${gridCols} items-center gap-x-3 border-t border-gray-100 py-2`}
              >
                <div>
                  {(
                    member.profiles as unknown as { full_name: string | null }
                  )?.full_name ?? "—"}
                </div>
                <div>
                  {RSVP_LABEL[rsvpByProfile.get(member.profile_id) ?? ""] ??
                    "—"}
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="attended"
                    defaultChecked={
                      attendanceByProfile.get(member.profile_id) ?? false
                    }
                  />
                </div>
                {isMatch && (
                  <>
                    <div>
                      <input
                        name="goals"
                        type="number"
                        defaultValue={stat?.goals ?? 0}
                        className="w-14 rounded border border-gray-300 px-1 py-0.5"
                      />
                    </div>
                    <div>
                      <input
                        name="assists"
                        type="number"
                        defaultValue={stat?.assists ?? 0}
                        className="w-14 rounded border border-gray-300 px-1 py-0.5"
                      />
                    </div>
                    <div>
                      <input
                        name="yellowCards"
                        type="number"
                        defaultValue={stat?.yellow_cards ?? 0}
                        className="w-12 rounded border border-gray-300 px-1 py-0.5"
                      />
                    </div>
                    <div>
                      <input
                        name="redCards"
                        type="number"
                        defaultValue={stat?.red_cards ?? 0}
                        className="w-12 rounded border border-gray-300 px-1 py-0.5"
                      />
                    </div>
                  </>
                )}
                <div className="flex gap-2">
                  <button
                    formAction={recordAttendance.bind(
                      null,
                      eventId,
                      member.profile_id,
                    )}
                    className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                  >
                    Save attendance
                  </button>
                  {isMatch && (
                    <button
                      formAction={recordStats.bind(
                        null,
                        eventId,
                        member.profile_id,
                      )}
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                    >
                      Save stats
                    </button>
                  )}
                </div>
              </form>
            );
          })}
        </div>
      </div>
    </div>
  );
}
