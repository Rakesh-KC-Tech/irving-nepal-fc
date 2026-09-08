import Link from "next/link";
import { requireApproved } from "@/lib/supabase/auth";

export default async function StatsPage() {
  const { supabase } = await requireApproved();

  const { data: stats } = await supabase
    .from("event_stats")
    .select("profile_id, goals, assists, yellow_cards, red_cards, profiles(full_name)");

  const totals = new Map<
    string,
    {
      name: string;
      goals: number;
      assists: number;
      yellowCards: number;
      redCards: number;
      matches: number;
    }
  >();

  for (const row of stats ?? []) {
    const name =
      (row.profiles as unknown as { full_name: string | null })?.full_name ??
      "—";
    const existing = totals.get(row.profile_id) ?? {
      name,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      matches: 0,
    };
    existing.goals += row.goals;
    existing.assists += row.assists;
    existing.yellowCards += row.yellow_cards;
    existing.redCards += row.red_cards;
    existing.matches += 1;
    totals.set(row.profile_id, existing);
  }

  const rows = Array.from(totals.values()).sort((a, b) => b.goals - a.goals);

  return (
    <div className="mx-auto flex w-full min-w-0 min-h-screen max-w-2xl flex-col gap-4 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Statistics</h1>
        <Link href="/dashboard" className="text-sm underline">
          Back to dashboard
        </Link>
      </div>

      <div className="min-w-0 overflow-x-auto rounded-md border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase text-mist">
            <tr>
              <th className="px-4 py-2">Player</th>
              <th className="px-4 py-2">Matches</th>
              <th className="px-4 py-2">Goals</th>
              <th className="px-4 py-2">Assists</th>
              <th className="px-4 py-2">YC</th>
              <th className="px-4 py-2">RC</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-line">
                <td className="px-4 py-2">{row.name}</td>
                <td className="px-4 py-2">{row.matches}</td>
                <td className="px-4 py-2">{row.goals}</td>
                <td className="px-4 py-2">{row.assists}</td>
                <td className="px-4 py-2">{row.yellowCards}</td>
                <td className="px-4 py-2">{row.redCards}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-mist" colSpan={6}>
                  No stats recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
