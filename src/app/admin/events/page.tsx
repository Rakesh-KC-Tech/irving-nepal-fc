import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/auth";
import { createEvent } from "./actions";

export default async function AdminEventsPage() {
  const { supabase } = await requireAdmin();

  const { data: events } = await supabase
    .from("events")
    .select("id, title, type, starts_at, teams(name)")
    .order("starts_at", { ascending: false });

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name")
    .order("name");

  return (
    <div className="min-w-0 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Matches & Training</h2>
        <Link href="/admin/teams" className="text-sm underline">
          Teams
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {events?.map((event) => (
          <Link
            key={event.id}
            href={`/admin/events/${event.id}`}
            className="flex items-center justify-between rounded-md border border-line p-3 text-sm hover:bg-white/5"
          >
            <div>
              <p className="font-medium">{event.title}</p>
              <p className="text-mist">
                {(event.teams as unknown as { name: string })?.name} ·{" "}
                {new Date(event.starts_at).toLocaleString()}
              </p>
            </div>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs uppercase">
              {event.type}
            </span>
          </Link>
        ))}
        {events?.length === 0 && (
          <p className="text-sm text-mist">No events yet.</p>
        )}
      </div>

      <form className="flex flex-col gap-3 rounded-md border border-line p-4">
        <h3 className="text-sm font-medium">Schedule a match or training</h3>
        <select
          name="teamId"
          required
          className="bg-paper text-navy rounded-md border border-line px-3 py-2 text-sm"
        >
          <option value="">Select a team…</option>
          {teams?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          name="type"
          required
          className="bg-paper text-navy rounded-md border border-line px-3 py-2 text-sm"
        >
          <option value="training">Training</option>
          <option value="match">Match</option>
        </select>
        <input
          name="title"
          type="text"
          placeholder="Title"
          required
          className="bg-paper text-navy rounded-md border border-line px-3 py-2 text-sm"
         />
        <input
          name="opponent"
          type="text"
          placeholder="Opponent (for matches)"
          className="bg-paper text-navy rounded-md border border-line px-3 py-2 text-sm"
         />
        <input
          name="location"
          type="text"
          placeholder="Location"
          className="bg-paper text-navy rounded-md border border-line px-3 py-2 text-sm"
         />
        <label className="flex flex-col gap-1 text-sm">
          Date & time
          <input
            name="startsAt"
            type="datetime-local"
            required
            className="bg-paper text-navy rounded-md border border-line px-3 py-2"
           />
        </label>
        <button
          formAction={createEvent}
          className="rounded-md bg-crimson px-3 py-2 text-sm font-medium text-white"
        >
          Schedule
        </button>
      </form>
    </div>
  );
}
