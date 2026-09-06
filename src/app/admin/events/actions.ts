"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";

export async function createEvent(formData: FormData) {
  const { supabase } = await requireAdmin();

  const teamId = formData.get("teamId") as string;
  const type = formData.get("type") as "match" | "training";
  const title = formData.get("title") as string;
  const location = formData.get("location") as string;
  const startsAt = formData.get("startsAt") as string;
  const opponent = formData.get("opponent") as string;

  await supabase.from("events").insert({
    team_id: teamId,
    type,
    title,
    location: location || null,
    starts_at: new Date(startsAt).toISOString(),
    opponent: opponent || null,
  });

  revalidatePath("/admin/events");
}
