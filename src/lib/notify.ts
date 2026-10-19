// Emails the club when something arrives from the public website (contact
// form, new registration). Uses Resend's REST API directly — no SDK — and is
// a silent no-op until RESEND_API_KEY is set, so the forms keep working
// either way. A failed or slow email must never fail the visitor's request.
const FROM = process.env.NOTIFY_FROM ?? "Irving Nepal FC <onboarding@resend.dev>";
const TO = process.env.NOTIFY_EMAIL ?? "irvingnepalfc@gmail.com";

// Subjects and reply-to come from visitor input; strip anything that could
// smuggle extra headers.
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim().slice(0, 200);

export async function notifyAdmin(opts: { subject: string; text: string; replyTo?: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        subject: oneLine(opts.subject),
        text: opts.text,
        ...(opts.replyTo ? { reply_to: oneLine(opts.replyTo) } : {}),
      }),
      signal: AbortSignal.timeout(4000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
