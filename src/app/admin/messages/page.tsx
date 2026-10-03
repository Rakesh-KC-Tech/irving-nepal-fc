import { requireAdmin } from "@/lib/supabase/auth";
import { setMessageStatus, setSubscriberUnsubscribed } from "./actions";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

type Subscriber = {
  id: string;
  email: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-gold/15 text-gold",
  replied: "bg-emerald-500/15 text-emerald-300",
  archived: "bg-white/10 text-mist",
};

const STATUS_OPTIONS = ["new", "replied", "archived"];

export default async function AdminMessagesPage() {
  const { supabase } = await requireAdmin();

  const [{ data: messages }, { data: subscribers }] = await Promise.all([
    supabase
      .from("contact_messages")
      .select("id, name, email, subject, message, status, created_at")
      .order("created_at", { ascending: false })
      .returns<ContactMessage[]>(),
    supabase
      .from("newsletter_subscribers")
      .select("id, email, subscribed_at, unsubscribed_at")
      .order("subscribed_at", { ascending: false })
      .returns<Subscriber[]>(),
  ]);

  const activeSubscribers = subscribers?.filter((s) => !s.unsubscribed_at).length ?? 0;

  return (
    <div className="min-w-0 flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Contact messages</h2>
          <p className="text-sm text-mist">{messages?.length ?? 0} total</p>
        </div>

        <div className="flex flex-col gap-3">
          {messages?.map((m) => (
            <div key={m.id} className="rounded-md border border-line p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-mist">
                    <a href={`mailto:${m.email}`} className="underline">
                      {m.email}
                    </a>{" "}
                    · {m.subject} · {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[m.status] ?? ""}`}>
                  {m.status}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words">{m.message}</p>
              <form className="mt-3 flex items-center gap-2">
                <span className="text-xs text-mist">Mark as:</span>
                {STATUS_OPTIONS.filter((s) => s !== m.status).map((s) => (
                  <button key={s} formAction={setMessageStatus.bind(null, m.id, s)} className="text-xs underline">
                    {s}
                  </button>
                ))}
              </form>
            </div>
          ))}
          {messages?.length === 0 && <p className="text-sm text-mist">No messages yet.</p>}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Newsletter subscribers</h2>
          <p className="text-sm text-mist">{activeSubscribers} active</p>
        </div>

        <div className="flex flex-col gap-2">
          {subscribers?.map((s) => (
            <form key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line px-4 py-2 text-sm">
              <span className={s.unsubscribed_at ? "text-mist line-through" : ""}>{s.email}</span>
              <span className="flex items-center gap-3 text-xs text-mist">
                {new Date(s.subscribed_at).toLocaleDateString()}
                <button
                  formAction={setSubscriberUnsubscribed.bind(null, s.id, !s.unsubscribed_at)}
                  className="underline"
                >
                  {s.unsubscribed_at ? "Resubscribe" : "Unsubscribe"}
                </button>
              </span>
            </form>
          ))}
          {subscribers?.length === 0 && <p className="text-sm text-mist">No subscribers yet.</p>}
        </div>
      </section>
    </div>
  );
}
