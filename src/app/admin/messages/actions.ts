"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { logAudit } from "@/lib/supabase/audit";

export async function setMessageStatus(messageId: string, status: string) {
  const { supabase, user } = await requireAdmin();

  await supabase.from("contact_messages").update({ status }).eq("id", messageId);
  await logAudit(supabase, user.id, "contact_message_status_changed", "contact_message", messageId, { status });

  revalidatePath("/admin/messages");
}

export async function setSubscriberUnsubscribed(subscriberId: string, unsubscribed: boolean) {
  const { supabase, user } = await requireAdmin();

  await supabase
    .from("newsletter_subscribers")
    .update({ unsubscribed_at: unsubscribed ? new Date().toISOString() : null })
    .eq("id", subscriberId);
  await logAudit(
    supabase,
    user.id,
    unsubscribed ? "newsletter_subscriber_unsubscribed" : "newsletter_subscriber_resubscribed",
    "newsletter_subscriber",
    subscriberId,
  );

  revalidatePath("/admin/messages");
}
