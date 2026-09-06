"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";

export async function recordAttendance(
  eventId: string,
  profileId: string,
  formData: FormData,
) {
  const { supabase } = await requireAdmin();

  const attended = formData.get("attended") === "on";

  await supabase.from("event_attendance").upsert({
    event_id: eventId,
    profile_id: profileId,
    attended,
    recorded_at: new Date().toISOString(),
  });

  revalidatePath(`/admin/events/${eventId}`);
}

export async function recordStats(
  eventId: string,
  profileId: string,
  formData: FormData,
) {
  const { supabase } = await requireAdmin();

  const goals = Number(formData.get("goals") ?? 0);
  const assists = Number(formData.get("assists") ?? 0);
  const yellowCards = Number(formData.get("yellowCards") ?? 0);
  const redCards = Number(formData.get("redCards") ?? 0);

  await supabase.from("event_stats").upsert({
    event_id: eventId,
    profile_id: profileId,
    goals,
    assists,
    yellow_cards: yellowCards,
    red_cards: redCards,
  });

  revalidatePath(`/admin/events/${eventId}`);
}
