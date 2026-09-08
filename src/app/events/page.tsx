import Link from "next/link";
import { requireApproved } from "@/lib/supabase/auth";
import { setRsvp } from "./actions";

const RSVP_LABEL: Record<string, string> = {
  yes: "Going",
  no: "Not going",
  maybe: "Maybe",
};

export default async function EventsPage() {
  const { supabase, user } = await requireApproved();

  const { data: events } = await supabase
    .from("events")
    .select("id, title, type, location, starts_at, opponent, teams(name)")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at");

  const { data: myRsvps } = await supabase
    .from("event_rsvps")
    .select("event_id, response")
    .eq("profile_id", user.id);

  const rsvpByEvent = new Map(myRsvps?.map((r) => [r.event_id, r.response]));

  return (
    <div className="mx-auto flex w-full min-w-0 min-h-screen max-w-2xl flex-col gap-4 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Upcoming Events</h1>
        <Link href="/dashboard" className="text-sm underline">
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {events?.map((event) => {
          const myResponse = rsvpByEvent.get(event.id);
          return (
            <div
              key={event.id}
              className="rounded-md border border-line p-4 text-sm"
            >
              <div className="flex items-center justify-between">
                <Link
                  href={`/events/${event.id}`}
                  className="font-medium hover:underline"
                >
                  {event.title}
                </Link>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs uppercase">
                  {event.type}
                </span>
              </div>
              <p className="mt-1 text-mist">
                {(event.teams as unknown as { name: string })?.name} ·{" "}
                {new Date(event.starts_at).toLocaleString()}
                {event.location ? ` · ${event.location}` : ""}
                {event.opponent ? ` · vs ${event.opponent}` : ""}
              </p>

              <form className="mt-3 flex items-center gap-2">
                <span className="text-xs text-mist">
                  {myResponse
                    ? `You: ${RSVP_LABEL[myResponse]}`
                    : "RSVP:"}
                </span>
                {(["yes", "maybe", "no"] as const).map((option) => (
                  <button
                    key={option}
                    formAction={setRsvp.bind(null, event.id, option)}
                    className={`rounded-md border px-2 py-1 text-xs ${
                      myResponse === option
                        ? "border-black bg-crimson text-white"
                        : "border-line"
                    }`}
                  >
                    {RSVP_LABEL[option]}
                  </button>
                ))}
              </form>
            </div>
          );
        })}
        {events?.length === 0 && (
          <p className="text-sm text-mist">Nothing scheduled.</p>
        )}
      </div>
    </div>
  );
}
