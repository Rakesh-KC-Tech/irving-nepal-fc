import Link from "next/link";
import { notFound } from "next/navigation";
import { requireApproved } from "@/lib/supabase/auth";
import { setRsvp } from "../actions";

const RSVP_LABEL: Record<string, string> = {
  yes: "Going",
  no: "Not going",
  maybe: "Maybe",
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const { supabase, user } = await requireApproved();

  const { data: event } = await supabase
    .from("events")
    .select(
      "id, title, type, location, starts_at, opponent, notes, teams(name)",
    )
    .eq("id", eventId)
    .single();

  if (!event) {
    notFound();
  }

  const { data: rsvps } = await supabase
    .from("event_rsvps")
    .select("profile_id, response, profiles(full_name)")
    .eq("event_id", eventId);

  const myResponse = rsvps?.find((r) => r.profile_id === user.id)?.response;

  const { data: stats } = await supabase
    .from("event_stats")
    .select("goals, assists, yellow_cards, red_cards, profiles(full_name)")
    .eq("event_id", eventId);

  const grouped = {
    yes: rsvps?.filter((r) => r.response === "yes") ?? [],
    maybe: rsvps?.filter((r) => r.response === "maybe") ?? [],
    no: rsvps?.filter((r) => r.response === "no") ?? [],
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{event.title}</h1>
          <p className="text-sm text-gray-500">
            {(event.teams as unknown as { name: string })?.name} ·{" "}
            {new Date(event.starts_at).toLocaleString()}
            {event.location ? ` · ${event.location}` : ""}
            {event.opponent ? ` · vs ${event.opponent}` : ""}
          </p>
        </div>
        <Link href="/events" className="text-sm underline">
          All events
        </Link>
      </div>

      {event.notes && <p className="text-sm text-gray-700">{event.notes}</p>}

      <form className="flex items-center gap-2">
        <span className="text-sm text-gray-500">
          {myResponse ? `You: ${RSVP_LABEL[myResponse]}` : "RSVP:"}
        </span>
        {(["yes", "maybe", "no"] as const).map((option) => (
          <button
            key={option}
            formAction={setRsvp.bind(null, event.id, option)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              myResponse === option
                ? "border-black bg-black text-white"
                : "border-gray-300"
            }`}
          >
            {RSVP_LABEL[option]}
          </button>
        ))}
      </form>

      <div className="grid grid-cols-3 gap-3 text-sm">
        {(["yes", "maybe", "no"] as const).map((option) => (
          <div key={option} className="rounded-md border border-gray-200 p-3">
            <p className="text-xs uppercase text-gray-500">
              {RSVP_LABEL[option]} ({grouped[option].length})
            </p>
            <ul className="mt-1 text-gray-700">
              {grouped[option].map((r) => (
                <li key={r.profile_id}>
                  {(r.profiles as unknown as { full_name: string | null })
                    ?.full_name ?? "—"}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {event.type === "match" && stats && stats.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium uppercase text-gray-500">
            Stats
          </h2>
          <div className="overflow-hidden rounded-md border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-2">Player</th>
                  <th className="px-4 py-2">Goals</th>
                  <th className="px-4 py-2">Assists</th>
                  <th className="px-4 py-2">YC</th>
                  <th className="px-4 py-2">RC</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-4 py-2">
                      {(s.profiles as unknown as { full_name: string | null })
                        ?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-2">{s.goals}</td>
                    <td className="px-4 py-2">{s.assists}</td>
                    <td className="px-4 py-2">{s.yellow_cards}</td>
                    <td className="px-4 py-2">{s.red_cards}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
