"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { logAudit } from "@/lib/supabase/audit";

export async function createAnnouncement(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;

  const { data: announcement } = await supabase
    .from("announcements")
    .insert({ title, body, created_by: user.id })
    .select("id")
    .single();

  if (announcement) {
    await logAudit(
      supabase,
      user.id,
      "announcement_created",
      "announcement",
      announcement.id,
      { title },
    );
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/dashboard");
}

export async function deleteAnnouncement(announcementId: string) {
  const { supabase, user } = await requireAdmin();

  await supabase.from("announcements").delete().eq("id", announcementId);
  await logAudit(
    supabase,
    user.id,
    "announcement_deleted",
    "announcement",
    announcementId,
  );

  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/dashboard");
}
