import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/auth";

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function AdminOverviewPage() {
  const { supabase } = await requireAdmin();

  const [
    { count: totalMembers },
    { count: pendingMembers },
    { count: teamCount },
    { count: upcomingEventCount },
    { data: paidPayments },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("teams").select("id", { count: "exact", head: true }),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .gte("starts_at", new Date().toISOString()),
    supabase.from("payments").select("amount_cents").eq("status", "paid"),
  ]);

  const totalRevenueCents =
    paidPayments?.reduce((sum, p) => sum + p.amount_cents, 0) ?? 0;

  const cards = [
    { label: "Total Members", value: totalMembers ?? 0 },
    { label: "Pending Approval", value: pendingMembers ?? 0 },
    { label: "Teams", value: teamCount ?? 0 },
    { label: "Upcoming Events", value: upcomingEventCount ?? 0 },
    { label: "Total Revenue", value: formatCents(totalRevenueCents) },
  ];

  const links = [
    { href: "/admin/members", label: "Members" },
    { href: "/admin/teams", label: "Teams" },
    { href: "/admin/events", label: "Events" },
    { href: "/admin/announcements", label: "Announcements" },
    { href: "/admin/documents", label: "Documents" },
    { href: "/admin/plans", label: "Membership Plans" },
    { href: "/admin/payments", label: "Payments" },
    { href: "/admin/audit-logs", label: "Audit Logs" },
  ];

  return (
    <div className="min-w-0 flex flex-col gap-6">
      <h2 className="text-lg font-medium">Overview</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-md border border-line p-4"
          >
            <p className="text-xs uppercase text-mist">{card.label}</p>
            <p className="mt-1 text-xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md border border-line px-4 py-3 text-center text-sm font-medium hover:bg-white/5"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
