import { requireAdmin } from "@/lib/supabase/auth";
import { setRegistrationStatus, convertRegistrationToAccount } from "./actions";

type Registration = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  plan: string;
  preferred_position: string | null;
  notes: string | null;
  status: string;
  linked_profile_id: string | null;
  amount_cents: number | null;
  payment_status: string;
  paid_at: string | null;
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-gold/15 text-gold",
  contacted: "bg-sky-500/15 text-sky-300",
  converted: "bg-emerald-500/15 text-emerald-300",
  archived: "bg-white/10 text-mist",
};

const PAYMENT_STYLES: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-300",
  unpaid: "bg-crimson/15 text-crimson-2",
};

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

// "converted" only happens through convertRegistrationToAccount below, which
// has real side effects (sends an invite email, creates the account) — it's
// deliberately not one of the plain status buttons.
const STATUS_OPTIONS = ["new", "contacted", "archived"];

export default async function AdminRegistrationsPage() {
  const { supabase } = await requireAdmin();

  const { data: registrations } = await supabase
    .from("registrations")
    .select(
      "id, first_name, last_name, email, phone, date_of_birth, plan, preferred_position, notes, status, linked_profile_id, amount_cents, payment_status, paid_at, created_at",
    )
    .order("created_at", { ascending: false })
    .returns<Registration[]>();

  return (
    <div className="min-w-0 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Registrations</h2>
        <p className="text-sm text-mist">{registrations?.length ?? 0} total</p>
      </div>

      <div className="flex flex-col gap-3">
        {registrations?.map((r) => (
          <div key={r.id} className="rounded-md border border-line p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">
                  {r.first_name} {r.last_name}
                </p>
                <p className="text-xs text-mist">
                  {r.email} · {r.phone} · DOB {r.date_of_birth}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${PAYMENT_STYLES[r.payment_status] ?? ""}`}>
                  {r.payment_status}
                  {r.payment_status === "paid" && r.paid_at
                    ? ` · ${new Date(r.paid_at).toLocaleDateString()}`
                    : ""}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[r.status] ?? ""}`}>
                  {r.status}
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-mist">
              Plan: <span className="text-white">{r.plan}</span>
              {r.amount_cents != null && <> ({formatCents(r.amount_cents)})</>}
              {r.preferred_position && (
                <>
                  {" "}
                  · Position: <span className="text-white">{r.preferred_position}</span>
                </>
              )}
              {" · "}
              Submitted {new Date(r.created_at).toLocaleString()}
            </p>
            {r.notes && <p className="mt-2 text-xs text-mist">Notes: {r.notes}</p>}
            {r.linked_profile_id ? (
              <p className="mt-3 text-xs text-green-500">
                Account created — invite sent to {r.email}.
              </p>
            ) : (
              <form className="mt-3">
                <button
                  formAction={convertRegistrationToAccount.bind(null, r.id)}
                  className="text-xs underline text-green-500"
                >
                  Convert &amp; create account
                </button>
              </form>
            )}
            <form className="mt-2 flex items-center gap-2">
              <span className="text-xs text-mist">Mark as:</span>
              {STATUS_OPTIONS.filter((s) => s !== r.status).map((s) => (
                <button
                  key={s}
                  formAction={setRegistrationStatus.bind(null, r.id, s)}
                  className="text-xs underline"
                >
                  {s}
                </button>
              ))}
            </form>
          </div>
        ))}
        {registrations?.length === 0 && (
          <p className="text-sm text-mist">No registrations yet.</p>
        )}
      </div>
    </div>
  );
}
