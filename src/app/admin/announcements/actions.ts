"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";

export async function createAnnouncement(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;

  await supabase.from("announcements").insert({
    title,
    body,
    created_by: user.id,
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/dashboard");
}

export async function deleteAnnouncement(announcementId: string) {
  const { supabase } = await requireAdmin();

  await supabase.from("announcements").delete().eq("id", announcementId);

  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/dashboard");
}
