"use server";

import { revalidatePath } from "next/cache";
import { requireApproved } from "@/lib/supabase/auth";

export async function setRsvp(
  eventId: string,
  response: "yes" | "no" | "maybe",
) {
  const { supabase, user } = await requireApproved();

  await supabase.from("event_rsvps").upsert({
    event_id: eventId,
    profile_id: user.id,
    response,
    responded_at: new Date().toISOString(),
  });

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
}
